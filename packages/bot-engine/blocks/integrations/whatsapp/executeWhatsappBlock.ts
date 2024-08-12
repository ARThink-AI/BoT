import {
  WhatsappBlock,
  SessionState,
  ReplyLog,
  WebhookResponse
} from "@typebot.io/schemas";
import { byId } from '@typebot.io/lib'

import got, { HTTPError } from "got";
import { ExecuteIntegrationResponse } from '../../../types'
import prisma from '@typebot.io/lib/prisma'
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import { resumeWhatsappExecution } from "./resumeWhatsappBlock";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function fillText(template, variables) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return template.replace(/{{(\d+)}}/g, (match, number) => {
    return variables[number - 1];
  });
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function containsBraces(str) {
  return /{{.*?}}/.test(str);
}

export const executeWhatsappBlock = async (
  state: SessionState,
  block: WhatsappBlock
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
): Promise<ExecuteIntegrationResponse> => {
  const { typebot } = state.typebotsQueue[0];

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: block.options.credentialsId
    },
  });

  const data = (await decrypt(
    // @ts-ignore
    credentials.data,
    // @ts-ignore
    credentials.iv
  )) as { systemAccessToken: string };
  console.log("data decrypted", data);
  if (block.options.task == "Initiate Message") {
    let variableRegex = /{{(.*?)}}/g;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let variables = block.options?.to?.match(variableRegex);
    if (variables) {
      for (let variable of variables) {
        let variableName = variable.slice(2, -2);
        let typebotVariable = typebot.variables.find((variable) => variable.name === variableName);
        if (typebotVariable) {
          let variableValue = typebotVariable.value;
          console.log("variableValue", variableValue);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          block.options.to = block.options?.to?.replace(variable, variableValue);
        }
      }
    }
    const { response: webhookResponse, logs: executeWebhookLogs } =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await initiateMessage(data, block);
    return resumeWhatsappExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  }
}

export const initiateMessage = async (data: { systemAccessToken: string }, block: WhatsappBlock): Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    console.log("opttttttttttt", JSON.stringify(block.options));
    const payload = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let components = block.options.components;
    for (let i = 0; i < components.length; i++) {
      if (components[i].type == "BODY" && containsBraces(components[i].text)) {
        let obj = { type: "BODY", parameters: [] };

        for (let j = 0; j < components[i].variables.length; j++) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          obj.parameters.push({ type: "text", text: components[i].variables[j] })
        }
        payload.push(obj);
      }
      if (components[i].type == "HEADER" && !Boolean(components[i]?.image) && containsBraces(components[i].text)) {
        let obj = { type: "HEADER", parameters: [] };

        for (let j = 0; j < components[i].variables.length; j++) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          obj.parameters.push({ type: "text", text: components[i].variables[j] })
        }
        payload.push(obj);
      }
      if (components[i].type == "HEADER" && Boolean(components[i]?.image)) {
        let obj = { type: "HEADER", parameters: [{ type: "image", image: { link: components[i].variables[0] } }] };
        payload.push(obj);
      }

    }
    // console.log("intiaite message payload", JSON.stringify(payload));
    let lastPayload;
    if (payload.length > 0) {
      lastPayload = {
        messaging_product: "whatsapp",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        to: block.options?.to,
        type: "template",
        template: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          name: block.options?.selectedTemplateName,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          language: { code: block.options?.selectedTemplateLang },
          components: payload

        }
      }


    } else {
      lastPayload = {
        messaging_product: "whatsapp",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        to: block.options?.to,
        type: "template",
        template: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          name: block.options?.selectedTemplateName,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          language: { code: block.options?.selectedTemplateLang }

        }
      }
    }
    // console.log("last payload", JSON.stringify(lastPayload));
    // const {
    //   data: { expires_at, scopes, app_id, application },
    // } = (await got(
    //   `https://graph.facebook.com/v17.0/debug_token?input_token=${data?.systemAccessToken}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${data.systemAccessToken}`,
    //     },
    //   }
    // ).json()) as {
    //   data: {
    //     app_id: string
    //     application: string
    //     expires_at: number
    //     scopes: string[]
    //   }
    // }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const messageResponse = await got.post(`https://graph.facebook.com/v20.0/${block?.options?.phoneNumberId}/messages`, {
      json: lastPayload,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.systemAccessToken}`
      }
    });
    console.log("mesage responseeeettt", JSON.parse(messageResponse?.body)?.messages[0].message_status);
    return {
      response: {

        statusCode: 200,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data: { status: JSON.parse(messageResponse?.body)?.messages[0].message_status },
      },
      logs,
    }
  } catch (error) {

    if (error instanceof HTTPError) {
      console.log("error response", error.response)
      const response = {
        statusCode: error.response.statusCode,
        data: "",
      }
      logs.push({
        status: 'error',
        description: `Webhook returned an error.`,
        details: {
          statusCode: error.response.statusCode,
          response,
        },
      })
      return { response, logs }
    }
    const response = {
      statusCode: 500,
      data: { message: `Error from Typebot server: ${error}` },
    }
    console.error(error)
    logs.push({
      status: 'error',
      description: `Webhook failed to execute.`,
      details: null,
    })
    return { response, logs }
  }
}