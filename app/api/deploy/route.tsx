import { NextRequest, NextResponse } from 'next/server';
import { config } from 'dotenv';
config();
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import archiver from 'archiver';
import axios from 'axios';
import { promisify } from 'util';
import {rimraf} from 'rimraf';

// Convert callback-based functions to promise-based
const execPromise = promisify(exec);
//const rimrafPromise = promisify(rimraf);

// Store build progress for GET requests
let buildProgress = {
  status: 'idle',
  stage: '',
  message: '',
  timestamp: Date.now()
};

// Improved interfaces
interface FileData {
  code: string;
}

interface FileObject {
  name: string;
  content: string;
}

const transformFiles = (files: Record<string, FileData>): FileObject[] => {
  return Object.entries(files).map(([filePath, fileData]) => {
    // Remove leading slash if present.
    let name = filePath.startsWith("/") ? filePath.substring(1) : filePath;
    
    if (
      name === "App.js" ||
      name === "App.css" ||
      name === "index.js" ||
      name.startsWith("components/") ||
      name.startsWith("pages/")
    ) {
      // If not already prefixed with "src/", add it.
      if (!name.startsWith("src/")) {
        name = "src/" + name;
      }
    }
    
    let content = fileData?.code;
    if (typeof content !== "string") {
      content = String(content);
    }
   
    return { name, content };
  });
};

// Update build progress
function updateProgress(status: string, stage: string, message: string) {
  buildProgress = {
    status,
    stage,
    message,
    timestamp: Date.now()
  };
  console.log(`[${status}] ${stage}: ${message}`);
}

// Write files to disk with better error handling
async function writeFilesToDisk(files: FileObject[], outputDir: string): Promise<void> {
  try {
    updateProgress('active', 'file_preparation', 'Writing files to disk');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      console.log('no output dir');
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process each file
    for (const file of files) {
      const fullPath = path.join(outputDir, file.name);
      const folder = path.dirname(fullPath);
      
      // Create folder structure if needed
      if (!fs.existsSync(folder)) {
        console.log('no folder exists');
        fs.mkdirSync(folder, { recursive: true });
      }
      
      // Write file content
      fs.writeFileSync(fullPath, file.content);
    }
    
    // Create src directory if it doesn't exist
    const srcDir = path.join(outputDir, 'src');
    if (!fs.existsSync(srcDir)) {
      console.log('no src dir')
      fs.mkdirSync(srcDir, { recursive: true });
    }
    
    // Add package.json if not already included
    const packageJsonPath = path.join(outputDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const defaultPackageJson = {
        name: "bolt-generated-app",
        version: "1.0.0",
        private: true,
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom":"^7.4.0",
          "react-scripts": "5.0.1",
          "lucide-react": "^0.292.0",
          "tailwindcss": "^3.3.5",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31"
        },
        scripts: {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        browserslist: {
          "production": [">0.2%", "not dead", "not op_mini all"],
          "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2));
    }
    
    // Add index.js if not already included
    const indexJsPath = path.join(outputDir, 'src/index.js');
    if (!fs.existsSync(indexJsPath)) {
      console.log('no index.js file');
      const defaultIndexJs = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
      fs.writeFileSync(indexJsPath, defaultIndexJs);
    }
    
    // Ensure public/index.html exists
    const publicDir = path.join(outputDir, 'public');
    if (!fs.existsSync(publicDir)) {
      console.log('no public dir')
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const indexHtmlPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.log('no index.html file');
      const defaultIndexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web application created using React" />
    <title>Bolt App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
      fs.writeFileSync(indexHtmlPath, defaultIndexHtml);
    }
    
    updateProgress('active', 'file_preparation', `Successfully wrote ${files.length} files to ${outputDir}`);
  } catch (error) {
    updateProgress('error', 'file_preparation', `Failed to write files: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Failed to write files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Run build process with improved error handling and timeout
async function runBuild(workingDir: string): Promise<string> {
  try {
    updateProgress('active', 'build_process', 'Installing dependencies...');
    console.log('working dir', workingDir);
    await execPromise('npm install', { cwd: workingDir, timeout: 120000 });
    
    updateProgress('active', 'build_process', 'Starting production build...');
    const { stdout } = await execPromise('npm run build', { 
      cwd: workingDir,
      timeout: 180000 // 3 minutes timeout for build
    });
    
    updateProgress('active', 'build_process', 'Build completed successfully');
    return stdout;
  } catch (error: any) {
    updateProgress('error', 'build_process', `Build error: ${error.message}`);
    if (error.stdout) console.error(`Build stdout: ${error.stdout}`);
    if (error.stderr) console.error(`Build stderr: ${error.stderr}`);
    throw new Error(`Build process failed: ${error.message}`);
  }
}

// Create ZIP archive with progress tracking
function zipDirectory(sourceDir: string, outPath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      updateProgress('active', 'zip_creation', 'Creating ZIP archive...');
      const output = fs.createWriteStream(outPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        const size = archive.pointer();
        updateProgress('active', 'zip_creation', `Created ZIP file of size ${(size / 1024 / 1024).toFixed(2)} MB`);
        resolve(outPath);
      });
      
      archive.on('error', (err: Error) => {
        updateProgress('error', 'zip_creation', `Zip creation error: ${err.message}`);
        reject(err);
      });
      
      archive.on("progress", (progress) => {
        const percentage = progress.entries.processed / progress.entries.total * 100;
        if (progress.entries.total > 0) {
          updateProgress('active', 'zip_creation', `Zipping: ${percentage.toFixed(1)}% complete`);
        }
      });
      
      archive.pipe(output);
      
      // Check if source directory exists
      if (!fs.existsSync(sourceDir)) {
        throw new Error(`Build directory does not exist: ${sourceDir}`);
      }
      
      archive.directory(sourceDir, false);
      archive.finalize();
    } catch (error) {
      updateProgress('error', 'zip_creation', `Error initiating zip process: ${error instanceof Error ? error.message : String(error)}`);
      reject(error);
    }
  });
}

// Create a new Netlify site with better error handling
async function createNetlifySite(): Promise<{ id: string, name: string, url: string }> {
  const url = 'https://api.netlify.com/api/v1/sites';
  const token = process.env.DEPLOY_ACCESS_TOKEN;
  
  updateProgress('active', 'site_creation', 'Creating Netlify site...');
  
  if (!token) {
    updateProgress('error', 'site_creation', 'DEPLOY_ACCESS_TOKEN is not set in environment variables');
    throw new Error('DEPLOY_ACCESS_TOKEN is not set in environment variables');
  }
  
  try {
    const response = await axios.post(url, {
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
    updateProgress('error', 'site_creation', `Failed to create Netlify site: ${error.response?.data?.message || error.message}`);
    throw new Error(`Failed to create Netlify site: ${error.response?.data?.message || error.message}`);
  }
}

// Deploy ZIP to Netlify with improved error handling and progress tracking
async function deployZipToNetlify(siteId: string, zipPath: string): Promise<any> {
  const deployUrl = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`;
  const token = process.env.DEPLOY_ACCESS_TOKEN;
  
  updateProgress('active', 'deployment', 'Deploying to Netlify...');
  
  if (!token) {
    updateProgress('error', 'deployment', 'DEPLOY_ACCESS_TOKEN is not set in environment variables');
    throw new Error('DEPLOY_ACCESS_TOKEN is not set in environment variables');
  }
  
  if (!fs.existsSync(zipPath)) {
    updateProgress('error', 'deployment', `ZIP file does not exist at ${zipPath}`);
    throw new Error(`ZIP file does not exist at ${zipPath}`);
  }
  
  try {
    const zipData = fs.readFileSync(zipPath);
    const zipSize = (zipData.length / 1024 / 1024).toFixed(2);
    updateProgress('active', 'deployment', `Uploading ZIP file (${zipSize} MB) to Netlify...`);
    
    const response = await axios.post(deployUrl, zipData, {
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateProgress('active', 'deployment', `Upload progress: ${percentCompleted}%`);
        }
      }
    });
      
    updateProgress('success', 'deployment', `Deployed to Netlify: ${response.data.deploy_url}`);
    return response.data;
  } catch (error: any) {
    updateProgress('error', 'deployment', `Failed to deploy to Netlify: ${error.response?.data?.message || error.message}`);
    throw new Error(`Failed to deploy to Netlify: ${error.response?.data?.message || error.message}`);
  }
}

// Clean up temporary files and directories
async function cleanupTempFiles(paths: string[]) {
  updateProgress('active', 'cleanup', 'Cleaning up temporary files...');
  try {
    for (const filePath of paths) {
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          // Directly await rimraf
          await rimraf(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
        updateProgress('active', 'cleanup', `Removed: ${filePath}`);
      }
    }
    updateProgress('active', 'cleanup', 'Cleanup completed');
  } catch (error) {
    updateProgress('warning', 'cleanup', `Warning: cleanup failed - ${error instanceof Error ? error.message : String(error)}`);
    // Non-fatal error, just log warning
  }
}
// Main API endpoint handler
export async function POST(req: Request): Promise<NextResponse> {
  // Create unique project ID for this deployment
  const projectId = `bolt-${Date.now().toString(36)}`;
  const tempSrcDir = path.join(process.cwd(), `temp-${projectId}`);
  const buildDir = path.join(tempSrcDir, 'build');
  const zipPath = path.join(process.cwd(), `${projectId}.zip`);
  
  try {
    updateProgress('active', 'initialization', `Starting deployment process for project ${projectId}`);
    
    // Parse request body
    const { files } = await req.json();
    
    if (!files || Object.keys(files).length === 0) {
      updateProgress('error', 'initialization', 'No files provided for deployment');
      return NextResponse.json({ 
        error: 'No files provided for deployment' 
      }, { status: 400 });
    }
    
    // Transform and write files
    const fileObjects = transformFiles(files);
    await writeFilesToDisk(fileObjects, tempSrcDir);
    
    // Build the project
    const buildOutput = await runBuild(tempSrcDir);
    
    // Check if build directory exists and contains index.html
    if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
      updateProgress('error', 'build_process', 'Build failed: index.html not found in build output');
      throw new Error('Build failed: index.html not found in build output');
    }
    
    // Create ZIP archive
    await zipDirectory(buildDir, zipPath);
    
    // Create Netlify site
    const site = await createNetlifySite();
    
    // Deploy to Netlify
    const deployResult = await deployZipToNetlify(site.id, zipPath);
    
    // Clean up
    await cleanupTempFiles([tempSrcDir, zipPath]);
    
    // Return success response
    return NextResponse.json({
      url: deployResult?.deploy_url,
      stage: "deploy completed",
      message: `Congratulations! Your site has been deployed to Netlify`,
      status: 'success'
    });
    
  } catch (error: any) {
    console.error('Deployment failed:', error);
    
    // Attempt cleanup even if deployment failed
    try {
      await cleanupTempFiles([tempSrcDir, zipPath]);
    } catch (cleanupError) {
      console.error('Cleanup failed after error:', cleanupError);
    }
    
    // Determine error stage
    let stage = buildProgress.stage || 'unknown';
    
    // Return structured error response
    return NextResponse.json({
      error: error.message || 'Unknown deployment failure',
      stage,
      details: error.stack
    }, { status: 500 });
  }
}
