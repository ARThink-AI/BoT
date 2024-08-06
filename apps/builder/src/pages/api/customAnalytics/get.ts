import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'
import prisma from '@typebot.io/lib/prisma'


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const apiKeyParam = req.query.apiKey?.toString()
    const publicIdParam = req.query.publicId?.toString()
    const skip = Number(req.query.skip)
    
    const take = Number(req.query.take)
   
    if ( !apiKeyParam || !publicIdParam || (!skip && skip != 0 ) || !take  ) {
      return res.status(400).send({ message: 'Bad request' })
    }


    const apiTokenInfo = await prisma.apiToken.findUnique({  where : { token : apiKeyParam } });
    if ( apiTokenInfo ) {
      const userId = apiTokenInfo.ownerId;
      const workspaces = await prisma.workspace.findMany({
        where: { members: { some: { userId } } },
        select: { name: true, id: true, icon: true, plan: true },
      })
    const  typebot = await prisma.typebot.findUnique( {  where : { publicId : publicIdParam  }   } );
      const  ownerShip = workspaces.filter( w => w.id == typebot?.workspaceId  ).length == 1;
      if ( ownerShip ) {
        const  results = await prisma.result.findMany({ skip  :skip
         , take : take ,where : {  typebotId : typebot?.id  }  });
         console.log("results",  JSON.stringify(results) );
           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
         const  finalResuls = [];
         for ( let i=0; i < results.length;i++ ) {
          const  obj = {};
           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
         for ( let j =0;j < results[i].variables.length ; j++ ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        obj[results[i].variables[j].name] = results[i].variables[j].value 
         }
        const  logs = await prisma.log.findMany({  where : { resultId : results[i].id   } , select : { status : true , description : true , details : true }  });
        if ( logs.length > 0 ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  obj["logs"] = logs;
        }
      
        if ( Object.getOwnPropertyNames(obj).length > 0 ) {
          finalResuls.push(obj);
        }  
       
         
      }
         
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        return res.status(200).json({ results : finalResuls })
      } else {
        return res.status(500).send({ message: 'Typebot does not belong to user' })
      }

      
    } else {
      return res.status(500).send({ message: 'Incorrect API token' })
    }
      
    }
    
  
  return methodNotAllowed(res)
}

export default handler
