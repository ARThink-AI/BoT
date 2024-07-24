import { Stack, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import {
  whatsappTasks,
  WhatsappBlock
} from "@typebot.io/schemas/features/blocks/integrations/whatsapp"
import { WhatsappCredentialsModal } from "./WhatsappCredentialsModal";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'

import { DropdownList } from '@/components/DropdownList'

import { InitiateMessage } from "./components/InitiateMessage/InitiateMessage";

type Props = {
  block: WhatsappBlock,
  onOptionsChange: (options: WhatsappBlock['options']) => void
}

type WhatsappTask = (typeof whatsappTasks)[number]

export const WhatsAppSettings = ({
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

  const updateTask = (task: WhatsappTask) => {
    switch (task) {
      case 'Initiate Message': {
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
            type="Whatsapp"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName="Whatsapp account"
          />
          <WhatsappCredentialsModal
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
            items={whatsappTasks}
            onItemSelect={updateTask}
            placeholder="Select task"
          />
          {options?.task && (
            <WhatsappTaskSettings
              options={options}
              onOptionsChange={onOptionsChange}
            />
          )}
        </>

      )}
    </Stack>
  )
}

const WhatsappTaskSettings = ({
  options,
  onOptionsChange,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment 
  // @ts-ignore
  // options: any
  options: WhatsappBlock['options']
  onOptionsChange: (options: WhatsappBlock['options']) => void
}) => {
  switch (options.task) {
    case 'Initiate Message': {
      return (
        <InitiateMessage
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    }




  }
}

