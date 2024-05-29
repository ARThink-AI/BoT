// src/App.js
import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
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


export const AnalyticChart = ({ data, multipleSelect }: any) => {

  console.log("dddddddddddd", data)
  function getTotalCounts(multipleSelect: any) {
    const contentTotals: any = {};
    if (multipleSelect) {
      multipleSelect.forEach((item: any) => {
        const contents = item.content
          .split(',')
          .map((content: any) => content.trim());

        contents.forEach((content: any) => {
          if (!contentTotals[content]) {
            contentTotals[content] = 0;
          }
          contentTotals[content] += item.total;
        });
      });
    }




    // Convert object to array of objects with content and total
    const totalCountsArray = Object.keys(contentTotals).map((content) => ({
      content: content,
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
        labels: data['date input'].blocks.map((block, index) => `Block ${index + 1}`),
        datasets: [
          {
            label: 'Date Input',
            data: data['date input'].blocks.map(block => block.total),
            borderColor: 'rgba(75,192,192,1)',
            fill: false
          }
        ]
      };
      charts.push(<div key="dateInputChart"><h2>Date/Time Input: Line Chart</h2><Line data={dateInputData} /></div>);
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
      charts.push(<div key="multiSelectChart"><h2>Multiple Select: Bar Chart</h2><Bar data={multiSelectData} /></div>);
    }
    // Text Input: Bar Chart
    if (data['text input']) {
      const textInputData = {
        labels: data['text input'].blocks.map(block => block.blockId),
        datasets: [
          {
            label: 'Text Input',
            data: data['text input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(75,192,192,0.6)'
          }
        ]
      };
      charts.push(<div key="textInputChart"><h2>Text Input: Bar Chart</h2><Bar data={textInputData} /></div>);
    }
    // Email Input: Bar Chart
    if (data['email input']) {
      const emailInputData = {
        labels: data['email input'].blocks.map(block => block.blockId),
        datasets: [
          {
            label: 'Email Input',
            data: data['email input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(75,192,192,0.6)'
          }
        ]
      };
      charts.push(<div key="emailInputChart"><h2>Email Input</h2><Bar data={emailInputData} /></div>);
    }


    // Checkbox: Stacked Bar Chart (Choice Input)
    if (data['choice input']) {
      const choiceInputData = {
        labels: data['choice input'].blocks.map(block => block.blockId),
        datasets: [
          {
            label: 'Choice Input',
            data: data['choice input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(153,102,255,0.6)'
          }
        ]
      };
      charts.push(<div key="choiceInputChart"><h2>Checkbox: Stacked Bar Chart</h2><Bar data={choiceInputData} /></div>);
    }

    // Dropdown: Pie Chart (Choice Input)
    if (data['choice input']) {
      const dropdownInputData = {
        labels: data['choice input'].blocks.map(block => block.blockId),
        datasets: [
          {
            data: data['choice input'].blocks.map(block => block.total),
            backgroundColor: [
              'rgba(255,99,132,0.6)',
              'rgba(54,162,235,0.6)',
              'rgba(255,206,86,0.6)',
              'rgba(75,192,192,0.6)'
            ]
          }
        ]
      };
      charts.push(<div key="dropdownInputChart"><h2>Dropdown: Pie Chart</h2><Pie data={dropdownInputData} /></div>);
    }

    // Numeric Input: Histogram
    if (data['number input']) {
      const numberInputData = {
        labels: data['number input'].blocks.map((block, index) => `Block ${index + 1}`),
        datasets: [
          {
            label: 'Number Input',
            data: data['number input'].blocks.map(block => block.total),
            backgroundColor: 'rgba(255,159,64,0.6)'
          }
        ]
      };
      charts.push(<div key="numberInputChart"><h2>Numeric Input: Histogram</h2><Bar data={numberInputData} /></div>);
    }

    return charts;
  };
  return (

    <div style={{ display: 'flex', flexWrap: 'wrap', position: 'absolute', bottom: '10px' }}>
      {renderCharts()}
    </div>

  );
};


