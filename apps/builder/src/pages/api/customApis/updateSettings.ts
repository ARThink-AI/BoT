import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'
import prisma from '@typebot.io/lib/prisma'

// import { Theme } from '@typebot.io/schemas';
// @ts-ignore
function overwriteObjectValues(mainObject, inputObject) {
  for (let key in inputObject) {
     
      if (mainObject.hasOwnProperty(key) && typeof inputObject[key] === 'object') {
          
          for (let prop in inputObject[key]) {
              
              if (mainObject[key].hasOwnProperty(prop) && typeof inputObject[key][prop] === 'object' ) {
                 
                  for ( let p in inputObject[key][prop] ) {
                      mainObject[key][prop][p] = inputObject[key][prop][p]
                      
                  }
              } else {
                
                  mainObject[key][prop] = inputObject[key][prop];
              }
          }
      } else {
          // If entire object not present, add it to the main object
          mainObject[key] = inputObject[key];
      }
  }
}
// function overwriteObjectValues(mainObject, inputObject) {
//   for (let key in inputObject) {
//       if (mainObject.hasOwnProperty(key) && typeof inputObject[key] === 'object') {
//           for (let prop in inputObject[key]) {
//               if (mainObject[key].hasOwnProperty(prop)) {
//                   mainObject[key][prop] = inputObject[key][prop];
//               } else {
//                   // If property not present, retain previous property
//                   mainObject[key][prop] = inputObject[key][prop];
//               }
//           }
//       } else {
//           // If entire object not present, retain previous object
//           mainObject[key] = inputObject[key];
//       }
//   }
// }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
   const {  apiKey  , publicId  , theme } = req.body;
   if ( !apiKey || !publicId || !theme  ) {
    return res.status(400).send({ message: 'Bad request' })
  }
  const apiTokenInfo = await prisma.apiToken.findUnique({  where : { token : apiKey } });
  if ( apiTokenInfo ) {
    const userId = apiTokenInfo.ownerId;
      const workspaces = await prisma.workspace.findMany({
        where: { members: { some: { userId } } },
        select: { name: true, id: true, icon: true, plan: true },
      });

      const  typebot = await prisma.typebot.findUnique( {  where : { publicId : publicId  }   } );
      let ownerShip = workspaces.filter( w => w.id == typebot?.workspaceId  ).length == 1;
      if ( ownerShip ) {
        let  prevtheme = typebot?.theme;
        overwriteObjectValues(prevtheme ,theme  );
        // @ts-ignore
        await prisma.typebot.update({ where : { id:  typebot?.id } , data:{  theme : prevtheme  }  });
        return res.status(200).json({ message : "Update Succesfull" })
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