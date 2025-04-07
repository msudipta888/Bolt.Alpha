import { NextResponse } from 'next/server';
import { config } from 'dotenv';
config();

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import archiver from 'archiver';
import axios from 'axios';
import { promisify } from 'util';
import { rimraf } from 'rimraf';
import { supabase } from '@/app/supabase/supabaseClient';
import { PassThrough } from 'stream';

const execPromise = promisify(exec);

// Build progress tracking
let buildProgress = {
  status: 'idle',
  stage: '',
  message: '',
  timestamp: Date.now()
};

interface FileData {
  code: string;
}

interface FileObject {
  name: string;
  content: string | Buffer;
}
function updateProgress(status: string, stage: string, message: string) {
  buildProgress = {
    status,
    stage,
    message,
    timestamp: Date.now()
  };
  console.log(`[${status}] ${stage}: ${message}`);
}
const transformFiles = (files: Record<string, FileData>): FileObject[] => {
  const fileNames = Object.keys(files); // Get all file names to check for index.js
  const hasIndexJs = fileNames.includes("index.js"); // Check if index.js exists

  return Object.entries(files).map(([filePath, fileData]) => {
    let name = filePath.startsWith("/") ? filePath.substring(1) : filePath;

    // Handle specific cases for file paths
    if (
      name === "App.js" ||
      name === "App.css" ||
      name.startsWith("components/") ||
      name.startsWith("pages/")
    ) {
      if (!name.startsWith("src/")) {
        name = "src/" + name;
      }
    }
    let content = fileData?.code;

//     if (name === "src/index.js" && fileData?.code.includes("<")) {
//       name = "src/index.jsx";
//       content = `import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';

// ReactDOM.render(React.createElement(App), document.getElementById('root'));`
//     }
    
    // Handle index.html in the public directory
    if (name.startsWith("public/")) {
      if (name === "public/index.html") {
        name = "index.html"; 
      }
    }

    if (typeof content !== "string") {
      content = String(content);
    }

    return { name, content };
  }).filter(Boolean) as FileObject[]; 
};


function writeFilesToDisk(files: FileObject[], baseDir: string): void {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  files.forEach(file => {
    const fullPath = path.join(baseDir, file.name);
    const folder = path.dirname(fullPath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(fullPath, file.content);
    console.log(`Wrote file: ${fullPath}`); 
  });
  updateProgress('active', 'file_preparation', `Wrote ${files.length} files to ${baseDir}`);
}

async function runBuild(workingDir: string): Promise<string> {
  try {
    // Log project contents before build
    console.log('Project directory contents before build:', fs.readdirSync(workingDir));
    
    // Check for the package.json file
    if (!fs.existsSync(path.join(workingDir, 'package.json'))) {
      updateProgress('error', 'build_process', 'Missing package.json file');
      throw new Error('Missing package.json file');
    }
    
    updateProgress('active', 'build_process', 'Installing dependencies...');
    await execPromise('npm install', { cwd: workingDir, timeout: 120000 });
    
    updateProgress('active', 'build_process', 'Starting production build...');
    const { stdout } = await execPromise('npm run build', { 
      cwd: workingDir,
      timeout: 180000 
    });
    
    // Log directory contents after build to see where files were created
    console.log('Project directory contents after build:', fs.readdirSync(workingDir));
    
    // Check common build output directories
    const possibleBuildDirs = ['build', 'dist', 'out', 'public'];
    let buildDir = null;
    
    for (const dir of possibleBuildDirs) {
      const dirPath = path.join(workingDir, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`Found potential build output directory: ${dir}`);
        buildDir = dirPath;
        break;
      }
    }
    
    if (!buildDir) {
      updateProgress('warning', 'build_process', 'Could not find build output directory');
      // Continue with original path, but log the warning
    }
    
    updateProgress('active', 'build_process', 'Build completed successfully');
    return stdout;
  } catch (error: any) {
    updateProgress('error', 'build_process', `Build error: ${error.message || error}`);
    throw new Error(`Build process failed: ${error.message || error}`);
  }
}


async function uploadDirectoryToSupabase(localDir: string, remotePrefix: string) {
  console.log(`Uploading directory: ${localDir} to ${remotePrefix}`);
  try {
    const entries = fs.readdirSync(localDir);
    console.log(`Files in ${localDir}:`, entries);
    
    for (const entry of entries) {
      const fullPath = path.join(localDir, entry);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        await uploadDirectoryToSupabase(fullPath, `${remotePrefix}/${entry}`);
      } else if (stats.isFile()) {
        const fileBuffer = fs.readFileSync(fullPath);
        // Ensure remote path uses forward slashes
        const remotePath = `${remotePrefix}/${entry}`.replace(/\\/g, '/');
        console.log(`Uploading ${remotePath}...`);
        const { error, data } = await supabase
          .storage
          .from('bolt.alpha')
          .upload(remotePath, fileBuffer, { upsert: true });
        if (error) {
          console.error(`Error uploading ${remotePath}: ${error.message}`);
        } else {
          console.log(`Uploaded ${remotePath}:`, data);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${localDir}:`, error);
    throw error;
  }
}

async function downloadFilesFromSupabase(prefix: string): Promise<FileObject[]> {
  console.log(`Downloading files from Supabase with prefix: ${prefix}`);
  const files: FileObject[] = [];
  
  // Function to recursively list and download files
  async function listAndDownload(currentPrefix: string) {
    const { data: fileList, error } = await supabase
      .storage
      .from('bolt.alpha')
      .list(currentPrefix, { limit: 1000 });
      
    if (error) {
      console.error(`Error listing files with prefix ${currentPrefix}:`, error);
      throw error;
    }
    
    console.log(`Found ${fileList.length} items with prefix ${currentPrefix}`);
    
    for (const item of fileList) {
      const itemPath = currentPrefix ? `${currentPrefix}/${item.name}` : item.name;
      
      if (item.id === null) {
        // This is a folder, recursively process it
        console.log(`Found subfolder: ${itemPath}`);
        await listAndDownload(itemPath);
      } else {
        // This is a file, download it
        console.log(`Downloading file: ${itemPath}`);
        const { data, error: downloadError } = await supabase
          .storage
          .from('bolt.alpha')
          .download(itemPath);
          
        if (downloadError) {
          console.error(`Download error for ${itemPath}:`, downloadError);
          continue;
        }
        
        let buffer: Buffer;
        if (Buffer.isBuffer(data)) {
          buffer = data;
        } else {
          buffer = Buffer.from(await data.arrayBuffer());
        }
        
        // Store with the full path relative to the prefix
        const relPath = itemPath.startsWith(prefix + '/') 
          ? itemPath.substring(prefix.length + 1) 
          : item.name;
          
        files.push({ name: relPath, content: buffer });
        console.log(`Downloaded: ${relPath} (${buffer.length} bytes)`);
      }
    }
  }
  
  await listAndDownload(prefix);
  console.log(`Downloaded ${files.length} files from prefix ${prefix}`);
  return files;
}

async function createZipFromFiles(files: FileObject[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const zipStream = new PassThrough();

    zipStream.on('data', (chunk: any) => {
      chunks.push(chunk);
    });
    zipStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    archive.on('error', (err: Error) => reject(err));
    archive.pipe(zipStream);

    files.forEach(file => {
      // Log what we're adding to the ZIP
      console.log(`Adding to ZIP: ${file.name} (${file.content.length} bytes)`);
      archive.append(file.content, { name: file.name });
    });
    archive.finalize();
  });
}

/**
 * Creates a new Netlify site via Netlify API.
 */
async function createNetlifySite(): Promise<{ id: string, name: string, url: string }> {
  const netlifyUrl = 'https://api.netlify.com/api/v1/sites';
  const token = process.env.DEPLOY_ACCESS_TOKEN;
  
  updateProgress('active', 'site_creation', 'Creating Netlify site...');
  
  if (!token) {
    updateProgress('error', 'site_creation', 'DEPLOY_ACCESS_TOKEN is not set');
    throw new Error('DEPLOY_ACCESS_TOKEN is not set in environment variables');
  }
  
  try {
    const response = await axios.post(netlifyUrl, {
      name: `bolt-app-${Date.now().toString(36)}`,
      ssl: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    updateProgress('active', 'site_creation', `Created Netlify site: ${response.data.name}`);
    return {
      id: response.data.id,
      name: response.data.name,
      url: response.data.ssl_url || response.data.url
    };
  } catch (error: any) {
    updateProgress('error', 'site_creation', `Failed to create Netlify site: ${error.message || error}`);
    throw new Error(`Failed to create Netlify site: ${error.message || error}`);
  }
}

/**
 * Deploys a ZIP buffer to Netlify.
 */
async function deployZipBufferToNetlify(siteId: string, zipBuffer: Buffer) {
  const token = process.env.DEPLOY_ACCESS_TOKEN;
  updateProgress('active', 'deployment', 'Uploading ZIP file to Netlify...');
  const deployUrl = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`;
  const response = await axios.post(deployUrl, zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Authorization': `Bearer ${token}`
    }
  });
  updateProgress('success', 'deployment', `Deployed to Netlify: ${response.data.deploy_url}`);
  return response.data;
}


export async function POST(req: Request) {
  try {
    // 1. Receive source files from client.
    const { files } = await req.json();
    console.log('Received files:', files);
    if (!files || Object.keys(files).length === 0) {
      updateProgress('error', 'initialization', 'No files provided for deployment');
      return NextResponse.json({ error: 'No files provided for deployment' }, { status: 400 });
    }
    
    // 2. Recursively transform files.
    const fileObjects = transformFiles(files);
    console.log('Transformed files:', fileObjects.map(f => f.name));
    
    // 3. Write files to a temporary project directory in /tmp.
    const projectId = `bolt-${Date.now().toString(36)}`;
    const tmpProjectDir = path.join('/tmp', projectId);
    writeFilesToDisk(fileObjects, tmpProjectDir);
    
    // 4. Run the build process in that directory.
    // Make sure your package.json build script outputs production files to a "build" folder.
    await runBuild(tmpProjectDir);
    
    const buildOutputDir = path.join(tmpProjectDir, 'dist');
   // After checking the dist directory
console.log('Contents of dist directory:', fs.readdirSync(buildOutputDir));

// If dist is missing critical files but they exist at the root
if (fs.readdirSync(buildOutputDir).length === 1 && fs.readdirSync(buildOutputDir)[0] === 'index.html') {
  console.log('Dist only has index.html, looking for assets in project root...');
  // Copy root assets to dist if they exist
  ['index.js', 'index.css', 'assets'].forEach(item => {
    const srcPath = path.join(tmpProjectDir, item);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(buildOutputDir, item);
      if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        fs.mkdirSync(destPath, { recursive: true });
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${item} to dist directory`);
    }
  });
}
    
    // 5. Upload build output recursively to Supabase under "bolt-build"
    await uploadDirectoryToSupabase(buildOutputDir, 'bolt-build');
    
    // 6. Download all files from Supabase Storage with prefix "bolt-build".
    const downloadedFiles = await downloadFilesFromSupabase('bolt-build');
    console.log('Downloaded files:', downloadedFiles.map(f => f.name));
    
    // 7. Create an in-memory ZIP archive from the downloaded build files.
    const zipBuffer = await createZipFromFiles(downloadedFiles);
    console.log('ZIP archive created, size:', zipBuffer.length);
    
    // 8. Create a Netlify site and deploy the ZIP.
    const site = await createNetlifySite();
    const deployResult = await deployZipBufferToNetlify(site.id, zipBuffer);
    
    // 9. Cleanup the temporary project directory.
    await rimraf(tmpProjectDir);
    
    return NextResponse.json({
      url: deployResult.deploy_url,
      stage: "deploy completed",
      message: `Congratulations! Your site has been deployed to Netlify`,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Deployment failed:', error);
    return NextResponse.json({
      error: error.message || 'Unknown deployment failure',
      stage: buildProgress.stage || 'unknown',
      details: error
    }, { status: 500 });
  }
}
