import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTable } from 'react-table';

function Td({ cell, cellId, handleKeyDownCell, j, row,from }) {
  const [value, setValue] = useState(cell.value);

  const minimumHandler = (original) => {
    const minList = [];
    const data = original?.split(' ')?.forEach((item) => {
      minList.push(parseInt(item.split('-')[0], 10)); // Specify radix as 10
      // You can perform operations here if needed
    });

    return Math.max(...minList);
  };

  // Render the UI for your table
  return (
    <td
      style={{
        backgroundColor:
          j === 3 && value < minimumHandler(row?.original?.catalog_condition?.condition_1) && from ==="need summary" ? '#FFAC1C' : 'transparent', // Set a default background color if the condition is not met
        // border: '1px solid transparent', // Set a default border initially

        // Define focus styles separately
        ':focus': {
          borderColor:
            j === 3 && value < minimumHandler(row?.original?.catalog_condition?.condition_1)
              ? 'rgb(204, 85, 0)'
              : 'transparent',
        },
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      role="presentation"
      key={cellId}
      id={cellId}
      {...cell.getCellProps()}
     
      onKeyDown={(e) =>{ 
        handleKeyDownCell(e, row, cellId)}}
    >
      {cell.render('Cell')}
    </td>
  );
}

export default Td;
