import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

// components
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';
import useLocales from '../../../../hooks/useLocales';
import useAuth from '../../../../hooks/useAuth';

// Paths
import { PATH_BUY } from '../../../../routes/paths';

// ----------------------------------------------------------------------

TableMoreMenu.propTypes = {
  order: PropTypes.object,
  onDelete: PropTypes.func,
};

export default function TableMoreMenu({ currentBuy, order, onDelete }) {
  const [open, setOpen] = useState(null);
  const { translate } = useLocales();
  const { user } = useAuth();
  const { currentPharmacy } = useAuth();

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

  // console.log("ORDER", {currentBuy, currentPharmacy, order})
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

        {(currentPharmacy.id === order.pharmacy || user.id === order.created_by) && (
          <MenuItem component={RouterLink} state={{buyId:order.buy,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.buyOrderDetail.replace(':id', order.id)}`}>
            <Iconify icon={'eva:edit-fill'} sx={{ ...ICON }} />
            {translate('edit')}
          </MenuItem>
        )}
        <MenuItem component={RouterLink} state={{buyId:order.buy,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.buyShipments.replace(':orderId', order.id)}`}>
          <Iconify icon={'carbon:delivery'} sx={{ ...ICON }} />
          {translate('shipment.shipments')}
        </MenuItem>
        {(currentPharmacy.id === order.pharmacy || user.id === order.created_by) && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
              <Iconify icon={'eva:trash-2-outline'} sx={{ ...ICON }} />
              {translate('delete')}
            </MenuItem>
          </>
        )}
      </MenuPopover>
    </>
  );
}
