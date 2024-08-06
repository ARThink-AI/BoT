import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  FileInputBlock,
  InputBlockType,
  LogicBlockType,
  PublicTypebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { byId, isDefined } from '@typebot.io/lib'
import { z } from 'zod'
import { generatePresignedUrl } from '@typebot.io/lib/s3/deprecated/generatePresignedUrl'
import {  generatePresignedUrlBlob } from '@typebot.io/lib/azure-blob/generatePresignedUrl';
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'

export const getUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/blocks/{blockId}/storage/upload-url',
      summary: 'Get upload URL for a file',
      description: 'Used for the web client to get the bucket upload file.',
      deprecated: true,
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      filePath: z.string(),
      fileType: z.string().optional(),
    })
  )
  .output(
    z.object({
      presignedUrl: z.string(),
      hasReachedStorageLimit: z.boolean(),
    })
  )
  .query(async ({ input: { typebotId, blockId, filePath, fileType } }) => {
    if ( (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) || ( !env.AZURE_BLOB_ACCOUNT_NAME || !env.AZURE_BLOB_ACCOUNT_KEY || !env.AZURE_BLOB_CONNECTION_STRING || !env.AZURE_BLOB_CONTAINER_NAME )  ) {
      // throw new TRPCError({
      //   code: 'INTERNAL_SERVER_ERROR',
      //   message:
      //     'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      // })
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'File upload variables not configured properly',
      })
    }

     

    const publicTypebot = (await prisma.publicTypebot.findFirst({
      where: { typebotId },
      select: {
        groups: true,
        typebotId: true,
      },
    })) as Pick<PublicTypebot, 'groups' | 'typebotId'>

    const fileUploadBlock = await getFileUploadBlock(publicTypebot, blockId)

    if (!fileUploadBlock)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'File upload block not found',
      })

    // const presignedUrl = await generatePresignedUrl({
    //   fileType,
    //   filePath,
    // })
    let presignedUrl:string;
    if ( env.S3_ENDPOINT  && env.S3_ACCESS_KEY && env.S3_SECRET_KEY ) {
        presignedUrl = await generatePresignedUrl({
            fileType,
            filePath,
          })
    } else if ( env.AZURE_BLOB_CONNECTION_STRING && env.AZURE_BLOB_CONTAINER_NAME )  {
      presignedUrl = await generatePresignedUrlBlob({ fileType , filePath })
    }
   
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      presignedUrl,
      hasReachedStorageLimit: false,
    }
  })

const getFileUploadBlock = async (
  publicTypebot: Pick<PublicTypebot, 'groups' | 'typebotId'>,
  blockId: string
): Promise<FileInputBlock | null> => {
  const fileUploadBlock = publicTypebot.groups
    .flatMap((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlock?.type === InputBlockType.FILE) return fileUploadBlock
  const linkedTypebotIds = publicTypebot.groups
    .flatMap((group) => group.blocks)
    .filter((block) => block.type === LogicBlockType.TYPEBOT_LINK)
    .flatMap((block) => (block as TypebotLinkBlock).options.typebotId)
    .filter(isDefined)
  const linkedTypebots = (await prisma.publicTypebot.findMany({
    where: { typebotId: { in: linkedTypebotIds } },
    select: {
      groups: true,
    },
  })) as Pick<PublicTypebot, 'groups'>[]
  const fileUploadBlockFromLinkedTypebots = linkedTypebots
    .flatMap((typebot) => typebot.groups)
    .flatMap((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlockFromLinkedTypebots?.type === InputBlockType.FILE)
    return fileUploadBlockFromLinkedTypebots
  return null
}
