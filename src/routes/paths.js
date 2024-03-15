// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_PHARMACY = '/pharmacy';
const ROOTS_STOCK = '/stock-sold';
const ROOTS_USER = '/user';
const ROOTS_SEARCH = '/search';
const ROOT_BUY = '/buy';
const ROOT_REPORT = '/reports';
// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  verify: path(ROOTS_AUTH, '/verify'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components',
  ssKeyInstallation: '/sskey-installation-steps',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    conversation: path(ROOTS_DASHBOARD, '/chat/:conversationKey'),
  },
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    newUser: path(ROOTS_DASHBOARD, '/user/new'),
    editById: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
    account: path(ROOTS_DASHBOARD, '/user/account'),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    product: path(ROOTS_DASHBOARD, '/e-commerce/product/:name'),
    productById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    newProduct: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    editById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    invoice: path(ROOTS_DASHBOARD, '/e-commerce/invoice'),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    post: path(ROOTS_DASHBOARD, '/blog/post/:title'),
    postById: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
    newPost: path(ROOTS_DASHBOARD, '/blog/new-post'),
  },
};

export const PATH_PHARMACY = {
  root: ROOTS_PHARMACY,
  register: path(ROOTS_PHARMACY, '/register'),
  edit: path(ROOTS_PHARMACY, '/edit'),
  price_revision: path(ROOTS_PHARMACY, '/price-revision'),
};

export const PATH_STOCK = {
  root: ROOTS_STOCK,
  stock_not_sold: path(ROOTS_STOCK, '/stock-not-sold'),
};

export const PATH_USER = {
  root: ROOTS_USER,
  account: path(ROOTS_USER, '/account'),
  userList: path(ROOTS_USER, '/list'),
  newUser: path(ROOTS_USER, '/create'),
};

export const PATH_SEARCH = {
  root: ROOTS_SEARCH,
  productDetail: path(ROOTS_SEARCH, '/product'),
  PharmacyDetails: path(ROOTS_SEARCH, '/product/PharmacyDetails'),
};

export const PATH_BUY = {
  root: ROOT_BUY,
  groupList: path(ROOT_BUY, '/groups'),
  newGroup: path(ROOT_BUY, '/groups/new'),
  editGroup: path(ROOT_BUY, '/groups/edit/:id'),
  buyList: path(ROOT_BUY, '/list'),
  editbuy: path(ROOT_BUY, '/update/:id'),
  newBuy: path(ROOT_BUY, '/new'),
  buyCatalog: path(ROOT_BUY, '/catalog/:id'),
  pharmacyNeed: path(ROOT_BUY, '/need/:buyId'),
  buyOrders: path(ROOT_BUY, '/orders/:buyId'),
  buyCreateOrder: path(ROOT_BUY, '/orders/:buyId/create/:catalogCondition'),
  buyOrderDetail: path(ROOT_BUY, '/order/:id'),
  buyShipments: path(ROOT_BUY, '/shipments/:orderId'),
  buyShipmentDetail: path(ROOT_BUY, '/shipment/:id'),
  buyShipmentPharmacyDetail: path(ROOT_BUY, '/shipment/pharmacy/:id'),
};

export const PATH_REPORTS = {
  purchasing: path(ROOT_REPORT, '/purchasing'),
  pharmacyPurchasing: path(ROOT_REPORT, '/purchasing/:pharmacyId'),
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';
