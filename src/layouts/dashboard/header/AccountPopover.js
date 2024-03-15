import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { capitalCase } from 'change-case';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar } from '@mui/material';
// components
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
// Hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useLocales from '../../../hooks/useLocales';

// Path
import { PATH_USER, PATH_AUTH } from '../../../routes/paths';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Account',
    linkTo: PATH_USER.account,
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATH_AUTH.login, { replace: true });

      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar
          src={user?.photo || `https://ui-avatars.com/api/?name=${user.get_full_name}`}
          alt={capitalCase(`${user.get_full_name}`)}
        />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {capitalCase(`${user.get_full_name}`)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} to={option.linkTo} component={RouterLink} onClick={handleClose}>
              {translate(option.label)}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem sx={{ m: 1 }} onClick={handleLogout}>
          {translate('Logout')}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
