import React from 'react'
import { Select, Box } from '@chakra-ui/react'
import {
  timeFilterValues,
  timeFilterLabels,
  // parseFromDateFromTimeFilter,
  // parseToDateFromTimeFilter,
} from '../api/constants' // Adjust the import path as necessary

interface TimeFilterDropdownProps {
  selectedTimeFilter: (typeof timeFilterValues)[number]
  onChange: (value: (typeof timeFilterValues)[number]) => void
  placeholder?: string
}

const TimeFilterDropdown: React.FC<TimeFilterDropdownProps> = ({
  selectedTimeFilter,
  onChange,
  placeholder = 'Select Frequency',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as (typeof timeFilterValues)[number]
    onChange(value)
  }

  return (
    <Box width="200px">
      <Select value={selectedTimeFilter} onChange={handleChange} >
        <option value="" disabled selected>
          {placeholder}
        </option>
        {timeFilterValues.map((filter) => (
          <option key={filter} value={filter}>
            {timeFilterLabels[filter]}
          </option>
        ))}
      </Select>
    </Box>
  )
}

export default TimeFilterDropdown
