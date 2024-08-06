// import {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
//   generateBlobSASQueryParameters,
//   BlobSASPermissions,
// } from '@azure/storage-blob'
// import { env } from '@typebot.io/env';
// // @ts-ignore
// export const generatePresignedUrlBlob = async ({ blobName: string }) => {
//   if (!env.AZURE_BLOB_ACCOUNT_NAME || !env.AZURE_BLOB_ACCOUNT_KEY || !env.AZURE_BLOB_CONTAINER_NAME )
//     throw new Error(
//       'AZURE Blob Variables not configued properly'
//     ) 
//   const sharedKeyCredential = new StorageSharedKeyCredential(
//     env.AZURE_BLOB_ACCOUNT_NAME,
//     env.AZURE_BLOB_ACCOUNT_KEY
//   )
//   const blobServiceClient = new BlobServiceClient(
//     `https://${sharedKeyCredential.accountName}.blob.core.windows.net`,
//     sharedKeyCredential
//   )
//   const containerClient = blobServiceClient.getContainerClient(env.AZURE_BLOB_CONTAINER_NAME)
//   const blobClient = containerClient.getBlobClient(blobName)

//   const sasQueryParameters = generateBlobSASQueryParameters(
//     {
//       containerName: containerClient.containerName,
//       blobName: blobClient.name,
//       permissions: BlobSASPermissions.parse('r'), // "r" for read
//       startsOn: new Date(),
//       expiresOn: new Date(new Date().valueOf() + 86400), // Valid for 24 hours
//     },
//     sharedKeyCredential
//   )

//   return `${blobClient.url}?${sasQueryParameters.toString()}`
// }

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
import { env } from '@typebot.io/env';
type GeneratePresignedUrlProps = {
  filePath: string;
  fileType?: string;
};

const tenMinutes = 10 * 60;

export const generatePresignedUrlBlob  = async ({
  filePath,
  fileType,
}: GeneratePresignedUrlProps): Promise<string> => {
  if (!env.AZURE_BLOB_CONNECTION_STRING || !env.AZURE_BLOB_CONTAINER_NAME ) {
    throw new Error('Azure Blob Storage not properly configured.');
  }

  // Create a BlobServiceClient using the connection string
  const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_BLOB_CONNECTION_STRING);

  // Create a container client
  const containerName = env.AZURE_BLOB_CONTAINER_NAME; // Replace with your container name
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Get a blob client with the specified filePath
  const blobClient = containerClient.getBlobClient(filePath);

  // Set the constraints for the SAS token
  const permissions = "w"; // "w" for write permission (PUT)
  const expiresOn = new Date(new Date().getTime() + tenMinutes * 1000);
  const options = {
    permissions,
    startsOn: new Date(),
    expiresOn,
  };

  if (fileType) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options["contentType"] = fileType;
  }

  // Generate a SAS token
  const sasToken = await blobClient.generateSasUrl(options);

  // Construct the complete URL
  const completeUrl = blobClient.url + "?" + sasToken;

  return completeUrl;
};
