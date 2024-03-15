import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import {
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

// Components
import Scrollbar from '../../../components/Scrollbar';
import Label from '../../../components/Label';
import GroupListHead from './components/GroupListHead';
import GroupMoreMenu from './components/GroupMoreMenu';
import Loader from '../../../components/Loader';

// utils
import { fDate } from '../../../utils/formatTime';
import axios from '../../../utils/axios';
import useLocales from '../../../hooks/useLocales';
import useAuth from '../../../hooks/useAuth';

// Redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getGroups, getGroupsSuccess } from '../../../redux/slices/buy';
import { BUY_API } from '../../../constants/ApiPaths';

export default function GroupList() {
  const theme = useTheme();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { groups, isGroupsLoading } = useSelector((state) => state.buy);
  const { currentPharmacy } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Leave Group states
  const [openDialogLeave, setOpenDialogLeave] = useState(false);
  const [leaveGroupId, setLeaveGroupId] = useState(null);
  const [leavingGroup, setLeavingGroup] = useState(false);

  const TABLE_HEAD = [
    { id: 'name', label: translate('buy.group_name'), alignRight: false },
    { id: 'group_type', label: translate('buy.group_type'), alignRight: false },
    { id: 'brief', label: translate('buy.brief'), alignRight: false },
    { id: 'pharmacies', label: translate('buy.pharmacies'), alignRight: false },
    { id: 'active', label: translate('active'), alignRight: false },
    { id: 'created_date', label: translate('created_at'), alignRight: false },
    { id: '' },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteGroup = (groupId) => {
    setDeleteGroupId(groupId);
    setOpenConfirm(true);
  };

  const handleLeaveGroup = (groupId) => {
    setLeaveGroupId(groupId);
    setOpenDialogLeave(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setOpenDialogLeave(false);
  };

  const handleDelete = () => {
    setIsDeletingGroup(true);
    axios
      .delete(`${BUY_API.BUY_GROUP}${deleteGroupId}/`)
      .then((response) => {
        setIsDeletingGroup(false);
        if (response.status === 204) {
          // Remove the group into redux store and store new array
          const deleteGroup = groups.filter((group) => group.id !== deleteGroupId);
          dispatch(getGroupsSuccess(deleteGroup));

          enqueueSnackbar('Group has been deleted successfully.');
        }

        setOpenConfirm(false);
      })
      .catch((error) => {
        setIsDeletingGroup(false);
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        setOpenConfirm(false);
      });
  };

  const handleLeave = () => {
    setLeavingGroup(true);
    axios
      .get(BUY_API.LEAVE_GROUP, { params: { group: leaveGroupId, pharmacy: currentPharmacy.id } })
      .then((response) => {
        setLeavingGroup(false);
        if (response.status === 204) {
          // Remove the group into redux store and store new array
          const remainingGroups = groups.filter((group) => group.id !== leaveGroupId);
          dispatch(getGroupsSuccess(remainingGroups));

          enqueueSnackbar('You left the group successfully.');
        }

        setOpenDialogLeave(false);
      })
      .catch((error) => {
        setLeavingGroup(false);
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        setOpenDialogLeave(false);
      });
  };

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  return (
    <Card sx={{ p: 2 }}>
      <Scrollbar>
        <TableContainer>
          <Table>
            <GroupListHead order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onRequestSort={handleRequestSort} />
            <TableBody>
              {groups.length ? (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.group_type}</TableCell>
                    <TableCell>{group.brief}</TableCell>
                    <TableCell>{group.pharmacies.map((item) => `${item.name}, `)}</TableCell>
                    <TableCell>
                      <Label
                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                        color={group.active === true ? 'success' : 'error'}
                      >
                        {group.active ? 'Active' : 'Inactive'}
                      </Label>
                    </TableCell>
                    <TableCell>{fDate(group.created_date)}</TableCell>
                    <TableCell align="right">
                      <GroupMoreMenu
                        group={group}
                        onDelete={() => handleDeleteGroup(group.id)}
                        onLeave={() => handleLeaveGroup(group.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>{translate('confirm_action')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ pt: 3 }}>{translate('buy.confirm_delete_msg')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleCloseConfirm}>
            {translate('cancel')}
          </Button>
          <LoadingButton onClick={handleDelete} autoFocus color="error" variant="contained" loading={isDeletingGroup}>
            {translate('confirm')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Leave Group Confirmation Dialog */}
      <Dialog open={openDialogLeave} onClose={handleCloseConfirm}>
        <DialogTitle>{translate('confirm_action')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ pt: 3 }}>{translate('buy.confirm_leave_msg')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleCloseConfirm}>
            {translate('cancel')}
          </Button>
          <LoadingButton onClick={handleLeave} autoFocus color="error" variant="contained" loading={leavingGroup}>
            {translate('confirm')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
