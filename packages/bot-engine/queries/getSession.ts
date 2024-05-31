import prisma from '@typebot.io/lib/prisma'
import { sessionStateSchema } from '@typebot.io/schemas'

export const getSession = async (sessionId: string) => {
  // console.log("get session called");
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, updatedAt: true },
  });
  // console.log("session", session );
  if (!session) return null
  // return { ...session, state: sessionStateSchema.parse(session.state) }
  return { ...session, state: session?.state }
}
