import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { NAVBAR } from '../../../config';
// components
import Logo from '../../../components/Logo';
import Scrollbar from '../../../components/Scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
//
import navConfig from './NavConfig';
import NavbarAccount from './NavbarAccount';
import CollapseButton from './CollapseButton';
// import solosoeLogo from '../../../assets/icons/solosoelargologo.png';
import { ReactComponent as LogoLarge } from './solosoelogolargo.svg'

import SearchDialogModal from '../../../components/SearchDialogModal';
import SearchbarPopover from '../header/SearchbarPopover';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

// ----------------------------------------------------------------------

NavbarVertical.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { translate } = useLocales();
  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } = useCollapseDrawer();
  const isDesktop = useResponsive('up', 'lg');
  const [openSearch, setOpenSearch] = useState(false)

  const handleClose = () => {
    setOpenSearch(false)
    onHoverLeave()
  }

  const handleOpen = (i) => {
    setOpenSearch(true)
    onHoverLeave()
  }

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
          ...(isCollapse && { alignItems: 'center' }),
        }}
      >
        <Stack sx={{ pl: 1, mb: 0, ...(isCollapse && { pl: 5.5, mb: -15 }) }} direction="row" alignItems="center" justifyContent="space-between">
          {isCollapse ? <Logo /> : <LogoLarge style={{ width: 200, height: 44 }} />}
          {isDesktop && !isCollapse && (
            <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
          )}
        </Stack>
        <NavbarAccount isCollapse={isCollapse} />
      </Stack> */}

      <NavSectionVertical navConfig={navConfig} isCollapse={isCollapse} handleOpen1={handleOpen} />

      <Box sx={{ flexGrow: 1 }} />
      <SearchDialogModal
        open={Boolean(openSearch)}
        title={translate('Product_search')}
        onClose={handleClose}
        DialogContentItems={<SearchbarPopover onClose={handleClose} />}
      />
      {/* {!isCollapse && <NavbarDocs />} */}
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: {
          lg: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH,
        },
        ...(collapseClick && {
          position: 'absolute',
        }),
      }}
    >
      {!isDesktop && (
        <Drawer open={isOpenSidebar} onClose={onCloseSidebar} PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH } }}>
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: NAVBAR.DASHBOARD_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: 'background.default',
              transition: (theme) =>
                theme.transitions.create('width', {
                  duration: theme.transitions.duration.standard,
                }),
              ...(isCollapse && {
                width: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
              }),
              ...(collapseHover && {
                ...cssStyles(theme).bgBlur(),
                boxShadow: (theme) => theme.customShadows.z24,
              }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
