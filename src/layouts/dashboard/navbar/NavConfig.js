// components
import Iconify from '../../../components/Iconify';
import SvgIconStyle from '../../../components/SvgIconStyle';

// Path
import { PATH_USER, PATH_PHARMACY, PATH_REPORTS } from '../../../routes/paths';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  groups: getIcon('ic_groups'),
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  cart: getIcon('ic_cart'),
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      { title: 'search', isModal: true, icon: <Iconify icon={'eva:search-fill'} width={20} height={20} /> },
      { title: 'dashboard', path: '/dashboard/home', icon: ICONS.dashboard, adminAccessOnly: true },
      { title: 'Price_revision', path: '/pharmacy/price-revision', icon: ICONS.ecommerce },
      {
        title: 'inventory_analysis',
        path: '/stock-sold/stock-not-sold',
        icon: <Iconify icon={'material-symbols:inventory-rounded'} />,
      },
      { title: 'groups', path: '/buy/groups', icon: ICONS.groups },
      { title: 'Buy', path: '/buy/list', icon: ICONS.cart },
      { title: 'Reports', path: PATH_REPORTS.purchasing, icon: ICONS.analytics },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'user',
        path: '/dashboard/user',
        icon: ICONS.user,
        children: [
          { title: 'User List', path: PATH_USER.userList },
          { title: 'My Account', path: PATH_USER.account },
          { title: 'Pharmacy', path: PATH_PHARMACY.edit },
        ],
      },
    ],
  },
];

export default sidebarConfig;
