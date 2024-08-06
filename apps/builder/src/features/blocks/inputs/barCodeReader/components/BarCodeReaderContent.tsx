import { Text } from '@chakra-ui/react'
import { BarCodeInputBlock } from '@typebot.io/schemas'

type Props = {
  block: BarCodeInputBlock
}

export const BarCodeInputContent = ({ block }: Props) => {
  if (
    !block.options.mode
  )
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {block?.options?.mode}
    </Text>
  )
}