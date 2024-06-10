
import React from 'react';
import { Bar } from 'react-chartjs-2';
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
export const AnalyticChart = ({ data }) => {
  console.log("analytic chart callled", data)
  // const ratingInputData = data.filter(item => item.inputs.some(input => input.type === "rating input"));

  // const choiceInputData = data.filter(item => item.inputs.some(input => input.type === "choice input"));

  // const ratingCharts = ratingInputData.map(item => {
  //   const ratings = item.inputs[1].total[0].map(rating => parseInt(rating.rating));
  //   const total = item.inputs[1].total[0].map(rating => parseInt(rating.total));
  //   const title = item.inputs[0].content.richText[0].children[0].text;

  //   const chartData = {
  //     labels: ratings,
  //     datasets: [{
  //       label: title,
  //       data: total,
  //       backgroundColor: 'rgba(255, 159, 64, 0.6)'
  //     }]
  //   };

  //   return (
  //     <div key={item.groupId}>
  //       <h3>{title}</h3>
  //       <Bar data={chartData} />
  //     </div>
  //   );
  // });

  // const choiceCharts = choiceInputData.map(item => {
  //   const labels = item.inputs[1].items.map(choice => choice.content);
  //   const total = item.inputs[1].total[0].map(choice => parseInt(choice.total));
  //   const title = item.inputs[0].content.richText[0].children[0].text;

  //   const chartData = {
  //     labels: labels,
  //     datasets: [{
  //       label: title,
  //       data: total,
  //       backgroundColor: 'rgba(255, 159, 64, 0.6)'
  //     }]
  //   };

  //   return (
  //     <div key={item.groupId}>
  //       <h3>{title}</h3>
  //       <Bar data={chartData} />
  //     </div>
  //   );
  // });
  // const charts = [...ratingCharts, ...choiceCharts];


  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  // chart for choice input and rating
  const charts = Array.isArray(data) && data.map(group => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (group.inputs.some(input => input.type === "rating input")) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ratingInput = group.inputs.find(input => input.type === "rating input");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const total = ratingInput.total[0].map(entry => ({
        rating: parseInt(entry.rating),
        total: parseInt(entry.total)
      }));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const title = group.inputs.find(input => input.type === "text")?.content?.richText[0]?.children[0]?.text;




      // Calculate NPS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const detractors = total.filter(entry => entry.rating >= 0 && entry.rating <= 6).reduce((acc, curr) => acc + curr.total, 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const promoters = total.filter(entry => entry.rating >= 9 && entry.rating <= 10).reduce((acc, curr) => acc + curr.total, 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const totalResponses = total.reduce((acc, curr) => acc + curr.total, 0);

      // console.log('Total responses:', totalResponses);
      // console.log('Promoters:', promoters);
      // console.log('Detractors:', detractors);



      let nps;
      if (!isNaN(totalResponses) && totalResponses !== 0) {
        nps = ((promoters - detractors) / totalResponses) * 100;
      } else {
        nps = 0; // Handle case where there are no responses or NaN
      }

      console.log('NPS:', nps);

      const chartData = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        labels: total.map(entry => entry.rating),
        datasets: [{
          label: `NPS: ${nps.toFixed(2)}%`,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          data: total.map(entry => entry.total),
          backgroundColor: 'rgba(255, 159, 64, 0.8)'
        }]
      };

      return (
        <div key={group.groupId}>
          {totalResponses > 0 ? <>
            <h3>{title ? title : group.title}</h3>
            <Bar data={chartData} />
          </> : ''}
        </div>
      );
    } else if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      group.inputs.some(input => input.type === "choice input")) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const choiceInput = group.inputs.find(input => input.type === "choice input");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // const labels = choiceInput.items.map(choice => choice.content);
      const itemsWithTotals = choiceInput.items.map(choice => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const totalEntry = choiceInput.total[0].find(entry => entry.content === choice.content);
        return {
          label: choice.content,
          total: totalEntry ? parseInt(totalEntry.total) : 0

        };
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const labels = itemsWithTotals.map(item => item.label);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const totals = itemsWithTotals.map(item => item.total);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const checkAnyMultipleValueSelected = choiceInput.total[0].map(choice => parseInt(choice.total));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const title = group.inputs.find(input => input.type === "text")?.content?.richText[0]?.children[0]?.text;

      const chartData = {
        labels: labels,
        datasets: [{
          label: title ? title : group.title,
          data: totals,
          backgroundColor: 'rgba(255, 159, 64, 0.8)'
        }]
      };
      // console.log("total choicesssssssssssssssssss", checkAnyMultipleValueSelected.length)
      return (
        <div key={group.groupId}>
          {checkAnyMultipleValueSelected.length ?
            <><h3 >{title ? title : group.title}</h3>
              <Bar data={chartData} />
            </> : ''}

        </div>
      );
    } else {
      return null; // Handle other types of inputs if necessary
    }
  });


  // const charts = data && data.map(group => {
  //   if (group.inputs.some(input => input.type === "rating input")) {
  //     const ratingInput = group.inputs.find(input => input.type === "rating input");
  //     const ratings = ratingInput.total[0].map(rating => parseInt(rating.rating));
  //     const total = ratingInput.total[0].map(rating => parseInt(rating.total));
  //     const title = group.inputs.find(input => input.type === "text")?.content?.richText[0]?.children[0].text;





  //     const chartData = {
  //       labels: ratings,
  //       datasets: [{
  //         label: `NPS: $`,
  //         data: total,
  //         backgroundColor: 'rgba(255, 159, 64, 0.6)'
  //       }]
  //     };

  //     return (
  //       <div key={group.groupId}>
  //         <h3>{title}</h3>
  //         <Bar data={chartData} />
  //       </div>
  //     );
  //   } else if (group.inputs.some(input => input.type === "choice input")) {
  //     const choiceInput = group.inputs.find(input => input.type === "choice input");
  //     const labels = choiceInput.items.map(choice => choice.content);
  //     const total = choiceInput.total[0].map(choice => parseInt(choice.total));
  //     const title = group.inputs.find(input => input.type === "text")?.content?.richText[0]?.children[0].text;

  //     const chartData = {
  //       labels: labels,
  //       datasets: [{
  //         label: title,
  //         data: total,
  //         backgroundColor: 'rgba(255, 159, 64, 0.6)'
  //       }]
  //     };

  //     return (
  //       <div key={group.groupId}>
  //         <h3>{title}</h3>
  //         <Bar data={chartData} />
  //       </div>
  //     );
  //   } else {
  //     return null; // Handle other types of inputs if necessary
  //   }
  // });
  return (

    <div style={{ display: 'flex', marginTop: '10%', justifyContent: 'center', alignItems: 'center', gap: '25px', flexWrap: 'wrap', height: '70%', overflowY: 'auto' }}>
      {/* {renderCharts()} */}
      {charts}
    </div>

  );
};


