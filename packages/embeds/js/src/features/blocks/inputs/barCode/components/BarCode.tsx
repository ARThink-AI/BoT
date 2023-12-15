
import { createSignal, createEffect, onCleanup , onMount } from "solid-js";
import { env } from "@typebot.io/env";
import { isMobile } from '@/utils/isMobileSignal'
// import { BrowserMultiFormatReader } from '@zxing/library';
import { BrowserMultiFormatReader } from '@zxing/library/esm/browser/BrowserMultiFormatReader.js';

const codeReader = new BrowserMultiFormatReader();
// let barcodeListener;
export const BarCodeInput = (props) => {
  console.log("bar code input props", JSON.stringify(props) );
  const [mediaStream, setMediaStream] = createSignal(null);
  const [ uploaded , setUploaded ] = createSignal(false);
  const [imageDataUrl, setImageDataUrl] = createSignal(null);
  const [isFrontCamera, setIsFrontCamera] = createSignal(false);
  const [cameraMode, setCameraMode] = createSignal('user');
  const [hasListener, setHasListener] = createSignal(false);
  const [barcodeListener, setBarcodeListener] = createSignal(null);

  // const videoRef = createRef();
  let videoRef : HTMLVideoElement | undefined
  const  isAndroid =() => {
    return /Android/i.test(navigator.userAgent);
  }
  
  
  
  
  const startBarCodeCamera = async () => {
    try {
    
      const facingMode = cameraMode() === 'user' ? 'user' : 'environment';
      console.log("facing mode", facingMode );
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode : "environment" },
        audio : false
      });

      setMediaStream(stream);
      videoRef.srcObject = stream;

      // Start barcode scanning
      barcodeListener = codeReader.decodeFromVideoDevice(undefined, videoRef, (result, error) => {
        if (result) {
          if (mediaStream()) {
            mediaStream().getTracks().forEach(track => track.stop());
          }
          
          submitBarcode(result.getText());
         
          
        } else if (error) {
          console.error('Barcode scanning error:', error);
        }
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }
  const submitBarcode = (barcode) => {
    // Perform actions with the scanned barcode
    console.log('Scanned Barcode:', barcode);
    // ... (additional actions)

    // Example: Submitting barcode information
    props.onSubmit({ value: barcode, label: 'Scanned' });
  };
  // const startCamera = async () => {
  //   try {
  //     // const facingMode = isFrontCamera() ? "user" : "environment";
  //     const facingMode = cameraMode() === 'user' ? 'user' : 'environment';
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode  },
  //       audio : false 
  //     });
  //     setMediaStream(stream);
  //     videoRef.srcObject = stream;
  //     if (!hasListener() && props?.block?.options?.mode == "barCode" ) {
  //       console.log("entered has listener");
  //       let val  = codeReader.decodeFromVideoDevice(undefined, videoRef, (result, error) => {
  //       if (result) {
  //         console.log("entered result");
  //         if (mediaStream()) {
  //           mediaStream().getTracks().forEach(track => track.stop());
  //         }
          
  //         submitBarcode(result.getText());
        
          
  //       } else if (error) {
  //         console.error('Barcode scanning error:', error);
  //       }
  //     });
  //     console.log("valll",val);
  //     setBarcodeListener(val);
  //     setHasListener(true);
  //   }


    
  //   } catch (error) {
  //     console.error("Error accessing camera:", error);
  //   }
    
  // };
  const startCamera = async () => {
    try {
      const facingMode = cameraMode() === 'user' ? 'user' : 'environment';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      setMediaStream(stream);
      videoRef.srcObject = stream;

      if (props?.block?.options?.mode === "barCode") {
        // console.log("entered has listener", barcodeListener() );
        
        console.log("code reader",codeReader);
        codeReader.reset();
       // Start listener and update state
  const listener = codeReader.decodeFromVideoDevice(undefined, videoRef , (result, error) => {
    if (result) {
      try {
        if (mediaStream()) {
          mediaStream().getTracks().forEach(track => track.stop());
        }
      } catch(err) {
console.log("error removing mdia stream",err);
      }
      
      
      submitBarcode(result.getText());
     
      
    } else if (error) {
      console.error('Barcode scanning error:', error);
    }
  });
  // setBarcodeListener(listener);
  // setHasListener(true);

  // Wait for listener to resolve
  // await listener.promise;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const toggleCamera = () => {
    console.log("type of stream",  typeof mediaStream());
    if ( typeof mediaStream() !== 'undefined') {
      console.log("stream not undefined");
      mediaStream().getTracks().forEach(track => track.stop());
    }
    // setIsFrontCamera((prev) => !prev);
    setCameraMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    startCamera();
  };
  const toggleBarCodeCamera = () => {
    if ( typeof mediaStream() !== 'undefined') {
      mediaStream().getTracks().forEach(track => track.stop());
    }
    // if (barcodeListener && barcodeListener.subscription ) {
    //   barcodeListener.unsubscribe();
    // }
    // setIsFrontCamera((prev) => !prev);
    setCameraMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    startBarCodeCamera();
  }

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
  onCleanup(() => {
        if (mediaStream()) {
        mediaStream().getTracks().forEach(track => track.stop());
      }
      codeReader.reset();
  })
  onMount(() => {
     console.log("on mount called", JSON.stringify(props) );
    if ( props?.block?.options?.mode == "camera" ) {
      startCamera();
    } else if ( props?.block?.options?.mode == "barCode" ) {
      
      startCamera();
     
    }
    

    
  })
  
  return (
    <>
    { props?.block?.options?.mode == "qrCode" && <div> Bar Code Component { props?.block?.options?.mode }  </div> }
    {  props?.block?.options?.mode == "camera" &&  <div>
      {mediaStream() && !imageDataUrl() && !uploaded() && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
          { isMobile() && <button style={{ border : "1px solid #0042da", "border-radius":  "4px" , cursor : "pointer" , padding: "6px" , "margin-right":  "5px" , "margin-top":  "4px" , background:  "#0042da" , color : "white" }} onClick={toggleCamera}>Switch Camera</button> }
            <button style={{ border : "1px solid #0042da", "border-radius":  "4px" , cursor : "pointer" , padding: "6px" , "margin-right":  "5px" , "margin-top":  "4px" , background:  "#0042da" , color : "white" }} onClick={takePicture}>Capture</button>
          </div>
        </div>
      )}

      {imageDataUrl() && !uploaded() && (
        <div>
          <img src={imageDataUrl()} alt="Captured" style={{ width: "100%", marginTop: "10px" }} />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button style={{ border : "1px solid #0042da", "border-radius":  "4px" , cursor : "pointer" , padding: "6px" , "margin-right":  "5px" , "margin-top":  "4px" , background:  "#0042da" , color : "white" }} onClick={retakePicture}>Retake</button>
            <button  style={{ border : "1px solid #0042da", "border-radius":  "4px" , cursor : "pointer" , padding: "6px" , "margin-right":  "5px" , "margin-top":  "4px" , background:  "#0042da" , color : "white" }} onClick={uploadToAzure}>Upload</button>
          </div>
        </div>
      )}
      { uploaded() && <div> Uploaded  </div>}
    </div>
}
{ props?.block?.options?.mode == "barCode" && (
  <div>
    <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
    <div style={{ textAlign: "center", marginTop: "10px" }}>
    { isMobile() && <button style={{ border : "1px solid #0042da", "border-radius":  "4px" , cursor : "pointer" , padding: "6px" , "margin-right":  "5px" , "margin-top":  "4px" , background:  "#0042da" , color : "white" }} onClick={toggleCamera}>Switch Camera</button> }
    </div>
  </div>
) }
    </>
  );
};

