import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getMonthDays } from '../utils';

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function MonthView({ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, setSelectedDay, habitudes, checkedDays, isOnline }) {
  const monthDays = getMonthDays(selectedMonth, selectedYear);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDayClick = (index) => {
    if (monthDays[index]) {
      setSelectedDay(index);
    }
  };

  const hasCheckedHabits = (dayIndex) => {
    return habitudes.some(habitude => checkedDays[`${habitude.id}-${dayIndex}`]);
  };

  const hasAllChecked = (dayIndex) => {
    return habitudes.length > 0 && habitudes.every(habitude => checkedDays[`${habitude.id}-${dayIndex}`]);
  };

  return (
    <div className="mb-2 mt-[10px]">
      <div className="flex items-center justify-center mb-2 pb-[15px]"> {/* Ajouté pb-[5px] */}
        <button
          onClick={handlePrevMonth}
          className="p-1 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-center mx-10 text-black dark:text-white">
          {monthNames[selectedMonth]} {selectedYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-1 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="max-w-[360px] mx-auto">
        <div className="grid grid-cols-7 gap-1 text-center pb-[15px]"> {/* Ajouté pb-[5px] */}
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
            <span key={day} className="text-xs font-bold text-black dark:text-white">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {monthDays.map((day, index) => (
            <div key={index} className="flex justify-center items-center h-[42px]">
              {day ? (
                <button
                  onClick={() => handleDayClick(index)}
                  className={`w-[42px] h-[42px] rounded-full border text-sm flex items-center justify-center transition ${
                    hasAllChecked(index)
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                      : hasCheckedHabits(index)
                      ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600'
                      : 'border-gray-700 text-black dark:text-white hover:bg-gray-600 dark:hover:bg-gray-500'
                  }`}
                >
                  {day.day}
                </button>
              ) : (
                <span className="w-[42px] h-[42px]"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MonthView;