import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import { generatePresignedPostPolicyBlob } from '@typebot.io/lib/azure-blob/generatePresignedPostPolicy'
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}

export async function POST(req: Request) {
  const { filePath, fileType, maxFileSize } = (await req.json()) as {
    filePath: string;
    fileType: string;
    maxFileSize: string;
  }

  if (!filePath || !fileType || !maxFileSize) {
    return NextResponse.json(
      { message: 'Missing required fields in request body' },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     //@ts-ignore
    const props = {
      filePath,  // Modify the path as needed
      fileType,  // Adjust the file type if necessary
      maxFileSize,  // Set the maximum file size in megabytes
    };
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
    const { presignedUrl, formData, fileUrl } = await generatePresignedPostPolicyBlob(props);
 
    
   
    
    
    
    
    
    

    
    // Return the public URL of the uploaded image
    // return new NextResponse({ presignedUrl ,formData ,fileUrl  }, {
    //   headers: {
    //     ...responseHeaders,
    //     'Content-Type': 'text/plain',
    //   },
    // });
    return NextResponse.json(
      { message: { presignedUrl, formData, fileUrl } },
      { status: 200, headers: responseHeaders }
    );


  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error generating QR code or uploading to Azure' },
      { status: 500, headers: responseHeaders }
    );
  }
}