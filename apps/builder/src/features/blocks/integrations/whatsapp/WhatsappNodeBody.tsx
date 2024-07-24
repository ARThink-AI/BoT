import { Stack, Text } from "@chakra-ui/react"
import { WhatsappBlock } from "@typebot.io/schemas"
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
type Props = {
  task: WhatsappBlock["options"]["task"],
  variableId: string | undefined
}
export const WhatsappNodeBody = ({ task, variableId }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Stack w="full">
      <Text color={task ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {!task ? 'Configure...' : task}
      </Text>


    </Stack>
  )
}