import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { sentenceCase } from 'change-case';
import { useSnackbar } from 'notistack';
// @mui
import { useTheme } from '@mui/material/styles';

import {
  Avatar,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Grid,
  TableHead,
  Skeleton,
  Stack,
  Autocomplete,
  TextField,
  CardHeader,
  Collapse
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import fileDownload from 'js-file-download';
import { useConfirm } from 'material-ui-confirm';
import Iconify from '../../../components/Iconify';
// Constants

import { BUY_TYPE_IMAGES } from '../../../constants/AppEnums';

// Components
import Scrollbar from '../../../components/Scrollbar';
import Label from '../../../components/Label';
import TableMoreMenu from './components/TableMoreMenu';
import Loader from '../../../components/Loader';

// utils
import { fCurrency } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';

// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getBuyOrders, getBuyAction } from '../../../redux/slices/buy';
import useAuth from '../../../hooks/useAuth';

OrderTable.propTypes = {
  currentBuy: PropTypes.object,
};

export default function OrderTable({ currentBuy }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { currentPharmacy } = useAuth();
  const { orders, orderLoading, buyAction } = useSelector((state) => state.buy);
  const [isOrders, setIsOrders] = useState(true);
  const [orderReport, setOrderReport] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const toggleShowContent = useCallback(() => {
    setShowContent(v => !v)
  }, [])

  const handleOrderDelete = (order) => {
    // console.log(order);
    const butId = order.buy;
    confirm({
      title: translate('confirm_action'),
      content: 'Do you really want to delete the order?',
      dialogProps: { maxWidth: 'xs', fullWidth: false },
      confirmationText: translate('confirm'),
      cancellationText: translate('cancel'),
      confirmationButtonProps: { color: 'error', variant: 'contained', autoFocus: true },
      cancellationButtonProps: { color: 'inherit', variant: 'contained' },
      contentProps: { p: 0, pt: 3 },
    })
      .then(() => {
        axios
          .delete(`${BUY_API.BUY_ORDER}${order.id}`)
          .then(() => {
            enqueueSnackbar('Order has been deleted successfully.');
            dispatch(getBuyOrders(butId));
          })
          .catch(() => {
            enqueueSnackbar('Opps something went wrong', { variant: 'error' });
          });
      })
      .catch(() => {
        // console.log('Cancelled the action');
      });
  };

  useEffect(() => {
    if( orders.length > 0) {
      setIsOrders(true);
      setShowContent(true);
      dispatch(getBuyAction(orders[0].buy, currentPharmacy.id));
    }
  }, [orders])

  const onGenerateReport = () => {
    axios({
          method: 'get',
          url: BUY_API.ORDER_REPORT,
          responseType: 'blob'
        })
      .then((response) => {
        // console.log(response);
        fileDownload(response.data, 'orders_report.txt');
        enqueueSnackbar('Order Report Downloaded.');
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} sx={{ mt: 3 }}>
        <Card>
          <CardHeader title= {translate("list_of_orders")} sx={{ mb: 2, pt: 2 }} 
            action={
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <LoadingButton
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon={showContent ? 'formkit:eyeclosed' : 'ph:eye'} />}
                  onClick={toggleShowContent}
                >
                  {showContent ? translate('hide') : translate('show')}
                </LoadingButton>
              </Stack>
            }
            
          />
          <Scrollbar>
          <Collapse in={showContent}>
            <TableContainer>
              {orderLoading ? (
                <>
                  <Loader />
                </>
              ) : (<>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nº Pedido</TableCell>
                      <TableCell>{translate("Pharmacy")}</TableCell>
                      <TableCell>{translate("Total_Units")}</TableCell>
                      <TableCell>{translate("Sub_Total")}</TableCell>
                      <TableCell>{translate("Discount")}</TableCell>
                      <TableCell>IVA</TableCell>
                      <TableCell>{translate("Recargo")}</TableCell>
                      <TableCell>{translate("total")}</TableCell>
                      <TableCell>{translate("status")}</TableCell>
                      <TableCell>&nbsp;</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders && orders.length ? (
                      orders.map((row) => (
                        <TableRow key={row.id} sx={currentPharmacy.id === row.pharmacy ? { '& > *': { borderBottom: 'unset', backgroundColor: '#03a3683d' }} : { '& > *': { borderBottom: 'unset'}}}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.pharmacy_detail?.name || ''}</TableCell>
                          <TableCell align="center">{row.total_units}</TableCell>
                          <TableCell align="right">{fCurrency(row.sub_total)}</TableCell>
                          <TableCell align="right">{fCurrency(row.discount_amount)}</TableCell>
                          <TableCell align="right">{fCurrency(row.tax_amount)}</TableCell>
                          <TableCell align="right">{fCurrency(row.recargo_amount)}</TableCell>
                          <TableCell align="right">{fCurrency(row.grand_total)}</TableCell>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: '1rem'}}>
                          <Avatar alt={row.name} src={BUY_TYPE_IMAGES[row.status]} sx={{ width: 40, height: 40 }} variant='square'/>
                          </TableCell>

                          <TableCell>
                            <TableMoreMenu currentBuy={currentBuy} order={row} onDelete={() => handleOrderDelete(row)} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          {translate('No_record_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>)}

            </TableContainer>
            </Collapse>
          </Scrollbar>
        </Card>
      </Grid>
    </Grid>
  );
}
