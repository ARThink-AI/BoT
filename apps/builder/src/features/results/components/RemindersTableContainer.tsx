


import React, { useEffect, useMemo, useState } from 'react'
import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@udecode/plate-common'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
import { defaultTimeFilter, timeFilterValues } from '../api/constants'
import { parseResultHeader } from '@typebot.io/lib/results'
import { LogicBlockType } from '@typebot.io/schemas'
import { convertResultsToTableData } from '../helpers/convertResultsToTableData'
import { ColumnSettings } from './table/ColumnSettings'
import { parseColumnOrder } from '../helpers/parseColumnsOrder'
import { ReminderColumnSettings } from './table/ReminderColumnSettings'
// import { Frequency } from '@typebot.io/prisma'

export const RemindersTableContainer = () => {
  const { updateTypebot } = useTypebot()
  const { typebot, publishedTypebot } = useTypebot()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
  const [selectedType, setSelectedType] = useState('EMAIL')
  const [emails, setEmails] = useState([])
  const [emailValid, setEmailValid] = useState(true);
  const [duplicateEmail, setDuplicateEmail] = useState<boolean>(false);
  // const [isEditing, setIsEditing] = useState(true);
  const [isUpdating, setUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [reminderId, setreminderId] = useState("")
  const [updatedColumnSetting, setUpdatedColumnSetting] = useState({
    remcolumnsOrder: [],
    remcolumnsWidth: {},
    remcolumnsVisibility: {}
  })
  const [isUpdatingBtn, setIsUpdatingBtn] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ type: '', frequency: '', emails: [], jobId: '', typebotId: '', columnState: updatedColumnSetting });
  const { isOpen, onOpen, onClose } = useDisclosure()
  console.log('updatedColumnSetting', updatedColumnSetting)
  const [columnState, setColumnState] = useState({
    remcolumnsOrder: [],
    remcolumnsWidth: {},
    remcolumnsVisibility: {}
  });

  useEffect(() => {
    const storedVisibility = localStorage.getItem(`reminder_${reminderId}`);
    const storedOrder = localStorage.getItem(`reminder_order${reminderId}`);
    if (storedVisibility) {
      setUpdatedColumnSetting(prev => ({
        ...prev,
        remcolumnsVisibility: JSON.parse(storedVisibility),
        remcolumnsOrder: JSON.parse(storedOrder)
      }));
    }
  }, [reminderId]); //

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
  console.log("reminder table table data", tableData)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handleInputChange = (index, event) => {
    const newEmails = [...emails];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    newEmails[index] = event.target.value;
    setEmailValid(validateEmail(newEmails[index]));
    setDuplicateEmail(newEmails.filter((e, i) => newEmails.indexOf(e) !== i).length > 0);
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setEmails([...emails, '']); // Add a new empty email field
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data: reminders, refetch } = trpc.results.fetchReminders.useQuery({ typebotId: typebot?.id, });

  const preferences = typebot?.resultsTablePreferences ?? undefined

  const {
    columnsOrder,
    columnsVisibility = {},
    columnsWidth = {},
  } = {
    ...preferences,
    columnsOrder: parseColumnOrder(preferences?.columnsOrder, resultHeader),
  }

  const changeColumnVisibility = (
    newColumnVisibility: Record<string, boolean>
  ) => {
    if (typeof newColumnVisibility === 'function') return
    // updateTypebot({
    //   updates: {
    //     resultsTablePreferences: {
    //       columnsVisibility: newColumnVisibility,
    //       columnsWidth,
    //       columnsOrder,
    //     },
    //   },
    // })



    setColumnState((prev) =>({
      remcolumnsVisibility: { ...prev.remcolumnsVisibility, ...newColumnVisibility },
      remcolumnsWidth: prev.remcolumnsWidth,
      // @ts-ignore
      remcolumnsOrder: prev.remcolumnsOrder,
    }))
  }

  const changeColumnVisibilityForUpdate = (
    newColumnVisibility: Record<string, boolean>
  ) => {
    if (typeof newColumnVisibility === 'function') return
    setUpdatedColumnSetting((prev)=>({
      remcolumnsVisibility: { ...prev.remcolumnsVisibility, ...newColumnVisibility },
      remcolumnsWidth: prev.remcolumnsWidth,
      // @ts-ignore
      remcolumnsOrder: prev.remcolumnsOrder,
    }))
    console.log('updatedColumnSetting--', updatedColumnSetting)
  }

  console.log("columnState 1", columnState)
  // console.log("columnState 2", newColumnVisibility)

  // setColumnState({
  //   remcolumnsVisibility: columnsVisibility,
  //   remcolumnsWidth: columnsWidth,
  //   // @ts-ignore
  //   remcolumnsOrder: columnsOrder,
  // })

  // const onColumnOrderChange = (
  //   newColumnVisibility: Record<string, boolean>
  // ) => {
  //   if (typeof newColumnVisibility === 'function') return
  //   // updateTypebot({
  //   //   updates: {
  //   //     resultsTablePreferences: {
  //   //       columnsVisibility: newColumnVisibility,
  //   //       columnsWidth,
  //   //       columnsOrder,
  //   //     },
  //   //   },
  //   // })
  //   setColumnState({
  //     remcolumnsVisibility: { ...columnsVisibility, ...newColumnVisibility },
  //     remcolumnsWidth: columnsWidth,
  //     // @ts-ignore
  //     remcolumnsOrder: columnsOrder,
  //   })
  // }
  const onColumnOrderChange = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === 'function') return
    setColumnState((prev: any) => ({
      ...prev,
      remcolumnsOrder: newColumnOrder
    }));
  }

  const onUpadteColumnOrderChange = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === 'function') return
    setUpdatedColumnSetting((prev: any) => ({
      ...prev,
      remcolumnsOrder: newColumnOrder
    }));
  }

  const selectedHeaders = isUpdatingBtn 
  ? resultHeader.filter(
      // @ts-ignore
      (header) => updatedColumnSetting.remcolumnsVisibility[header.id] === true
    )
  : resultHeader.filter(
      // @ts-ignore
      (header) => columnState.remcolumnsVisibility[header.id] === true
    );



  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log("hiddennnnnn header", selectedHeaders)

  const addReminder = async (jobId: string, columnState: object) => {
    try {
      const newReminder = await mutation.mutateAsync({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jobId: jobId,
        payload: { 'emails': emails, 'columnState': columnState },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typebotId: typebot?.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        type: selectedType,
        frequency: selectedTimeFilter,
      });
      console.log('Reminder added:', newReminder);
      refetch()
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handleUpdate = async (reminderId) => {
    try {
      const updatedReminder = await updateMutation.mutateAsync({
        id: reminderId,
        updates: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: updateFormData.type,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          frequency: updateFormData.frequency,
          payload: { emails: updateFormData.emails, resultHeader: selectedHeaders, 'columnState': updatedColumnSetting },
          jobId: updateFormData.jobId,
          typebotId: updateFormData.typebotId
        },
      });
      // window.location.reload()
      refetch()
      console.log('Reminder updated:', updatedReminder);
      setUpdating(null); // Reset the updating state
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const result = await deleteMutation.mutateAsync(id);
      // window.location.reload()
      refetch()
      console.log('Reminder deleted:', result);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const scheduledJob = async (typebotId: string, type: string, payload: JSON, frequency: string, columnState: object) => {
    try {
      const url = 'https://scheduler.arthink.ai/schedule_job'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "typebotId": typebotId,
          "type": type,
          "payload": { payload, resultHeader: selectedHeaders },
          "frequency": frequency,
        })
      })
      const response = await res.json()
      if (response) {
        // setJobId(response.jobId)
        setTimeout(() => { addReminder(response.jobId, columnState) }, 1000)

      }
      console.log("response of scheduled job", response)
    }
    catch (error) {
      console.log('error occur while scheduled job', error)
    }
  }






  const cancelJob = async (id: string, jobId: string) => {
    try {
      const url = `https://scheduler.arthink.ai/cancel_job?id=${jobId}`
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
      const url = 'https://scheduler.arthink.ai/update_job'
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "typebotId": updateFormData.typebotId,
          "type": updateFormData.type,
          "payload": { "payload": updateFormData.emails, resultHeader: selectedHeaders },
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

  const handleClose = () => {
    setColumnState({
      remcolumnsVisibility: {},
      remcolumnsWidth: {},
      remcolumnsOrder: [],
    });
    setUpdatedColumnSetting({
      remcolumnsVisibility: {},
      remcolumnsWidth: {},
      remcolumnsOrder: [],
    });
    onClose();
  }

  // console.log("job iddddddd", jobId)
  const handleSave = async () => {
    // setIsEditing(false);
    // addReminder();
    setSelectedType('EMAIL');
    setEmails([]);
    setSelectedTimeFilter(defaultTimeFilter);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scheduledJob(typebot?.id, selectedType, emails, selectedTimeFilter, columnState)
    // handleClose()
    onClose()
    // window.location.reload()
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  const handleDelete = async (id, jobId) => {
    try {
      // Log to verify the key exists
      console.log(`Trying to remove reminder_${id}`);
      setIsDeleting(id)
      setIsUpdatingBtn(false)
      // Remove the item
      localStorage.removeItem(`reminder_${id}`);
      localStorage.removeItem(`reminder_order${id}`)
      console.log(`Item removed: reminder_${id}`);

      // Ensure cancelJob works correctly
      await cancelJob(id, jobId);
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };


  useEffect(() => {
    setColumnState({
      remcolumnsVisibility: columnsVisibility,
      remcolumnsWidth: columnsWidth,
      // @ts-ignore
      remcolumnsOrder: columnsOrder,
    })
  }, [])


  // const handleDelete = async (id, jobId) => {
  //   // deleteReminder(id);

  //    localStorage.removeItem(`reminder_${id}`)
  //   cancelJob(id, jobId)
  // };

  const handleOpen = () => {
    setColumnState({
      remcolumnsVisibility: columnsVisibility,
      remcolumnsWidth: columnsWidth,
      // @ts-ignore
      remcolumnsOrder: columnsOrder,
    })
    onOpen()
  }

  const handleUpdateReminderData = async (id: string, jobId: string) => {
    // handleUpdate(id)
    updateJob(id, jobId)
    setIsUpdatingBtn(false)
  }

  // const handleUpdateReminder = (reminder) => {
  //   setUpdating(reminder.id);
  //   setUpdateFormData({
  //     type: reminder.type,
  //     frequency: reminder.frequency,
  //     emails: reminder.payload.emails,
  //   });
  // };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handleUpdateReminder = (reminder) => {
    setUpdating(reminder.id);
    setreminderId(reminder?.id)
    setUpdateFormData({
      type: reminder.type,
      frequency: reminder.frequency,
      emails: reminder.payload.emails,
      jobId: reminder.jobId, // Include jobId in the form data
      typebotId: reminder.typebotId, // Include typebotId in the form data
      updatedColumnSettings: updatedColumnSetting
    });
    setIsUpdatingBtn(true);
  };

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
                    <Th>Result Header</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>

                      <Select onChange={handleTypeChange} value={selectedType}>
                        {['EMAIL'].map((type, index) => (
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
                    <Td> <ReminderColumnSettings
                      resultHeader={resultHeader}
                      columnVisibility={columnState?.remcolumnsVisibility}
                      setColumnVisibility={changeColumnVisibility}
                      columnOrder={columnState?.remcolumnsOrder}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      onColumnOrderChange={onColumnOrderChange}
                    // @ts-ignore
                    /></Td>
                  </Tr>
                </Tbody>
              </Table>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleSave} variant='ghost'>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Button color={'white'} _hover={{ bg: 'blue.700' }} bg={'blue.500'} onClick={handleOpen}>Add Reminder</Button>


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
                  <Th>Result Header</Th>
                  <Th>Action</Th>

                </Tr>
              </Thead>
              <Tbody>
                {reminders && reminders.map((reminder) => {
                  // const existingVisibility = JSON.parse(localStorage.getItem("reminder")) || {};
                  // existingVisibility[`reminder_${reminder.id}`] = reminder.payload.columnState.remcolumnsVisibility;
                  // localStorage.setItem("reminder", JSON.stringify(existingVisibility));
                  // localStorage.setItem("reminder", JSON.stringify(existingVisibility));
                  if (isDeleting !== reminder.id) {
                    localStorage.setItem(`reminder_${reminder.id}`, JSON.stringify(reminder.payload.columnState.remcolumnsVisibility));
                    localStorage.setItem(`reminder_order${reminder.id}`, JSON.stringify(reminder.payload.columnState.remcolumnsOrder));
                  }


                  return <Tr key={reminder.id}>
                    <Td>{new Date(reminder.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {isUpdating === reminder.id ? (
                        <Select
                          onChange={(e) => setUpdateFormData({ ...updateFormData, type: e.target.value })}
                          value={updateFormData.type}
                        >
                          {['EMAIL'].map((type, index) => (
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
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
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
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
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
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        reminder.payload.emails.map((email, index) => (
                          <Text key={index}>{email}</Text>
                        ))
                      )}
                    </Td>
                    <Td>
                      <ReminderColumnSettings
                        resultHeader={resultHeader}
                        columnVisibility={isUpdating !== reminder?.id ? reminder.payload.columnState.remcolumnsVisibility : updatedColumnSetting.remcolumnsVisibility}
                        setColumnVisibility={changeColumnVisibilityForUpdate}
                        columnOrder={isUpdating !== reminder?.id ? reminder.payload.columnState.remcolumnsOrder : updatedColumnSetting.remcolumnsOrder}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onColumnOrderChange={onUpadteColumnOrderChange}
                        disableEyeIcon={isUpdating !== reminder?.id}
                      />
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
                })}
              </Tbody>
            </Table>}
        </Box>
      </Box>
    </Flex>
  )
}
