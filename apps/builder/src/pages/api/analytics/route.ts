import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { env } from "@typebot.io/env";
import { NextApiRequest } from 'next';

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}

export default async function handler(req : NextApiRequest , res : NextResponse) {
  try {
    if ( req.method == "GET" ) {
      console.log("req params", req.query );
    const responseData = { message: "Success in get request" };
    return NextResponse.json(responseData, { status: 200, headers: responseHeaders });
    }
   

  } catch (err) {
    console.log("error", err);
    const errorResponseData = { message: 'Error converting text to speech' };
    return NextResponse.json(errorResponseData, { status: 500, headers: responseHeaders });
  }
}