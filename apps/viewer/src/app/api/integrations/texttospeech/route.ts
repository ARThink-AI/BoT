import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { TextToSpeechClient  } from "@google-cloud/text-to-speech";
import { env  } from "@typebot.io/env";
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}

export async function POST(req: Request) {
  const { text , type  } = (await req.json()) as {
    text : string;
    type: string;
   
  }

  if (!text || !type ) {
    return NextResponse.json(
      { message: 'Missing required fields in request body' },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    console.log("textt", text );
   
    const client = new TextToSpeechClient({
       projectId : env.GOOGLE_PROJECT_ID ,
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
       // @ts-ignore
       credentials : JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
    });
   if ( type == "translate" ) {
    const request = {
      input: { text },
      voice: { languageCode: 'en-IN', ssmlGender: 'FEMALE'  },
      audioConfig: { audioEncoding: 'MP3' }
  };
  
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-ignore
    const [response] = await client.synthesizeSpeech(request);
    const audioBuffer = response.audioContent;
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    console.log("base64 audio", base64Audio );
      const  obj = {  audioData : base64Audio  };
      return NextResponse.json(
        { message: obj },
        { status: 200, headers: responseHeaders }
      )
   } else if ( type == "listvoices" ) {
    const [response] = await client.listVoices({});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const  voices = response.voices?.map( v => {
      return {
        ...v ,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        languageName : new Intl.DisplayNames([v?.languageCodes[0].split("-")[0]], { type: 'region' }).of(v?.languageCodes[0].split("-")[1])
      }
    } )
    const  obj = { voices :voices };
    return NextResponse.json(
      { message: obj },
      { status: 200, headers: responseHeaders }
    )
   } else {
    return NextResponse.json(
      { message: "No Type Found" },
      { status: 200, headers: responseHeaders }
    )
   }
   




  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error converting text to speech' },
      { status: 500, headers: responseHeaders }
    );
  }
}