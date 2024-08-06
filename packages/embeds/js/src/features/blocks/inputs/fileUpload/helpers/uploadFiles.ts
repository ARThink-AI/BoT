import { sendRequest } from '@typebot.io/lib/utils'

type UploadFileProps = {
  apiHost: string
  files: {
    file: File
    input: {
      sessionId: string
      fileName: string
    }
  }[]
  onUploadProgress?: (percent: number) => void
}

type UrlList = (string | null)[]

export const uploadFiles = async ({
  apiHost,
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  console.log("const api hosts files",apiHost,files);

  const urls = []
  let i = 0
  for (const { input, file } of files) {
    onUploadProgress && onUploadProgress((i / files.length) * 100)
    i += 1
    const { data } = await sendRequest<{
      presignedUrl: string
      formData: Record<string, string>
      fileUrl: string
    }>({
      method: 'POST',
      url: `${apiHost}/api/v1/generate-upload-url`,
      body: {
        filePathProps: input,
        fileType: file.type,
      },
    })

    if (!data?.presignedUrl) continue
    else {
      const formData = new FormData()
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', file)
      // const upload = await fetch(data.presignedUrl, {
      //   method: 'POST',
      //   body: formData,
      // })
      console.log("fileee",file);
      console.log(file.type);
      const upload = await fetch(data.presignedUrl, {
        method: 'PUT',
        headers : {
          "Content-Type":  file.type,
          "x-ms-blob-type" : "BlockBlob",
          "Access-Control-Allow-Origin":  "http://localhost:3001"
        },
        body: file,
      })

      if (!upload.ok) continue

      urls.push(data.fileUrl)
    }
  }
  return urls
}
