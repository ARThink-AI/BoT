import React, { useEffect, useState } from 'react';
import { Button, Input, Box, Text, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useTypebot } from '../providers/TypebotProvider';

interface CustomInputAIProps {
  isChecked: boolean;
  threadId: string;
}

const CustomInputAI: React.FC<CustomInputAIProps> = ({ isChecked, threadId }) => {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [botEdges, setBotEdges] = useState([])
  const [botGroups, setBotGroups] = useState([])
  const [botVariables, setBotVariables] = useState([])
  const { updateTypebot, isReadOnly } = useTypebot()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const botCreationInitiate = async () => {
    try {
      const res = await fetch("http://localhost:5000/build_bot", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "thread_id": threadId,
          "user_input": inputValue
        })
      });
      setInputValue("")
      const response = await res.json();
      setMessage(response.message)
      setBotEdges(response.bot_structure.edges)
      setBotGroups(response.bot_structure.groups)
      setBotVariables(response.bot_structure.variables)

      updateTypebot({
        updates: {
          groups: response.bot_structure.groups,
          edges: response.bot_structure.edges,
          variables: response.bot_structure.variables
        },
      })
      console.log("ai generated response", response)
    } catch (error) {
      console.log("error while getting bot creation ai assistant", error)
    }
  }



  console.log("testing ai custom input", inputValue)
  console.log("testing ai bot edges", botEdges)

  console.log("testing ai bot group", botGroups)

  console.log("testing ai bot variables", botVariables)

  return (

    <Box width="100%" maxW="600px" mx="auto" mt="4" p="4" borderRadius="md" boxShadow={isChecked ? "lg" : ""} bg={isChecked ? "white" : "none"}>
      {isChecked && (
        <>
          <Box display="flex" justifyContent="space-between" mb={4}>
            <InputGroup size="lg" boxShadow={isChecked ? "sm" : ""}>
              <Input
                color={'black'}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type something..."
                border={'1px'}
                _hover={{ border: '1px' }}
              // focusBorderColor="blue.300"
              />
              <InputRightElement width="5rem">
                <Button h="1.75rem" size="sm" onClick={botCreationInitiate} colorScheme="white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20px" height="20px">
                    <path d="M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z"></path>
                  </svg>
                </Button>
                <Button h="1.75rem" size="sm" onClick={() => alert('Button 2 clicked')} colorScheme="white">
                  <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1,12A11,11,0,0,1,17.882,2.7l1.411-1.41A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707l1.128-1.128A8.994,8.994,0,0,0,3,12a1,1,0,0,1-2,0Zm21-1a1,1,0,0,0-1,1,9.01,9.01,0,0,1-9,9,8.9,8.9,0,0,1-4.42-1.166l1.127-1.127A1,1,0,0,0,8,17H4a1,1,0,0,0-1,1v4a1,1,0,0,0,.617.924A.987.987,0,0,0,4,23a1,1,0,0,0,.707-.293L6.118,21.3A10.891,10.891,0,0,0,12,23,11.013,11.013,0,0,0,23,12A1,1,0,0,0,22,11Z" />
                  </svg>
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
          <Text color="gray.600" fontSize="sm">
            {message}
          </Text>
        </>
      )}

    </Box>
  );
};

export default CustomInputAI;
