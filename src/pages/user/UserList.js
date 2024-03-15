import { useEffect, useState } from 'react';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import { useDispatch, useSelector } from '../../redux/store';

import { getUserList } from '../../redux/slices/user';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';

// Paths
import { UserTable, UserForm } from '../../sections/user';

export default function UserList() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { loadingList, userList } = useSelector((state) => state.user);

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState({});
  const onClose = () => {
    // TODO:: Reset the form on modal close and reset states
    // console.log('Modal closed');
    setOpen(false);
  };

  const onEdit = (row) => {
    // console.log('Opened Edit: ', row);
    setEditUser(row);
    setOpen(true);
  };

  useEffect(() => {
    dispatch(getUserList());
  }, []);

  return (
    <Page title="User List">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={translate('user_management.heading')}
          links={[{ name: translate('user_management.subheading') }]}
          action={
            <Button variant="contained" onClick={() => setOpen(true)} startIcon={<Iconify icon={'eva:plus-fill'} />}>
              {translate('user_management.new_user')}
            </Button>
          }
        />
        <UserTable onEdit={onEdit} users={userList} />
        <Dialog open={open} onClose={onClose}>
          <DialogTitle>{translate('user_management.new_user')}</DialogTitle>
          <DialogContent>
            <UserForm isEdit={false} currentUser={editUser} onClose={onClose} />
          </DialogContent>
        </Dialog>
      </Container>
    </Page>
  );
}
