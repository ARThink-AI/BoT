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
    // @ts-ignore
    const accountId = workspace?.twilioId;
    // @ts-ignore
    const twilioPhone = workspace?.twilioPhoneNumber;
    if ( !accountId || !twilioPhone ) {
      return badRequest(res)
    }
    const client = twilio( accountId , env.TWILIO_AUTH_TOKEN );
    
    await client.calls.create( {
      url : "https://viewer.arthink.ai/twilio/voice",
       to : req.body.phoneNumber,
       // @ts-ignore
       from : twilioPhone

    } );

    res.status(200).json({ success : true  })
  }
  return methodNotAllowed(res);
}
export default handler;