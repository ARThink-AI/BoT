// TimerComponent.tsx
import { createSignal, onCleanup, onMount } from 'solid-js';

const TimerComponent = (props) => {
  const [timerCount, setTimerCount] = createSignal(60);
  let timerInterval: number;

  const startTimer = () => {
    timerInterval = setInterval(() => {
      setTimerCount((prevCount) => {
        const newCount = prevCount - 1;
        if (newCount <= 0) {
          stopTimer();
          props.stopRecordingUserVoice(); // Call your function when the timer hits zero
        }
        return newCount;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
  };

  onMount(() => {
    startTimer();
  });

  
  const timerContainerStyle = {
    position: 'relative',
    // width: '100px', // Adjust the width and height as needed
    // height: '100px',
    width : "20px",
    height : "20px",
    "margin-bottom" : "10px"

  };

  const timerStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid #3498db', // Set border color
    "border-radius" : "10px",
    animation: 'timerAnimation linear infinite',
  };

  const displayStyle = {
    
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '10px !important',
    
    color: '#3498db', // Set text color
  };
  onCleanup(() => {
    stopTimer();
  });
  // return (
  //   <div>
  //     {/* Your timer component UI here */}
  //     <span class="display">{timerCount()}</span>
  //   </div>
  // );
  return (
    <div style={timerContainerStyle}>
      <div style={timerStyle} />
      <span style={displayStyle}>{timerCount()}</span>
    </div>
  );

};

export default TimerComponent;