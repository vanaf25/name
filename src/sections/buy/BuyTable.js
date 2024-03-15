import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

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
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Typography,
  Avatar,
  TextField,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

import Scrollbar from '../../components/Scrollbar';
import Label from '../../components/Label';
import BuyListHead from './components/BuyListHead';
import BuyMoreMenu from './components/BuyMoreMenu';
import Loader from '../../components/Loader';

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
  getBuyAction,
} from '../../redux/slices/buy';
import { BUY_API } from '../../constants/ApiPaths';

// Constants
import { BUY_TYPE_IMAGES } from '../../constants/AppEnums';

export default function BuyTable() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { currentPharmacy } = useAuth();
  const { availableBuys, participatedBuys, isAvailableBuysLoading, isParticipatedBuysLoading } = useSelector(
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

  const TABLE_HEAD = [
    { id: 'name', label: translate('name'), alignRight: false },
    { id: 'total', label: translate('total'), alignRight: false },
    { id: 'distance', label: translate('distance'), alignRight: false },
    { id: 'status', label: translate('status'), alignRight: false },
    { id: 'created_date', label: translate('created_at'), alignRight: false },
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
          dispatch(getParticipatedBuysSuccess([buyObj, ...participatedBuys]));
          enqueueSnackbar('You have been participated successfully.');
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleLeaveBuy = (buyObj) => {
    // console.log('Leave Buy: ', buyObj);
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
    // dispatch(getBuyAction(null, currentPharmacy.id));
    dispatch(getAvailableBuys(availableBuySearch));
    dispatch(getParticipatedBuys(participatedBuySearch));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(getAvailableBuys(availableBuySearch));
  }, [availableBuySearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(getParticipatedBuys(participatedBuySearch));
  }, [participatedBuySearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <BuyListHead order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onRequestSort={handleRequestSort} />
              <TableBody>
                {availableBuys.length ? (
                  availableBuys.map((row) => (
                    <TableRow key={row.id}>
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
                      <TableCell>{fCurrency(0)}</TableCell>
                      <TableCell>{row?.distance || 'N/A'} KM</TableCell>
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
                        <BuyMoreMenu
                          row={row}
                          onDelete={() => handleDeleteGroup(row.id)}
                          showParticipate
                          onParticipateBuy={() => handleParticipateBuy(row)}
                        />
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
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <BuyListHead order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onRequestSort={handleRequestSort} />
              <TableBody>
                {participatedBuys.length ? (
                  participatedBuys.map((row) => (
                    <TableRow key={row.id}>
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
                      <TableCell>{fCurrency(0)}</TableCell>
                      <TableCell>{row?.distance || 'N/A'} KM</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={row.status === 'OPEN' ? 'success' : 'error'}
                        >
                          {row.status}
                        </Label>
                        <Avatar alt={row.name} src={BUY_TYPE_IMAGES[row.status]} sx={{ width: 40, height: 40 }} variant='square'/>
                      </TableCell>
                      <TableCell>{fDate(row.created_date)}</TableCell>
                      
                      <TableCell align="right">
                        <BuyMoreMenu
                          row={row}
                          onDelete={() => handleDeleteGroup(row.id)}
                          onLeaveBuy={() => handleLeaveBuy(row)}
                        />
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
