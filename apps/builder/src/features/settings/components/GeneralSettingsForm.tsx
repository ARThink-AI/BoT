import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Tag,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { GeneralSettings, rememberUserStorages } from '@typebot.io/schemas'
import React, { useState } from 'react'
import { isDefined } from '@typebot.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
// import { Input, Button } from '@chakra-ui/react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { DropdownList } from '@/components/DropdownList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { TextInput } from '@/components/inputs'

// import { TextInput } from '@/components/inputs'
// import { useTypebot } from '@/features/editor/providers/TypebotProvider'
type Props = {
  generalSettings: GeneralSettings
  onGeneralSettingsChange: (generalSettings: GeneralSettings) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  // const { typebot, updateTypebot } = useTypebot()
  // console.log("ttt", typebot);
  const [inputField, setInputField] = useState(generalSettings.navigationButtons)

  const toggleRememberUser = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings.rememberUser,
        isEnabled,
      },
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })



  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    })
  const handleVoiceChange = (isVoiceEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isVoiceEnabled,
    })

  const handleLiveChatChange = (isLiveChatEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isLiveChatEnabled
    })

  const handleTicketVariableNameChange = (ticketVariableName: string) =>
    onGeneralSettingsChange({
      ...generalSettings,
      ticketVariableName
    })

  const handleAccessTokenVariableNameChange = (accessTokenVariableName: string) =>
    onGeneralSettingsChange({
      ...generalSettings,
      accessTokenVariableName
    })

  const handleQuadzBaseUrlChange = (quadzBaseUrl: string) =>
    onGeneralSettingsChange({
      ...generalSettings,
      quadzBaseUrl
    })

  const handleTwilioChange = (isTwilioEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isTwilioEnabled,
    })

  const handleCustomInputChange = (isCustomInputEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isCustomInputEnabled,
    })

  const handleIsBottomNavigationEnabled = (isBottomNavigationEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isBottomNavigationEnabled,
    })

  const handleAutoRefreshInputChange = (isAutoRefreshEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isAutoRefreshEnabled,
    })

  const handlePublicIdInputChange = (publicId: string) =>
    onGeneralSettingsChange({
      ...generalSettings,
      publicId,
    })


  const handleBottomNavigationButtonName = (e) => {


  }
  const handleBottomNavigationButtonPrompt = () => {

  }


  const addFields = () => {
    let buttons = [...generalSettings.navigationButtons];
    buttons.push({ name: "", prompt: "" });

    onGeneralSettingsChange({
      ...generalSettings,
      navigationButtons: buttons
    })

  }

  const handleUpdateButtonChange = (index, property, value) => {
    const buttons = [...generalSettings.navigationButtons]
    buttons[index][property] = value
    onGeneralSettingsChange({
      ...generalSettings,
      navigationButtons: buttons
    })

  }

  const handleRemoveFields = (index) => {
    const buttons = inputField.filter((_, i) => i !== index);
    onGeneralSettingsChange({
      ...generalSettings,
      navigationButtons: buttons
    })

  }

  // const handleRemoveFields = (index) => {
  //   const newFields = inputField.filter((_, i) => i !== index);
  //   generalSettings.navigationButtons
  // };

  // const handleInputChange = (index, event) => {
  //   const newFields = [...inputField];
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   newFields[index] = event.target.value;

  //   setInputField(newFields);
  // };

  const handleSave = () => {

  }

  // const handlePhoneNumberChange = (twilioPhoneNumber: string) =>
  //   onGeneralSettingsChange({
  //     ...generalSettings,
  //     twilioPhoneNumber,
  //   })

  const handleSessionTimoutTime = (sessionTimout: string) =>
    onGeneralSettingsChange({
      ...generalSettings,
      sessionTimout
    })
  const handleHideBranding = (hideBranding: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      hideBranding
    })


  console.log("input fielddd button navigation", inputField)

  const updateRememberUserStorage = (
    storage: NonNullable<GeneralSettings['rememberUser']>['storage']
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings.rememberUser,
        storage,
      },
    })

  // let twilioUrl = `https://www.twilio.com/authorize/CN01eb83649eb3514ba70c7dd777ec69de?state=${typebot.id}`;
  return (
    <Stack spacing={6}>
      <SwitchWithLabel
        label="Prefill input"
        initialValue={generalSettings.isInputPrefillEnabled ?? true}
        onCheckChange={handleInputPrefillChange}
        moreInfoContent="Inputs are automatically pre-filled whenever their associated variable has a value"
      />
      <SwitchWithLabel
        label="Hide Branding"
        initialValue={generalSettings.hideBranding ?? false}
        onCheckChange={handleHideBranding}
        moreInfoContent="Hide Footer"
      />
      <SwitchWithLabel
        label="Hide query params on bot start"
        initialValue={generalSettings.isHideQueryParamsEnabled ?? true}
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent="If your URL contains query params, they will be automatically hidden when the bot starts."
      />
      <SwitchWithLabel
        label="Voice Enabled on bot start"
        initialValue={generalSettings.isVoiceEnabled ?? true}
        onCheckChange={handleVoiceChange}
        moreInfoContent="Toggle for voice"
      />
      <SwitchWithLabel
        label="Live chat on BoT"
        initialValue={generalSettings.isLiveChatEnabled ? generalSettings.isLiveChatEnabled : false}
        onCheckChange={handleLiveChatChange}
        moreInfoContent="Toggle for live chat"
      />
      {generalSettings.isLiveChatEnabled && (
        <>
          <Text> Ticket Variable  </Text>
          <TextInput
            defaultValue={generalSettings.ticketVariableName ? generalSettings.ticketVariableName : ""}
            onChange={e => handleTicketVariableNameChange(e)}
            withVariableButton={false}
          />
        </>
      )}

      {generalSettings.isLiveChatEnabled && (
        <>
          <Text> Access Token  Variable  </Text>
          <TextInput
            defaultValue={generalSettings.accessTokenVariableName ? generalSettings.accessTokenVariableName : ""}
            onChange={e => handleAccessTokenVariableNameChange(e)}
            withVariableButton={false}
          />
        </>
      )}

      {generalSettings.isLiveChatEnabled && (
        <>
          <Text> Quadz Base Url   </Text>
          <TextInput
            defaultValue={generalSettings.quadzBaseUrl ? generalSettings.quadzBaseUrl : ""}
            onChange={e => handleQuadzBaseUrlChange(e)}
            withVariableButton={false}
          />
        </>
      )}
      <SwitchWithLabel
        label="Twilio Enabled"
        initialValue={generalSettings.isTwilioEnabled ?? false}
        onCheckChange={handleTwilioChange}
        moreInfoContent="Toggle to Enable Twilio"
      />
      <SwitchWithLabel
        label="Auto Refresh Enabled"
        initialValue={generalSettings.isAutoRefreshEnabled ?? true}
        onCheckChange={handleAutoRefreshInputChange}
        moreInfoContent="Toggle to Enable Auto Refresh"
      />

      <>
        {/* <Text> Session Timeout  </Text> */}
        <TextInput
          label="Session Timeout"
          onChange={handleSessionTimoutTime}
          withVariableButton={false}
          defaultValue={generalSettings.sessionTimout ?? '20'}

        />
        {/* <input
        
          // defaultValue={generalSettings.sessionTimout ? generalSettings.sessionTimout : ""}
          onChange={e => handleSessionTimoutTime(e)}
          defaultValue={20}
          value={20}

        /> */}
      </>
      {/* {generalSettings.isTwilioEnabled && (
        <TextInput
          label="Twilio Phone Number"
          onChange={handlePhoneNumberChange}
          defaultValue={generalSettings.twilioPhoneNumber ?? ''}
          placeholder="Phone Number"
          withVariableButton={false}
        />
      )} */}
      {/* {
        generalSettings.isTwilioEnabled && !generalSettings.twilioAccountId && (
          <>
            <a
              href={twilioUrl}
              style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#0042DA", width: "180px", height: "36px", paddingRight: "5px", color: "white", border: "none", borderRadius: "4px", textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "20px" }}  >
              <span style={{ marginTop: "4px", width: "40px" }} ><img src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCA2MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPgoJPHRpdGxlPnR3aWxpby1sb2dvbWFyay13aGl0ZUFydGJvYXJkIDE8L3RpdGxlPgoJPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzAsMTVBMTUsMTUsMCwxLDAsNDUsMzAsMTUsMTUsMCwwLDAsMzAsMTVabTAsMjZBMTEsMTEsMCwxLDEsNDEsMzAsMTEsMTEsMCwwLDEsMzAsNDFabTYuOC0xNC43YTMuMSwzLjEsMCwxLDEtMy4xLTMuMUEzLjEyLDMuMTIsMCwwLDEsMzYuOCwyNi4zWm0wLDcuNGEzLjEsMy4xLDAsMSwxLTMuMS0zLjFBMy4xMiwzLjEyLDAsMCwxLDM2LjgsMzMuN1ptLTcuNCwwYTMuMSwzLjEsMCwxLDEtMy4xLTMuMUEzLjEyLDMuMTIsMCwwLDEsMjkuNCwzMy43Wm0wLTcuNGEzLjEsMy4xLDAsMSwxLTMuMS0zLjFBMy4xMiwzLjEyLDAsMCwxLDI5LjQsMjYuM1oiLz4KPC9zdmc+" /></span>
              Twilio Connect
            </a>
          </>
        )
      } */}
      <SwitchWithLabel
        label="Toggle for bottom navigation"
        initialValue={generalSettings.isBottomNavigationEnabled ?? false}
        onCheckChange={handleIsBottomNavigationEnabled}
        moreInfoContent="Toggle for bottom navigation"
      />

      {
        generalSettings.isBottomNavigationEnabled &&
        (
          generalSettings.navigationButtons.map((input, index) => {
            return <div key={index}>
              <FormControl>
                <FormLabel>Name</FormLabel>

                <Input
                  onChange={(e) => { handleUpdateButtonChange(index, "name", e.target.value) }}
                  // onChange={(event) => handleInputChange(index, event)}
                  defaultValue={input.name ?? ''}
                  placeholder="please enter your name "

                />
              </FormControl>
              <FormControl>
                <FormLabel>Prompt</FormLabel>
              </FormControl>
              <Textarea
                // onChange={ }
                onChange={(e) => { handleUpdateButtonChange(index, "prompt", e.target.value) }}
                // onChange={(event) => handleInputChange(index, event)}
                defaultValue={input.prompt ?? ''}
                placeholder="please enter prompt"

              />
              <Button mt={5} bg={"red.400"} _hover={{ bg: "red.600" }} onClick={() => { handleRemoveFields(index) }}>remove</Button>
            </div>
          })

        )


      }
      {generalSettings.isBottomNavigationEnabled && (
        <Button bg={"blue.500"} _hover={{ bg: "blue.600" }} onClick={addFields}>add</Button>
      )}
      <SwitchWithLabel
        label="Custom Input Enabled on bot start"
        initialValue={generalSettings.isCustomInputEnabled ?? false}
        onCheckChange={handleCustomInputChange}
        moreInfoContent="Toggle for Custom Input"
      />


      {generalSettings.isCustomInputEnabled && (
        <TextInput
          label="Public Id"
          onChange={handlePublicIdInputChange}
          defaultValue={generalSettings.publicId ?? ''}
          placeholder="Public Id "
          withVariableButton={false}
        />
      )}







      <SwitchWithRelatedSettings
        label={'Remember user'}
        moreInfoContent="If enabled, user previous variables will be prefilled and his new answers will override the previous ones."
        initialValue={
          generalSettings.rememberUser?.isEnabled ??
          (isDefined(generalSettings.isNewResultOnRefreshEnabled)
            ? !generalSettings.isNewResultOnRefreshEnabled
            : false)
        }
        onCheckChange={toggleRememberUser}
      >
        <FormControl as={HStack} justifyContent="space-between">
          <FormLabel mb="0">
            Storage:&nbsp;
            <MoreInfoTooltip>
              <Stack>
                <Text>
                  Choose <Tag size="sm">session</Tag> to remember the user as
                  long as he does not closes the tab or the browser.
                </Text>
                <Text>
                  Choose <Tag size="sm">local</Tag> to remember the user
                  forever.
                </Text>
              </Stack>
            </MoreInfoTooltip>
          </FormLabel>
          <DropdownList
            currentItem={generalSettings.rememberUser?.storage ?? 'session'}
            onItemSelect={updateRememberUserStorage}
            items={rememberUserStorages}
          ></DropdownList>
        </FormControl>
      </SwitchWithRelatedSettings>
    </Stack>
  )
}

