import { ExecutableWebhook } from '@typebot.io/schemas'
import { createUniqueId } from 'solid-js'
// import { useSocket } from "@/../../apps/viewer/src/components/SocketContext";
export const executeWebhook = async (
  webhookToExecute: ExecutableWebhook ,
    socket : any ,
  onMessageStream : any 
): Promise<string> => {
  const { url, method, body, headers } = webhookToExecute
  try {
    console.log("sockett", socket.id );
    let txt = "";
    if ( url.includes("prediction") ) {
      console.log("bodyyy", JSON.stringify({...body, socketIOClientId : socket.id }) );
      const id = createUniqueId();
      console.log("id",id);
      socket.on("token" , (text) => {
        console.log("texttt",text);
        // txt += " " + text;
        txt += text;
        onMessageStream({ id , message : txt })
      } )
      const response = await fetch(url, {
        method,
        body: method !== 'GET' && body ? JSON.stringify({...body, socketIOClientId : socket.id }) : undefined,
        headers,
      })
      const statusCode = response.status
      const data = await response.json()
      socket.off("token");
      return JSON.stringify({ statusCode, data })
    } else {
      const response = await fetch(url, {
        method,
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
        headers,
      })
      const statusCode = response.status
      const data = await response.json()
      return JSON.stringify({ statusCode, data })
    }
    

  } catch (error) {
    console.error(error)
    return JSON.stringify({
      statusCode: 500,
      data: 'An error occured while executing the webhook on the client',
    })
  }
}

// export const executeWebhook = (
//   webhookToExecute: ExecutableWebhook ,
//   socket : any ,
//   onMessageStream : any 
// ): Promise<string> => {
//   const { url, method, body, headers } = webhookToExecute;
//   // console.log("aaaaa", useSocket() );
//   console.log("fetch called with params socket" ,socket);
//   console.log("fetch called with params webhooktoexecute", webhookToExecute );
//   console.log("fetch called with params onMessageStream", onMessageStream );
//   // const { socket } = useSocket();
//   // console.log("socket instance for flowise", socket );
//   return fetch(url, {
//     method,
//     body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
//     headers,
//   })
//     .then((response) => {
//       console.log("fetch finished");
//       const statusCode = response.status;

//       // Check if the response is a streaming response
//       if (response.body && typeof response.body.getReader === 'function') {
//         console.log("streaming response");

//         const reader = response.body.getReader();
//         let result = '';

//         // Consume the stream using .read() and recursion
//         const readChunk = () =>
//           reader.read().then(({ done, value }) => {
//             if (done) {
//               return JSON.stringify({ statusCode, data: result });
//             }

//             // Process the chunk of data (replace this with your own logic)
//             result += new TextDecoder().decode(value);
//             console.log("result", result);

//             // Continue reading the next chunk
//             return readChunk();
//           });

//         return readChunk();
//       } else {
//         console.log("not streaming response");
//         // If not a streaming response, read the entire body
//         return response.json().then((data) => JSON.stringify({ statusCode, data }));
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       return JSON.stringify({
//         statusCode: 500,
//         data: 'An error occurred while executing the webhook on the client',
//       });
//     });
// };



