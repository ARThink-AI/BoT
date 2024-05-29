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

  if (req.method === 'GET') {
    
    const  AccountSid = req.query.AccountSid;
    const  workspaceId = req.query.state;
    if ( !AccountSid || !workspaceId ) {
   return badRequest(res)
    }
    let buyPhone = null;
    const workspace = await prisma.workspace.findUnique({
      where : {
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id : workspaceId
      }
    });
   
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
    if ( ! workspace.twilioPhoneNumber ) {
    
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
 const client = twilio( AccountSid , env.TWILIO_AUTH_TOKEN );

 const phoneNumbers = await client.availablePhoneNumbers('US')
 .local
 .list({inRegion: 'AR', limit: 20});
 
 
 if ( phoneNumbers.length > 0 ) {
   buyPhone = phoneNumbers[0].phoneNumber;
   await client.incomingPhoneNumbers.create( {phoneNumber: buyPhone } );
   await prisma.workspace.update({
    where: {
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      id : workspaceId
    },
    data : {
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      twilioId:  AccountSid ,
      twilioPhoneNumber : buyPhone
    }
  })
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
  res.redirect(env.NEXT_PUBLIC_BUILDER_URL[0]);
 }

    } else {
      
      await prisma.workspace.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
          id : workspaceId
        },
        data : {
           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
          twilioId:  AccountSid 
          
        }
      })
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      res.redirect(env.NEXT_PUBLIC_BUILDER_URL[0]);
    }
   

  }

  return methodNotAllowed(res);
}
export default handler;