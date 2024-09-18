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
    console.log('resultId', resultId)
    const result = await prisma.result.findUnique({ where: { id: resultId } })
    console.log('result', JSON.stringify(result))
    return res.json({
      success: true,
      data: result?.livechat,
      sessionDate: result?.createdAt,
    })
  }
  return methodNotAllowed(res)
}

export default handler
