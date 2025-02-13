import {
  TrudeskBlock ,
  SessionState ,
  ReplyLog ,
  WebhookResponse
} from "@typebot.io/schemas";
import { byId  } from '@typebot.io/lib'

import got , { HTTPError }  from "got";
import { ExecuteIntegrationResponse } from '../../../types'
import prisma from '@typebot.io/lib/prisma'
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";  

import { resumeTrudeskExecution } from "./resumeTrudeskBlock";



export const executeTrudeskBlock = async (
  state: SessionState,
  block: TrudeskBlock
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
  )) as { userName: string, password: string, baseUrl: string };
  console.log("data decrypted",data);
  if ( block.options.task == "Create Customer" ) {

      let name ;  
      let  phone ;
      let  email ; 
      let  address ;
      if ( block.options?.variableNameId ) {
        const existingTicketIdVariable = typebot.variables.find(byId(block.options.variableNameId));
        name  = existingTicketIdVariable?.value;
      }
      if ( block.options?.variableEmailId ) {
        const existingTicketIdVariable = typebot.variables.find(byId(block.options.variableEmailId));
        email  = existingTicketIdVariable?.value;
      }
      if ( block.options?.variablePhoneId ) {
        const existingTicketIdVariable = typebot.variables.find(byId(block.options.variablePhoneId));
        phone   = existingTicketIdVariable?.value;
      }
      if ( block.options?.variableAddressId ) {
        const existingTicketIdVariable = typebot.variables.find(byId(block.options.variableAddressId));
        address   = existingTicketIdVariable?.value;
      }
      const { response: webhookResponse, logs: executeWebhookLogs } =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await createCustomer(data,block, name , email, phone,  address );
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })


  } else  if ( block.options.task == "Create Ticket" ) {
    let customerId;
    
    let variableRegex = /{{(.*?)}}/g;
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let variables  = block.options?.subject?.match(variableRegex);
    if ( variables  ) {
     for ( let variable  of variables ) {
      let variableName = variable.slice(2, -2);
      let typebotVariable = typebot.variables.find( (variable) => variable.name === variableName );
      if ( typebotVariable  ) {
          let variableValue = typebotVariable.value;
          console.log("variableValue",variableValue);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    block.options.subject =  block.options?.subject?.replace(variable, variableValue );
      } 
     }
    }
    if ( block.options.variableId2 ) {
      const existingCustomerIdVariable = typebot.variables.find(byId(block.options.variableId2));
      customerId = existingCustomerIdVariable?.value;
    }

    const { response: webhookResponse, logs: executeWebhookLogs } =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await createTicket(data,block , customerId );
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  } else if ( block.options.task == "Create Note" ) {
    let ticketId;
    let note;
    
    if ( block.options.variableId1 ) {
      const existingTicketIdVariable = typebot.variables.find(byId(block.options.variableId1));
      ticketId = existingTicketIdVariable?.value;
    }
    if ( block.options.variableId2 ) {
      const existingNotetVariable = typebot.variables.find(byId(block.options.variableId2));
      note = existingNotetVariable?.value;
    }
    const { response: webhookResponse, logs: executeWebhookLogs } =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await createNote(data,block ,ticketId , note);
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  } else if ( block.options.task == "Update Assignee and Group" ) {
    let ticketId;
    let ticketUID;
    if ( block.options?.variableId ) {
      const existingTicketIdVariable = typebot.variables.find(byId(block.options?.variableId));
      ticketId = existingTicketIdVariable?.value;
    }
    if ( block.options?.variableId1 ) {
      const existingUidVariable = typebot.variables.find(byId(block.options.variableId1));
      ticketUID = existingUidVariable?.value;
    }
    const { response: webhookResponse, logs: executeWebhookLogs } =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateAssigneeAndGroup(data,block ,ticketId , ticketUID);
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  } else if ( block.options.task == "Update Priority" ) {
    let ticketId;
    let ticketUID;
    if ( block.options?.variableId ) {
      const existingTicketIdVariable = typebot.variables.find(byId(block.options?.variableId));
      ticketId = existingTicketIdVariable?.value;
    }
    if ( block.options?.variableId1 ) {
      const existingUidVariable = typebot.variables.find(byId(block.options.variableId1));
      ticketUID = existingUidVariable?.value;
    }
    const { response: webhookResponse, logs: executeWebhookLogs } =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updatePriority(data,block ,ticketId , ticketUID);
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  } else if ( block.options.task == "Update Status" ) {
    let ticketId;
    let ticketUID;
    if ( block.options?.variableId ) {
      const existingTicketIdVariable = typebot.variables.find(byId(block.options?.variableId));
      ticketId = existingTicketIdVariable?.value;
    }
    if ( block.options?.variableId1 ) {
      const existingUidVariable = typebot.variables.find(byId(block.options.variableId1));
      ticketUID = existingUidVariable?.value;
    }
    console.log("ticket uidddd", ticketUID );
    const { response: webhookResponse, logs: executeWebhookLogs } =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateStatus(data,block ,ticketId , ticketUID);
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })
  } else if ( block.options.task == "Update Tags" ) {
    let ticketId;
    let ticketUID;
    if ( block.options?.variableId ) {
      const existingTicketIdVariable = typebot.variables.find(byId(block.options?.variableId));
      ticketId = existingTicketIdVariable?.value;
    }
    if ( block.options?.variableId1 ) {
      const existingUidVariable = typebot.variables.find(byId(block.options.variableId1));
      ticketUID = existingUidVariable?.value;
    }
    const { response: webhookResponse, logs: executeWebhookLogs } =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateTags(data,block ,ticketId , ticketUID);
    return resumeTrudeskExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    })

  }

  

  
}

export const updateTags  = async ( data :  { userName: string, password: string, baseUrl: string } , block : TrudeskBlock , ticketId : string , ticketUID : string    ):Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    console.log("parametersss", ticketId , ticketUID )
    if ( !ticketId || !ticketUID  ) {
      throw new Error("Parameters missing")
    }
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    const getTicketResponse = await got.get(`${data.baseUrl}/api/v1/tickets/${ticketUID}`, {
     headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();
    console.log("patch values json update tags",  {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      group:  getTicketResponse?.ticket?.group?._id ,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      status : getTicketResponse?.ticket?.status?._id ,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      priority: getTicketResponse?.ticket?.priority?._id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      type: getTicketResponse?.ticket?.type?._id ,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      assignee: getTicketResponse?.ticket?.assignee?._id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      subject:  getTicketResponse?.ticket?.subject ,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      tags : block.options.tags ? block.options?.tags?.reduce( (curr,  val) =>  {
        curr.push(val.id)
        return curr
    } ,[]) : []

    } );
     await got.put(`${data.baseUrl}/api/v1/tickets/${ticketId}`, {
      json: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        group: getTicketResponse?.ticket?.group?._id ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        status : getTicketResponse?.ticket?.status?._id  ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        priority: getTicketResponse?.ticket?.priority?._id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        type: getTicketResponse?.ticket?.type?._id ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        assignee: getTicketResponse?.ticket?.assignee?._id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        subject:  getTicketResponse?.ticket?.subject ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        tags : block.options.tags ? block.options?.tags?.reduce( (curr,  val) =>  {
          curr.push(val.id)
          return curr
      } ,[]) : []

      }, 
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();

    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200
        
      },
    })
    return {
      response: {
        statusCode: 200,
        
      },
      logs,
    }

  } catch(error) {
console.log("error",error);
    if (error instanceof HTTPError) {

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

export const updateStatus  = async ( data :  { userName: string, password: string, baseUrl: string } , block : TrudeskBlock , ticketId : string , ticketUID : string    ):Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    console.log("parametersss", ticketId , ticketUID )
    if ( !ticketId || !ticketUID  ) {
      throw new Error("Parameters missing")
    }
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    const getTicketResponse = await got.get(`${data.baseUrl}/api/v1/tickets/${ticketUID}`, {
     headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();
    
     await got.put(`${data.baseUrl}/api/v1/tickets/${ticketId}`, {
      json: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        group: getTicketResponse?.ticket?.group?._id ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        status : block.options?.status  ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        priority: getTicketResponse?.ticket?.priority?._id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        type: getTicketResponse?.ticket?.type?._id ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        assignee: getTicketResponse?.ticket?.assignee?._id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        subject:  getTicketResponse?.ticket?.subject

      }, 
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();

    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200
        
      },
    })
    return {
      response: {
        statusCode: 200,
        
      },
      logs,
    }

  } catch(error) {
console.log("error",error);
    if (error instanceof HTTPError) {

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

export const updatePriority  = async ( data :  { userName: string, password: string, baseUrl: string } , block : TrudeskBlock , ticketId : string , ticketUID : string    ):Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    console.log("parametersss", ticketId , ticketUID )
    if ( !ticketId || !ticketUID  ) {
      throw new Error("Parameters missing")
    }
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    const getTicketResponse = await got.get(`${data.baseUrl}/api/v1/tickets/${ticketUID}`, {
     headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();
    
     await got.put(`${data.baseUrl}/api/v1/tickets/${ticketId}`, {
      json: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        group: block.options?.group ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        status : getTicketResponse?.ticket?.status._id  ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        priority: block.options?.priority,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        type: block.options?.type ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        assignee: block.options?.assignee,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        subject:  getTicketResponse?.ticket?.subject 

      }, 
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();

    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200
        
      },
    })
    return {
      response: {
        statusCode: 200,
        
      },
      logs,
    }

  } catch(error) {
console.log("error",error);
    if (error instanceof HTTPError) {

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




export const updateAssigneeAndGroup = async ( data :  { userName: string, password: string, baseUrl: string } , block : TrudeskBlock , ticketId : string , ticketUID : string    ):Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    console.log("parametersss", ticketId , ticketUID )
    if ( !ticketId || !ticketUID  ) {
      throw new Error("Parameters missing")
    }
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    const getTicketResponse = await got.get(`${data.baseUrl}/api/v1/tickets/${ticketUID}`, {
     headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();
    
     await got.put(`${data.baseUrl}/api/v1/tickets/${ticketId}`, {
      json: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        group: block.options?.group ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        status : getTicketResponse?.ticket?.status._id  ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        priority: getTicketResponse?.ticket?.priority?._id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        type: getTicketResponse?.ticket?.type?._id ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        assignee: block.options?.assignee,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        subject:  getTicketResponse?.ticket?.subject 

      }, 
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();

    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200
        
      },
    })
    return {
      response: {
        statusCode: 200,
        
      },
      logs,
    }

  } catch(error) {
console.log("error",error);
    if (error instanceof HTTPError) {

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
export const createNote  = async (data :  { userName: string, password: string, baseUrl: string } ,block : TrudeskBlock , ticketId : string , note:  string  ) :Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = []
  try {
    if ( !ticketId || !note  ) {
      throw new Error("Parameters missing")

    }
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    const createNoteResponse = await got.post(`${data.baseUrl}/api/v1/tickets/addnote`, {
      json: {
        ticketid : ticketId,
        note : note 

      }, 
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();

    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200
        
      },
    })
    return {
      response: {
        statusCode: 200,
        
      },
      logs,
    }

  } catch(error) {
    console.log("error",error);
    if (error instanceof HTTPError) {

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

export const createCustomer = async ( data :  { userName: string, password: string, baseUrl: string } ,block : TrudeskBlock, name : string , email : string , phone:  string , address : string  ) :Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = [];
  try {
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    console.log("login data",loginData);
    let payloadData = {};
    if ( name && name.trim() != "" ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
     payloadData.name = name;
    }
    if ( email && email.trim() != "" ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        payloadData.email = email;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ( phone && phone.trim() != "" ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      payloadData.phoneNumber = phone;
    }
   console.log("final payload data", JSON.stringify( payloadData ) );
    const createCustomerResponse = await got.post(`${data.baseUrl}/api/v3/users/create`, {
      json : {...payloadData},
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    } ).json();
    
    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        response: { id :  createCustomerResponse?.account?._id },
      },
    })

    return {
      response: {

        statusCode: 200,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        data: { id :  createCustomerResponse?.account?._id },
      },
      logs,
    }

  } catch(error) {
    
    if (error instanceof HTTPError) {

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

export const createTicket = async (data :  { userName: string, password: string, baseUrl: string } ,block : TrudeskBlock , customerId : (string | null)  ) :Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = []
  try {
    const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
      json: {
        username: data?.userName,
        password: data?.password,

      }
    }).json();
    const loginData = loginResponse as {
      accessToken: string,
      success: boolean
    }
    console.log("login data",loginData);
    
    const createTicketResponse = await got.post(`${data.baseUrl}/api/v1/tickets/create`, {
      json: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        subject : block.options?.subject ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        group: block.options?.group,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        type: block.options?.type,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        priority: block.options.priority,
        issue: "Ticket created",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        owner: customerId ? customerId : block.options.assignee ,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        assignee: block.options.assignee,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        tags : block.options?.tags ? block.options?.tags.reduce((accumulator, currentValue) => {
          accumulator.push(currentValue.id);
          return accumulator;
        }, []) : []
       

      },
      headers : {
        accessToken: `${loginData.accessToken}`
      }
    }).json();
    console.log("create ticket response", JSON.stringify(createTicketResponse) );
    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: 200,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        response: { id : createTicketResponse.ticket._id , uid:  createTicketResponse.ticket.uid , accessToken : loginData.accessToken  },
      },
    })
    return {
      response: {

        statusCode: 200,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
        data: { id : createTicketResponse.ticket._id , uid:  createTicketResponse.ticket.uid , accessToken : loginData.accessToken },
      },
      logs,
    }

  } catch(error) {
    console.log("error",error);
    if (error instanceof HTTPError) {

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: string): { data: any; isJson: boolean } => {
  try {
    return { data: JSON.parse(json), isJson: true }
  } catch (err) {
    return { data: json, isJson: false }
  }
}