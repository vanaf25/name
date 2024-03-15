import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

// components
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';
import useLocales from '../../../../hooks/useLocales';

// ----------------------------------------------------------------------

TableMoreMenu.propTypes = {
  onDelete: PropTypes.func,
  onDistribution: PropTypes.func,
};

export default function TableMoreMenu({ onDistribution, onDelete }) {
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
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', bproductRadius: 0.75 },
        }}
      >
        <MenuItem onClick={onDistribution}>
          <Iconify icon={'fa6-solid:truck-medical'} sx={{ ...ICON }} />
          {translate("Distribution")}
        </MenuItem>
        <Divider sx={{ bproductStyle: 'dashed' }} />
        <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ ...ICON }} />
          {translate('delete')}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
