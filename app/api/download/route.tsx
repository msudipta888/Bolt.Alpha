import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip'; // Note: Renamed from 'Zip' to 'JSZip' to match standard import name

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

const transformToZip = async (files: FileObject[]) => {
  const zip = new JSZip();
  
  // Add each file to the zip
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  // Generate the zip file as an array buffer
  return await zip.generateAsync({ type: "nodebuffer" });
};

export async function POST(req: NextRequest) {
  try {
    const { files } = await req.json();
    const transformedFiles = transformFiles(files);
    const zipBuffer = await transformToZip(transformedFiles);
    
    // Create a response with the zip file
    const response = new NextResponse(zipBuffer);
    
    // Set appropriate headers
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', 'attachment; filename="bolt_alpha.zip"');
    
    return response;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
  }
}