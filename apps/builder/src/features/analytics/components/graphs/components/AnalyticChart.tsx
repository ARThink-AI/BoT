
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import { useTypebot } from '@/features/editor/providers/TypebotProvider';
import { title } from 'process';


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
  const { typebot, publishedTypebot } = useTypebot()

  const blocks = publishedTypebot?.groups



  // function Options() {
  //   const option = []
  //   multipleOptionss?.forEach(group => {
  //     group.blocks.forEach((block) => {
  //       if (block.type === "choice input") {
  //         block.items.map((item) => option.push(item.content))
  //       }
  //     })
  //   });
  //   return option
  // }

  // function getItemsAndText(blocks) {
  //   const results = [];

  //   blocks.forEach(group => {
  //     const groupResult = {
  //       title: group.title,
  //       itemsContent: [],
  //       lastTextContent: group.title // Default to title if no text block is found
  //     };

  //     group.blocks.forEach(block => {
  //       if (block.type === 'choice input') {
  //         block.items.forEach(item => {
  //           groupResult.itemsContent.push({content: item.content});
  //         });
  //       } else if (block.type === 'text') {
  //         const textBlocks = block.content.richText;
  //         const lastTextBlock = textBlocks[textBlocks.length - 1];

  //         if (lastTextBlock && lastTextBlock.children) {
  //           groupResult.lastTextContent = lastTextBlock.children.map(child => child.text).join(' ');
  //         }
  //       }
  //     });

  //     results.push(groupResult);
  //   });

  //   return results;
  // }
  function getItemsAndText(blocks) {
    return blocks.map(group => {
      const result = {
        blockId: '',
        title: group.title,
        items: [],
        lastTextContent: '' // Default to title if no text block is found
      };

      group.blocks.forEach(block => {
        result.blockId = block.id
        if (block.type === 'rating input') {


        } else if (block.type === 'choice input') {
          block.items.forEach(item => {
            result.items.push({ content: item.content });
          });
        }
        else if (block.type === 'text') {
          const richText = block.content.richText;
          if (richText.length > 0) {
            const lastTextBlock = richText[richText.length - 1];
            if (lastTextBlock.children) {
              result.lastTextContent = lastTextBlock.children.map(child => child.text).join(' ');
            }
          }
        }
      });

      return result;
    });
  }
  const items = getItemsAndText(blocks)
  console.log("all optionsssssssss", getItemsAndText(blocks))


  console.log("textttttttttttttttt", rating)
  console.log("dddddddddddd", data)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
  function combineRatings(rating) {
    // Create a map to store combined ratings
    const map = new Map();

    // Iterate over each entry in the data
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 
    rating && rating.forEach(item => {
      const { blockId, rating, total } = item;

      // Check if the blockId already exists in the map
      if (map.has(blockId)) {
        // If it exists, update the existing entry
        const existingEntry = map.get(blockId);
        existingEntry.ratings.push(rating);
        existingEntry.totals.push(total);
      } else {
        // If it doesn't exist, create a new entry
        map.set(blockId, { ratings: [rating], totals: [total] });
      }
    });



    // Convert the map back to an array of objects
    return Array.from(map.entries()).map(([blockId, { ratings, totals }]) => ({
      blockId,
      ratings,
      totals
    }));
  }


  const RatingData = combineRatings(rating)

  console.log("dataaaaaaaaaaa ratinggggggggg gggg", combineRatings(rating))

  // const ratingData = rating
  {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore */ }
  // function calculateNPS(RatingData) {
  //   let promoters = 0;
  //   let passives = 0;
  //   let detractors = 0;

  //   // Loop through the ratingData to count promoters, passives, and detractors
  //   if (RatingData) {
  //     for (let i = 0; i < RatingData.length; i++) {
  //       const rating = parseInt(RatingData[i].rating);

  //       if (rating >= 9 && rating <= 10) {
  //         promoters += RatingData[i].total;
  //       } else if (rating >= 7 && rating <= 8) {
  //         passives += RatingData[i].total;
  //       } else {
  //         detractors += RatingData[i].total;
  //       }
  //     }
  //   }


  //   // Calculate NPS
  //   const totalResponses = promoters + passives + detractors;
  //   const nps = ((promoters - detractors) / totalResponses) * 100;

  //   return nps;
  // }


  function calculateNPS(RatingData) {
    const npsResults = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 
    RatingData.forEach(item => {
      let promoters = 0;
      // let passives = 0;
      let detractors = 0;
      let totalResponses = 0;

      // Calculate total responses
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      totalResponses = item.totals.reduce((a, b) => a + b, 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      // Calculate promoters, passives, and detractors
      item.ratings.forEach((rating, index) => {
        const count = item.totals[index];
        rating = parseInt(rating);
        if (rating >= 9) {
          promoters += count;
        } else if (rating >= 7) {
          // passives += count;
        } else {
          detractors += count;
        }
      });

      // Calculate NPS
      const nps = ((promoters - detractors) / totalResponses) * 100;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      // Store NPS result for this blockId
      npsResults[item.blockId] = nps;
    });

    return npsResults;
  }


  const nps = calculateNPS(RatingData)

  console.log("npsssss", nps)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
  // function getTotalCounts(multipleSelect) {
  //   const contentTotals = {};
  //   if (multipleSelect) {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore 
  //     multipleSelect.forEach((item) => {
  //       const contents = item.content
  //         .split(',')
  //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //         // @ts-ignore 
  //         .map((content) => content.trim());
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-ignore 
  //       contents.forEach((content) => {
  //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //         // @ts-ignore 
  //         if (!contentTotals[content]) {
  //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //           // @ts-ignore 
  //           contentTotals[content] = 0;
  //         }
  //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //         // @ts-ignore 
  //         contentTotals[content] += item.total;
  //       });
  //     });
  //   }







  //   // Convert object to array of objects with content and total
  //   const totalCountsArray = Object.keys(contentTotals).map((content) => ({
  //     content: content,
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore 
  //     total: contentTotals[content]
  //   }));

  //   return totalCountsArray;
  // }
  function getTotalCounts(multipleSelect) {
    const contentTotals = {};

    if (multipleSelect) {
      multipleSelect.forEach((item) => {
        const blockId = item.blockId;
        const contents = item.content
          .split(',')
          .map((content) => content.trim());

        contents.forEach((content) => {
          if (!contentTotals[content]) {
            contentTotals[content] = {};
          }
          if (!contentTotals[content][blockId]) {
            contentTotals[content][blockId] = 0;
          }
          contentTotals[content][blockId] += item.total;
        });
      });
    }

    // Convert object to array of objects with content, blockId, and total
    const totalCountsArray = [];

    Object.keys(contentTotals).forEach((content) => {
      Object.keys(contentTotals[content]).forEach((blockId) => {
        totalCountsArray.push({
          content: content,
          blockId: blockId,
          total: contentTotals[content][blockId]
        });
      });
    });

    return totalCountsArray;
  }
  const dataMultipleSelectWise = getTotalCounts(multipleSelect)
  console.log("mmmmmmmmmmmmm", dataMultipleSelectWise)




  function multipleSelectCombineRatings(dataMultipleSelectWise) {
    // Create a map to store combined ratings
    const map = new Map();

    // Iterate over each entry in the data
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 
    dataMultipleSelectWise && dataMultipleSelectWise.forEach(item => {
      const { blockId, content, total } = item;

      // Check if the blockId already exists in the map
      if (map.has(blockId)) {
        // If it exists, update the existing entry
        const existingEntry = map.get(blockId);
        existingEntry.contents.push(content);
        existingEntry.totals.push(total);
      } else {
        // If it doesn't exist, create a new entry
        map.set(blockId, { contents: [content], totals: [total] });
      }
    });



    // Convert the map back to an array of objects
    return Array.from(map.entries()).map(([blockId, { contents, totals }]) => ({
      blockId,
      contents,
      totals
    }));
  }



  const combineMultipleSelect = multipleSelectCombineRatings(dataMultipleSelectWise)

  console.log("multiple selectssssssssss combine", multipleSelectCombineRatings(dataMultipleSelectWise))




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
    // if (multipleSelect && data['choice input']) {
    //   const multiSelectData = {
    //     labels: dataMultipleSelectWise.map(select => select.content),
    //     datasets: [
    //       {
    //         label: 'Multiselect',
    //         data: dataMultipleSelectWise.map(select => select.total),
    //         backgroundColor: 'rgba(75,192,192,0.6)'
    //       }
    //     ]
    //   };
    //   charts.push(<div key="multiSelectChart"><h2>Multiple Select</h2><Bar data={multiSelectData} /></div>);
    // }
    if (combineMultipleSelect && Array.isArray(combineMultipleSelect)) {
      combineMultipleSelect.forEach(item => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const contents = item.contents.map(content => content);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const totaloFContent = item.totals.map(total => parseInt(total));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const blockId = item.blockId;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 

        //  const title = items.map((content)=>{if(content.blockId===item.blockId){
        //   return content.title

        //  }})
        const title = items.map((content) => {
          if (content.blockId === item.blockId) {
            return content.lastTextContent ? content.lastTextContent : content.title

          }
        })
        const name = items.map((content) => {
          if (content.blockId === item.blockId) {
            return content.items

          }
        })

        const chartData = {
          // labels:[0,1,2,3,4,5,6,7,8,9],
          labels: contents,
          datasets: [
            {
              label: `${title}`,
              // data:ratings,
              data: totaloFContent,
              backgroundColor: 'rgba(255, 159, 64, 0.6)'
            }
          ]
        };

        charts.push(
          <div key={blockId}>
            <h3>{title}</h3>
            <Bar data={chartData} />
          </div>
        );
      });
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
    if (RatingData && Array.isArray(RatingData)) {
      RatingData.forEach(item => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const ratings = item.ratings.map(rating => parseInt(rating));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const totaloFRating = item.totals.map(total => parseInt(total));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const blockId = item.blockId;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore 
        const npsData = nps[blockId]; // Assuming you have a function to calculate NPS
        const title = items.map((content) => {
          if (content.blockId === item.blockId) {
            return content.lastTextContent ? content.lastTextContent : content.title

          }
        })
        const chartData = {
          // labels:[0,1,2,3,4,5,6,7,8,9],
          labels: ratings,
          datasets: [
            {
              label: `NPS ${npsData.toFixed(2)}%`,
              // data:ratings,
              data: totaloFRating,
              backgroundColor: 'rgba(255, 159, 64, 0.6)'
            }
          ]
        };

        charts.push(
          <div key={blockId}>
            <h3>{title}</h3>
            <Bar data={chartData} />
          </div>
        );
      });
    }
    // if (data['rating input']) {
    //   const phoneNumberInputData = {
    //     labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    //     datasets: [
    //       {
    //         label: `NPS ${nps.toFixed(2)}%`,
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore 
    //         data: rating.map(rating => parseInt(rating.rating)),
    //         backgroundColor: 'rgba(255,159,64,0.6)'
    //       }
    //     ]
    //   };
    //   charts.push(<div key="ratingInputChart"><Bar data={phoneNumberInputData} /></div>);
    // }

    return charts;
  };
  return (

    <div style={{ display: 'flex', marginTop: '5%', justifyContent: 'center', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
      {renderCharts()}
    </div>

  );
};


