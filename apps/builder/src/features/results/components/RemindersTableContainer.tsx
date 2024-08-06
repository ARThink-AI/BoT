// import React, { useEffect, useMemo, useState } from 'react'
// import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select, Button, TableCaption, Text } from '@chakra-ui/react'
// import { useTypebot } from '@/features/editor/providers/TypebotProvider'
// import { trpc } from '@/lib/trpc'
// import { isDefined } from '@udecode/plate-common'
// import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
// import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
// import { defaultTimeFilter, timeFilterValues } from '../api/constants'
// import { parseResultHeader } from '@typebot.io/lib/results'
// import { LogicBlockType } from '@typebot.io/schemas'
// import { convertResultsToTableData } from '../helpers/convertResultsToTableData'




// export const RemindersTableContainer = () => {
//   const { typebot, publishedTypebot } = useTypebot()
//   // @ts-ignore
//   const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
//   const [selectedType, setSelectedType] = useState('Email')
//   const [emails, setEmails] = useState([])
//   const [emailValid, setEmailValid] = useState(true);
//   const [duplicateEmail, setDuplicateEmail] = useState<boolean>(false);



//   const { data } = trpc.results.getReminders.useQuery(
//     {
//       typebotId: typebot?.id as string,
//       timeFilter: selectedTimeFilter

//     },
//     { enabled: isDefined(publishedTypebot) }
//   )


//   console.log("reminderssss data", data)

//   const linkedTypebotIds =
//     publishedTypebot?.groups
//       .flatMap((group) => group.blocks)
//       .reduce<string[]>(
//         (typebotIds, block) =>
//           block.type === LogicBlockType.TYPEBOT_LINK &&
//             isDefined(block.options.typebotId) &&
//             !typebotIds.includes(block.options.typebotId) &&
//             block.options.mergeResults !== false
//             ? [...typebotIds, block.options.typebotId]
//             : typebotIds,
//         []
//       ) ?? []

//   const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
//     {
//       typebotId: typebot?.id as string,
//     },
//     {
//       enabled: linkedTypebotIds.length > 0,
//     }
//   )


//   const resultHeader = useMemo(
//     () =>
//       publishedTypebot
//         ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
//         : [],
//     [linkedTypebotsData?.typebots, publishedTypebot]
//   )



//   // const tableData = useMemo(
//   //   () =>
//   //     publishedTypebot
//   //       ? convertResultsToTableData(
//   //         data?.flatMap((d) => d.results) ?? [],
//   //         resultHeader
//   //       )
//   //       : [],
//   //   [publishedTypebot, data, resultHeader]
//   // )
//   const tableData = useMemo(
//     () =>
//       publishedTypebot
//         ? convertResultsToTableData(
//           data?.results,
//           resultHeader
//         )
//         : [],
//     [publishedTypebot, data, resultHeader]
//   )

//   const handleTypeChange = (e) => {
//     const value = e.target.value;
//     setSelectedType(value)

//   }

//   console.log("tabledataaaaaaa", tableData)
//   console.log("headerssssss", resultHeader)

//   // const generateTableHTML = (resultHeader: any[], data: any[]) => {
//   //   const headerHTML = resultHeader.map(header => `<th>${header.label}</th>`).join('');
//   //   const rowsHTML = data.map(row => {
//   //     const cellsHTML = resultHeader.map(header => `<td>${row[header.id] || ''}</td>`).join('');
//   //     return `<tr>${cellsHTML}</tr>`;
//   //   }).join('');

//   //   return `
//   //     <table style="width: 100%; border-collapse: collapse;">
//   //       <thead>
//   //         <tr>${headerHTML}</tr>
//   //       </thead>
//   //       <tbody>${rowsHTML}</tbody>
//   //     </table>
//   //   `;
//   // };

//   // const htmlTable = generateTableHTML(resultHeader, tableData);
//   const types = [
//     'Email',
//     'Whatsapp',
//     'Text'
//   ]


//   const validateEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   // @ts-ignore
//   const handleInputChange = (index, event) => {
//     const newEmails = [...emails];
//     // @ts-ignore
//     newEmails[index] = event.target.value;
//     // @ts-ignore
//     // console.log(`reminder email ${index}`, newEmails[index] = event.target.value)

//     // @ts-ignore
//     setEmailValid(validateEmail(newEmails[index] = event.target.value))
//     setDuplicateEmail(newEmails.filter((e, i) => newEmails.indexOf(e) !== i).length > 0);
//     setEmails(newEmails);
//   };

//   const handleAddEmail = () => {
//     // @ts-ignore
//     setEmails([...emails, '']); // Add a new empty email field
//   };
//   // @ts-ignore
//   const handleRemoveEmail = (index) => {
//     const newEmails = emails.filter((_, i) => i !== index);
//     setEmails(newEmails);
//   };
//   // console.log("reminder emailsss", emails)
//   return (
//     <Flex overflowY={'auto'} overflowX={'hidden'} h="100vh" flexDir="column">
//       <TypebotHeader />

//       {/* <TimeFilterDropdown
//         selectedTimeFilter={selectedTimeFilter}
//         onChange={setSelectedTimeFilter}
//         placeholder="Choose a time filter"
//       /> */}

//       <Box mt={'5%'} mx={'auto'} w={'max-content'} p={4}>
//         {/* <h1 style={{ textAlign: 'center' }}>Reminders</h1>
//          */}

//         <Table variant="simple">
//           <TableCaption>Reminders</TableCaption>
//           <Thead>
//             <Tr>
//               <Th>Type</Th>
//               <Th>Frequency</Th>
//               <Th>Typebot ID</Th>
//               <Th>Emails</Th>
//               <Th>Action</Th>
//               {/* <Th>Created At</Th>
//               <Th>Updated At</Th> */}
//             </Tr>
//           </Thead>
//           <Tbody>

//             <Tr >
//               <Td>
//                 <Select onChange={handleTypeChange} value={selectedType}>
//                   {types.map((type, index) => (<option key={index}>{type}</option>)
//                   )}
//                 </Select>
//               </Td>
//               <Td>
//                 <TimeFilterDropdown
//                   selectedTimeFilter={selectedTimeFilter}
//                   onChange={setSelectedTimeFilter}
//                   placeholder="Choose a frequency"
//                 />
//               </Td>
//               <Td>{typebot?.id}</Td>
//               <Td>
//                 {!emailValid && (
//                   // <p style={} className="text-red-500 text-sm">Please enter a valid email address.</p>
//                   <Text color={'red.500'} fontSize={'sm'}>Please enter a valid email address.</Text>
//                 )}
//                 {duplicateEmail && (
//                   <Text color="red.500" fontSize="sm">Duplicate email address found.</Text>
//                 )}
//                 {emails.map((email, index) => (
//                   <Flex wrap={'wrap'}>

//                     <Input
//                       key={index}
//                       type="email"
//                       value={email}
//                       onChange={(event) => handleInputChange(index, event)}
//                       placeholder={`Email ${index + 1}`}
//                     />
//                     <Button m={2} type="button" onClick={() => handleRemoveEmail(index)}>
//                       Remove
//                     </Button>
//                   </Flex>
//                 ))}
//                 <Button onClick={handleAddEmail}>Add</Button>

//                 {/* <Input placeholder='Please enter your email' type='email' /> */}
//               </Td>
//               <Td><Button>Save</Button> <Button>Delete</Button> </Td>
//               {/* <Td>{ }</Td>
//               <Td>{ }</Td> */}
//             </Tr>

//           </Tbody>
//         </Table>
//       </Box>


//     </Flex>
//   )
// }

import React, { useEffect, useMemo, useState } from 'react'
import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select, Button, TableCaption, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@udecode/plate-common'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
import { defaultTimeFilter, timeFilterValues } from '../api/constants'
import { parseResultHeader } from '@typebot.io/lib/results'
import { LogicBlockType } from '@typebot.io/schemas'
import { convertResultsToTableData } from '../helpers/convertResultsToTableData'

export const RemindersTableContainer = () => {
  const { typebot, publishedTypebot } = useTypebot()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
  const [selectedType, setSelectedType] = useState('EMAIL')
  const [emails, setEmails] = useState([])
  const [emailValid, setEmailValid] = useState(true);
  const [duplicateEmail, setDuplicateEmail] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(true);

  const { data } = trpc.results.getReminders.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter: selectedTimeFilter
    },
    { enabled: isDefined(publishedTypebot) }
  )

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

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleInputChange = (index, event) => {
    const newEmails = [...emails];
    newEmails[index] = event.target.value;
    setEmailValid(validateEmail(newEmails[index]));
    setDuplicateEmail(newEmails.filter((e, i) => newEmails.indexOf(e) !== i).length > 0);
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']); // Add a new empty email field
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };



  const handleEdit = () => {
    setIsEditing(true);
  };
  console.log("selected frequencyy", selectedTimeFilter)

  const mutation = trpc.results.reminderCreate.useMutation();
  const updateMutation = trpc.results.updateReminder.useMutation();
  const deleteMutation = trpc.results.deleteReminder.useMutation();


  const addReminder = async () => {
    try {
      const newReminder = await mutation.mutateAsync({
        jobId: 'example-job-id',
        payload: { 'emails': emails },
        typebotId: typebot?.id,
        type: selectedType,
        frequency: selectedTimeFilter,
      });
      console.log('Reminder added:', newReminder);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const updateReminder = async (id: string, updates: Partial<ReminderType>) => {
    try {
      const updatedReminder = await updateMutation.mutateAsync({
        id,
        updates,
      });
      console.log('Reminder updated:', updatedReminder);
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const result = await deleteMutation.mutateAsync(id);
      console.log('Reminder deleted:', result);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };


  const handleSave = async () => {
    setIsEditing(false);
    addReminder()

  };
  const handleDelete = async (id) => {
    // setIsEditing(false);
    deleteReminder(id)

  };


  // const { data: reminders, isLoading, error } = trpc.results.fetchReminders.useQuery({ typebotId: typebot?.id });
  // console.log("reminderss", reminders)
  return (
    <Flex overflowY={'auto'} overflowX={'hidden'} h="100vh" flexDir="column">
      <TypebotHeader />
      <Box mt={'5%'} mx={'auto'} w={'max-content'} p={4}>
        <h1 style={{ textAlign: 'center' }}>Reminders</h1>
        <Table variant="simple">

          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Frequency</Th>
              <Th>Typebot ID</Th>
              <Th>Emails</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                {isEditing ? (
                  <Select onChange={handleTypeChange} value={selectedType}>
                    {['EMAIL', 'WHATSAPP', 'TEXT'].map((type, index) => (
                      <option key={index}>{type}</option>
                    ))}
                  </Select>
                ) : (
                  <Text>{selectedType}</Text>
                )}
              </Td>
              <Td>
                {isEditing ? (
                  <TimeFilterDropdown
                    selectedTimeFilter={selectedTimeFilter}
                    onChange={setSelectedTimeFilter}
                    placeholder="Choose a frequency"
                  />
                ) : (
                  <Text>{selectedTimeFilter.toUpperCase()}</Text>
                )}
              </Td>
              <Td>{typebot?.id}</Td>
              <Td>
                {!emailValid && (
                  <Text color={'red.500'} fontSize={'sm'}>Please enter a valid email address.</Text>
                )}
                {duplicateEmail && (
                  <Text color="red.500" fontSize="sm">Duplicate email address found.</Text>
                )}
                {isEditing ? (
                  emails.map((email, index) => (
                    <Flex key={index} wrap={'wrap'}>
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => handleInputChange(index, event)}
                        placeholder={`Email ${index + 1}`}
                      />
                      <Button m={2} type="button" onClick={() => handleRemoveEmail(index)}>
                        Remove
                      </Button>
                    </Flex>
                  ))
                ) : (
                  emails.map((email, index) => (
                    <Text key={index}>{email}</Text>
                  ))
                )}
                {isEditing && (
                  <Button onClick={handleAddEmail}>Add</Button>
                )}
              </Td>
              <Td>
                {isEditing ? (<>
                  <Button onClick={handleSave}>Save</Button>
                  <Button onClick={() => { handleDelete('clzgx4f8i0007v7ow7n9r0ig8') }}>delete</Button>

                </>
                ) : (<>
                  <Button onClick={handleEdit}>Edit</Button>

                </>
                )}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Flex>
  )
}


// import React, { useEffect, useMemo, useState } from 'react'
// import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select, Button, TableCaption, Text } from '@chakra-ui/react'
// import { useTypebot } from '@/features/editor/providers/TypebotProvider'
// import { trpc } from '@/lib/trpc'
// import { isDefined } from '@udecode/plate-common'
// import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
// import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
// import { defaultTimeFilter, timeFilterValues } from '../api/constants'
// import { parseResultHeader } from '@typebot.io/lib/results'
// import { LogicBlockType } from '@typebot.io/schemas'
// import { convertResultsToTableData } from '../helpers/convertResultsToTableData'

// export const RemindersTableContainer = () => {
//   const { typebot, publishedTypebot } = useTypebot()
//   const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
//   const [selectedType, setSelectedType] = useState('Email')
//   const [emails, setEmails] = useState(['']) // Initialize with one empty email
//   const [emailValid, setEmailValid] = useState(true);
//   const [duplicateEmail, setDuplicateEmail] = useState<boolean>(false);
//   const [isEditing, setIsEditing] = useState(true);
//   const [reminders, setReminders] = useState([{ type: 'Email', frequency: defaultTimeFilter, emails: [''] }]); // Initialize with one reminder
//   const [checkIsEmailEmpty, setcheckIsEmailEmpty] = useState(false)
//   const { data } = trpc.results.getReminders.useQuery(
//     {
//       typebotId: typebot?.id as string,
//       timeFilter: selectedTimeFilter
//     },
//     { enabled: isDefined(publishedTypebot) }
//   )

//   const linkedTypebotIds =
//     publishedTypebot?.groups
//       .flatMap((group) => group.blocks)
//       .reduce<string[]>(
//         (typebotIds, block) =>
//           block.type === LogicBlockType.TYPEBOT_LINK &&
//             isDefined(block.options.typebotId) &&
//             !typebotIds.includes(block.options.typebotId) &&
//             block.options.mergeResults !== false
//             ? [...typebotIds, block.options.typebotId]
//             : typebotIds,
//         []
//       ) ?? []

//   const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
//     {
//       typebotId: typebot?.id as string,
//     },
//     {
//       enabled: linkedTypebotIds.length > 0,
//     }
//   )

//   const resultHeader = useMemo(
//     () =>
//       publishedTypebot
//         ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
//         : [],
//     [linkedTypebotsData?.typebots, publishedTypebot]
//   )

//   const tableData = useMemo(
//     () =>
//       publishedTypebot
//         ? convertResultsToTableData(
//           data?.results,
//           resultHeader
//         )
//         : [],
//     [publishedTypebot, data, resultHeader]
//   )

//   useEffect(() => {
//     if (data?.results) {
//       setReminders([{ type: 'Email', frequency: defaultTimeFilter, emails: [''] }]);
//     }
//   }, [data]);

//   const handleTypeChange = (index, e) => {
//     const newReminders = [...reminders];
//     newReminders[index].type = e.target.value;
//     setReminders(newReminders);
//   }

//   const handleFrequencyChange = (index, newFrequency) => {
//     const newReminders = [...reminders];
//     newReminders[index].frequency = newFrequency;
//     console.log("frequency", newReminders)
//     setSelectedTimeFilter(newReminders.frequency)
//     setReminders(newReminders);
//   }

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   const handleEmailChange = (reminderIndex, emailIndex, event) => {
//     const newReminders = [...reminders];
//     newReminders[reminderIndex].emails[emailIndex] = event.target.value;
//     console.log("is email emty", newReminders[reminderIndex].emails[emailIndex] = event.target.value == '')
//     // if (newReminders[reminderIndex].emails[emailIndex] = event.target.value == '') {
//     //   setcheckIsEmailEmpty(true)
//     // }
//     setEmailValid(validateEmail(event.target.value));
//     setDuplicateEmail(newReminders[reminderIndex].emails.filter((e, i) => newReminders[reminderIndex].emails.indexOf(e) !== i).length > 0);
//     setReminders(newReminders);
//   };

//   const handleAddEmail = (index) => {
//     const newReminders = [...reminders];
//     newReminders[index].emails.push('');
//     setReminders(newReminders);
//   };

//   const handleRemoveEmail = (reminderIndex, emailIndex) => {
//     const newReminders = [...reminders];
//     newReminders[reminderIndex].emails = newReminders[reminderIndex].emails.filter((_, i) => i !== emailIndex);
//     setReminders(newReminders);
//   };

//   const handleSave = () => {
//     setIsEditing(false);
//     if (checkIsEmailEmpty) {
//       setIsEditing(true)
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleDelete = (index) => {
//     const newReminders = reminders.filter((_, i) => i !== index);
//     setReminders(newReminders);
//   };

//   return (
//     <Flex overflowY={'auto'} overflowX={'hidden'} h="100vh" flexDir="column">
//       <TypebotHeader />
//       <Box mt={'5%'} mx={'auto'} w={'max-content'} p={4}>
//         <Table variant="simple">
//           <TableCaption>Reminders</TableCaption>
//           <Thead>
//             <Tr>
//               <Th>Type</Th>
//               <Th>Frequency</Th>
//               <Th>Typebot ID</Th>
//               <Th>Emails</Th>
//               <Th>Action</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {reminders.map((reminder, index) => (
//               <Tr key={index}>
//                 <Td>
//                   {isEditing ? (
//                     <Select onChange={(e) => handleTypeChange(index, e)} value={reminder.type}>
//                       {['Email', 'Whatsapp', 'Text'].map((type, idx) => (
//                         <option key={idx}>{type}</option>
//                       ))}
//                     </Select>
//                   ) : (
//                     <Text>{reminder.type}</Text>
//                   )}
//                 </Td>
//                 <Td>
//                   {isEditing ? (
//                     <TimeFilterDropdown
//                       selectedTimeFilter={reminder.frequency}
//                       onChange={(newFrequency) => handleFrequencyChange(index, newFrequency)}
//                       placeholder="Choose a frequency"
//                     />
//                   ) : (
//                     <Text>{reminder.frequency.label}</Text>
//                   )}
//                 </Td>
//                 <Td>{typebot?.id}</Td>
//                 <Td>
//                   {!emailValid && (
//                     <Text color={'red.500'} fontSize={'sm'}>Please enter a valid email address.</Text>
//                   )}
//                   {duplicateEmail && (
//                     <Text color="red.500" fontSize="sm">Duplicate email address found.</Text>
//                   )}
//                   {/* {checkIsEmailEmpty && (<Text color="red.500" fontSize="sm">Please add email first.</Text>)} */}
//                   {isEditing ? (
//                     reminder.emails.map((email, emailIndex) => (
//                       <Flex key={emailIndex} wrap={'wrap'}>
//                         <Input
//                           type="email"
//                           value={email}
//                           onChange={(event) => handleEmailChange(index, emailIndex, event)}
//                           placeholder={`Email ${emailIndex + 1}`}
//                         />
//                         <Button m={2} type="button" onClick={() => handleRemoveEmail(index, emailIndex)}>
//                           Remove
//                         </Button>
//                       </Flex>
//                     ))
//                   ) : (
//                     reminder.emails.map((email, emailIndex) => (
//                       <Text key={emailIndex}>{email}</Text>
//                     ))
//                   )}
//                   {isEditing && (
//                     <Button onClick={() => handleAddEmail(index)}>Add</Button>
//                   )}
//                 </Td>
//                 <Td>
//                   {isEditing ? (
//                     <Button onClick={handleSave}>Save</Button>
//                   ) : (
//                     <Button onClick={handleEdit}>Edit</Button>
//                   )}
//                   <Button ml={2} onClick={() => handleDelete(index)}>Delete</Button>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </Box>
//     </Flex>
//   )
// }
