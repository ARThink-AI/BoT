import { Standard } from '@typebot.io/nextjs'
import { useRouter } from 'next/router'
import { SEO } from './Seo'
import { Typebot } from '@typebot.io/schemas/features/typebot/typebot'
import { BackgroundType } from '@typebot.io/schemas/features/typebot/theme/enums'
import { io } from "socket.io-client";
import { useEffect , useState } from "react";
import {  env } from "@typebot.io/env";
// import { SocketProvider } from "./SocketContext";
// import { SocketProvider  } from "@typebot.io/react";
export type TypebotV3PageProps = {
  url: string
  name: string
  publicId: string | null
  isHideQueryParamsEnabled: boolean | null
  background: Typebot['theme']['general']['background']
  metadata: Typebot['settings']['metadata']
}

export const TypebotPageV3 = ({
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
}: TypebotV3PageProps) => {
  const { asPath, push } = useRouter()
  const [ socketInstance , setSocketInstance ] = useState(null); 
  useEffect(() => {
    // Establish the socket.io connection when the component mounts
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
    // console.log("env variable", env.NEXT_PUBLIC_FLOWISE_SOCKET_URL[0] );
    const socketInstance = io(env.NEXT_PUBLIC_FLOWISE_SOCKET_URL[0] ,{
      reconnection: true, // Enable reconnection
      reconnectionAttempts: Infinity, // Retry indefinitely
      reconnectionDelay: 1000, // Initial delay (in ms) before the first reconnection attempt
      reconnectionDelayMax: 5000, // Maximum delay (in ms) between reconnection attempts
    } );
    // console.log('Socket connection established');
   socketInstance.on("connect", () => {
    console.log("flowise socket connected",socketInstance.id);
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
    setSocketInstance(socketInstance);
    // localStorage.setItem("flowise_socket_id", JSON.stringify(socketInstance.id) );
    // localStorage.setItem("flowise_socket", JSON.stringify(socketInstance) );
   } ) 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // setSocket(socketInstance);

    return () => {
      // Clean up the socket connection when the component unmounts
      socketInstance.disconnect();
      console.log('Socket connection closed');
    };
  }, []); 

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes('?')
    if (!hasQueryParams || !(isHideQueryParamsEnabled ?? true)) return
    push(asPath.split('?')[0], undefined, { shallow: true })
  }

  return (
    // <SocketProvider socket={socketInstance}>
    <div
      style={{
        height: '100vh',
        // Set background color to avoid SSR flash
        backgroundColor:
          background?.type === BackgroundType.COLOR
            ? background?.content
            : background?.type === BackgroundType.NONE
            ? undefined
            : '#fff',
      }}
    >
      <SEO url={url} typebotName={name} metadata={metadata} />
      <Standard typebot={publicId} onInit={clearQueryParamsIfNecessary}  socket={socketInstance} />
    </div>
    //  </SocketProvider>
  )
}
