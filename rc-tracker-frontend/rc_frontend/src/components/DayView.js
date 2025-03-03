import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import SortableItem from "./SortableItem";

function DayView({
  selectedMonth,
  selectedYear,
  selectedDay,
  setSelectedDay,
  habitudes,
  checkedDays,
  handleCheckboxChange,
  monthDays,
  isDarkMode,
  isAdmin,   
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkedCount = habitudes.filter((habitude) =>
      checkedDays[`${habitude.id}-${selectedDay}`]?.status
    ).length;
    const totalCount = habitudes.length;
    const newProgress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
    setProgress(newProgress);
  }, [checkedDays, selectedDay, habitudes]);

  const handlePrevDay = () => {
    if (selectedDay > 0 && monthDays[selectedDay - 1]) {
      setSelectedDay(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < monthDays.length - 1 && monthDays[selectedDay + 1]) {
      setSelectedDay(selectedDay + 1);
    }
  };

  return (
    <div className={`px-4 py-4 min-h-screen flex justify-center items-start ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div className="w-full max-w-md">
        {/* Navigation entre jours */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={handlePrevDay}
            disabled={selectedDay === 0 || !monthDays[selectedDay - 1]}
            className={`p-2 ${isDarkMode ? 'text-white hover:text-blue-400 disabled:text-gray-500' : 'text-black hover:text-blue-600 disabled:text-gray-400'} disabled:cursor-not-allowed`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className={`mx-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {monthDays[selectedDay].day}/{monthDays[selectedDay].month} ({monthDays[selectedDay].weekDay})
          </span>
          <button
            onClick={handleNextDay}
            disabled={selectedDay === monthDays.length - 1 || !monthDays[selectedDay + 1]}
            className={`p-2 ${isDarkMode ? 'text-white hover:text-blue-400 disabled:text-gray-500' : 'text-black hover:text-blue-600 disabled:text-gray-400'} disabled:cursor-not-allowed`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton Retour */}
        <button
          onClick={() => setSelectedDay(null)}
          className={`block mx-auto mb-6 px-4 py-2 text-sm border rounded-md ${isDarkMode ? 'border-gray-600 text-white bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-black bg-gray-100 hover:bg-gray-200'}`}
        >
          Retour au mois
        </button>

        {/* Barre de progression */}
        <div className="mb-4">
          <span className={`block text-sm text-center mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>Progression : {progress}%</span>
          <Progress.Root
            className={`relative w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
            value={progress}
          >
            <Progress.Indicator
              className={`h-full transition-transform duration-300 ease-in-out ${progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
        </div>

        {/* Liste des habitudes */}
        <div className={`rounded-md shadow-md p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {habitudes.map((habitude) => (
            <SortableItem
              key={habitude.id}
              habitude={habitude}
              checkedDays={checkedDays}
              handleCheckboxChange={handleCheckboxChange}
              selectedDayIndex={selectedDay}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayView;