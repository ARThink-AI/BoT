import {
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import { GeneralSettings, rememberUserStorages } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
// import { Input, Button } from '@chakra-ui/react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { DropdownList } from '@/components/DropdownList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
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

  // const handlePhoneNumberChange = (twilioPhoneNumber: string) =>
  //   onGeneralSettingsChange({
  //     ...generalSettings,
  //     twilioPhoneNumber,
  //   })






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
        label="Twilio Enabled"
        initialValue={generalSettings.isTwilioEnabled ?? false}
        onCheckChange={handleTwilioChange}
        moreInfoContent="Toggle to Enable Twilio"
      />
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
        label="Custom Input Enabled on bot start"
        initialValue={generalSettings.isCustomInputEnabled ?? false}
        onCheckChange={handleCustomInputChange}
        moreInfoContent="Toggle for Custom Input"
      />






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
