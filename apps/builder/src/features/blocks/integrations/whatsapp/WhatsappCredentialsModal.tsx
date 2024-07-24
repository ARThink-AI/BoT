import { TextInput } from '@/components/inputs/TextInput'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc, trpcVanilla } from '@/lib/trpc'
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   Stack,
//   ModalFooter,
//   Button,
//   Alert,
//   AlertIcon,
//   Link
// } from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Stepper,
  useSteps,
  Step,
  StepIndicator,
  Box,
  StepIcon,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  UnorderedList,
  ListItem,
  Text,
  Image,
  Button,
  HStack,
  IconButton,
  Heading,
  OrderedList,
  Link,
  Code,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import React, { useState } from 'react'

import { ExternalLinkIcon } from '@/components/icons'
import { isEmpty, isNotEmpty } from '@typebot.io/lib/utils'

// import { useToast } from '@/hooks/useToast'
type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const WhatsappCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()

  const [systemAccessToken, setSystemAccessToken] = useState("");
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
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

  const { data: tokenInfoData } = trpc.whatsApp.getSystemTokenInfo.useQuery(
    {
      token: systemAccessToken,
    },
    { enabled: isNotEmpty(systemAccessToken) }
  )
  const isTokenValid = async () => {
    console.log("is token valid check called");
    setIsVerifying(true)
    try {
      const { expiresAt, scopes } =
        await trpcVanilla.whatsApp.getSystemTokenInfo.query({
          token: systemAccessToken,
        })
      if (expiresAt !== 0) {
        showToast({
          description:
            'Token expiration was not set to *never*. Create the token again with the correct expiration.',
        })
        return false
      }
      if (
        ['whatsapp_business_management', 'whatsapp_business_messaging'].find(
          (scope) => !scopes.includes(scope)
        )
      ) {
        showToast({
          description: 'Token does not have all the necessary scopes',
        })
        return false
      }
    } catch (err) {
      setIsVerifying(false)
      showToast({
        description: 'Could not get system info',
      })
      return false
    }
    setIsVerifying(false)
    return true
    // return false;
  }
  const createWhatsappCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(await isTokenValid())) return

    if (!workspace) return
    mutate({
      credentials: {
        type: 'Whatsapp',
        workspaceId: workspace.id,
        name,
        data: {
          systemAccessToken

        },
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent padding={10}>
        <OrderedList spacing={4}>
          <ListItem>
            Go to your{' '}
            <Button
              as={Link}
              href="https://business.facebook.com/settings/system-users"
              isExternal
              rightIcon={<ExternalLinkIcon />}
              size="sm"
            >
              System users page
            </Button>
          </ListItem>
          <ListItem>
            Create a new user by clicking on <Code>Add</Code>
          </ListItem>
          <ListItem>
            Fill it with any name and give it the <Code>Admin</Code> role
          </ListItem>
          <ListItem>
            <Stack>
              <Text>
                Click on <Code>Add assets</Code>. Under <Code>Apps</Code>, look for
                your previously created app, select it and check{' '}
                <Code>Manage app</Code>
              </Text>
              <Image
                src="/images/meta-system-user-assets.png"
                alt="Meta system user assets"
                rounded="md"
              />
            </Stack>
          </ListItem>
          <ListItem>
            <Stack spacing={4}>
              <Text>
                Now, click on <Code>Generate new token</Code>. Select your app.
              </Text>
              <UnorderedList spacing={4}>
                <ListItem>
                  Token expiration: <Code>Never</Code>
                </ListItem>
                <ListItem>
                  Available Permissions: <Code>whatsapp_business_messaging</Code>,{' '}
                  <Code>whatsapp_business_management</Code>{' '}
                </ListItem>
              </UnorderedList>
            </Stack>
          </ListItem>

        </OrderedList>
        {/* <ModalHeader>Add System User Token  with whatsapp_business_management and whatsapp_business_messaging scopes </ModalHeader> */}
        {/* <Button
          as={Link}
          href="https://business.facebook.com/settings/system-users"
          isExternal
          rightIcon={<ExternalLinkIcon />}
          size="sm"
        >
          System users page
        </Button> */}
        <ModalCloseButton />
        <form onSubmit={createWhatsappCredentials}>
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
              label="System User Token"
              onChange={setSystemAccessToken}
              placeholder='Enter System User Token'
              withVariableButton={false}
              debounceTimeout={0}
            />

            {/* <Alert status="warning">
              <AlertIcon />
              Make sure to add admin account of Quadz.

            </Alert> */}
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={isVerifying || isCreating}
              // isLoading={isCreating}
              isDisabled={systemAccessToken?.trim() === ''}
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
