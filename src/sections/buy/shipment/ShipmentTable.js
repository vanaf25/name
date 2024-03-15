import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sentenceCase } from 'change-case';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Grid,
  TableHead,
  Skeleton,
  CardHeader,
  Avatar
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';

// Components
import Scrollbar from '../../../components/Scrollbar';
import Label from '../../../components/Label';
import TableMoreMenu from './components/TableMoreMenu';
import Loader from '../../../components/Loader';

// utils
import { fCurrency } from '../../../utils/formatNumber';
import { fDate } from '../../../utils/formatTime';
import useLocales from '../../../hooks/useLocales';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';

// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getShipmentList } from '../../../redux/slices/shipment';
import OrderPharmacyInfo from '../order/components/OrderPharmacyInfo';
import OrderSummary from '../order/components/OrderSummary';
import { CURRENT_BUY_STATUS_IMAGES } from '../../../constants/AppEnums';

import { PATH_BUY } from '../../../routes/paths';
import useAuth from '../../../hooks/useAuth';

ShipmentTable.propTypes = {
  order: PropTypes.object,
};

export default function ShipmentTable({ order }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { shipmentList, loadingList } = useSelector((state) => state.shipment);
  const { currentPharmacy } = useAuth();

  let sumResult = {};

  const handleShipmentDelete = (shipment) => {
    // console.log(shipment);
    confirm({
      title: translate('confirm_action'),
      content: 'Do you really want to delete the shipment?',
      dialogProps: { maxWidth: 'xs', fullWidth: false },
      confirmationText: translate('confirm'),
      cancellationText: translate('cancel'),
      confirmationButtonProps: { color: 'error', variant: 'contained', autoFocus: true },
      cancellationButtonProps: { color: 'inherit', variant: 'contained' },
      contentProps: { p: 0, pt: 3 },
    })
      .then(() => {
        axios
          .delete(`${BUY_API.SHIPMENT}${shipment.id}`)
          .then(() => {
            enqueueSnackbar('Shipment has been deleted successfully.');
            // Load the shipment list for current order
            dispatch(getShipmentList({ order: order.id }));
          })
          .catch(() => {
            enqueueSnackbar('Opps something went wrong', { variant: 'error' });
          });
      })
      .catch(() => {
        // console.log('Cancelled the action');
      });
  };

  if (shipmentList.length > 0) {
    sumResult = shipmentList.reduce((accumulator, currentValue) => {
      return {
        grand_total: accumulator.grand_total + currentValue.order.grand_total,
        discount_amount: +(accumulator.discount_amount) + +(currentValue.order.discount_amount),
        sub_total: +(accumulator.sub_total) + +(currentValue.order.sub_total),
        total_units: +(accumulator.total_units) + +currentValue.order.total_units,
        recargo_amount: +accumulator.recargo_amount + +currentValue.order.recargo_amount,
        tax_amount: +accumulator.tax_amount + +currentValue.order.tax_amount,
      };
    }, {
      grand_total: 0,
      discount_amount: 0,
      sub_total: 0,
      total_units: 0,
      recargo_amount: 0,
      tax_amount: 0,
    });

  }
  
  const isLeft =true;
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} sx={{ mt: 3 }}>
        <Card sx={{ py: 1 }}>
          <Scrollbar>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    <TableCell>Nº Compra</TableCell>
                    <TableCell>{translate("Order_ID")}</TableCell>
                    <TableCell>Nº Envio</TableCell>
                    <TableCell>{translate('shipment.shipment_number')}</TableCell>
                    <TableCell>{translate('shipment.shipment_date')}</TableCell>
                    <TableCell>{translate("Total_Units")}</TableCell>
                    <TableCell>{translate('Sub_Total')}</TableCell>
                    <TableCell>{translate('Discount')}</TableCell>
                    <TableCell>IVA</TableCell>
                    <TableCell>{translate('Recargo')}</TableCell>
                    <TableCell>{translate('total')}</TableCell>
                    <TableCell>&nbsp;</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loadingList && shipmentList.length ? (
                    shipmentList.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Avatar src={CURRENT_BUY_STATUS_IMAGES.RECEIVE[row.shipment_action.toString()]} sx={{ width: 30, height: 30, cursor:"pointer"}} variant="square"
                            onClick={() => {
                              navigate(PATH_BUY.buyShipmentDetail.replace(':id', row.id),{state:{buyId:row.order.buy, pharmacyId: currentPharmacy.id}});
                            }}
                          />
                        </TableCell>
                        <TableCell>{row.order.buy}</TableCell>
                        <TableCell>{row.order.id}</TableCell>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.shipment_number}</TableCell>
                        <TableCell>{fDate(row.shipment_date)}</TableCell>
                        <TableCell>{row.order.total_units}</TableCell>
                        <TableCell>{fCurrency(row.order.sub_total)}</TableCell>
                        <TableCell>{fCurrency(row.order.discount_amount)}</TableCell>
                        <TableCell>{fCurrency(row.order.tax_amount)}</TableCell>
                        <TableCell>{fCurrency(row.order.recargo_amount)}</TableCell>
                        <TableCell>{fCurrency(row.order.grand_total)}</TableCell>
                        <TableCell>
                          <TableMoreMenu shipment={row} onDelete={() => handleShipmentDelete(row)} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {loadingList ? (
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
      </Grid>
      <Grid item xs={12} style={{
        "display": "flex",
        "justifyContent": "space-between",
        "alignItems": "stretch"
    }}>
          <OrderPharmacyInfo editOrder={order} />
          <OrderSummary editOrder={sumResult} title={translate("shipment_summary")}/> 
      </Grid>
    </Grid>
  );
}
