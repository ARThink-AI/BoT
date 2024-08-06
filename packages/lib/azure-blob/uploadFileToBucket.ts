import { BlobServiceClient } from '@azure/storage-blob'
import { env } from '@typebot.io/env'
type Props = {
  fileName: string
  file: Buffer
  mimeType: string
}

export const uploadFileToBlob = async ({
  fileName,
  file,
  mimeType,
}: Props): Promise<string> => {
  if (!env.AZURE_BLOB_CONNECTION_STRING || !env.AZURE_BLOB_CONTAINER_NAME )
    throw new Error(
      'AZURE Blob Variables not configued properly'
    )
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    env.AZURE_BLOB_CONNECTION_STRING
  )
  const containerClient = blobServiceClient.getContainerClient(env.AZURE_BLOB_CONTAINER_NAME)
  const blockBlobClient = containerClient.getBlockBlobClient(fileName)

  await blockBlobClient.upload(file, file.length, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  })

  return blockBlobClient.url
}
