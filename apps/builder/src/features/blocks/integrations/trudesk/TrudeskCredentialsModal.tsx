import { TextInput } from '@/components/inputs/TextInput'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import React, { useState } from 'react'



type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const TrudeskCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  //const [apiKey, setApiKey] = useState('')
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [name, setName] = useState('')

  const [isCreating, setIsCreating] = useState(false)

  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()
  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onError: (err) => {
      showToast({
        description: err.message,
        status: 'error',
      })
    },
    onSuccess: (data) => {
      refetchCredentials()
      onNewCredentials(data.credentialsId)
      onClose()
    },
  })

  const createTrudeskCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return
    mutate({
      credentials: {
        type: 'trudesk',
        workspaceId: workspace.id,
        name,
        data: {
          userName,
          password,
          baseUrl

        },
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Quadz account</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={createTrudeskCredentials}>
          <ModalBody as={Stack} spacing="6">
            <TextInput
              isRequired
              label="Name"
              onChange={setName}
              placeholder="My account"
              withVariableButton={false}
              debounceTimeout={0}
            />
            <TextInput
              isRequired
              label="Base Url"
              onChange={setBaseUrl}
              placeholder='Enter Base Url'
              withVariableButton={false}
              debounceTimeout={0}
            />
            <TextInput
              isRequired
              type="text"
              label="User Name"
              onChange={setUserName}
              placeholder='Enter User Name'
              withVariableButton={false}
              debounceTimeout={0}

            />
            <TextInput
              isRequired
              type="text"
              label="Password"
              onChange={setPassword}
              placeholder='Enter Password'
              withVariableButton={false}
              debounceTimeout={0}
            />


            {/* <TextInput
              isRequired
              type="password"
              label="API key"
              helperText={
                <>
                  You can generate an API key{' '}
                  <TextLink href={openAITokensPage} isExternal>
                    here
                  </TextLink>
                  .
                </>
              }
              onChange={setApiKey}
              placeholder="sk-..."
              withVariableButton={false}
              debounceTimeout={0}
            /> */}
            <Alert status="warning">
              <AlertIcon />
              Make sure to add admin account of Quadz.

            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={isCreating}
              isDisabled={userName?.trim() === '' || name?.trim() === '' || password?.trim() === '' || baseUrl?.trim() === ''}
              colorScheme="blue"
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
