import prisma from '@typebot.io/lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, initMiddleware } from '@typebot.io/lib/api'
import Cors from 'cors'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  console.log('request', req.query)
  if (req.method === 'GET') {
    const resultId = req.query.resultId as string
    const ticketIdVariableName = req.query.ticketId as string
    const accessTokenVariableName = req.query.accessTokenVariable as string

    const result = await prisma.result.findUnique({ where: { id: resultId } })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ticketId =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result?.variables?.filter((v) => v.name == ticketIdVariableName).length >
        0
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ? result?.variables?.filter((v) => v.name == ticketIdVariableName)[0]
          ?.value
        : null

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accessToken =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result?.variables?.filter((v) => v.name == accessTokenVariableName)
        .length > 0
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ? result?.variables?.filter((v) => v.name == accessTokenVariableName)[0]
          ?.value
        : null

    return res.json({
      success: true,
      ticketId: ticketId,
      accessToken: accessToken,
    })
  }
  return methodNotAllowed(res)
}

export default handler
