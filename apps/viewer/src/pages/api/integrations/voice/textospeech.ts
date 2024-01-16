import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  
  initMiddleware,
  methodNotAllowed,
} from '@typebot.io/lib/api'
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { TranslationServiceClient } from "@google-cloud/translate";
import { SpeechClient } from "@google-cloud/speech";
import { env } from "@typebot.io/env";
// import { generatePresignedUrlBlob } from '@typebot.io/lib/azure-blob/generatePresignedUrl';
import Cors from 'cors'


const cors = initMiddleware(Cors())


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'POST') {
    const { text, type, audio, langCode , inputFace } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    if (!text || !type) {
      return badRequest(res)
      
    }

    try {
      const client = new TextToSpeechClient({
        projectId: env.GOOGLE_PROJECT_ID,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
        credentials: JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
      });

      if (type == "translate") {
        const translationClient = new TranslationServiceClient({
          projectId: env.GOOGLE_PROJECT_ID,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
          credentials: JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
        });

        if (langCode != "en-IN" && langCode != "te-IN" ) {
          const [resp] = await translationClient.translateText({
            parent: `projects/${env.GOOGLE_PROJECT_ID}/locations/global`,
            contents: [text],
            targetLanguageCode: langCode.split("-")[0]
          });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
          const translation = resp.translations[0].translatedText;
          const  payload = {
            input_face :  inputFace ,
            text_prompt : translation 
          }
          const response = await fetch("https://api.gooey.ai/v2/LipsyncTTS/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GOOEY_AI_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        
          if (!response.ok) {
           return  res.status(500).send({
              error : "Internal Server Error",
            })
          }
        
          const result = await response.json();
          return res.json({ videoUrl : result["output"]["output_video"]  });
          // return res.json({ message : translation  });



//           let request ;
//           if ( langCode != "te-IN" ) {
//  request = {
//             input: { text: translation },
//             voice: { languageCode: langCode, ssmlGender: 'FEMALE' },
//             audioConfig: { audioEncoding: 'MP3' }
//           };
//           } else {
//  request = {
//             input: { text: translation },
//             voice: { languageCode: langCode,  name : "te-IN-Standard-A", ssmlGender: 'FEMALE' },
//             audioConfig: { audioEncoding: 'MP3' } ,
//             ssml: `<speak><prosody pitch="7.0%">${translation}</prosody></speak>`
//           };
//           }
          
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   //@ts-ignore
//           const [response] = await client.synthesizeSpeech(request);
//           const audioBuffer = response.audioContent;
//           const base64Audio = Buffer.from(audioBuffer).toString('base64');

//           const obj = { audioData: base64Audio };
          
//           return res.json({ message : obj });
        } else if ( langCode == "te-IN" ) {
          const [resp] = await translationClient.translateText({
            parent: `projects/${env.GOOGLE_PROJECT_ID}/locations/global`,
            contents: [text],
            targetLanguageCode: langCode.split("-")[0]
          });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
          const translation = resp.translations[0].translatedText;
          const  payload = {
            input_face :  inputFace ,
            text_prompt : translation ,
            tts_provider : "GOOGLE_TTS",
            google_voice_name : "te-IN-Standard-A",
            google_speaking_rate: 1.4,
  google_pitch: 0,
          }
          const response = await fetch("https://api.gooey.ai/v2/LipsyncTTS/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GOOEY_AI_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        
          if (!response.ok) {
           return  res.status(500).send({
              error : "Internal Server Error",
            })
          }
        
          const result = await response.json();
          return res.json({ videoUrl : result["output"]["output_video"]  });

//           const [resp] = await translationClient.translateText({
//             parent: `projects/${env.GOOGLE_PROJECT_ID}/locations/global`,
//             contents: [text],
//             targetLanguageCode: langCode.split("-")[0]
//           });
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   //@ts-ignore
//           const translation = resp.translations[0].translatedText;
//           let request ;
//            request = {
//             input: { text: translation },
//             voice: { languageCode: langCode,  name : "te-IN-Standard-A", ssmlGender: 'FEMALE' },
//             audioConfig: { audioEncoding: 'MP3' } ,
//             // @ts-ignore
//             ssml: `<speak><prosody pitch="7.0%">${translation}</prosody></speak>`
//           };
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         //@ts-ignore
//           const [response] = await client.synthesizeSpeech(request);
//           const audioBuffer = response.audioContent;
//           const base64Audio = Buffer.from(audioBuffer).toString('base64');


          
        } else {
         
          const  payload = {
            input_face :  inputFace ,
            text_prompt : text 
          }
          const response = await fetch("https://api.gooey.ai/v2/LipsyncTTS/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GOOEY_AI_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        
          if (!response.ok) {
           return  res.status(500).send({
              error : "Internal Server Error",
            })
          }
        
          const result = await response.json();
          return res.json({ videoUrl : result["output"]["output_video"]  });
//           const request = {
//             input: { text },
//             voice: { languageCode: langCode, ssmlGender: 'FEMALE' },
//             audioConfig: { audioEncoding: 'MP3' }
//           };
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   //@ts-ignore
//           const [response] = await client.synthesizeSpeech(request);
//           const audioBuffer = response.audioContent;
//           const base64Audio = Buffer.from(audioBuffer).toString('base64');

//           const obj = { audioData: base64Audio };
        
//           return res.json({ message : obj });


        }
      } else if (type == "listvoices") {
        const [response] = await client.listVoices({});
        const voices = response.voices?.map(v => {
          return {
            ...v,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
            languageName: new Intl.DisplayNames([v?.languageCodes[0].split("-")[0]], { type: 'region' }).of(v?.languageCodes[0].split("-")[1])
          }
        });

        const obj = { voices };
        // return NextResponse.json(
        //   { message: obj },
        //   { status: 200, headers: responseHeaders }
        // );
        return res.json({ message : obj });
      } else if (type == "speechtotext") {
        const speechClient = new SpeechClient({
          projectId: env.GOOGLE_PROJECT_ID,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
          credentials: JSON.parse(env.GOOGLE_PROJECT_CREDENTIALS)
        });

        const audioBytes = Buffer.from(audio, 'base64');
        const [response] = await speechClient.recognize({
          audio: {
            content: audioBytes
          },
          config: {
            encoding: "WEBM_OPUS",
            // sampleRateHertz: 8000,
            languageCode: 'en-IN',
            // alternativeLanguageCodes: ['es-ES', 'en-US', 'en-IN'],
          },
        });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
        const transcription = response.results
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
          .map(result => result.alternatives[0].transcript)
          .join('\n');

        const obj = { transcription };
        // return NextResponse.json(
        //   { message: obj },
        //   { status: 200, headers: responseHeaders }
        // );
        return res.json({ message : obj });
      } else {
        // return NextResponse.json(
        //   { message: "No Type Found" },
        //   { status: 200, headers: responseHeaders }
        // );
        return res.json({ message : "No Type Found" })
      }
    } catch (error) {
      console.error('Error:', error);
            res.status(500).send({
          error,
        })
    }
  }

  return methodNotAllowed(res);
}

// export default handler;



// https://stripe.com/docs/currencies#zero-decimal


export default handler
