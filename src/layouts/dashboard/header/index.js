import { AppBar, Box, Stack, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { format } from 'date-fns';
import CardHeader from '@mui/material/CardHeader';
import { MobileDateRangePicker } from '@mui/lab';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentUtils from '@date-io/moment';

import { useLocation, useParams } from 'react-router-dom';

// ----------------------------------------------------------------------
import IconButton from '@mui/material/IconButton';
// @mui
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/Iconify';
// components
import Logo from '../../../components/Logo';
// config
import { HEADER, NAVBAR } from '../../../config';
// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
import useResponsive from '../../../hooks/useResponsive';
// utils
import cssStyles from '../../../utils/cssStyles';
import { useDispatch, useSelector } from '../../../redux/store';
import BuyNeedHeader from './BuyNeedHeader';
import AccountPopover from './AccountPopover';
import ContactsPopover from './ContactsPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
//
import Searchbar from './Searchbar';
import { filterProducts } from '../../../redux/slices/pharmacy_product';
import BuyListHeader from './BuyListHeader';
import BuyUpDateHeader from './BuyUpDateHeader';
import BuyNewHeader from './BuyNewHeader';
import BuyOrdersHeader from './BuyOrdersHeader';
import BuyEditOrderHeader from './BuyEditOrderHeader';
import BuyOrderShipmentsHeader from './BuyOrderShipmentsHeader';
import BuyCatalogHeader from './BuyCatalogHeader';
import BuyOrderShipmentHeader from './BuyOrderShipmentHeader';

moment.updateLocale('en', {
  week: {
    dow: 1,
  },
});

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse' && prop !== 'isOffset' && prop !== 'verticalLayout',
})(({ isCollapse, isOffset, verticalLayout, theme }) => ({
  ...cssStyles(theme).bgBlur(),
  boxShadow: 'none',
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
  transition: theme.transitions.create(['width', 'height'], {
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up('lg')]: {
    height: HEADER.DASHBOARD_DESKTOP_HEIGHT,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH + 1}px)`,
    ...(isCollapse && {
      width: `calc(100% - ${NAVBAR.DASHBOARD_COLLAPSE_WIDTH}px)`,
    }),
    ...(isOffset && {
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
    }),
    ...(verticalLayout && {
      width: '100%',
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
      backgroundColor: theme.palette.background.default,
    }),
  },
}));

// ----------------------------------------------------------------------

DashboardHeader.propTypes = {
  onOpenSidebar: PropTypes.func,
  isCollapse: PropTypes.bool,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const dispatch = useDispatch();

  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT) && !verticalLayout;
  const { filters } = useSelector((state) => state.pharmacy_product);
  const [openPicker, setOpenPicker] = useState(false);
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const location = useLocation();
  const startTime1 = new Date();

  const { buyId = '' } = useParams();

  useEffect(() => {
    setDateRange(filters.dateRange);
  }, [filters]);

  useEffect(() => {
    const dateRange = [Date(startTime1), Date(startTime1)];
    dispatch(filterProducts({ dateRange }));
  }, [location]);

  const startTime = dateRange[0] || new Date();
  const endTime = dateRange[1] || startTime;
  const isDesktop = useResponsive('up', 'lg');
  const handleClosePicker = () => {
    if (startTime && endTime) {
      dispatch(filterProducts({ dateRange }));
    }
    setOpenPicker(false);
  };
  const handleOpenPicker = () => {
    setDateRange([null, null]);
    setOpenPicker(true);
  };
  const handleChangeDate = (newValue) => {
    setDateRange(newValue);
  };
  return (
    <RootStyle isCollapse={isCollapse} isOffset={isOffset} verticalLayout={verticalLayout}>
      <Toolbar
        sx={{
          minHeight: '100% !important',
          px: { lg: 5 },
        }}
      >
        {isDesktop && verticalLayout && <Logo sx={{ mr: 2.5 }} />}

        {!isDesktop && (
          <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Iconify icon="eva:menu-2-fill" />
          </IconButtonAnimate>
        )}

        <Searchbar />
        {location.pathname === '/pharmacy/price-revision' && (
          <CardHeader
            sx={{ p: 0, ml: 2 }}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#231A18', font: '600' }}>
                <Tooltip title="Choose Date Range">
                  <IconButton size="small" onClick={handleOpenPicker}>
                    <Iconify icon={'eva:calendar-fill'} width={20} height={20} />
                  </IconButton>
                </Tooltip>
                <Typography variant="subtitle2" paragraph sx={{ p: 0, m: 0 }}>
                  {startTime && endTime
                    ? `${format(new Date(startTime), 'dd MMM, yyyy')} - ${format(new Date(endTime), 'dd MMM, yyyy')}`
                    : ''}
                </Typography>
              </Box>
            }
          />
        )}
        <LocalizationProvider dateAdapter={MomentUtils}>
          <MobileDateRangePicker
            open={openPicker}
            onClose={handleClosePicker}
            onOpen={handleOpenPicker}
            value={dateRange}
            onChange={handleChangeDate}
            renderInput={() => {}}
          />
        </LocalizationProvider>
        <Box sx={{ flexGrow: 1 }} />

        {location.pathname.startsWith('/buy/need/') && buyId && <BuyNeedHeader />}
        {location.pathname.startsWith('/buy/list') && <BuyListHeader />}
        {location.pathname.startsWith('/buy/update/') && <BuyUpDateHeader />}
        {location.pathname.startsWith('/buy/new') && <BuyNewHeader />}
        {location.pathname.startsWith('/buy/orders/') && <BuyOrdersHeader />}
        {location.pathname.startsWith('/buy/order/') && <BuyEditOrderHeader />}
        {location.pathname.startsWith('/buy/catalog/') && <BuyCatalogHeader />}
        {location.pathname.startsWith('/buy/shipments/') && <BuyOrderShipmentsHeader />}
        {location.pathname.startsWith('/buy/shipment/') && <BuyOrderShipmentHeader />}

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <LanguagePopover />

          <NotificationsPopover />
          <ContactsPopover />
          <AccountPopover />
        </Stack>
      </Toolbar>
    </RootStyle>
  );
}
