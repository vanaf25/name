import React, { useEffect, useState } from 'react';
// @mui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { Card } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';

// Redux
import { useSelector } from '../../redux/store';

// Hooks
import useLocales from '../../hooks/useLocales';

// utils
import { fCurrency } from '../../utils/formatNumber';
import { fDate2 } from '../../utils/formatTime';
import Loader from '../../components/Loader';

// ----------------------------------------------------------------------

export default function ClientsDataGrid() {
  const { translate } = useLocales();
  const { clients, buyerClients, isLoadingPriceRevision } = useSelector((state) => state.pharmacy_product);
  const [allClients, setAllClients] = useState([]);

  useEffect(() => {
    let allClients = clients || [];
    if (buyerClients.length > 0) {
      allClients = [...allClients, ...buyerClients.map((item) => ({ ...item, is_buyer: true }))];
    }
    setAllClients(_.sortBy(allClients, (item) => new Date(item.date)).reverse());
  }, [clients, buyerClients, isLoadingPriceRevision]);

  return (
    <Card sx={{ pt: 1, mt: 2, minHeight: '50px', height: '100%', maxHeight: '300px' }}>
      <TableContainer
        sx={{
          height: '100%',
        }}
      >
        {isLoadingPriceRevision && <Loader />}
        {!isLoadingPriceRevision && (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontSize: '.8rem', width: '9%', padding: '10px' }}>{translate('date')}</TableCell>
                <TableCell style={{ fontSize: '.8rem', width: '50%' }}>{translate('customer')}</TableCell>
                <TableCell style={{ fontSize: '.8rem', width: '10%' }}>{translate('price_revision.units')}</TableCell>
                <Tooltip title={translate('price_revision.average_price')} arrow>
                  <TableCell style={{ fontSize: '.8rem', width: '10%' }}>AVG</TableCell>
                </Tooltip>
                <TableCell style={{ fontSize: '.8rem', width: '12%' }}>
                  {translate('price_revision.sale_price')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allClients.map((row, index) => (
                <TableRow
                  key={`${row.id} ${row.name}${index}`}
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  sx={{ bgcolor: row.is_buyer ? 'info.lighter' : '' }}
                >
                  <TableCell style={{ width: '10%', fontSize: '0.7rem', padding: '5px' }}>{fDate2(row.date)}</TableCell>
                  <TableCell
                    style={{ width: '50%', flexWrap: 'wrap', fontWeight: 'bold', fontSize: '0.7rem', padding: '5px' }}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell style={{ width: '10%', fontSize: '0.7rem', padding: '5px', textAlign: 'center' }}>
                    {row.units}
                  </TableCell>
                  <TableCell style={{ width: '10%', fontSize: '0.7rem', padding: '5px', textAlign: 'center' }}>
                    {fCurrency(row.avgpurchaseprice)}
                  </TableCell>
                  <TableCell style={{ width: '12%', fontSize: '0.7rem', padding: '5px', textAlign: 'center' }}>
                    {fCurrency(row.sellprice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Card>
  );
}
