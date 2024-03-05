import React, { useEffect, useState, ChangeEvent } from "react";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'
import { VStack, Stack, FormLabel, Select } from '@chakra-ui/react';
import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Variable } from '@typebot.io/schemas'

// @ts-ignore
export const CreateTicket = ({ options, onOptionsChange }) => {

  const { workspace } = useWorkspace();
  const { showToast } = useToast();



  const handleSubjectChange = (value: string) => {

    onOptionsChange({
      ...options,
      subject: value
    })

  }
  const handleOwnerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      owner: e.target.value
    })
  }

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




  const { data: tickettypesdata } = trpc.trudesk.listTicketTypes.useQuery(
    {
      credentialsId: options?.credentialsId,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace,
      onError: (error) => {
        showToast({
          description: error.message,
          status: 'error',
        })
      },
    }
  );
  console.log("ticket types", tickettypesdata);

  useEffect(() => {
    try {
      console.log("create ticket rendered", JSON.stringify(options));
      console.log("workspace id", workspace?.id);
    } catch (err) {
      console.log("error", err);
    }



  }, []);


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
        <VStack spacing={1} >
          <FormLabel>Enter Owner  </FormLabel>
          <Select
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
          </Select>



        </VStack>
        <VStack spacing={1} >
          <FormLabel>Enter Assignee   </FormLabel>
          <Select
            placeholder="Select Assignee"
            value={options?.assignee}
            onChange={handleAssigneeChange}
          >
            {tickettypesdata?.users?.map(usr => {
              return (
                <option value={usr.id} key={usr.id}>
                  {usr.name}
                </option>
              )
            })}
          </Select>

        </VStack>


      </Stack>
      <VStack spacing={1} >
        <FormLabel>Choose Group </FormLabel>
        <Select
          placeholder="Select Group"
          value={options?.group}
          onChange={handleGroupChange}
        >
          {tickettypesdata?.groups?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </Select>



      </VStack>


      <VStack spacing={1} >
        <FormLabel>Choose type </FormLabel>
        <Select
          placeholder="Select Type"
          value={options?.type}
          onChange={handleTypeChange}
        >
          {tickettypesdata?.types?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </Select>


      </VStack>

      {options?.type && (
        <Stack direction={"row"} spacing={3} justifyContent={"flex-start"} >
          <FormLabel>Choose Priority  </FormLabel>
          <Select
            placeholder="Select Priority"
            value={options?.priority}
            onChange={handlePriorityChange}
          >
            {tickettypesdata?.types?.filter(t => t.id == options.type)[0].priorities.map(usr => {
              return (
                <option value={usr.id} key={usr.id}>
                  {usr.name}
                </option>
              )
            })}
          </Select>

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



    </VStack>
  )
}