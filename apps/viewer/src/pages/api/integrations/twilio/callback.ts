import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  
  initMiddleware,
  methodNotAllowed,
} from '@typebot.io/lib/api'
import Cors from 'cors'
import prisma from '@typebot.io/lib/prisma'
import { env } from '@typebot.io/env'
const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'GET') {
    console.log( JSON.stringify(req.query) );
    let AccountSid = req.query.AccountSid;
    let workspaceId = req.query.state;
    if ( !AccountSid || !workspaceId ) {
   return badRequest(res)
    }

    // const typebot = await prisma.typebot.findUnique({
    //   where: {
    //     // @ts-ignore
    //     id : typebotId
    //   }
    // });
    // console.log("typebot details",typebotDetails);
    await prisma.workspace.update({
      where: {
        // @ts-ignore
        id : workspaceId
      },
      data : {
        // @ts-ignore
        twilioId:  AccountSid
      }
    })
     // @ts-ignore
    res.redirect(env.NEXT_PUBLIC_BUILDER_URL[0]);



    // res.status(200).json({ message : "Hello World" })
  }

  return methodNotAllowed(res);
}
export default handler;