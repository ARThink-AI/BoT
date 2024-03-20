import { SendButton } from '@/components/SendButton'
import { BotContext, InputSubmitContent } from '@/types'
import { FileInputBlock } from '@typebot.io/schemas'
import { defaultFileInputOptions } from '@typebot.io/schemas/features/blocks/inputs/file'
import { createSignal, Match, Show, Switch } from 'solid-js'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { uploadFiles } from '../helpers/uploadFiles'
import { guessApiHost } from '@/utils/guessApiHost'
import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'

type Props = {
  context: BotContext
  block: FileInputBlock
  onSubmit: (url: InputSubmitContent) => void
  onSkip: (label: string) => void
}

export const FileUploadForm = (props: Props) => {
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([])
  const [isUploading, setIsUploading] = createSignal(false)
  const [uploadProgressPercent, setUploadProgressPercent] = createSignal(0)
  const [isDraggingOver, setIsDraggingOver] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal<string>()

  const onNewFiles = (files: FileList) => {
    setErrorMessage(undefined)
    const newFiles = Array.from(files)
    const sizeLimit =
      props.block.options.sizeLimit ??
      getRuntimeVariable('NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE')
    if (
      sizeLimit &&
      newFiles.some((file) => file.size > sizeLimit * 1024 * 1024)
    )
      return setErrorMessage(`A file is larger than ${sizeLimit}MB`)
    if (!props.block.options.isMultipleAllowed && files)
      return startSingleFileUpload(newFiles[0])
    setSelectedFiles([...selectedFiles(), ...newFiles])
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (selectedFiles().length === 0) return
    startFilesUpload(selectedFiles())
  }

  const startSingleFileUpload = async (file: File) => {
    if (props.context.isPreview || !props.context.resultId)
      return props.onSubmit({
        label: `File uploaded`,
        value: 'http://fake-upload-url.com',
      })
    setIsUploading(true)
    const urls = await uploadFiles({
      apiHost: props.context.apiHost ?? guessApiHost(),
      files: [
        {
          file,
          input: {
            sessionId: props.context.sessionId,
            fileName: file.name,
          },
        },
      ],
    })
    setIsUploading(false)
    if (urls.length)
      return props.onSubmit({ label: `File uploaded`, value: urls[0] ?? '' })
    setErrorMessage('An error occured while uploading the file')
  }
  const startFilesUpload = async (files: File[]) => {
    const resultId = props.context.resultId
    if (props.context.isPreview || !resultId)
      return props.onSubmit({
        label: `${files.length} file${files.length > 1 ? 's' : ''} uploaded`,
        value: files
          .map((_, idx) => `http://fake-upload-url.com/${idx}`)
          .join(', '),
      })
    setIsUploading(true)
    const urls = await uploadFiles({
      apiHost: props.context.apiHost ?? guessApiHost(),
      files: files.map((file) => ({
        file: file,
        input: {
          sessionId: props.context.sessionId,
          fileName: file.name,
        },
      })),
      onUploadProgress: setUploadProgressPercent,
    })
    setIsUploading(false)
    setUploadProgressPercent(0)
    if (urls.length !== files.length)
      return setErrorMessage('An error occured while uploading the files')
    props.onSubmit({
      label: `${urls.length} file${urls.length > 1 ? 's' : ''} uploaded`,
      value: urls.join(', '),
    })
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => setIsDraggingOver(false)

  const handleDropFile = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer?.files) return
    onNewFiles(e.dataTransfer.files)
  }

  const clearFiles = () => setSelectedFiles([])

  const skip = () =>
    props.onSkip(
      props.block.options.labels.skip ?? defaultFileInputOptions.labels.skip
    )

  return (
    <form class="flex flex-col 	justify-center items-center w-full gap-2" onSubmit={handleSubmit}>
      <label
        for="dropzone-file"
        class={
          'typebot-upload-input py-6 flex flex-col justify-center  items-center lg:w-2/3 md:w-2/3 sm:w-full border-2 border-gray-500 border-dashed  cursor-pointer hover:bg-gray-50 px-8 ' +
          (isDraggingOver() ? 'dragging-over' : '')
        }
        style={{ "border-radius": '24px' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropFile}
      >
        <Switch>
          <Match when={isUploading()}>
            <Show when={selectedFiles().length > 1} fallback={<Spinner />}>
              <div class="w-full bg-gray-200 flex justify-center gap-2 items-center rounded-full h-2.5">
                <div
                  class="upload-progress-bar h-2.5 rounded-full"
                  style={{
                    width: `${uploadProgressPercent() > 0 ? uploadProgressPercent : 10
                      }%`,
                    transition: 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </Show>
          </Match>
          <Match when={!isUploading()}>
            <>
              <div class="flex flex-col justify-center items-center">
                <Show when={selectedFiles().length} fallback={<UploadIcon />}>
                  <span class="relative">
                    <FileIcon />
                    <div
                      class="total-files-indicator flex items-center justify-center absolute -right-1 px-1 w-4 h-4"
                      style={{ bottom: '5px' }}
                    >
                      {selectedFiles().length}
                    </div>
                  </span>
                </Show>
                <p
                  class="text-sm md:text-base lg:text-lg text-gray-500 text-center my-3"
                  innerHTML={props.block.options.labels.placeholder}
                />
              </div>
              <input
                id="dropzone-file"
                type="file"
                class="hidden"
                multiple={props.block.options.isMultipleAllowed}
                onChange={(e) => {
                  if (!e.currentTarget.files) return
                  onNewFiles(e.currentTarget.files)
                }}
              />
            </>
          </Match>
        </Switch>
      </label>
      <Show
        when={
          selectedFiles().length === 0 &&
          props.block.options.isRequired === false
        }
      >
        <div class="flex justify-end">
          <Button on:click={skip}>
            {props.block.options.labels.skip ??
              defaultFileInputOptions.labels.skip}
          </Button>
        </div>
      </Show>
      <Show
        when={
          props.block.options.isMultipleAllowed &&
          selectedFiles().length > 0 &&
          !isUploading()
        }
      >
        <div class="flex justify-end">
          <div class="flex gap-2">
            <Show when={selectedFiles().length}>
              <Button variant="secondary" on:click={clearFiles}>
                {props.block.options.labels.clear ??
                  defaultFileInputOptions.labels.clear}
              </Button>
            </Show>
            <SendButton type="submit" disableIcon>
              {props.block.options.labels.button ===
                defaultFileInputOptions.labels.button
                ? `Upload ${selectedFiles().length} file${selectedFiles().length > 1 ? 's' : ''
                }`
                : props.block.options.labels.button}
            </SendButton>
          </div>
        </div>
      </Show>
      <Show when={errorMessage()}>
        <p class="text-red-500 text-sm">{errorMessage()}</p>
      </Show>
    </form>
  )
}

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg"
    height="40px"
    viewBox="0 -960 960 960"
    width="40px">
    <path d="M440-367v127q0 17 11.5 28.5T480-200q17 0 28.5-11.5T520-240v-127l36
     36q6 6 13.5 9t15 2.5q7.5-.5 14.5-3.5t13-9q11-12 11.5-28T612-388L508-492q-6-6-13-8.5t-15-2.5q-8 0-15
      2.5t-13 8.5L348-388q-12 12-11.5 28t12.5 28q12 11 28 11.5t28-11.5l35-35ZM240-80q-33 
      0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h287q16 0 30.5 6t25.5 17l194 194q11
       11 17 25.5t6 30.5v447q0 33-23.5 56.5T720-80H240Zm280-560q0 17 11.5 28.5T560-600h160L520-800v160Z" fill="#4A7194" /></svg>
)

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="200px"
    height="200px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="mb-3 text-gray-500"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)
