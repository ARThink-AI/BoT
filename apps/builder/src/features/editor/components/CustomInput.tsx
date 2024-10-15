import React from 'react';
import { Button, Input, Box, Text, InputGroup, InputRightElement } from '@chakra-ui/react';

interface CustomInputAIProps {
  isChecked: boolean;
}

const CustomInputAI: React.FC<CustomInputAIProps> = ({ isChecked }) => {
  const [inputValue, setInputValue] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  console.log("testing ai custom input", inputValue)
  return (
    //     <Box width="100%" w="400px" mx="auto" mt="4" p="4" borderRadius="md" >
    //       {isChecked && (
    //         <>

    //           <Box display="flex" justifyContent="space-between" p={4} mb={4} boxShadow={isChecked ? "lg" : ""}>
    //             <Input
    //               value={inputValue}
    //               onChange={handleInputChange}
    //               placeholder="Type something..."
    //               mb={4}
    //               focusBorderColor="teal.500"
    //               size="lg"
    //             />
    //             <Button colorScheme="white" onClick={() => alert('Button 1 clicked')}>
    //               <svg xmlns="
    // http://www.w3.org/2000/svg"
    //                 viewBox="0 0 512 512" width="25px" height="25px" fill="" color="white" >
    //                 <path d="M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z"></path>
    //               </svg>
    //             </Button>
    //             <Button colorScheme="white" onClick={() => alert('Button 2 clicked')}>
    //               <svg fill="#000000" width="25px" height="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1,12A11,11,0,0,1,17.882,2.7l1.411-1.41A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707l1.128-1.128A8.994,8.994,0,0,0,3,12a1,1,0,0,1-2,0Zm21-1a1,1,0,0,0-1,1,9.01,9.01,0,0,1-9,9,8.9,8.9,0,0,1-4.42-1.166l1.127-1.127A1,1,0,0,0,8,17H4a1,1,0,0,0-1,1v4a1,1,0,0,0,.617.924A.987.987,0,0,0,4,23a1,1,0,0,0,.707-.293L6.118,21.3A10.891,10.891,0,0,0,12,23,11.013,11.013,0,0,0,23,12,1,1,0,0,0,22,11Z" /></svg>
    //             </Button>
    //           </Box></>
    //       )}
    //       <Text color="gray.600" fontSize="sm">
    //         {message}
    //       </Text>
    //     </Box>
    <Box width="100%" maxW="400px" mx="auto" mt="4" p="4" borderRadius="md" boxShadow={isChecked ? "lg" : ""} bg={isChecked ? "white" : "none"}>
      {isChecked && (
        <>
          <Box display="flex" justifyContent="space-between" mb={4}>
            <InputGroup size="lg" boxShadow={isChecked ? "sm" : ""}>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type something..."
                focusBorderColor="teal.500"
              />
              <InputRightElement width="5rem">
                <Button h="1.75rem" size="sm" onClick={() => alert('Button 1 clicked')} colorScheme="white">
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
        </>
      )}
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </Box>
  );
};

export default CustomInputAI;
