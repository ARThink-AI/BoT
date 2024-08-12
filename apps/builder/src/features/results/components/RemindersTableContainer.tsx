


import React, { useMemo, useState } from 'react'
import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select, Button, Text, Heading, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@udecode/plate-common'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
import { defaultTimeFilter, timeFilterValues } from '../api/constants'
import { parseResultHeader } from '@typebot.io/lib/results'
import { LogicBlockType } from '@typebot.io/schemas'
import { convertResultsToTableData } from '../helpers/convertResultsToTableData'
// import { Frequency } from '@typebot.io/prisma'

export const RemindersTableContainer = () => {
  const { typebot, publishedTypebot } = useTypebot()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
  const [selectedType, setSelectedType] = useState('EMAIL')
  const [emails, setEmails] = useState([])
  const [emailValid, setEmailValid] = useState(true);
  const [duplicateEmail, setDuplicateEmail] = useState<boolean>(false);
  // const [isEditing, setIsEditing] = useState(true);
  const [isUpdating, setUpdating] = useState<string | null>(null);
  const [updateFormData, setUpdateFormData] = useState({ type: '', frequency: '', emails: [], jobId: '', typebotId: '' });
  const { isOpen, onOpen, onClose } = useDisclosure()
  // const [jobId, setJobId] = useState<string | null>(null)
  const { data } = trpc.results.getReminders.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter: selectedTimeFilter
    },
    { enabled: isDefined(publishedTypebot) }
  )
  console.log("get remindersfsnjsd", data)

  const linkedTypebotIds =
    publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>(
        (typebotIds, block) =>
          block.type === LogicBlockType.TYPEBOT_LINK &&
            isDefined(block.options.typebotId) &&
            !typebotIds.includes(block.options.typebotId) &&
            block.options.mergeResults !== false
            ? [...typebotIds, block.options.typebotId]
            : typebotIds,
        []
      ) ?? []

  const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
    {
      typebotId: typebot?.id as string,
    },
    {
      enabled: linkedTypebotIds.length > 0,
    }
  )

  const resultHeader = useMemo(
    () =>
      publishedTypebot
        ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
        : [],
    [linkedTypebotsData?.typebots, publishedTypebot]
  )
  console.log("result headersss", resultHeader)
  const tableData = useMemo(
    () =>
      publishedTypebot
        ? convertResultsToTableData(
          data?.results,
          resultHeader
        )
        : [],
    [publishedTypebot, data, resultHeader]
  )
  // console.log("reminder table headerss", resultHeader)
  // console.log("reminder table table data", tableData)
  // @ts-ignore
  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  //@ts-ignore
  const handleInputChange = (index, event) => {
    const newEmails = [...emails];
    //@ts-ignore
    newEmails[index] = event.target.value;
    setEmailValid(validateEmail(newEmails[index]));
    setDuplicateEmail(newEmails.filter((e, i) => newEmails.indexOf(e) !== i).length > 0);
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    //@ts-ignore
    setEmails([...emails, '']); // Add a new empty email field
  };
  //@ts-ignore
  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  // const handleEdit = () => {
  //   setIsEditing(true);
  // };
  // console.log("selected frequency", selectedTimeFilter)

  const mutation = trpc.results.reminderCreate.useMutation();
  const updateMutation = trpc.results.updateReminder.useMutation();
  const deleteMutation = trpc.results.deleteReminder.useMutation();

  //@ts-ignore
  const { data: reminders, isLoading, error } = trpc.results.fetchReminders.useQuery({ typebotId: typebot?.id, });

  const addReminder = async (jobId: string) => {
    try {
      const newReminder = await mutation.mutateAsync({
        //@ts-ignore
        jobId: jobId,
        payload: { 'emails': emails, resultHeader: resultHeader },
        //@ts-ignore
        typebotId: typebot?.id,
        //@ts-ignore
        type: selectedType,
        frequency: selectedTimeFilter,
      });
      console.log('Reminder added:', newReminder);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };
  //@ts-ignore
  const handleUpdate = async (reminderId) => {
    try {
      const updatedReminder = await updateMutation.mutateAsync({
        id: reminderId,
        updates: {
          //@ts-ignore
          type: updateFormData.type,
          //@ts-ignore
          frequency: updateFormData.frequency,
          payload: { emails: updateFormData.emails },
          jobId: updateFormData.jobId,
          typebotId: updateFormData.typebotId
        },
      });
      window.location.reload()
      console.log('Reminder updated:', updatedReminder);
      setUpdating(null); // Reset the updating state
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const result = await deleteMutation.mutateAsync(id);
      window.location.reload()
      console.log('Reminder deleted:', result);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const scheduledJob = async (typebotId: string, type: string, payload: JSON, frequency: string) => {
    try {
      const url = 'http://localhost:4000/schedule_job'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "typebotId": typebotId,
          "type": type,
          "payload": { payload, resultHeader: resultHeader },
          "frequency": frequency,
        })
      })
      const response = await res.json()
      if (response) {
        // setJobId(response.jobId)
        setTimeout(() => { addReminder(response.jobId) }, 1000)

      }
      console.log("response of scheduled job", response)
    }
    catch (error) {
      console.log('error occur while scheduled job', error)
    }
  }






  const cancelJob = async (id: string, jobId: string) => {
    try {
      const url = `http://localhost:4000/cancel_job?id=${jobId}`
      const response = await fetch(url, {
        method: 'DELETE',
      }).then((res) => res.json())

      if (response) {
        deleteReminder(id);
      }
      console.log("response for cancel job", response)

    } catch (error) {
      console.log("error while canceling job", error)
    }
  }

  const updateJob = async (id: string, jobId: string) => {
    try {
      const url = 'http://localhost:4000/update_job'
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "typebotId": updateFormData.typebotId,
          "type": updateFormData.type,
          "payload": updateFormData.emails,
          "frequency": updateFormData.frequency,
          "jobId": jobId,
        })
      }).then((res) => res.json())
      if (response) {
        updateFormData.jobId = response.jobId
        handleUpdate(id)
      }
      console.log("response for update job", response)
    } catch (error) {
      console.log("error occur while updating job")
    }
  }

  // console.log("job iddddddd", jobId)
  const handleSave = async () => {
    // setIsEditing(false);
    // addReminder();
    setSelectedType('EMAIL');
    setEmails([]);
    setSelectedTimeFilter(defaultTimeFilter);
    // @ts-ignore
    scheduledJob(typebot?.id, selectedType, emails, selectedTimeFilter)
    onClose()
    // window.location.reload()
  };
  //@ts-ignore
  const handleDelete = async (id, jobId) => {
    // deleteReminder(id);
    cancelJob(id, jobId)
  };

  const handleUpdateReminderData = async (id: string, jobId: string) => {
    // handleUpdate(id)
    updateJob(id, jobId)
  }

  // const handleUpdateReminder = (reminder) => {
  //   setUpdating(reminder.id);
  //   setUpdateFormData({
  //     type: reminder.type,
  //     frequency: reminder.frequency,
  //     emails: reminder.payload.emails,
  //   });
  // };
  //@ts-ignore
  const handleUpdateReminder = (reminder) => {
    setUpdating(reminder.id);
    setUpdateFormData({
      type: reminder.type,
      frequency: reminder.frequency,
      emails: reminder.payload.emails,
      jobId: reminder.jobId, // Include jobId in the form data
      typebotId: reminder.typebotId // Include typebotId in the form data
    });
  };



  console.log("reminders", reminders);


  return (
    <Flex overflowY={'auto'} overflowX={'hidden'} h="100vh" flexDir="column">
      <TypebotHeader />
      <Box mx={'auto'} p={4}>
        <Modal size={'5xl'} blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reminder</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Frequency</Th>
                    {/* <Th>Typebot ID</Th> */}
                    <Th>Emails</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>

                      <Select onChange={handleTypeChange} value={selectedType}>
                        {['EMAIL', 'WHATSAPP', 'TEXT'].map((type, index) => (
                          <option key={index}>{type}</option>
                        ))}
                      </Select>

                    </Td>
                    <Td>

                      <TimeFilterDropdown
                        selectedTimeFilter={selectedTimeFilter}
                        onChange={setSelectedTimeFilter}
                        placeholder="Choose a frequency"
                      />

                    </Td>
                    {/* <Td>{typebot?.id}</Td> */}
                    <Td>
                      {!emailValid && (
                        <Text color={'red.500'} fontSize={'sm'}>Please enter a valid email address.</Text>
                      )}
                      {duplicateEmail && (
                        <Text color="red.500" fontSize="sm">Duplicate email address found.</Text>
                      )}
                      {emails.map((email, index) => (
                        <Flex key={index} wrap={'wrap'}>
                          <Input
                            type="email"
                            value={email}
                            onChange={(event) => handleInputChange(index, event)}
                            placeholder={`Email ${index + 1}`}
                          />
                          <Button color={'white'} _hover={{ bg: 'red.700' }} bg={'red.500'} mb={2} mt={2} type="button" onClick={() => handleRemoveEmail(index)}>
                            Remove
                          </Button>
                        </Flex>
                      ))}
                      <Button color={'white'} _hover={{ bg: 'green.600' }} bg={'green.400'} onClick={handleAddEmail}>Add</Button>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSave} variant='ghost'>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Button color={'white'} _hover={{ bg: 'blue.700' }} bg={'blue.500'} onClick={onOpen}>Add Reminder</Button>


        <Box overflowX="auto" maxW="100%">
          {reminders && reminders.length > 0 &&
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Created At</Th>
                  <Th>Type</Th>
                  <Th>Frequency</Th>
                  {/* <Th>Typebot ID</Th> */}
                  <Th>Emails</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reminders && reminders.map((reminder) => (
                  <Tr key={reminder.id}>
                    <Td>{new Date(reminder.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {isUpdating === reminder.id ? (
                        <Select
                          onChange={(e) => setUpdateFormData({ ...updateFormData, type: e.target.value })}
                          value={updateFormData.type}
                        >
                          {['EMAIL', 'WHATSAPP', 'TEXT'].map((type, index) => (
                            <option key={index}>{type}</option>
                          ))}
                        </Select>
                      ) : (
                        <Text>{reminder.type}</Text>
                      )}
                    </Td>
                    <Td>
                      {isUpdating === reminder.id ? (
                        <TimeFilterDropdown
                          //@ts-ignore
                          selectedTimeFilter={updateFormData.frequency}
                          onChange={(value) => setUpdateFormData({ ...updateFormData, frequency: value })}
                          placeholder="Choose a frequency"
                        />
                      ) : (
                        <Text>{reminder.frequency}</Text>
                      )}
                    </Td>
                    {/* <Td>{reminder.typebotId}</Td> */}
                    <Td>
                      {isUpdating === reminder.id ? (
                        updateFormData.emails.map((email, index) => (
                          <Flex key={index} wrap={'wrap'}>
                            <Input
                              type="email"
                              value={email}
                              onChange={(event) => {
                                const newEmails = [...updateFormData.emails];
                                //@ts-ignore
                                newEmails[index] = event.target.value;
                                setUpdateFormData({ ...updateFormData, emails: newEmails });
                              }}
                              placeholder={`Email ${index + 1}`}
                            />
                            <Button m={2} type="button" onClick={() => {
                              const newEmails = updateFormData.emails.filter((_, i) => i !== index);
                              setUpdateFormData({ ...updateFormData, emails: newEmails });
                            }}>
                              Remove
                            </Button>
                          </Flex>
                        ))
                      ) : (
                        //@ts-ignore
                        reminder.payload.emails.map((email, index) => (
                          <Text key={index}>{email}</Text>
                        ))
                      )}
                    </Td>
                    <Td>
                      {isUpdating === reminder.id ? (
                        // <Button mr={2} onClick={() => handleUpdate(reminder.id)}>Save</Button>
                        <Button mr={2} onClick={() => handleUpdateReminderData(reminder.id, reminder.jobId)}>Save</Button>
                      ) : (
                        <Button ml={2} color={'white'} _hover={{ bg: 'gray.600' }} bg={'gray.400'} mr={2} onClick={() => handleUpdateReminder(reminder)}>Update</Button>
                      )}
                      <Button color={'white'} _hover={{ bg: 'red.700' }} bg={'red.500'} onClick={() => handleDelete(reminder.id, reminder.jobId)}>Delete</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>}
        </Box>
      </Box>
    </Flex>
  )
}




