import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import CircularProgress from '@mui/material/CircularProgress';
import { MenuItem, IconButton, Divider } from '@mui/material';
// routes
import { PATH_BUY } from '../../../routes/paths';
// components
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import useLocales from '../../../hooks/useLocales';
import Loader from '../../../components/Loader';

// Hooks
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

BuyMoreMenu.propTypes = {
  onDelete: PropTypes.func,
  onParticipateBuy: PropTypes.func,
  onLeaveBuy: PropTypes.func,
  row: PropTypes.object,
  showParticipate: PropTypes.bool,
};

export default function BuyMoreMenu({ onDelete, row, showParticipate, onParticipateBuy, onLeaveBuy, disableButton }) {
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
        {user.id !== row.created_by && showParticipate && (
          <>
            {disableButton ?
              <>
                <Loader />
              </>
              : <MenuItem onClick={onParticipateBuy}>
                <Iconify icon={'eva:log-in-fill'} sx={{ ...ICON }} />
                {translate('buy.participate')}
              </MenuItem>
              }
          </>

        )}
        {/* Show the leave button if user joined this buy and there is not any order created yet, after placed a order the user cannot leave buy */}
        {user.id !== row.created_by && !showParticipate && !row.num_of_order > 0 && (
          <MenuItem onClick={onLeaveBuy}>
            <Iconify icon={'eva:log-out-fill'} sx={{ ...ICON }} />
            {translate('buy.leave')}
          </MenuItem>
        )}

        {/* Show the Needs menu if the user joined this buy and there is not any order placed yet */}
        {/* {!showParticipate && !row.num_of_order > 0 && ( */}
          {/* // If user joined the buy */}
          <MenuItem component={RouterLink}  state={{buyId:row.id,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.pharmacyNeed.replace(':buyId', row.id)}`}>
            <Iconify icon={'fluent:book-add-20-regular'} sx={{ ...ICON }} />
            {translate('buy.pharmacy_needs')}
          </MenuItem>
        {/* )} */}
        <MenuItem component={RouterLink}  state={{buyId:row.id,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.buyCatalog.replace(':id', row.id)}`}>
          <Iconify icon={'carbon:data-view'} sx={{ ...ICON }} />
          {translate('buy.view_catalog')}
        </MenuItem>

        {row.has_user && (
          <MenuItem component={RouterLink} state={{buyId:row.id,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.editbuy.replace(':id', row.id)}`}>
            <Iconify icon={'akar-icons:edit'} sx={{ ...ICON }} />
            {translate('edit')}
          </MenuItem>
        )}

        {/* Show the Order menu if the user joined this buy */}
        {!showParticipate && (
          <MenuItem component={RouterLink} state={{buyId:row.id,pharmacyId: currentPharmacy.id}} to={`${PATH_BUY.buyOrders.replace(':buyId', row.id)}`}>
            <Iconify icon={'bxs:shopping-bags'} sx={{ ...ICON }} />
            {translate('buy.catalog_orders')}
          </MenuItem>
        )}

        {(user.id === row.created_by && row.is_order) && (
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
