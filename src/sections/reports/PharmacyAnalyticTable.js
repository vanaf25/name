import PropTypes from 'prop-types';
import { Card, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, CardHeader } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import Scrollbar from '../../components/Scrollbar';
import MoreMenu from './components/MoreMenu';
import Loader from '../../components/Loader';

// utils
import { fCurrency } from '../../utils/formatNumber';
import { fDate2 } from '../../utils/formatTime';
import useLocales from '../../hooks/useLocales';
import { PATH_BUY } from '../../routes/paths';

PharmacyAnalyticTable.propTypes = {
  rows: PropTypes.object,
  pharmacy: PropTypes.object,
};
export default function PharmacyAnalyticTable({ rows, pharmacies, isReportsLoading, purchaseReportData, pharmacyId }) {
  const { translate } = useLocales();
  const filteredShipments = [];
  const purchaseByOtherPharmacy = [];

  const uniqueShipments = (shipments) => {
    const uniq = [...new Set(shipments)];
    return uniq.length;
  };

  purchaseReportData.forEach(data => {
    if (data.buy_ph === +pharmacyId){
      filteredShipments.push(data)
    }
  })


  purchaseReportData.forEach(data => {
    if (data.buy_ph !== +pharmacyId){
      purchaseByOtherPharmacy.push(data)
    }
  })
  // console.log("DATA",{purchaseReportData, pharmacyId, filteredShipments, isReportsLoading, purchaseByOtherPharmacy})

  

  return (
    <>
      <Card sx={{ p: 2 }}>
        <CardHeader title={translate('reports.sent_shipments_table_heading')} sx={{ mb: 3, p: 0 }} />
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('report_data.buy_id')}</TableCell>
                  <TableCell>{translate('report_data.buy')}</TableCell>
                  <TableCell>{translate('report_data.pharmacy')}</TableCell>
                  <TableCell>{translate('report_data.order')}</TableCell>
                  <TableCell>{translate('report_data.shipment')}</TableCell>
                  <TableCell>{translate('report_data.shipment_number')}</TableCell>
                  <TableCell>{translate('date')}</TableCell>
                  <TableCell>{translate('report_data.units')}</TableCell>
                  <TableCell>{translate('report_data.pvl')}</TableCell>
                  <TableCell>{translate('report_data.Neto')}</TableCell>
                  <TableCell>{translate('report_data.iva')}</TableCell>
                  <TableCell>{translate('report_data.recargo')}</TableCell>
                  <TableCell>{translate('report_data.dto')}</TableCell>
                  <TableCell>{translate('report_data.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  filteredShipments.length > 0 ? (
                    filteredShipments.map((row) => (
                      <TableRow key={row.buy_ph}>
                        <TableCell>{row.buy_id}</TableCell>
                        <TableCell>{row.buy_name}</TableCell>
                        <TableCell><RouterLink to={PATH_BUY.buyShipmentDetail.replace(':id', row.ship_id)} style={{"textDecoration": "none","color": "black","cursor": "pointer"}}>{row.rec_ph_name}</RouterLink></TableCell>
                        <TableCell>{row.buy_order}</TableCell>
                        <TableCell>{row.ship_id}</TableCell>
                        <TableCell>{row.ship_number}</TableCell>
                        <TableCell>{fDate2(row.created_date)}</TableCell>
                        <TableCell>{row.units}</TableCell>
                        <TableCell>{row.pvl}</TableCell>
                        <TableCell>{row.neto}</TableCell>
                        <TableCell>{row.iva}</TableCell>
                        <TableCell>{row.recargo}</TableCell>
                        <TableCell>{row.dto}</TableCell>
                        <TableCell>{row.total}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" style={{paddingLeft:"50%"}}>
                      {isReportsLoading ? (
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

      <Card sx={{ p: 2, mt: 3 }}>
        <CardHeader title={translate('reports.received_shipments_table_heading')} sx={{ mb: 3, p: 0 }} />
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('report_data.buy_id')}</TableCell>
                  <TableCell>{translate('report_data.buy')}</TableCell>
                  <TableCell>{translate('report_data.pharmacy')}</TableCell>
                  <TableCell>{translate('report_data.order')}</TableCell>
                  <TableCell>{translate('report_data.shipment')}</TableCell>
                  <TableCell>{translate('report_data.shipment_number')}</TableCell>
                  <TableCell>{translate('date')}</TableCell>
                  <TableCell>{translate('report_data.units')}</TableCell>
                  <TableCell>{translate('report_data.pvl')}</TableCell>
                  <TableCell>{translate('report_data.Neto')}</TableCell>
                  <TableCell>{translate('report_data.iva')}</TableCell>
                  <TableCell>{translate('report_data.recargo')}</TableCell>
                  <TableCell>{translate('report_data.dto')}</TableCell>
                  <TableCell>{translate('report_data.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  purchaseByOtherPharmacy.length > 0 ? (
                    purchaseByOtherPharmacy.map((row) => (
                      <TableRow key={row.buy_ph}>
                        <TableCell>{row.buy_id}</TableCell>
                        <TableCell>{row.buy_name}</TableCell>
                        <TableCell><RouterLink to={PATH_BUY.buyShipmentPharmacyDetail.replace(':id', row.ship_id)} style={{"textDecoration": "none","color": "black","cursor": "pointer"}}>{row.rec_ph_name}</RouterLink></TableCell>
                        <TableCell>{row.buy_order}</TableCell>
                        <TableCell>{row.ship_id}</TableCell>
                        <TableCell>{row.ship_number}</TableCell>
                        <TableCell>{fDate2(row.created_date)}</TableCell>
                        <TableCell>{row.units}</TableCell>
                        <TableCell>{row.pvl}</TableCell>
                        <TableCell>{row.neto}</TableCell>
                        <TableCell>{row.iva}</TableCell>
                        <TableCell>{row.recargo}</TableCell>
                        <TableCell>{row.dto}</TableCell>
                        <TableCell>{row.total}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" style={{paddingLeft:"50%"}}>
                      {isReportsLoading ? (
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
