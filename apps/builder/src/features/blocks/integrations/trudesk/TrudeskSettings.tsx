import { Stack, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import {
  trudeskTasks,
  TrudeskBlock
} from "@typebot.io/schemas/features/blocks/integrations/trudesk"
import { TrudeskCredentialsModal } from "./TrudeskCredentialsModal";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { CreateNote } from "./components/CreateNote/CreateNote";
import { UpdateAssigneeAndGroup } from "./components/UpdateAssigneeAndGroup/UpdateAssigneeAndGroup";
import { UpdatePriority } from "./components/UpdatePriority/UpdatePriority";
import { UpdateTags } from "./components/UpdateTags/UpdateTags";
import { UpdateStatus } from "./components/UpdateStatus/UpdateStatus";
import { CreateTicket } from "./components/CreateTicket/CreateTicket";
import { DropdownList } from '@/components/DropdownList'

type Props = {
  block: TrudeskBlock,
  onOptionsChange: (options: TrudeskBlock['options']) => void
}

type TrudeskTask = (typeof trudeskTasks)[number]

export const TrudeskSettings = ({
  block: { options },
  onOptionsChange,
}: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const updateTask = (task: TrudeskTask) => {
    switch (task) {
      case 'Create Note': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break


      }
      case 'Create Ticket': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break
      }
      case 'Update Assignee and Group': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break
      }
      case 'Update Tags': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break
      }
      case 'Update Priority': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break
      }
      case 'Update Status': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task
        })
        break
      }


    }
  }

  return (
    <Stack>
      {workspace && (
        <>
          <CredentialsDropdown
            type="trudesk"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName="Quadz account"
          />
          <TrudeskCredentialsModal
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />

        </>
      )}
      {options?.credentialsId && (

        <>
          <DropdownList
            currentItem={options.task}
            items={trudeskTasks}
            onItemSelect={updateTask}
            placeholder="Select task"
          />
          {options?.task && (
            <TrudeskTaskSettings
              options={options}
              onOptionsChange={onOptionsChange}
            />
          )}
        </>

      )}
    </Stack>
  )
}

const TrudeskTaskSettings = ({
  options,
  onOptionsChange,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment 
  // @ts-ignore
  // options: any
  options: TrudeskBlock['options']
  onOptionsChange: (options: TrudeskBlock['options']) => void
}) => {
  switch (options.task) {
    case 'Create Note': {
      return (
        <CreateNote
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case 'Create Ticket': {
      return (
        <CreateTicket
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case 'Update Assignee and Group':
      return (
        <UpdateAssigneeAndGroup
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    case 'Update Tags':
      return (
        <UpdateTags
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    case 'Update Priority':
      return (
        <UpdatePriority
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    case 'Update Status':
      return (
        <UpdateStatus
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )

  }
}

