import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  
  initMiddleware,
  methodNotAllowed,
} from '@typebot.io/lib/api'
import Cors from 'cors'
import prisma from '@typebot.io/lib/prisma'
import { env } from '@typebot.io/env'
import twilio from "twilio";
const cors = initMiddleware(Cors())


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  if ( req.method == "POST" ) {
    
    const { phoneNumber , typebotId    } = req.body;
    if ( !phoneNumber || !typebotId  ) {
      return badRequest(res)
    }
    const typebot = await prisma.typebot.findUnique({
      where: {
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id : typebotId
      }
    });
    const workspaceId = typebot?.workspaceId;
    const workspace = await prisma.workspace.findUnique({
      where : {
        id : workspaceId
      }
    });
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
    const accountId = workspace?.twilioId;
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
    const twilioPhone = workspace?.twilioPhoneNumber;
    if ( !accountId || !twilioPhone ) {
      return badRequest(res)
    }
    const client = twilio( accountId , env.TWILIO_AUTH_TOKEN );
    
    await client.calls.create( {
      // url : "https://viewer.arthink.ai/twilio",
      // url : "https://7786-139-167-50-142.ngrok-free.app/voice",
      url : "http://172.178.92.219:1338/voice",
       to : req.body.phoneNumber,
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
       from : twilioPhone ,
       record : true 

    } );

    res.status(200).json({ success : true  })
  }
  return methodNotAllowed(res);
}
export default handler;