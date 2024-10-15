import { Flex, FormControl, FormLabel, Switch } from '@chakra-ui/react';

interface ToggleSwitchProps {
  isChecked: boolean; // boolean type for the switch state
  handleToggle: () => void; // function type that returns void
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, handleToggle }) => {
  return (
    <Flex mx={'auto'}>
      <FormControl>
        <Flex>
          <FormLabel mb="0" fontSize={'sm'}>AI Assistant</FormLabel>
          <Switch isChecked={isChecked} onChange={handleToggle} />
        </Flex>

      </FormControl>
    </Flex>

  );
};

export default ToggleSwitch;
