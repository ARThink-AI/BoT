import { Stack, Text } from "@chakra-ui/react"
import { TrudeskBlock } from "@typebot.io/schemas"
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
type Props = {
  task: TrudeskBlock["options"]["task"],
  variableId: string | undefined
}
export const TrudeskNodeBody = ({ task, variableId }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Stack w="full">
      <Text color={task ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {!task ? 'Configure...' : task}
      </Text>
      {variableId && variableId.trim() != "" && (
        <SetVariableLabel
          key={variableId}
          variableId={variableId as string}
          variables={typebot?.variables}
        />
      )}

    </Stack>
  )
}