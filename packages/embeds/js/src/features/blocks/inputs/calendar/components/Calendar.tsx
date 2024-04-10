import { createSignal } from "solid-js";

export const Calendar = (props: any) => {
  const [date, setDate] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);

  const handleMonthChange = (event: Event) => {
    const selectedMonth = (event.target as HTMLSelectElement).value;
    setDate(new Date(date().getFullYear(), parseInt(selectedMonth), 1));
  };

  const handleYearChange = (event: Event) => {
    const selectedYear = (event.target as HTMLSelectElement).value;
    setDate(new Date(parseInt(selectedYear), date().getMonth(), 1));
  };

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const totalDays = daysInMonth(date().getFullYear(), date().getMonth());
    const startDay = startDayOfMonth(date().getFullYear(), date().getMonth());

    const rows = Math.ceil((totalDays + startDay) / 7);
    const calendar = [];

    console.log('start day', startDay)

    const day = 1 - startDay;
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        const currentDay = i * 7 + j + 1 - startDay;
        row.push(
          <td

            style={{ 'border-radius': '50%', "text-align": 'center' }}
            classList={{
              'not-in-month': currentDay <= 0 || currentDay > totalDays,
              'bg-[#E6F1FA]': selectedDate() && selectedDate().getDate() === currentDay && selectedDate().getMonth() === date().getMonth() && selectedDate().getFullYear() === date().getFullYear(),
              'hover:bg-[#E6F1FA}': true,


            }}
            onClick={() => {
              console.log('click');
              console.log('day:', currentDay);
              console.log('totalDays:', totalDays);
              if (currentDay > 0 && currentDay <= totalDays) {
                console.log('hello');
                const clickedDate = new Date(date().getFullYear(), date().getMonth(), currentDay);
                setSelectedDate(clickedDate);
              }
            }}
          >
            {currentDay > 0 && currentDay <= totalDays && (
              <span>
                {currentDay}
              </span>
            )}
          </td>
        );
      }
      calendar.push(<tr>{row}</tr>);
    }
    return calendar;
  };

  const goToPrevMonth = () => {
    setDate(new Date(date().getFullYear(), date().getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDate(new Date(date().getFullYear(), date().getMonth() + 1, 1));
  };

  return (
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div>
          <select onChange={handleMonthChange} value={date().getMonth()} class="mr-2">
            {Array.from({ length: 12 }, (_, index) => (
              <option value={index} >
                {new Date(0, index).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select onChange={handleYearChange} value={date().getFullYear()}>
            {Array.from({ length: 10 }, (_, index) => (
              <option value={date().getFullYear() + index}>
                {date().getFullYear() + index}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={goToPrevMonth} class=" ">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_210_2431)">
                <path d="M27.7049 19.41L26.2949 18L20.2949 24L26.2949 30L27.7049 28.59L23.1249 24L27.7049 19.41Z" fill="#4F444A" />
              </g>
              <defs>
                <clipPath id="clip0_210_2431">
                  <rect x="4" y="4" width="40" height="40" rx="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
          <button onClick={goToNextMonth} class="">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_210_2436)">
                <path d="M21.7049 18L20.2949 19.41L24.8749 24L20.2949 28.59L21.7049 30L27.7049 24L21.7049 18Z" fill="#4F444A" />
              </g>
              <defs>
                <clipPath id="clip0_210_2436">
                  <rect x="4" y="4" width="40" height="40" rx="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>
      <table class="table-auto">
        <thead>
          <tr class="text-left">
            <th class="px-5 py-5">S</th>
            <th class="px-5 py-5">M</th>
            <th class="px-5 py-5">T</th>
            <th class="px-5 py-5">W</th>
            <th class="px-5 py-5">T</th>
            <th class="px-5 py-5">F</th>
            <th class="px-5 py-5">S</th>
          </tr>
        </thead>
        <tbody>{generateCalendar()}</tbody>
      </table>

      {/* Display selected date */}
      <div>
        Selected Date: {selectedDate() ? selectedDate().toLocaleDateString() : 'None'}
      </div>

    </div>
  );
};
