import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Scrollbar from '../../components/Scrollbar';
import MoreMenu from './components/MoreMenu';
import Loader from '../../components/Loader';

// utils
import useLocales from '../../hooks/useLocales';
import axios from '../../utils/axios';
import { AUTH_API } from '../../constants/ApiPaths';

import { useDispatch, useSelector } from '../../redux/store';
import { getUserSuccess } from '../../redux/slices/user';

UserTable.propTypes = {
  onEdit: PropTypes.func,
  users: PropTypes.array,
};
export default function UserTable({ onEdit, users }) {
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { userList } = useSelector((state) => state.user);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userListLoader, setUserListLoader] = useState(true);

  const onDeleteUser = (userID) => {
    setDeleteUserId(userID);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDelete = () => {
    setIsDeletingUser(true);
    axios
      .delete(`${AUTH_API.USER_MANAGEMENT}${deleteUserId}/`)
      .then((response) => {
        setIsDeletingUser(false);
        if (response.status === 204) {
          // Remove the user into redux store and store new array
          const users = userList.filter((row) => row.id !== deleteUserId);
          setUserListLoader(false)
          dispatch(getUserSuccess(users));
          enqueueSnackbar('User has been deleted successfully.');
        }

        setOpenConfirm(false);
      })
      .catch((error) => {
        // console.log(error);
        setIsDeletingUser(false);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        setOpenConfirm(false);
      });
  };

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 800 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('name')}</TableCell>
                  <TableCell>{translate('pharmacy_register.email_address')}</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>{null}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users && users.length ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.get_full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      
                      {user.is_admin ? (<TableCell>
                        <MoreMenu user={user} onDelete={() => onDeleteUser(user.id)} />
                      </TableCell>)
                      : null}

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={9} align="center">
                        {userListLoader ? (
                          <>
                            <Loader />
                          </>
                        ) : (
                          translate('No_record_found')
                        )}
                      </TableCell>
                  </TableRow>
                  // <TableRow>
                    
                  //   <TableCell colSpan={4} align="center">
                  //     {translate('No_record_found')}
                  //   </TableCell>
                  // </TableRow>
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
          <DialogContentText sx={{ pt: 3 }}>{translate('user_management.delete_confirm_msg')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleCloseConfirm}>
            {translate('cancel')}
          </Button>
          <LoadingButton onClick={handleDelete} autoFocus color="error" variant="contained" loading={isDeletingUser}>
            {translate('confirm')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
