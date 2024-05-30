
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);



{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore */ }
export const AnalyticChart = ({ data, multipleSelect, rating }) => {
  console.log("textttttttttttttttt", rating)
  console.log("dddddddddddd", data)
  const ratingData = rating
  {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore */ }
  function calculateNPS(ratingData) {
    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    // Loop through the ratingData to count promoters, passives, and detractors
    if (ratingData) {
      for (let i = 0; i < ratingData.length; i++) {
        const rating = parseInt(ratingData[i].rating);

        if (rating >= 9 && rating <= 10) {
          promoters += ratingData[i].total;
        } else if (rating >= 7 && rating <= 8) {
          passives += ratingData[i].total;
        } else {
          detractors += ratingData[i].total;
        }
      }
    }


    // Calculate NPS
    const totalResponses = promoters + passives + detractors;
    const nps = ((promoters - detractors) / totalResponses) * 100;

    return nps;
  }

  const nps = calculateNPS(ratingData)
  console.log("npsssss",)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
  function getTotalCounts(multipleSelect) {
    const contentTotals = {};
    if (multipleSelect) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      multipleSelect.forEach((item) => {
        const contents = item.content
          .split(',')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore 
          .map((content) => content.trim());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        contents.forEach((content) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore 
          if (!contentTotals[content]) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            contentTotals[content] = 0;
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore 
          contentTotals[content] += item.total;
        });
      });
    }




    // Convert object to array of objects with content and total
    const totalCountsArray = Object.keys(contentTotals).map((content) => ({
      content: content,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      total: contentTotals[content]
    }));

    return totalCountsArray;
  }
  const dataMultipleSelectWise = getTotalCounts(multipleSelect)
  // console.log("mmmmmmmmmmmmm", dataMultipleSelectWise)
  // console.log("checkkkkkkkkkkkkkkkkkkkkkkkkkkk",);
  const renderCharts = () => {
    const charts = [];

    // Date/Time Input: Line Chart
    if (data['date input']) {
      const dateInputData = {
        // labels: data['date input'].blocks.map((block, index) => `Block ${index + 1}`),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['date input'].blocks.map((block, index) => `Date Input ${index + 1}`),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        datasets: [
          {
            label: 'Date Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 

            data: data['date input'].blocks.map(block => block.total),
            borderColor: 'rgba(75,192,192,1)',
            fill: false
          }
        ]
      };
      charts.push(<div key="dateInputChart"><h2>Date/Time Input</h2><Line data={dateInputData} /></div>);
    }
    if (multipleSelect && data['choice input']) {
      const multiSelectData = {
        labels: dataMultipleSelectWise.map(select => select.content),
        datasets: [
          {
            label: 'Multiselect',
            data: dataMultipleSelectWise.map(select => select.total),
            backgroundColor: 'rgba(75,192,192,0.6)'
          }
        ]
      };
      charts.push(<div key="multiSelectChart"><h2>Multiple Select</h2><Bar data={multiSelectData} /></div>);
    }
    // Text Input: Bar Chart
    if (data['text input']) {
      // const textInputData = {
      //   // labels: data['text input'].blocks.map(block => block.blockId),
      //   labels: data['text input'].blocks.map((block, index) => `Text Input ${index + 1}`),
      //   datasets: [
      //     {
      //       label: 'Text Input',
      //       data: data['text input'].blocks.map(block => block.total),
      //       backgroundColor: 'rgba(75,192,192,0.6)'
      //     }
      //   ]
      // };
      // charts.push(<div key="textInputChart"><h2>Text Input</h2><Bar data={textInputData} /></div>);
    }
    // Email Input: Bar Chart
    if (data['email input']) {
      const emailInputData = {
        // labels: data['email input'].blocks.map(block => block.blockId),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['email input'].blocks.map((block, index) => `Email Input ${index + 1}`),
        datasets: [
          {
            label: 'Email Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: data['email input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(75,192,192,0.6)'
          }
        ]
      };
      charts.push(<div key="emailInputChart"><h2>Email Input</h2><Bar data={emailInputData} /></div>);
    }


    // Checkbox: Stacked Bar Chart (Choice Input)
    // if (data['choice input']) {
    //   const choiceInputData = {
    //     // labels: data['choice input'].blocks.map(block => block.blockId),
    //     labels: data['number input'].blocks.map((block, index) => `Number Input ${index + 1}`),
    //     datasets: [
    //       {
    //         label: 'Choice Input',
    //         data: data['choice input'].blocks.map(block => block.total),
    //         backgroundColor: 'rgba(153,102,255,0.6)'
    //       }
    //     ]
    //   };
    //   charts.push(<div key="choiceInputChart"><h2>Input Choice</h2><Bar data={choiceInputData} /></div>);
    // }

    // Dropdown: Pie Chart (Choice Input)
    // if (data['choice input']) {
    //   const dropdownInputData = {
    //     // labels: data['choice input'].blocks.map(block => block.blockId),
    //     labels: data['choice input'].blocks.map((block, index) => `Choice Input ${index + 1}`),
    //     datasets: [
    //       {
    //         data: data['choice input'].blocks.map(block => block.total),
    //         backgroundColor: [
    //           'rgba(255,99,132,0.6)',
    //           'rgba(54,162,235,0.6)',
    //           'rgba(255,206,86,0.6)',
    //           'rgba(75,192,192,0.6)'
    //         ]
    //       }
    //     ]
    //   };
    //   charts.push(<div key="dropdownInputChart"><h2>Dropdown</h2><Pie data={dropdownInputData} /></div>);
    // }

    // Numeric Input: Histogram
    if (data['number input']) {
      const numberInputData = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['number input'].blocks.map((block, index) => `Number Input ${index + 1}`),
        datasets: [
          {
            label: 'Number Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: data['number input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="numberInputChart"><h2>Number Input</h2><Bar data={numberInputData} /></div>);
    }

    // Phone number input
    if (data['phone number input']) {
      const phoneNumberInputData = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['phone number input'].blocks.map((block, index) => `Phone Number ${index + 1}`),
        datasets: [
          {
            label: 'Number Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: data['phone number input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="phonenumberInputChart"><h2>Phone Number Input</h2><Bar data={phoneNumberInputData} /></div>);
    }

    // Url input
    if (data['url input']) {
      const phoneNumberInputData = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['phone number input'].blocks.map((block, index) => `Url Input ${index + 1}`),
        datasets: [
          {
            label: 'Url Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: data['phone number input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="urlInputChart"><h2>Url Input</h2><Bar data={phoneNumberInputData} /></div>);
    }
    // Card input
    if (data['card input']) {
      const phoneNumberInputData = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        labels: data['card input'].blocks.map((block, index) => `Card Input ${index + 1}`),
        datasets: [
          {
            label: 'Card Input',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: data['card input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="cardInputChart"><h2>Card Input</h2><Bar data={phoneNumberInputData} /></div>);
    }

    // Rating
    if (data['rating input']) {
      const phoneNumberInputData = {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        datasets: [
          {
            label: `NPS ${nps.toFixed(2)}%`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore 
            data: rating.map(rating => parseInt(rating.rating)),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="ratingInputChart"><Bar data={phoneNumberInputData} /></div>);
    }

    return charts;
  };
  return (

    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
      {renderCharts()}
    </div>

  );
};


