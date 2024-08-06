import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import { generatePresignedPostPolicyBlob } from '@typebot.io/lib/azure-blob/generatePresignedPostPolicy'
 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     //@ts-ignore
import * as qr from 'qrcode';
 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     //@ts-ignore
import { v4 as uuidv4 } from 'uuid';
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}

export async function POST(req: Request) {
  const { PNR, primaryPassengerName, paymentReferenceNumber } = (await req.json()) as {
    PNR: string;
    primaryPassengerName: string;
    paymentReferenceNumber: string;
  }

  if (!PNR || !primaryPassengerName || !paymentReferenceNumber) {
    return NextResponse.json(
      { message: 'Missing required fields in request body' },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    
    // Combine information for QR code
    const qrCodeInfo = `PNR: ${PNR}\nName: ${primaryPassengerName}\nPayment Reference: ${paymentReferenceNumber}`;

    // Generate QR code
    const qrCodeBuffer = await qr.toBuffer(qrCodeInfo);

    // Upload QR code image to Azure Blob Storage using generatePresignedPostPolicyBlob
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     //@ts-ignore
    const props = {
      filePath: `qr-codes/qr-code-${uuidv4()}.png`,  // Modify the path as needed
      fileType: 'image/png',  // Adjust the file type if necessary
      maxFileSize: 5,  // Set the maximum file size in megabytes
    };
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
    const { presignedUrl, formData, fileUrl } = await generatePresignedPostPolicyBlob(props);
    console.log("form data",formData);
    // Upload the QR code to the presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',  // Change to 'POST' based on your backend logic
      headers: {
        'x-ms-blob-type': 'BlockBlob',  // Add the required header
        'Content-Type': 'image/png',  // Adjust the content type if necessary
        // Add any other headers as needed
      },
      body: qrCodeBuffer,
    });
    
   
    
    
    
    
    
    

    if (!uploadResponse.ok) {
      const errorMessage = `Failed to upload QR code to Azure Blob Storage. Status: ${uploadResponse.status}`;
      console.error(errorMessage);
      return NextResponse.json(
        { message: errorMessage },
        { status: uploadResponse.status, headers: responseHeaders }
      );
    }
     const  updatedfileUrl = fileUrl.split("?")[0]
    // Return the public URL of the uploaded image
    return new NextResponse(updatedfileUrl, {
      headers: {
        ...responseHeaders,
        'Content-Type': 'text/plain',
      },
    });


  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error generating QR code or uploading to Azure' },
      { status: 500, headers: responseHeaders }
    );
  }
}