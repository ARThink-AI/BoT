import React, { useState, ChangeEvent } from "react";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'
import { VStack, Stack, FormLabel, Select as S } from '@chakra-ui/react';
import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Variable } from '@typebot.io/schemas'

import Select from 'react-select';



// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const CreateTicket = ({ options, onOptionsChange }) => {

  const [selectedOption, setSelectedOption] = useState(
    options?.tags ? options?.tags.map((t: { id: string, name: string, normalized: string }) => {
      return {
        label: t.name,
        value: t.id
      }
    }) : null
  );
  console.log("selected option", selectedOption);

  const { workspace } = useWorkspace();
  const { showToast } = useToast();



  const handleSubjectChange = (value: string) => {

    onOptionsChange({
      ...options,
      subject: value
    })

  }
  // const handleOwnerChange = (e: ChangeEvent<HTMLSelectElement>) => {
  //   onOptionsChange({
  //     ...options,
  //     owner: e.target.value
  //   })
  // }

  const handleAssigneeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      assignee: e.target.value
    })
  }
  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      group: e.target.value
    })
  }
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      type: e.target.value,
      priority: ""
    })
  }

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      priority: e.target.value
    })
  }
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId: variable?.id
    })
  }

  const handleVariableChange3 = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId2: variable?.id
    })
  }
  const handleVariableChange4 = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId3: variable?.id
    })
  }



  const handleVariableChange2 = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId1: variable?.id
    })
  }

  const handleTagsChange = (tags: [{ label: string, value: string }]) => {

    const tagsSelected = tags.map((t: { label: string, value: string }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return tickettypesdata?.tags?.filter(tp => tp.id == t.value)[0]
    });

    onOptionsChange({
      ...options,
      tags: tagsSelected
    })
    setSelectedOption(tags);

  }



  const { data: tickettypesdata } = trpc.trudesk.listTicketTypes.useQuery(
    {
      credentialsId: options?.credentialsId,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onError: (error) => {
        showToast({
          description: error.message,
          status: 'error',
        })
      },
    }
  );
  console.log("ticket types", tickettypesdata);




  return tickettypesdata && (
    <VStack spacing={4} align={"stretch"} >
      <TextInput
        defaultValue={options?.subject ? options?.subject : ""}
        onChange={handleSubjectChange}
        label={"Enter Subject"}
        withVariableButton={false}
        debounceTimeout={0}
      />
      <Stack direction={"row"} spacing={4} justifyContent={"space-evenly"} >
        {/* <VStack spacing={1} >
          <FormLabel>Enter Owner  </FormLabel>
          <S
            placeholder="Select Owner"
            value={options?.owner}
            onChange={handleOwnerChange}
          >
           
            {tickettypesdata?.users?.map(usr => {
              return (
                <option value={usr.id} key={usr.id}>
                  {usr.name}
                </option>
              )
            })}
          </S>



        </VStack> */}
        <VStack spacing={1} >
          <FormLabel>Pick  CustomerId  </FormLabel>
          <VariableSearchInput
            onSelectVariable={handleVariableChange3}
            placeholder="Search for a variable"
            initialVariableId={options?.variableId2}
          />
        </VStack>
        <VStack spacing={1} >
          <FormLabel>Enter Assignee   </FormLabel>
          <S
            placeholder="Select Assignee"
            value={options?.assignee}
            onChange={handleAssigneeChange}
          >
            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
            {tickettypesdata?.users?.map(usr => {
              return (
                <option value={usr.id} key={usr.id}>
                  {usr.name}
                </option>
              )
            })}
          </S>

        </VStack>


      </Stack>
      <VStack spacing={1} >
        <FormLabel>Choose Group </FormLabel>
        <S
          placeholder="Select Group"
          value={options?.group}
          onChange={handleGroupChange}
        >
          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
          {tickettypesdata?.groups?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </S>



      </VStack>


      <VStack spacing={1} >
        <FormLabel>Choose type </FormLabel>
        <S

          placeholder="Select Type"
          value={options?.type}
          onChange={handleTypeChange}
        >
          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
          {tickettypesdata?.types?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </S>


      </VStack>
      <VStack spacing={1} >
        <FormLabel>Choose tags  </FormLabel>
        <Select
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            colors: {
              ...theme.colors,
              primary25: 'hotpink',
              primary: 'black',
              neutral0: "black"
            },
          })}

          isMulti
          defaultValue={selectedOption}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={handleTagsChange}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options={tickettypesdata?.tags?.map(t => {
            return {
              label: t.name,
              value: t.id
            }
          })}
        />

      </VStack>

      {options?.type && (
        <Stack direction={"row"} spacing={3} justifyContent={"flex-start"} >
          <FormLabel>Choose Priority  </FormLabel>
          <S
            placeholder="Select Priority"
            value={options?.priority}
            onChange={handlePriorityChange}
          >
            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
            {tickettypesdata?.types?.filter(t => t.id == options.type)[0].priorities.map(usr => {
              return (
                <option value={usr.id} key={usr.id}>
                  {usr.name}
                </option>
              )
            })}
          </S>

        </Stack>
      )}
      <VStack spacing={1} >
        <FormLabel>Save TicketId in variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel>Save Ticket UID  in variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange2}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId1}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel>Save Access Token  in variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange4}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId3}
        />
      </VStack>



    </VStack>
  )
}