import {
  Stack,
  FormControl,
  FormLabel,
  Flex,
  Button,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { ConfirmModal } from '@/components/ConfirmModal'
import React from 'react'
import { EditableEmojiOrImageIcon } from '@/components/EditableEmojiOrImageIcon'
import { useWorkspace } from '../WorkspaceProvider'
import { TextInput } from '@/components/inputs'
import { useScopedI18n } from '@/locales'

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const scopedT = useScopedI18n('workspace.settings')
  const { workspace, workspaces, updateWorkspace, deleteCurrentWorkspace } =
    useWorkspace()

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return
    updateWorkspace({ name })
  }

  const handleChangeIcon = (icon: string) => updateWorkspace({ icon })

  const handleDeleteClick = async () => {
    await deleteCurrentWorkspace()
    onClose()
  }

  return (
    <Stack spacing="6" w="full">
      <FormControl>
        <FormLabel>{scopedT('icon.title')}</FormLabel>
        <Flex>
          {workspace && (
            <EditableEmojiOrImageIcon
              uploadFileProps={{
                workspaceId: workspace.id,
                fileName: 'icon',
              }}
              icon={workspace.icon}
              onChangeIcon={handleChangeIcon}
              boxSize="40px"
            />
          )}
        </Flex>
      </FormControl>
      {workspace && (
        <TextInput
          label={scopedT('name.label')}
          withVariableButton={false}
          defaultValue={workspace?.name}
          onChange={handleNameChange}
        />
      )}
      {/* <div> testing  </div> */}
      { /* @ts-ignore  */}
      {!workspace.twilioId ? (
        <>
          <div> Twilio Connect </div>
          <a
            href={`https://www.twilio.com/authorize/CN01eb83649eb3514ba70c7dd777ec69de?state=${workspace.id}`}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#0042DA", width: "180px", height: "36px", paddingRight: "5px", color: "white", border: "none", borderRadius: "4px", textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "20px" }}  >
            <span style={{ marginTop: "4px", width: "40px" }} ><img src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCA2MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPgoJPHRpdGxlPnR3aWxpby1sb2dvbWFyay13aGl0ZUFydGJvYXJkIDE8L3RpdGxlPgoJPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzAsMTVBMTUsMTUsMCwxLDAsNDUsMzAsMTUsMTUsMCwwLDAsMzAsMTVabTAsMjZBMTEsMTEsMCwxLDEsNDEsMzAsMTEsMTEsMCwwLDEsMzAsNDFabTYuOC0xNC43YTMuMSwzLjEsMCwxLDEtMy4xLTMuMUEzLjEyLDMuMTIsMCwwLDEsMzYuOCwyNi4zWm0wLDcuNGEzLjEsMy4xLDAsMSwxLTMuMS0zLjFBMy4xMiwzLjEyLDAsMCwxLDM2LjgsMzMuN1ptLTcuNCwwYTMuMSwzLjEsMCwxLDEtMy4xLTMuMUEzLjEyLDMuMTIsMCwwLDEsMjkuNCwzMy43Wm0wLTcuNGEzLjEsMy4xLDAsMSwxLTMuMS0zLjFBMy4xMiwzLjEyLDAsMCwxLDI5LjQsMjYuM1oiLz4KPC9zdmc+" /></span>
            Twilio Connect
          </a>
        </>
      ) : (
        <>
          <button onClick={() => {
            // @ts-ignore
            updateWorkspace({ twilioId: null })
          }} > Disconnect Twilio  </button>
        </>
      )}


      {workspace && workspaces && workspaces.length > 1 && (
        <DeleteWorkspaceButton
          onConfirm={handleDeleteClick}
          workspaceName={workspace?.name}
        />
      )}
    </Stack>
  )
}

const DeleteWorkspaceButton = ({
  workspaceName,
  onConfirm,
}: {
  workspaceName: string
  onConfirm: () => Promise<void>
}) => {
  const scopedT = useScopedI18n('workspace.settings')
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
        {scopedT('deleteButton.label')}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        message={
          <Text>
            {scopedT('deleteButton.confirmMessage', {
              workspaceName,
            })}
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  )
}
