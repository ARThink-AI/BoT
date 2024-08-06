import { env } from '@typebot.io/env';
export async function getFolderSizeBlob(folderName: string) {
  const {
    BlobServiceClient,
    StorageSharedKeyCredential,
  } = require('@azure/storage-blob')
  if (!env.AZURE_BLOB_ACCOUNT_NAME || !env.AZURE_BLOB_ACCOUNT_KEY || !env.AZURE_BLOB_CONTAINER_NAME )
    throw new Error(
      'AZURE Blob Variables not configued properly'
    ) 
  const account = env.AZURE_BLOB_ACCOUNT_NAME
  const accountKey = env.AZURE_BLOB_ACCOUNT_KEY
  const containerName = env.AZURE_BLOB_CONTAINER_NAME

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  )
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
  )

  const containerClient = blobServiceClient.getContainerClient(containerName)

  let folderSize = 0
  for await (const blob of containerClient.listBlobsFlat({
    prefix: folderName,
  })) {
    folderSize += blob.properties.contentLength
  }

  return folderSize
}

// getFolderSize('<folder-name>')
//   .then((size) => console.log(`Folder size: ${size} bytes`))
//   .catch((error) => console.error(`Error: ${error.message}`))
