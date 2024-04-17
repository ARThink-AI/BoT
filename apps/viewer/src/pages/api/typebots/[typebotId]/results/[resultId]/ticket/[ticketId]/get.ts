import prisma from '@typebot.io/lib/prisma'
import { Result } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("request",req.query);
  if (req.method === 'GET') {
   
    const resultId = req.query.resultId as string ;
    const ticketIdVariableName = req.query.ticketId as string ;
    const accessTokenVariableName = req.query.accessTokenVariable as string;

    
    const result = await prisma.result.findUnique( { where: { id: resultId }  } );
    console.log("variables", result?.variables );
    // @ts-ignore
    console.log("filter", result?.variables?.filter( v => v.name == ticketIdVariableName  ));
    // @ts-ignore
    const ticketId = result?.variables?.filter( v => v.name == ticketIdVariableName  ).length > 0 ?  result?.variables?.filter( v => v.name == ticketIdVariableName  )[0]?.value  : null;
    
    // @ts-ignore
    const accessToken  = result?.variables?.filter( v => v.name == accessTokenVariableName  ).length > 0 ?  result?.variables?.filter( v => v.name == accessTokenVariableName  )[0]?.value  : null;
  
  return res.json({ success : true , ticketId : ticketId , accessToken : accessToken  })
  }
  return methodNotAllowed(res)
}

export default handler