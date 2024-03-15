import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { MenuItem, IconButton } from '@mui/material';
// routes
import { PATH_BUY } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';
import useLocales from '../../../../hooks/useLocales';

// Hooks
import useAuth from '../../../../hooks/useAuth';

// ----------------------------------------------------------------------

GroupMoreMenu.propTypes = {
  onDelete: PropTypes.func,
  onLeave: PropTypes.func,
  group: PropTypes.object,
};

export default function GroupMoreMenu({ onDelete, onLeave, group }) {
  const [open, setOpen] = useState(null);
  const { translate } = useLocales();
  const { user } = useAuth();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const ICON = {
    mr: 2,
    width: 20,
    height: 20,
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          width: 160,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        {group.user.id === user.id ? (
          <>
            <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
              <Iconify icon={'eva:trash-2-outline'} sx={{ ...ICON }} />
              {translate('delete')}
            </MenuItem>

            <MenuItem component={RouterLink} to={`${PATH_BUY.editGroup.replace(':id', group.id)}`}>
              <Iconify icon={'eva:edit-fill'} sx={{ ...ICON }} />
              {translate('edit')}
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={onLeave} sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:minus-circle-outline'} sx={{ ...ICON }} />
            {translate('buy.leave_group')}
          </MenuItem>
        )}
      </MenuPopover>
    </>
  );
}
