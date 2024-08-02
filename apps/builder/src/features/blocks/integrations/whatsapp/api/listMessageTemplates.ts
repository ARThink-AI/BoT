import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import got from 'got'

export const listMessageTemplates = authenticatedProcedure.meta({
  openapi: {
    method: 'GET',
    path: '/Whastapp/messageTemplates',
    protect: true,
    summary: 'List Message Templates',
    tags: ['Whastapp'],
  },
}).input(
  z.object({
    credentialsId: z.string(),
    workspaceId: z.string(),
  })
).query(async ({ input: { credentialsId, workspaceId } }) => {
  // console.log("list message templates called");
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: credentialsId,
      workspaceId: workspaceId
    },
  });
  if (!credentials)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No credentials found',
    })
  const data = (await decrypt(
    credentials.data,
    credentials.iv
  )) as { systemAccessToken: string };
  const messageTemplatesResponse = await got.get(`https://graph.facebook.com/v20.0/404528709399690/message_templates
`, {
    headers: {
      Authorization: `Bearer ${data?.systemAccessToken}`
    }
  }).json();

  const {
    data: { expires_at, scopes, app_id, application },
  } = (await got(
    `https://graph.facebook.com/v17.0/debug_token?input_token=${data?.systemAccessToken}`,
    {
      headers: {
        Authorization: `Bearer ${data.systemAccessToken}`,
      },
    }
  ).json()) as {
    data: {
      app_id: string
      application: string
      expires_at: number
      scopes: string[]
    }
  }
  // console.log("app_id", app_id);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // return messageTemplatesResponse?.data;
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    templates: messageTemplatesResponse?.data,
    appId: app_id

  }
})