import React, { useEffect, useState, ChangeEvent } from "react";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { VStack, FormLabel, Button, Link, Text, Image, Select } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@/components/icons'
import { useToast } from '@/hooks/useToast'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Variable } from '@typebot.io/schemas'
import { TextInput } from "@/components/inputs";
import { trpc } from '@/lib/trpc'
// function deepCloneArray(arr) {
//   return arr.map(element =>
//     Array.isArray(element) ? deepCloneArray(element) : element
//   );
// }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const InitiateMessage = ({ options, onOptionsChange }) => {
  console.log("options for initiate message", JSON.stringify(options));

  const { workspace } = useWorkspace();
  const { showToast } = useToast();

  const handleToChange = (value: string) => {

    onOptionsChange({
      ...options,
      to: value
    })

  }

  const handlePhoneNumberIdChange = (value: string) => {

    onOptionsChange({
      ...options,
      phoneNumberId: value
    })

  }

  const handleVariableUpdate = (type: string, index: number, value: string) => {
    console.log("handleVariableUpdate params", type, index, value);
    let components = [...options.components];
    components = components.map(comp => {
      if (comp.type != type) return comp;
      let updatedComp = {
        ...comp,
        variables: [...comp.variables]
      };

      // Now you can safely modify the variables array
      updatedComp.variables[index] = value;
      // let updatedComp = { ...comp };
      // updatedComp.variables[index] = value;
      return updatedComp;

    });
    onOptionsChange({
      ...options,
      components: components
    })

  }
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId: variable?.id
    })
  }
  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let components = [];
    // @ts-ignore
    if (whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value).length > 0) {
      // @ts-ignore
      let template = whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value)[0];
      if (template && template?.components?.filter(t => t.type == "BODY").length > 0) {
        let selectedComponent = template?.components?.filter(t => t.type == "BODY")[0];
        console.log("variablesss", selectedComponent?.example?.body_text[0]);
        // let array = deepCloneArray(selectedComponent?.example?.body_text);
        if (selectedComponent?.example?.body_text[0]) {
          let newComp = { type: "BODY", text: selectedComponent.text, variables: [...selectedComponent?.example?.body_text[0]] ?? [] };
          // let newComp = { type: "BODY", text: selectedComponent.text, variables: new Array(selectedComponent?.example?.body_text[0].length).fill("") ?? [] };
          components.push(newComp);
        } else {
          console.log(" enteredd else ");
          let newComp = { type: "BODY", text: selectedComponent.text, variables: [] };
          components.push(newComp);
        }
      }
      // Header Code 
      if (template && template?.components?.filter(t => t.type == "HEADER").length > 0) {
        let selectedComponent = template?.components?.filter(t => t.type == "HEADER")[0];
        // Header Format text 
        if (selectedComponent?.format == 'TEXT') {
          if (selectedComponent?.example?.header_text) {
            let newComp = { type: "HEADER", text: selectedComponent.text, variables: [...selectedComponent?.example?.header_text] ?? [] };

            components.push(newComp);
          } else {
            let newComp = { type: "HEADER", text: selectedComponent.text, variables: [] };
            components.push(newComp);
          }
        }
        if (selectedComponent?.format == 'IMAGE' && selectedComponent?.example?.header_handle) {
          let newComp = { type: "HEADER", text: selectedComponent.text, image: true, variables: [...selectedComponent?.example?.header_handle] ?? [] };

          components.push(newComp);
        }

      }



    }
    onOptionsChange({
      ...options,
      selectedTemplateId: e?.target?.value,
      // @ts-ignore
      selectedTemplateName: whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value).length > 0 ? whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value)[0].name : "",
      // @ts-ignore
      selectedTemplateLang: whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value).length > 0 ? whatsappMessageTemplates?.templates?.filter(temp => temp?.id == e?.target?.value)[0].language : "",
      components: [...components]
    });
  }


  const { data: whatsappMessageTemplates } = trpc.Whatsapp.listMessageTemplates.useQuery(
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
  // console.log("whatsappMessageTemplates", whatsappMessageTemplates);
  let selectedTemplate;
  // @ts-ignore
  if (options?.selectedTemplateId && whatsappMessageTemplates && whatsappMessageTemplates?.templates?.filter(temp => temp?.id == options?.selectedTemplateId).length > 0) {
    // @ts-ignore
    selectedTemplate = whatsappMessageTemplates?.templates?.filter(temp => temp?.id == options?.selectedTemplateId)[0];
  }
  console.log("options", JSON.stringify(options));
  return whatsappMessageTemplates ? (
    <VStack spacing={4} align={"stretch"} >
      <TextInput
        defaultValue={options?.to ? options?.to : ""}
        onChange={handleToChange}
        label={"Whatsapp Number to send message"}
        withVariableButton={true}
        debounceTimeout={0}
      />
      <Text> Go to this link and select phone number and paste Phone Number Id Below   </Text>
      <Image
        src="/images/whatsapp-phone-selection.png"
        alt="WA phone selection"
      />
      <Button
        as={Link}
        href={`https://developers.facebook.com/apps/${whatsappMessageTemplates.appId}/whatsapp-business/wa-dev-console`}
        isExternal
        rightIcon={<ExternalLinkIcon />}
        size="sm"
      >
        WhatsApp Dev Console{' '}
      </Button>
      <TextInput
        defaultValue={options?.phoneNumberId ? options?.phoneNumberId : ""}
        onChange={handlePhoneNumberIdChange}
        label={"Enter Phone Number Id"}
        withVariableButton={false}
        debounceTimeout={0}
      />
      <VStack spacing={1} >
        <FormLabel> Select  Template    </FormLabel>
        <Select placeholder="Select Template" value={options?.selectedTemplateId} onChange={handleTemplateChange} >

          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
          {whatsappMessageTemplates?.templates?.filter(temp => temp?.status == "APPROVED").map(temp => {
            return (
              <option key={temp?.id} value={temp?.id} >
                {temp?.name}
              </option>
            )
          })}

        </Select>
      </VStack>
      { /* 
       Header text
      */ }

      {options?.components?.filter(t => t.type == "HEADER").length > 0 && (
        <VStack spacing={1} >
          <FormLabel> Header </FormLabel>
          {/* <Text> {options?.components?.filter(t => t.type == "HEADER")[0]?.format == "IMAGE" ? "Upload" : ""} </Text> */}
          <Text> {options?.components?.filter(t => t.type == "HEADER")[0]?.text ?? ""} </Text>

          {options?.components?.filter(t => t.type == "HEADER")[0]?.variables.length > 0 && (
            <Text> Variables  </Text>
          )}
          {options?.components?.filter(t => t.type == "HEADER")[0]?.variables?.map((variable, index) => {
            return (
              <TextInput
                key={options?.selectedTemplateId + variable}
                defaultValue={variable}
                // value={variable}
                // onChange={handlePhoneNumberIdChange}
                // @ts-ignore
                onChange={(val) => {
                  // console.log("vvvv", val);
                  handleVariableUpdate("HEADER", index, val)

                }}
                label={"Enter Variable Value"}
                withVariableButton={false}
                debounceTimeout={2000}
              />
            )
          })}
        </VStack>
      )}



      {options?.components?.filter(t => t.type == "BODY").length > 0 && (
        <VStack spacing={1} >
          <FormLabel>Body</FormLabel>
          <Text> {options?.components?.filter(t => t.type == "BODY")[0]?.text ?? ""} </Text>
          {options?.components?.filter(t => t.type == "BODY")[0]?.variables.length > 0 && (
            <Text> Variables  </Text>
          )}
          {options?.components?.filter(t => t.type == "BODY")[0]?.variables?.map((variable, index) => {
            return (
              <TextInput
                key={options?.selectedTemplateId + variable}
                defaultValue={variable}
                // value={variable}
                // onChange={handlePhoneNumberIdChange}
                // @ts-ignore
                onChange={(val) => {
                  // console.log("vvvv", val);
                  handleVariableUpdate("BODY", index, val)

                }}
                label={"Enter Variable Value"}
                withVariableButton={false}
                debounceTimeout={2000}
              />
            )
          })}
        </VStack>
      )}
      { /*  @ts-ignore */}
      {selectedTemplate && selectedTemplate.components.filter(t => t.type == "FOOTER").length > 0 && (
        <VStack spacing={1} >
          <FormLabel> Footer  </FormLabel>
          { /*  @ts-ignore */}
          <Text> {selectedTemplate.components.filter(t => t.type == "FOOTER")[0]?.text} </Text>
        </VStack>
      )}
      <VStack spacing={1} >
        <FormLabel>Save Message Status in variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId}
        />
      </VStack>


    </VStack>
  ) : (
    <div> Loading Data... </div>
  )
}