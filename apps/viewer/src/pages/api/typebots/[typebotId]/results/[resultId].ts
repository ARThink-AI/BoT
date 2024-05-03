import prisma from '@typebot.io/lib/prisma'
import { Result } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, initMiddleware } from '@typebot.io/lib/api'
import Cors from 'cors'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'PATCH') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Result
    const resultId = req.query.resultId as string
    const result = await prisma.result.updateMany({
      where: { id: resultId },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler
