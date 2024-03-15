import { TableBody, TableCell, TableRow, Tooltip } from '@mui/material';
import React from 'react';
import { ReactComponent as ThumbsUpGreen } from '../../pages/stocksold/icons/Thumbs_up_green.svg';
import { ReactComponent as ThumbsDownWhite } from '../../pages/stocksold/icons/Thumbs_down_red_line.svg';

const StockTable = (props) => {
  const { items, updatedGroupData1, stock } = props;
  return (
    <TableBody>
      {items?.map((i, index) => (
        <TableRow key={i.eans}>
          <Tooltip title={String(i.cns)} arrow>
            <TableCell
              sx={{
                p: 0,
                borderBottom: 0.5,
                boxShadow: 'none !important',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: 60,
                display: 'table-cell',
                overflow: 'hidden',
              }}
            >
              {i.cns}
            </TableCell>
          </Tooltip>
          <Tooltip title={String(i.eans)} arrow>
            <TableCell
              sx={{
                p: 1,
                borderBottom: 0.5,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: 100,
                display: 'table-cell',
                overflow: 'hidden',
              }}
            >
              {i.eans}
            </TableCell>
          </Tooltip>
          <TableCell sx={{ p: 1, borderBottom: 0.5 }}>
            {i?.available_stock && (
              <Tooltip title={String(i?.available_stock?.name)} arrow>
                <ThumbsUpGreen style={{ width: 20, height: 20 }} />
              </Tooltip>
            )}
            {!i.available_stock && <ThumbsDownWhite style={{ width: 20, height: 20 }} />}
          </TableCell>
          <TableCell sx={{ p: 1, borderBottom: 0.5 }}>{i.name}</TableCell>
          <TableCell sx={{ p: 1, borderBottom: 0.5 }}>{i.ud}</TableCell>
          <TableCell sx={{ p: 1, borderBottom: 0.5 }}>{i.avg_purchase_price}</TableCell>
          <TableCell sx={{ p: 1, borderBottom: 0.5 }}>{i.U_purchase_price}</TableCell>
          {updatedGroupData1?.map((data, index) => {
            return (
              <TableCell
                sx={{
                  p: 1,
                  borderBottom: 0.5,
                  borderRight: 0.5,
                  borderLeft: index === 0 ? 0.5 : 0,
                  borderColor: '#008300',
                  boxShadow: 'none !important',
                }}
              >
                {stock && stock[i.cns] && stock[i.cns][`ph_${data.ph}`] >= 1 ? (
                  <Tooltip title={String(i.name)} arrow>
                    <ThumbsUpGreen style={{ width: 20, height: 20 }} />
                  </Tooltip>
                ) : (
                  <ThumbsDownWhite style={{ width: 20, height: 20 }} />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default StockTable;
