import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { MenuItem, IconButton } from '@mui/material';
// routes
import { PATH_REPORTS } from '../../../routes/paths';
// components
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

MoreMenu.propTypes = {
  pharmacy: PropTypes.object,
};

export default function MoreMenu({ pharmacy }) {
  const [open, setOpen] = useState(null);
  const { translate } = useLocales();

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
        <MenuItem component={RouterLink} to={`${PATH_REPORTS.pharmacyPurchasing.replace(':pharmacyId', pharmacy.ph)}`}>
          <Iconify icon={'carbon:data-view'} sx={{ ...ICON }} />
          {translate('view')}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
