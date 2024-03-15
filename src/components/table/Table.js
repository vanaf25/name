import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTable } from 'react-table';
import Td from './Td';

const StyledTable = styled.table`
  td > input {
    font-size: 1rem;
  }
`;

function Table({ loading, columns, data,from }) {
  // Use the state and functions returned from useTable to build your UI
  const tbodyRef = React.useRef(null);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });
  

  const handleKeyDown = (event, row) => {
    event.stopPropagation();
    const currentRow = tbodyRef.current?.children.namedItem(row.id);
    console.log('evenet ke2y:',event.key);
    switch (event.key) {
      case 'ArrowUp':
        currentRow?.previousElementSibling?.focus();
        break;
      case 'ArrowDown':
        currentRow?.nextElementSibling?.focus();
        break;
        case 'Enter':
        currentRow?.nextElementSibling?.focus();
        break;
      case 'Tab':
        currentRow?.nextElementSibling?.focus();
        break;
      default:
        break;
    }
  };

  const handleKeyDownCell = (event, row, cellId) => {
    event.stopPropagation();
    const currentRow = tbodyRef.current?.children.namedItem(row.id);
    const currentCell = currentRow?.children.namedItem(cellId);

    const findCellElementFocusableChild = (element) => {
      if (!element) {
        return null;
      }

      const childrenList = [...(element?.children || [])];
      console.log('childs:',childrenList);
      const focusableElement =element.querySelector("input")
      console.log('focus on:',focusableElement);

      if (focusableElement) {
        focusableElement.select();
        focusableElement.addEventListener('keydown', (event) => {
          // Check if the key pressed is an arrow key
          if (['ArrowUp', 'ArrowDown','Enter',"Tab"].includes(event.key)) {
            // Prevent the default behavior of the arrow keys
            event.preventDefault();
            // Focus on the current input without changing its value
            // eslint-disable-next-line no-debugger
            event.target.focus();
            event.target.select();
          }
        });
      }

      return focusableElement || null;
    };

    const focuseChildElement = (element, direction) => {
      console.log('focuseChildElement:',element,direction);
      if (!element) {
        return;
      }

      let focusableChildElement = null;

      let currentElement = element;
      const hasNextElement =
        direction === 'left' ? currentElement.previousElementSibling : currentElement.nextElementSibling;
      while (hasNextElement || !!focusableChildElement) {
        focusableChildElement = findCellElementFocusableChild(currentElement);
        if (focusableChildElement || !currentElement) {
          break;
        }

        currentElement =
          direction === 'left' ? currentElement.previousElementSibling : currentElement.nextElementSibling;
      }

      if (focusableChildElement) {
        focusableChildElement.focus();
        focusableChildElement.select();
      }
    };

    const focuseVerticalChildElement = (element, direction) => {
      if (!element) {
        return;
      }

      const cellId = element.id;
      const columnIndex = cellId.split('_')[1];
      const rowElement = element.parentElement;
      const goToRowElement = direction === 'up' ? rowElement.previousElementSibling : rowElement.nextElementSibling;

      if (!goToRowElement) {
        return;
      }
      const rowIndex = goToRowElement.id;
      const goToCellId = `${rowIndex}_${columnIndex}`;
      const goToCellElement = goToRowElement.children.namedItem(goToCellId);
      console.log('go:',goToCellElement);
      if (goToCellElement) {
/*
        goToCellElement?.querySelector('input')?.focus();
*/
        const focusableChildElement = findCellElementFocusableChild(goToCellElement);

        if (focusableChildElement) {
          focusableChildElement.focus();
          focusableChildElement.select();
        }
      }
    };
    console.log('evenet Key:',event.key);
    switch (event.key) {
      case 'ArrowLeft':
        focuseChildElement(currentCell?.previousElementSibling, 'left');
        break;
      case 'ArrowRight':
        focuseChildElement(currentCell?.nextElementSibling, 'right');
        break;
      case 'ArrowUp':
        focuseVerticalChildElement(currentCell, 'up');
        break;
      case 'ArrowDown':
        console.log('c:',currentCell);
        focuseVerticalChildElement(currentCell, 'down');
        break;
        case 'Enter':
          focuseVerticalChildElement(currentCell, 'down');
          break;
      case 'Tab':
        focuseVerticalChildElement(currentCell, 'down');
        break;
      default:
        break;
    }
  };

  // Render the UI for your table
  return (
    <StyledTable {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} ref={tbodyRef}>
        {rows.map((row, i) => {
          prepareRow(row);
          const isEmptyCurrentItem = !row.original.current_item
          return (
            <tr style={isEmptyCurrentItem ? {}: {backgroundColor:"yellow"}} key={i} id={i} {...row.getRowProps()} onKeyDown={(e) => handleKeyDown(e, row)} tabIndex={0}>
              {row.cells.map((cell, j) => {
                const cellId = `${i}_${j}`;
                return (
                  <Td cell={cell} cellId={cellId} handleKeyDownCell={handleKeyDownCell} row={row} j={j} from={from}/>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
}

export default Table;
