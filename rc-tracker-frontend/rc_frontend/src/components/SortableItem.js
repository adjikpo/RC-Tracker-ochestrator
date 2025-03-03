import React from 'react';
import { CheckboxCards } from '@radix-ui/themes';
import { getCategoryFromName } from '../utils';

function SortableItem({
  habitude,
  checkedDays,
  handleCheckboxChange,
  selectedDayIndex,
  isDarkMode,
}) {
  const isChecked = checkedDays[`${habitude.id}-${selectedDayIndex}`]?.status || false;

  return (
    <div className={`p-2 border-b last:border-b-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <CheckboxCards.Root
        defaultValue={isChecked ? [habitude.id.toString()] : []}
        value={isChecked ? [habitude.id.toString()] : []}
        onValueChange={(values) => {
          const checked = values.includes(habitude.id.toString());
          handleCheckboxChange(habitude.id, selectedDayIndex, checked);
        }}
        color="green"
        className="w-full"
      >
        <CheckboxCards.Item
          value={habitude.id.toString()}
          className={`w-full p-2 rounded-md flex items-center justify-between ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{habitude.nom}</span>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{`(${getCategoryFromName(habitude.nom)})`}</span>
          </div>
        </CheckboxCards.Item>
      </CheckboxCards.Root>
    </div>
  );
}

export default SortableItem;