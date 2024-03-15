import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import lodashGet from 'lodash/get';

// routes
import { useConfirm } from 'material-ui-confirm';
import {
  Button,
  Card,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Typography,
  Avatar,
  TextField,
  Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import styled from 'styled-components';
import fileDownload from 'js-file-download';

import Scrollbar from '../../components/Scrollbar';
import Label from '../../components/Label';
import BuyListHead from './components/BuyListHead';
import BuyMoreMenu from './components/BuyMoreMenu';
import Loader from '../../components/Loader';
import TableMoreMenu from './order/components/TableMoreMenu';

// utils
import { fDate } from '../../utils/formatTime';
import { fCurrency } from '../../utils/formatNumber';
import axios from '../../utils/axios';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import {
  getAvailableBuys,
  getParticipatedBuys,
  getGroups,
  getAvailableBuysSuccess,
  getParticipatedBuysSuccess,
  getBuyOrders,
  getBuyAction,
  addParticipatedBuysSuccess,
} from '../../redux/slices/buy';
import { BUY_API } from '../../constants/ApiPaths';

// Constants
import {
  BUY_TYPE_IMAGES,
  BLUE_BUY_STATUS,
  RED_BUY_STATUS,
  GREEN_BUY_STATUS,
  BUY_STATUS,
  BUY_STATUS_ORDER,
  CURRENT_BUY_STATUS_IMAGES,
  BUY_STATE,
  BUY_STATUS_TO_INDEX_MAP,
} from '../../constants/AppEnums';

import { PATH_BUY } from '../../routes/paths';
import { PharmacyItemsTable } from './shipment';
// import

const blink = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Styles = styled.div`
  overflow: auto;
  margin-top: 1rem;

  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid #0000002b;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    thead {
      background: #fafafa;
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 10;
    }

    th,
    td {
      position: relative;
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #0000002b;
      border-right: 1px solid #0000002b;
      text-align: center;

      :last-child {
        border-right: 0;
      }
      &:nth-child(5),
      &:nth-child(8),
      &:nth-child(10) {
        border-right: none;
      }
    }
  }
`;

function Row(props) {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { currentPharmacy } = useAuth();
  const navigate = useNavigate();

  const { row, handleDeleteGroup, handleLeaveBuy, theme, buyAction } = props;
  const [open, setOpen] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [shipmentData, setShipmentData] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingShipments, setIsLoadingShipments] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [isShipmentDataLoading, setIsShipmentDataLoading] = useState(true);
  const [isOrderDataLoading, setIsOrderDataLoading] = useState(true);
  const [isOpenSentDialog, setOpenSentDialog] = useState(false);
  const [isReportOrder, setReportOrder] = useState([]);

  const [selectedOrderId, setSelectedOrderId] = useState(-1);
  const [selectedShipmentId, setSelectedShipmentId] = useState(-1);

  const showOrders = selectedOrderId !== -1;

  const showShipments = selectedShipmentId !== -1;

  const hasOrders = !!orderData.length || isLoadingOrders;

  const [clickSent, setClickSent] = useState(0);

  const onGenerateReport = (orderID) => {
    axios({
      method: 'get',
      url: BUY_API.ORDER_REPORT,
      params: { ord: orderID },
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      },
    })
      .then((response) => {
        fileDownload(response.data, 'Order_report.pdf');
        enqueueSnackbar('Order Report Downloaded.');
        setOpenSentDialog(false);
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  };

  const fetchOrderData = useCallback(
    (id, type) => {
      if (isLoadingOrders) {
        return;
      }
      setIsLoadingOrders(true);
      axios
        .get(BUY_API.BUY_ORDER, {
          params: { buy: row.id },
        })
        .then((response) => {
          response.data.forEach((element) => {
            const match = buyAction.find((item1) => item1.buy === element.buy);
            let shipAction = match.action_details[1];
            
            if (type === BUY_STATUS.SENT) {
              shipAction = match.action_details[2];
            }
            
            let foundValue = shipAction.find((item) => Array.isArray(item) && item[0] === element.id);
            
            if (type === BUY_STATUS.RECEIVE){
              shipAction = match.action_details[3];

              const inputData = shipAction.find((item) => Array.isArray(item) && item[0] === element.id);
              
              // Extract the main value
              const mainValue = inputData[0];

              // Extract second elements from the nested lists, ensuring a maximum of 5
              const nestedValues = inputData.slice(1).map(inner => Math.min(inner[1], 5));

              // Check if any value is 5, return 5; otherwise, return the minimum of the second values
              const outputValue = nestedValues.includes(5) ? 5 : Math.min(...nestedValues);

              // Return the main value along with the output value
              foundValue = [mainValue, outputValue];
            }
            element.order_state = foundValue[1];
          });
          
          setOrderData(response.data);
          if (type !== BUY_STATUS.SENT && type !== BUY_STATUS.RECEIVE) {
            if (response.data.length === 1) {
              navigate(PATH_BUY.buyOrderDetail.replace(':id', response.data[0].id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
            if (response.data.length === 0) {
              navigate(PATH_BUY.buyOrders.replace(':buyId', row.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
          } else if (type === BUY_STATUS.SENT){
            if (response.data.length === 1) {
              axios({
                method: 'get',
                url: BUY_API.ORDER_REPORT,
                params: { ord: response.data[0].id },
                responseType: 'blob',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/pdf',
                },
              })
                .then((response) => {
                  fileDownload(response.data, 'Order_report.pdf');
                  dispatch(getBuyAction(null, currentPharmacy.id));
                  enqueueSnackbar('Order Report Downloaded.');
                })
                .catch((error) => {
                  enqueueSnackbar('Oops something went wrong.', {
                    variant: 'error',
                  });
                });

              setSelectedOrderId(-1);
              // navigate(PATH_BUY.buyOrderDetail.replace(':id', response.data[0].id));
            }
            if (response.data.length === 0) {
              navigate(PATH_BUY.buyOrders.replace(':buyId', row.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
          }
          if (type === BUY_STATUS.RECEIVE){
            if(response.data.length === 1) {
              navigate(PATH_BUY.buyShipments.replace(':orderId', response.data[0].id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
          }

          setIsOrderDataLoading(false);
        })
        .catch((error) => {
          // console.log(error);
        })
        .finally(() => {
          setIsLoadingOrders(false);
        });
    },
    [row, isLoadingOrders, buyAction]
  );

  const openOrdersDialog = useCallback(
    (id, type) => {
      setSelectedOrderId(id);
      fetchOrderData(id, type);
    },
    [fetchOrderData]
  );

  const handleCloseDialog = () => {
    setSelectedOrderId(-1);
  };

  const fetchShipmenData = useCallback(
    (id, type) => {
      if (isLoadingOrders) {
        return;
      }
      setIsLoadingShipments(true);

      axios
        .get(BUY_API.SHIPMENT, { params: { buy: row.id } })
        .then((response) => {
          response.data.forEach((element) => {
            const match = buyAction.find((item1) => item1.buy === element.buy_id);
            let shipAction = match.action_details[3];
            if (type === BUY_STATUS.DISTRIBUTE) {
              shipAction = match.action_details[4];
              element.type = 'distribution';
            }
            if (type === BUY_STATUS.PHARMACY_RECEIVE) {
              shipAction = match.action_details[5];
              element.type = 'receiving';
            }

            const foundValue = shipAction
              .filter(Array.isArray)
              .find(
                (arr) =>
                  arr.includes(element.order) &&
                  arr.some((innerArr) => Array.isArray(innerArr) && innerArr.includes(element.id))
              )
              .find((innerArr) => Array.isArray(innerArr) && innerArr.includes(element.id));
            
            // console.log("TESTING", {foundValue, match, type, element, shipAction})
            element.shipment_state = foundValue[1];
          });
          setShipmentData(response.data);

          if (type === BUY_STATUS.PHARMACY_RECEIVE) {
            if (response.data.length === 1) {
              const pharmacyShipment = PATH_BUY.buyShipmentPharmacyDetail.replace(':id', response.data[0].id);
              navigate(pharmacyShipment, {state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
            if (response.data.length === 0) {
              navigate(PATH_BUY.buyShipments.replace(':orderId', response.data[0].order),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
          } 
          // else if (type !== BUY_STATUS.DISTRIBUTE) {
          //   if (response.data.length === 1) {
          //     navigate(PATH_BUY.buyShipments.replace(':orderId', response.data[0].order),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
          //   }
          //   if (response.data.length === 0) {
          //     navigate(PATH_BUY.buyOrders.replace(':buyId', row.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
          //   }
          // }
          if (type === BUY_STATUS.RECEIVE) {
            if (response.data.length === 1) {
              navigate(PATH_BUY.buyShipmentDetail.replace(':id', response.data[0].id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }

            if (response.data.length === 0) {
              axios
                .get(BUY_API.BUY_ORDER, {
                  params: { buy: row.id },
                })
                .then((response) => {
                  const order = response.data.find((item) => item.pharmacy === currentPharmacy.id);
                  navigate(PATH_BUY.buyShipments.replace(':orderId', order.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
                  setIsShipmentDataLoading(false);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
          if (type === BUY_STATUS.DISTRIBUTE) {
            // console.log('TESTING', type);
            // console.log('TESTING', response.data);
            if (response.data.length === 1) {
              // console.log("TESTING", response.data.length)
              navigate(PATH_BUY.buyShipmentDetail.replace(':id', response.data[0].id), {state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
            }
            if (response.data.length === 0) {
              axios
                .get(BUY_API.BUY_ORDER, {
                  params: { buy: row.id },
                })
                .then((response) => {
                  const order = response.data.find((item) => item.pharmacy === currentPharmacy.id);
                  navigate(PATH_BUY.buyShipments.replace(':orderId', order.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
                  setIsShipmentDataLoading(false);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
          // setIsShipmentDataLoading(false)
        })
        .catch((error) => {
          // console.log(error);
        })
        .finally(() => {
          setIsLoadingShipments(false);
        });
    },
    [row, isLoadingOrders, buyAction]
  );

  const openShipmentDialog = useCallback(
    (id, type) => {
      setSelectedShipmentId(id);
      fetchShipmenData(id, type);
    },
    [fetchShipmenData]
  );

  const handleShipmentCloseDialog = () => {
    setSelectedShipmentId(-1);
  };

  const toggleOrderData = useCallback(() => {
    setOpen((open) => {
      const newValue = !open;
      if (newValue) {
        fetchOrderData();
      }
      return newValue;
    });
  }, [fetchOrderData]);

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
            fetchOrderData();
          })
          .catch(() => {
            enqueueSnackbar('Opps something went wrong', { variant: 'error' });
          });
      })
      .catch(() => {
        // console.log('Cancelled the action');
      });
  };

  const getCurrentBuyStatusNew = (row, cellName) => {
    const { buy_status: buyStatus, buy_state: buyState_, id } = row;

    let action = '100000';
    const actionsList = buyAction;
    const actionData = actionsList.find((item) => item.buy === id);
    let actionDetail = [];

    if (actionData) {
      action = actionData.action;
      actionDetail = actionData.action_details;
    }

    const buyState = action.split('')[BUY_STATUS_TO_INDEX_MAP[cellName]];
    let content = null;
    let link = '';

    if (cellName === BUY_STATUS.ENTER_NEEDS) {
      link = PATH_BUY.pharmacyNeed.replace(':buyId', id);
    }

    const avatarSrc = CURRENT_BUY_STATUS_IMAGES[cellName][buyState];
    content = <Avatar src={avatarSrc} sx={{ width: 30, height: 30, cursor: buyState === "3" ? "not-allowed": "pointer" }} variant="square" />;

    if (link) {
      return <RouterLink to={link} state={{buyId:row.id,pharmacyId: currentPharmacy.id}} >{content}</RouterLink>;
    }

    return content;
  };

  const onCurrentBuyClick = (row, cellName) => {
    const { buy_status: buyStatus, buy_state: buyState_, id } = row;

    let action = '100000';
    const actionsList = buyAction;
    const actionData = actionsList.find((item) => item.buy === id);
    let actionDetail = [];

    if (actionData) {
      action = actionData.action;
      actionDetail = actionData.action_details;
    }

    const buyState = action.split('')[BUY_STATUS_TO_INDEX_MAP[cellName]];
    if (buyState !== BUY_STATE.NONE && buyState !== BUY_STATE.DONE) {
      if (
        cellName === BUY_STATUS.DISTRIBUTE ||
        cellName === BUY_STATUS.PHARMACY_RECEIVE
      ) {
        openShipmentDialog(row?.id, cellName);
      } else {
        if(cellName === "RECEIVE")
        {
          setClickSent(2);
        }
        if(cellName === "SENT")
        {
          setClickSent(1);
        }
        if(cellName === "CREATE ORDER"){
          setClickSent(0);
        }
        openOrdersDialog(row?.id, cellName);
      }
    }
  };

  const ReturnShipmentPath = (shipment) => {
    let link = '';
    let content = '';
    if (shipment?.type === 'receiving') {
      link = PATH_BUY.buyShipmentPharmacyDetail.replace(':id', shipment.id);
      content = (
        <Avatar
          src={CURRENT_BUY_STATUS_IMAGES[BUY_STATUS.PHARMACY_RECEIVE][shipment?.shipment_state || '0']}
          sx={{ width: 30, height: 30, cursor: shipment?.shipment_state === 3 ? "not-allowed" : "pointer"}}
          variant="square"
        />
      );
    } else if (shipment?.type === 'distribution') {
      link = PATH_BUY.buyShipmentDetail.replace(':id', shipment.id);
      content = (
        <Avatar
          src={CURRENT_BUY_STATUS_IMAGES[BUY_STATUS.DISTRIBUTE][shipment?.shipment_state || '0']}
          sx={{ width: 30, height: 30, cursor: shipment?.shipment_state === 3 ? "not-allowed" : "pointer"}}
          variant="square"
        />
      );
    } else {
      link = PATH_BUY.buyShipments.replace(':orderId', shipment.order);
      content = (
        <Avatar
          src={CURRENT_BUY_STATUS_IMAGES[BUY_STATUS.RECEIVE][shipment?.shipment_state || '0']}
          sx={{ width: 30, height: 30, cursor: shipment?.shipment_state === 3 ? "not-allowed" : "pointer"}}
          variant="square"
        />
      );
    }
    return <RouterLink  to={link} state={{buyId:row.id,pharmacyId: currentPharmacy.id}}>{content}</RouterLink>;
  };

  const openSentDialog = useCallback((order) => {
    setReportOrder(order);
    setOpenSentDialog(true);
  }, []);

  const openOrderEdit = useCallback((order) => {
    navigate(PATH_BUY.buyOrderDetail.replace(':id', order.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
  })

  const openShipmentCreatePage = useCallback((order) => {
    axios
      .get(BUY_API.SHIPMENT, { params: { order: order.id } })
      .then((response) => {

        navigate(PATH_BUY.buyShipments.replace(':orderId', order.id),{state:{buyId:row.id,pharmacyId: currentPharmacy.id}});
    })
    .catch((error) => {
      // console.log(error);
    })
  })

  const GetDialogBoxItemsIcons = (clickSent) => {
    let status = BUY_STATUS.CREATE_ORDER

    if(clickSent === 1){
      status = BUY_STATUS.SENT
    } else if(clickSent === 2 ){
      status =  BUY_STATUS.RECEIVE
    }

    return status
  }

  const handleSentCloseDialog = () => {
    setOpenSentDialog(false);
    setReportOrder([]);
  };

  const HandleSentDialogBox = () => {
    onGenerateReport(isReportOrder?.id);
  };

  const showBuyOwner = row.is_buy || row.pharmacy === currentPharmacy.id
    ? { '& > *': { borderBottom: 'unset', backgroundColor: '#03a3683d' } }
    : { '& > *': { borderBottom: 'unset' } };

  return (
    <>
      <TableRow sx={showBuyOwner}>
        <TableCell sx={{ width: 160 }} onClick={() => toggleOrderData()}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '200%' }}>
            <Avatar alt={row.name} src={BUY_TYPE_IMAGES[row.type]} sx={{ width: 30, height: 30 }} />
            {BLUE_BUY_STATUS[row.status] ? (
              <img style={{ objectFit: 'contain', height: 25 }} alt={row.name} src={BLUE_BUY_STATUS[row.status]} />
            ) : (
              <Avatar
                style={{ objectFit: 'contain' }}
                alt={row.name}
                src={BLUE_BUY_STATUS[row.status]}
                sx={{ height: 25, width: 48 }}
                variant="square"
              />
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ width: 40 }}>{row?.id || 'N/A'}</TableCell>
        <TableCell sx={{ width: 100 }}>{fDate(row.created_date)}</TableCell>
        <TableCell sx={{ width: 100 }}>{row?.lab_name || 'N/A'}</TableCell>
        <TableCell sx={{ width: 600 }}>{row?.name || 'N/A'}</TableCell>

        <TableCell sx={{ width: 20 }}>{getCurrentBuyStatusNew(row, BUY_STATUS.ENTER_NEEDS)}</TableCell>
        <TableCell
          onClick={() => onCurrentBuyClick(row, BUY_STATUS.CREATE_ORDER)}
          sx={{ cursor: 'pointer', width: 20 }}
        >
          {getCurrentBuyStatusNew(row, BUY_STATUS.CREATE_ORDER)}
        </TableCell>
        <TableCell onClick={() => onCurrentBuyClick(row, BUY_STATUS.SENT)} sx={{ cursor: 'pointer', width: 20 }}>
          {getCurrentBuyStatusNew(row, BUY_STATUS.SENT)}
        </TableCell>
        <TableCell onClick={() => onCurrentBuyClick(row, BUY_STATUS.RECEIVE)} sx={{ cursor: 'pointer', width: 20 }}>
          {getCurrentBuyStatusNew(row, BUY_STATUS.RECEIVE)}
        </TableCell>
        <TableCell onClick={() => onCurrentBuyClick(row, BUY_STATUS.DISTRIBUTE)} sx={{ cursor: 'pointer', width: 20 }}>
          {getCurrentBuyStatusNew(row, BUY_STATUS.DISTRIBUTE)}
        </TableCell>
        <TableCell
          onClick={() => onCurrentBuyClick(row, BUY_STATUS.PHARMACY_RECEIVE)}
          sx={{ cursor: 'pointer', width: 20 }}
        >
          {getCurrentBuyStatusNew(row, BUY_STATUS.PHARMACY_RECEIVE)}
        </TableCell>

        <TableCell sx={{ width: 20 }} align="right">
          <BuyMoreMenu
            row={row}
            onDelete={() => handleDeleteGroup(row.id)}
            disableButton={disableButton}
            onLeaveBuy={() => handleLeaveBuy(row)}
          />
        </TableCell>
      </TableRow>
      {isLoadingOrders && open && (
        <TableRow>
          <TableCell align="center">Loading...</TableCell>
        </TableRow>
      )}
      {!isLoadingOrders &&
        open &&
        (hasOrders ? (
          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                  <Typography variant="h6" gutterBottom component="div">
                    Orders
                  </Typography>
                  <Table size="small" aria-label="purchases">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Pharmacy</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>&nbsp;</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderData.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell component="th" scope="row">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.pharmacy_detail.name}</TableCell>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Avatar
                              alt={order.name}
                              src={BUY_TYPE_IMAGES[order.status]}
                              sx={{ width: 40, height: 40 }}
                              variant="square"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TableMoreMenu currentBuy={row} order={order} onDelete={() => handleOrderDelete(order)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableCell>No Orders</TableCell>
          </TableRow>
        ))}

      <Dialog open={showOrders} onClose={handleCloseDialog} PaperProps={{ sx: { maxWidth: 'none' } }}>
        <DialogContent>
          {orderData.length > 0 ? (
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  <TableCell># Order ID</TableCell>
                  <TableCell>Pharmacy Name</TableCell>
                  <TableCell>Order Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderData.map((order) => (
                  <TableRow key={order.id} sx={{backgroundColor: currentPharmacy.id === order.pharmacy ? "#03a3683d" : ""}}>
                    <TableCell component="th" scope="row">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.pharmacy_detail.name}</TableCell>
                    <TableCell onClick={() => {
                        if (order?.order_state !== 3) {
                          if (clickSent === 1) {
                            openSentDialog(order);
                          } else if (clickSent === 0) {
                            openOrderEdit(order);
                          }
                          else if (clickSent === 2) {
                            openShipmentCreatePage(order);
                          }
                        }
                      }
                    } sx={{ cursor: 'pointer' }}>
                      <Avatar
                        src={
                          CURRENT_BUY_STATUS_IMAGES[
                            GetDialogBoxItemsIcons(clickSent)
                          ][order?.order_state || '1']
                        }
                        sx={{ width: 30, height: 30, cursor: order?.order_state === 3 ? "not-allowed" : "pointer" }}
                        variant="square"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {isOrderDataLoading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  translate('No_record_found')
                )}
              </TableCell>
            </TableRow>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipment box */}
      <Dialog open={showShipments} onClose={handleShipmentCloseDialog} PaperProps={{ sx: { maxWidth: 'none' } }}>
        <DialogContent>
           {/* Conditionally render the Nombre Compra title if shipmentData has elements */}
          {shipmentData.length > 0 && (
              <div style={{paddingBottom: '20px'}}>
                {/* Split the text and apply styling only to the first part */}
                <h2>
                  <span style={{color: 'grey'}}>Compra:</span>
                  {' '}{shipmentData[0].buy_name}
                </h2>
              </div>
          )}
          {shipmentData.length ? (
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Nº Pedido</TableCell>
                    <TableCell>Nº Envio</TableCell>
                    {/* <TableCell>Nombre Compra</TableCell> */}
                  <TableCell>Farmacia que envia</TableCell>
                  <TableCell>Nº Albaran</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipmentData.map((shipment) => (
                  <TableRow key={shipment.id}>
                   <TableCell component="th" scope="row" align="center">
                      {shipment.order}
                    </TableCell>
                    <TableCell component="th" scope="row" align="center">
                      {shipment.id}
                    </TableCell>
                    {/* <TableCell component="th" scope="row">
                      {shipment.buy_name}
                    </TableCell> */}
                    <TableCell component="th" scope="row">
                      {shipment.pharmacy_name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {shipment.shipment_number}
                    </TableCell>
                    <TableCell component="th" scope="row" align="center">
                      {shipment.shipment_date}
                    </TableCell>
                    <TableCell>{ReturnShipmentPath(shipment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {isShipmentDataLoading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  translate('No_record_found')
                )}
              </TableCell>
            </TableRow>
          )}
        </DialogContent>
      </Dialog>

      {/* Sent Order Approval */}
      <Dialog open={isOpenSentDialog} onClose={handleSentCloseDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography>Do you want to download order report ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="contained" onClick={handleSentCloseDialog}>
            Cancel
          </Button>
          <Button color="secondary" variant="contained" onClick={HandleSentDialogBox}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function BuyTable() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { currentPharmacy } = useAuth();
  const { availableBuys, participatedBuys, isAvailableBuysLoading, isParticipatedBuysLoading, buyAction } = useSelector(
    (state) => state.buy
  );
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteBuyId, setDeleteBuyId] = useState(null);
  const [isDeletingBuy, setIsDeletingBuy] = useState(false);
  const [availableBuySearch, setAvailableBuySearch] = useState('');
  const [participatedBuySearch, setParticipatedBuySearch] = useState('');
  const [disableButton, setDisableButton] = useState(false);

  const TABLE_HEAD1 = [
    { id: 'code', label: translate('code'), alignRight: false },
    { id: 'name', label: translate('name'), alignRight: false },
    { id: 'laboratory', label: translate('laboratory'), alignRight: false },
    { id: 'status', label: translate('status'), alignRight: false },
    { id: 'created_date', label: translate('created_at'), alignRight: false },
    { id: '' },
  ];

  const TABLE_HEAD = [
    { id: '' },
    { id: 'code', label: translate('code'), alignRight: false },
    { id: 'date', label: translate('date'), alignRight: false },
    { id: 'laboratory', label: translate('laboratory'), alignRight: false },
    { id: 'name', label: translate('name'), alignRight: false },
    { id: 'need', label: <Tooltip title={translate('buy_tooltip.need')}><Avatar src={BLUE_BUY_STATUS.B_NEEDS} sx={{ width: 30, height: 30 }} /></Tooltip>, alignRight: false },
    { id: 'order', label: <Tooltip title={translate('buy_tooltip.order')}><Avatar src={BLUE_BUY_STATUS.B_ORDERS} sx={{ width: 30, height: 30 }} /></Tooltip>, alignRight: false },
    { id: 'sent', label: <Tooltip title={translate('buy_tooltip.sent')}><Avatar src={BLUE_BUY_STATUS.B_SEND} sx={{ width: 30, height: 30 }} /></Tooltip>, alignRight: false },
    {
      id: 'receive',
      label: <Tooltip title={translate('buy_tooltip.receive')}><Avatar src={BLUE_BUY_STATUS.B_RECEIVE} sx={{ width: 30, height: 30 }} /></Tooltip>,
      alignRight: false,
    },
    {
      id: 'distribut',
      label: <Tooltip title={translate('buy_tooltip.distribute')}><Avatar src={BLUE_BUY_STATUS.B_DISTRIBUT} sx={{ width: 30, height: 30 }} /></Tooltip>,
      alignRight: false,
    },
    {
      id: 'ph_receive',
      label: <Tooltip title={translate('buy_tooltip.ph_receive')}><Avatar src={BLUE_BUY_STATUS.B_PH_RECEIVE} sx={{ width: 30, height: 30 }} /></Tooltip>,
      alignRight: false,
    },
    { id: '' },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteGroup = (groupId) => {
    setDeleteBuyId(groupId);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDelete = () => {
    setIsDeletingBuy(true);
    axios
      .delete(`${BUY_API.BUY}${deleteBuyId}/`)
      .then((response) => {
        setIsDeletingBuy(false);
        if (response.status === 204) {
          // Remove the group into redux store and store new array
          const deleteAvailableBuy = availableBuys.filter((row) => row.id !== deleteBuyId);
          const deleteParticipatedBuy = participatedBuys.filter((row) => row.id !== deleteBuyId);
          dispatch(getAvailableBuysSuccess(deleteAvailableBuy));
          dispatch(getParticipatedBuysSuccess(deleteParticipatedBuy));

          enqueueSnackbar('Buy has been deleted successfully.');
        }

        setOpenConfirm(false);
      })
      .catch((error) => {
        setIsDeletingBuy(false);
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        setOpenConfirm(false);
      });
  };

  const handleParticipateBuy = (buyObj) => {
    // console.log('Participate Buy: ', buyObj);
    setDisableButton(true);
    axios
      .post(BUY_API.BUY_PARTICIPATE, {
        buy: buyObj.id,
        pharmacy: currentPharmacy.id,
        type: buyObj.type,
      })
      .then((response) => {
        if (response.status === 201) {
          const filteredAvailableBuys = availableBuys.filter((row) => row.id !== buyObj.id);
          dispatch(getAvailableBuysSuccess(filteredAvailableBuys));
          dispatch(getBuyAction(null, currentPharmacy.id));
          dispatch(addParticipatedBuysSuccess(buyObj));
          enqueueSnackbar('You have been participated successfully.');
          setDisableButton(false);
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleLeaveBuy = (buyObj) => {
    // console.log('Leave Buy: ', buyObj);
    setDisableButton(false);
    axios
      .delete(`${BUY_API.BUY_PARTICIPATE}${buyObj.id}/`, {
        data: {
          buy: buyObj.id,
          pharmacy: currentPharmacy.id,
        },
      })
      .then((response) => {
        if (response.status === 204) {
          // Remove the buy into participatedBuys and add in the availableBuys
          const filteredParticipatedBuys = participatedBuys.filter((row) => row.id !== buyObj.id);
          dispatch(getParticipatedBuysSuccess(filteredParticipatedBuys));
          dispatch(getAvailableBuysSuccess([buyObj, ...availableBuys]));
          enqueueSnackbar('You have been left successfully.');
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAvailableBuys(availableBuySearch));
  }, [availableBuySearch]);

  useEffect(() => {
    dispatch(getParticipatedBuys(participatedBuySearch, currentPharmacy.id));
  }, [participatedBuySearch]);

  return (
    <>
      <Card>
        <CardHeader
          title={translate('buy.available_buy_list')}
          sx={{ mb: 3 }}
          action={
            <TextField
              name="search"
              label="Search"
              size="small"
              onChange={(e) => {
                setAvailableBuySearch(e.target.value);
              }}
            />
          }
        />
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <BuyListHead order={order} orderBy={orderBy} headLabel={TABLE_HEAD1} onRequestSort={handleRequestSort} />
              <TableBody>
                {availableBuys.length ? (
                  availableBuys.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row?.id || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar alt={row.name} src={BUY_TYPE_IMAGES[row.type]} sx={{ width: 35, height: 35 }} />
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle2"> {row.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {row.type}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{row?.lab_name || 'N/A'}</TableCell>
                      {/* <TableCell>{row?.total_units || fCurrency(0)}</TableCell>
                                            <TableCell>{row?.distance || '0'} KM</TableCell> */}
                      <TableCell>
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={row.status === 'OPEN' ? 'success' : 'error'}
                        >
                          {row.status}
                        </Label>
                      </TableCell>
                      <TableCell>{fDate(row.created_date)}</TableCell>
                      <TableCell align="right">
                        {row.status === 'OPEN' ? (
                          <BuyMoreMenu
                            row={row}
                            onDelete={() => handleDeleteGroup(row.id)}
                            showParticipate
                            disableButton={disableButton}
                            onParticipateBuy={() => handleParticipateBuy(row)}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {isAvailableBuysLoading ? (
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

      {/* PARTICIPATED BUY LIST */}
      <Card sx={{ mt: 5 }}>
        <CardHeader
          title={translate('buy.participated_buy_list')}
          sx={{ mb: 3 }}
          action={
            <TextField
              name="search"
              label="Search"
              size="small"
              onChange={(e) => {
                setParticipatedBuySearch(e.target.value);
              }}
            />
          }
        />
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 1000 }}>
            <Table stickyHeader>
              <BuyListHead order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onRequestSort={handleRequestSort} />
              <TableBody>
                {participatedBuys.length ? (
                  participatedBuys.map((row) => (
                    <Row
                      key={row.name}
                      row={row}
                      handleDeleteGroup={handleDeleteGroup}
                      handleLeaveBuy={handleLeaveBuy}
                      theme={theme}
                      buyAction={buyAction}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" style={{ paddingLeft: '50%' }}>
                      {isParticipatedBuysLoading ? (
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

      {/* Delete Buy Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>{translate('confirm_action')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ pt: 3 }}>{translate('buy.confirm_buy_delete_msg')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleCloseConfirm}>
            {translate('cancel')}
          </Button>
          <LoadingButton onClick={handleDelete} autoFocus color="error" variant="contained" loading={isDeletingBuy}>
            {translate('confirm')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
