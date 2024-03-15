import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

// components
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

NeedSummaryMoreMenu.propTypes = {
  onAdjustNeed: PropTypes.func,
};

export default function NeedSummaryMoreMenu({ onAdjustNeed }) {
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
        <MenuItem onClick={onAdjustNeed}>
          <Iconify icon={'tabler:list-details'} sx={{ ...ICON }} />
          {translate('buy.adjust_needs')}
        </MenuItem>
        {/* <MenuItem
          component={RouterLink}
          to={`${PATH_BUY.buyCreateOrder
            .replace(':buyId', currentBuy.id)
            .replace(':catalogCondition', row.catalog_condition.id)}`}
        >
          <Iconify icon={'carbon:shopping-cart'} sx={{ ...ICON }} />
          {translate('buy.create_order')}
        </MenuItem> */}
      </MenuPopover>
    </>
  );
}
