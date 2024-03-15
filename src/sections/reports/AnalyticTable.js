import PropTypes from 'prop-types';
import { Card, Table, TableBody, TableCell, TableContainer, TableRow, TableHead } from '@mui/material';

import Scrollbar from '../../components/Scrollbar';
import MoreMenu from './components/MoreMenu';
import Loader from '../../components/Loader';

// utils
import { fCurrency } from '../../utils/formatNumber';
import useLocales from '../../hooks/useLocales';

AnalyticTable.propTypes = {
  rows: PropTypes.object,
  pharmacies: PropTypes.array,
};
export default function AnalyticTable({ rows, pharmacies, isGroupsLoading }) {
  const { translate } = useLocales();

  // console.log({rows})

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('reports.pharmacy_id')}</TableCell>
                  <TableCell>{translate('pharmacy')}</TableCell>
                  <TableCell>{translate('reports.sent_order')}</TableCell>
                  <TableCell>{translate('reports.bought')}</TableCell>
                  <TableCell>{translate('reports.received_order')}</TableCell>
                  <TableCell>{translate('reports.balance')}</TableCell>
                  <TableCell>{translate('reports.est_balance')}</TableCell>
                  <TableCell>{null}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length ? (
                  rows.map((pharmacy) => (
                    <TableRow key={pharmacy.ph}>
                      <TableCell>{pharmacy.ph}</TableCell>
                      <TableCell>{pharmacy.name}</TableCell>
                      <TableCell>{fCurrency(pharmacy.buying)}</TableCell>
                      <TableCell>{fCurrency(pharmacy.bought)}</TableCell>
                      <TableCell>{fCurrency((pharmacy.received))}</TableCell>
                      <TableCell>{fCurrency(pharmacy.balance)}</TableCell>
                      <TableCell>{fCurrency((pharmacy.est_balance))}</TableCell>
                      {
                        pharmacy.name !== "Total" ? (
                          <TableCell>
                            <MoreMenu pharmacy={pharmacy} />
                          </TableCell>
                        ) : null
                      }
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" style={{"paddingLeft":"50%"}}>
                      {isGroupsLoading ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        translate('No_record_found')
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>
    </>
  );
}
