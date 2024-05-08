import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { TextToSpeechClient  } from "@google-cloud/text-to-speech";
import { TranslationServiceClient }  from "@google-cloud/translate";
import {  SpeechClient } from "@google-cloud/speech";
import { env  } from "@typebot.io/env";
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}

export async function POST(req: Request) {
  const { text , type , audio , langCode } = (await req.json()) as {
    text : string;
    type: string;
    audio : string;
    langCode : string;
  }

  if (!text || !type ) {
    return NextResponse.json(
      { message: 'Missing required fields in request body' },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    console.log("textt", text , langCode );
   
    const client = new TextToSpeechClient({
       projectId : env.GOOGLE_PROJECT_ID ,
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
       // @ts-ignore
       credentials : JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
    });
   if ( type == "translate" ) {
    // const translate = new Translate();
    const translationClient = new TranslationServiceClient({
      projectId : env.GOOGLE_PROJECT_ID ,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      credentials : JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
   });
    // if ( langCode == "hi-IN" ) {
      if ( langCode != "en-IN" ) {
      const [resp] = await translationClient.translateText({
        parent: `projects/${env.GOOGLE_PROJECT_ID}/locations/global`,
        contents: [text],
        // targetLanguageCode: "hi",
        targetLanguageCode : langCode.split("-")[0]
      } );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const translation = resp.translations[0].translatedText;
      console.log("translation", translation );
      const request = {
        input: { text:   translation },
        voice: { languageCode:  langCode , ssmlGender: 'MALE'  },
        audioConfig: { audioEncoding: 'MP3' , speakingRate: 1.2  }
    };
      console.log("request input", JSON.stringify(request));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
           // @ts-ignore
      const [response] = await client.synthesizeSpeech(request);
      const audioBuffer = response.audioContent;
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      // console.log("base64 audio", base64Audio );
        const  obj = {  audioData : base64Audio  };
        return NextResponse.json(
          { message: obj },
          { status: 200, headers: responseHeaders }
        )
    } else {

      const request = {
        input: { text },
        voice: { languageCode:  langCode , ssmlGender: 'MALE'  },
        audioConfig: { audioEncoding: 'MP3' , speakingRate: 1.2 }
    };
      console.log("request input", JSON.stringify(request));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
           // @ts-ignore
      const [response] = await client.synthesizeSpeech(request);
      const audioBuffer = response.audioContent;
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      // console.log("base64 audio", base64Audio );
        const  obj = {  audioData : base64Audio  };
        return NextResponse.json(
          { message: obj },
          { status: 200, headers: responseHeaders }
        )
    }
 
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
   } else if ( type == "speechtotext" ) {
    const speechClient = new SpeechClient({
      projectId : env.GOOGLE_PROJECT_ID ,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      credentials : JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
  });
  const audioBytes = Buffer.from(audio , 'base64');
  const [response] = await speechClient.recognize({
      
    audio: {
      // content: audioBytes,
      content : audioBytes
    },
    config: {
      // encoding: 'LINEAR16',
      encoding : "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: 'en-IN',
      alternativeLanguageCodes: ['es-ES', 'en-US','en-IN'],
      
    },
  });
  // console.log('Speech-to-Text API response:', response);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
  const transcription = response.results
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    .map(result => result.alternatives[0].transcript)
    .join('\n');
    const  obj = {  transcription  };
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