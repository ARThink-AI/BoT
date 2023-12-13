// export const BarCodeInput = (props) => {
//   console.log(JSON.stringify(props));
//   return (
//     <div style={{ cursor : "pointer" }} onClick={ () => {
//       console.log("Bar Code component clicked");
//       props.onSubmit("scannned");
//     }  } >
//       Bar Code Component { props?.block?.options?.mode }
//     </div>
//   )
// }
import { createSignal, createEffect, onCleanup } from "solid-js";
import { env } from "@typebot.io/env";
export const BarCodeInput = (props) => {
  console.log("bar code input props", JSON.stringify(props) );
  const [mediaStream, setMediaStream] = createSignal(null);
  const [ uploaded , setUploaded ] = createSignal(false);
  const [imageDataUrl, setImageDataUrl] = createSignal(null);
  // const videoRef = createRef();
  let videoRef : HTMLVideoElement | undefined

  // Start the camera when the component mounts
  createEffect(() => {
    if ( props?.block?.options?.mode == "camera" ) {
      startCamera();
    }
    
    return () => {
      // Clean up by stopping the camera stream if the component is unmounted
      if (mediaStream()) {
        mediaStream().getTracks().forEach(track => track.stop());
      }
    };
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
      videoRef.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const takePicture = () => {
    const video = videoRef;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    setImageDataUrl(imageDataUrl);
  };

  const retakePicture = () => {
    setImageDataUrl(null);
    startCamera();
  };

  
  

  // const uploadToAzure = async () =>{
  //   console.log("upload to azure");

  // }
  
  const uploadToAzure = async () => {
    if (imageDataUrl()) {
      try {
        // Fetch the presigned URL from the server
        const response = await fetch(`${env.NEXT_PUBLIC_VIEWER_URL}/api/integrations/presignedUrl`, {
          method: "POST",
          body: JSON.stringify({
            filePath: `images/image-${Date.now()}.png`,
            fileType: "images/png",
            maxFileSize: 5
          })
        });
  
        if (!response.ok) {
          console.error("Failed to fetch presigned URL:", response.statusText);
          return;
        }
  
        const responseData = await response.json();
  
        // Extract the presigned URL from the server response
        const presignedUrl = responseData?.message?.presignedUrl;
  
        // Convert data URL to Blob
        const data = atob(imageDataUrl().split(",")[1]);
        const buffer = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          buffer[i] = data.charCodeAt(i);
        }
        const blob = new Blob([buffer], { type: "image/png" });
  
        // Make a PUT request using fetch for direct upload to Azure Blob Storage
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
            "x-ms-blob-type": "BlockBlob",
          },
          body: blob,
        });
  
        if (uploadResponse.ok) {
          console.log("File uploaded successfully!");
          setUploaded(true);
          props.onSubmit({ value : presignedUrl.split("?")[0] , label : "Uploaded" });
        } else {
          console.error("Failed to upload file:", uploadResponse.statusText);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };
  
  
  return (
    <>
    { props?.block?.options?.mode != "camera" && <div> Bar Code Component { props?.block?.options?.mode }  </div> }
    {  props?.block?.options?.mode == "camera" &&  <div>
      {mediaStream() && !imageDataUrl() && !uploaded() && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button onClick={takePicture}>Capture</button>
          </div>
        </div>
      )}

      {imageDataUrl() && !uploaded() && (
        <div>
          <img src={imageDataUrl()} alt="Captured" style={{ width: "100%", marginTop: "10px" }} />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button onClick={retakePicture}>Retake</button>
            <button onClick={uploadToAzure}>Upload</button>
          </div>
        </div>
      )}
      { uploaded() && <div> Uploaded  </div>}
    </div>
}
    </>
  );
};

