import { Seo } from '@/components/Seo'
import { Flex, FormControl, FormLabel, Spinner, Switch, useColorModeValue } from '@chakra-ui/react'
import {
  EditorProvider,
  useEditor,
  RightPanel as RightPanelEnum,
} from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { BlocksSideBar } from './BlocksSideBar'
import { BoardMenuButton } from './BoardMenuButton'
import { GettingStartedModal } from './GettingStartedModal'
import { PreviewDrawer } from '@/features/preview/components/PreviewDrawer'
import { TypebotHeader } from './TypebotHeader'
import { Graph } from '@/features/graph/components/Graph'
import { GraphDndProvider } from '@/features/graph/providers/GraphDndProvider'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { GroupsCoordinatesProvider } from '@/features/graph/providers/GroupsCoordinateProvider'
import { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
import CustomInputAI from './CustomInput'


export const EditorPage = () => {
  const { typebot, isReadOnly } = useTypebot()
  const [isChecked, setIsChecked] = useState(false);
  const [threadId, setThreadId] = useState('')

  const handleToggle = async () => {
    setIsChecked((prev) => !prev);
    const response = await fetch("http://localhost:5000/start_conversation", {
      method: "POST"
    }).then(res => res.json())
    setThreadId(response.thread_id)

  };

  console.log("response from toggle", threadId)
  return (
    <EditorProvider>
      <Seo title={typebot?.name ? `${typebot.name} | Editor` : 'Editor'} />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        <TypebotHeader />
        <Flex
          flex="1"
          pos="relative"
          h="full"
          bgColor={useColorModeValue('#f4f5f8', 'gray.850')}
          backgroundImage={useColorModeValue(
            'radial-gradient(#c6d0e1 1px, transparent 0)',
            'radial-gradient(#2f2f39 1px, transparent 0)'
          )}
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
        >
          {typebot ? (
            <GraphDndProvider>
              {!isReadOnly && <BlocksSideBar />}
              <div style={{ position: "absolute", right: "100px", top: "20px", zIndex: '99999' }}>
                <ToggleSwitch isChecked={isChecked} handleToggle={handleToggle} />
              </div>
              {/* style={{ width: "100%", position: "absolute", left: "5%", bottom: "25px", zIndex: '99999' }} */}
              <Flex w={{ lg: '100%' }} pos={'absolute'} left={{ lg: '5%', md: '50%' }} bottom={'25px'} zIndex={9999}>
                <CustomInputAI isChecked={isChecked} threadId={threadId} />
              </Flex>
              <GraphProvider isReadOnly={isReadOnly}>
                <GroupsCoordinatesProvider groups={typebot.groups}>
                  <Graph flex="1" typebot={typebot} key={typebot.id} />
                  <BoardMenuButton pos="absolute" right="40px" top="20px" />
                  <RightPanel />
                </GroupsCoordinatesProvider>
              </GraphProvider>
            </GraphDndProvider>
          ) : (
            <Flex justify="center" align="center" boxSize="full">
              <Spinner color="gray" />
            </Flex>
          )}
        </Flex>
      </Flex>
    </EditorProvider>
  )
}

const RightPanel = () => {
  const { rightPanel } = useEditor()
  return rightPanel === RightPanelEnum.PREVIEW ? <PreviewDrawer /> : <></>
}
