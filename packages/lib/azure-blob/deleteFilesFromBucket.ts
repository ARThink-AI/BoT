import { BlobServiceClient } from '@azure/storage-blob'
import { env } from '@typebot.io/env'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

function getBlobNameFromUrl(blobUrl : string) {
  try {
    // Use the URL constructor to parse the blob URL
    const url = new URL(blobUrl);
    
    // Extract the path (which includes the container name and blob name)
    const path = url.pathname;
    
    // Split the path into segments
    const segments = path.split('/');
    
    // The blob name is usually the last segment
    const blobName = segments[segments.length - 1];
    
    return blobName;
  } catch (error) {
    console.error('Error parsing blob URL:', error);
    return null; // Return null or handle the error as needed
  }
}
// @ts-ignore
export const deleteFilesFromBlob = async ({ urls }) => {
  console.log("urlsss",urls);
  if (!env.AZURE_BLOB_CONNECTION_STRING || !env.AZURE_BLOB_CONTAINER_NAME) {
    throw new Error('Azure Blob Storage not properly configured.')
  }
  const options = {
    deleteSnapshots: 'include' // or 'only'
  }
  // @ts-ignore
  urls = urls.map( u => u.split("?")[0] );
  // @ts-ignore
  let blobNames = urls.map( u => getBlobNameFromUrl(u) );
  console.log("blob names", blobNames );
  const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_BLOB_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(env.AZURE_BLOB_CONTAINER_NAME)
  for (const blobName of blobNames) {
    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
   // @ts-ignore
    await blockBlobClient.deleteIfExists(options);
    // await blobClient.delete()
    
    
  }
  // console.log("modified urls", urls );
  // const options = {
  //   deleteSnapshots: 'include' // or 'only'
  // }
  // if (!env.AZURE_BLOB_CONNECTION_STRING || !env.AZURE_BLOB_CONTAINER_NAME) {
  //   throw new Error('Azure Blob Storage not properly configured.')
  // }
  // const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_BLOB_CONNECTION_STRING)
  // const containerClient = blobServiceClient.getContainerClient(env.AZURE_BLOB_CONTAINER_NAME)
  // for (const url of urls) {
  //   const blobClient = containerClient.getBlobClient(url)
  //   // await blobClient.delete()
    
    
  // }
}
