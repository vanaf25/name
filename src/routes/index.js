import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// components
import LoadingScreen from '../components/LoadingScreen';
// guards
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
import RoleBasedGuard from '../guards/RoleBasedGuard';

// Paths
import { PATH_PAGE } from './paths';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        {
          path: 'registration/account-confirm-email/:confirmationKey',
          element: (
            <GuestGuard>
              <RegisterConfirmEmail />
            </GuestGuard>
          ),
        },
        {
          path: 'password/reset/confirm/:uid/:token',
          element: (
            <GuestGuard>
              <SetPassword />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'verify', element: <VerifyCode /> },
      ],
    },
    {
      path: 'pharmacy',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'register',
          element: (
            <AuthGuard>
              <RegisterPharmacy />
            </AuthGuard>
          ),
        },
        {
          path: 'edit',
          element: (
            <AuthGuard>
              <EditPharmacy />
            </AuthGuard>
          ),
        },
        {
          path: 'price-revision',
          element: (
            <AuthGuard>
              <PriceRevision />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'stock-sold',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'stock-not-sold',
          element: (
            <AuthGuard>
              <StockNotSold />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'buy',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'groups',
          element: (
            <AuthGuard>
              <BuyGroups />
            </AuthGuard>
          ),
        },
        {
          path: 'groups/new',
          element: (
            <AuthGuard>
              <BuyGroupCreate />
            </AuthGuard>
          ),
        },
        {
          path: 'groups/edit/:id',
          element: (
            <AuthGuard>
              <BuyGroupCreate />
            </AuthGuard>
          ),
        },
        {
          path: 'list',
          element: (
            <AuthGuard>
              <BuyList />
            </AuthGuard>
          ),
        },
        {
          path: 'update/:id',
          element: (
            <AuthGuard>
              <BuyCreate />
            </AuthGuard>
          ),
        },
        {
          path: 'new',
          element: (
            <AuthGuard>
              <BuyCreate />
            </AuthGuard>
          ),
        },
        {
          path: 'catalog/:id',
          element: (
            <AuthGuard>
              <BuyCreateCatalog />
            </AuthGuard>
          ),
        },
        {
          path: 'need/:buyId',
          element: (
            <AuthGuard>
              <PharmacyNeed />
            </AuthGuard>
          ),
        },
        {
          path: 'orders/:buyId',
          element: (
            <AuthGuard>
              <BuyOrders />
            </AuthGuard>
          ),
        },
        {
          path: 'order/:id',
          element: (
            <AuthGuard>
              <BuyOrderDetail />
            </AuthGuard>
          ),
        },
        {
          path: 'shipments/:orderId',
          element: (
            <AuthGuard>
              <OrderShipments />
            </AuthGuard>
          ),
        },
        {
          path: 'shipment/:id',
          element: (
            <AuthGuard>
              <OrderShipmentDetail />
            </AuthGuard>
          ),
        },
        {
          path: 'shipment/pharmacy/:id',
          element: (
            <AuthGuard>
              <PharmacyItemsTable />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'reports',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'purchasing',
          element: (
            <AuthGuard>
              <PurchasingReport />
            </AuthGuard>
          ),
        },
        {
          path: 'purchasing/:pharmacyId',
          element: (
            <AuthGuard>
              <PharmacyPurchasingReport />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'user',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'account',
          element: (
            <AuthGuard>
              <UserAccount />
            </AuthGuard>
          ),
        },
        {
          path: 'list',
          element: (
            <AuthGuard>
              <UserList />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to="/dashboard/one" replace />, index: true },
        { path: '/dashboard', element: <Navigate to="/dashboard/one" replace />, index: true },
        { path: '/dashboard/one', element: <PageOne /> },
        { path: '/dashboard/home', element: <RoleBasedGuard accessibleRoles={['ADMIN']}><DashboardSummary /></RoleBasedGuard> },
        { path: '/dashboard/two', element: <PageTwo /> },
        { path: '/dashboard/three', element: <PageThree /> },
        { path: PATH_PAGE.ssKeyInstallation, element: <SSKeyInstallation /> },
        {
          path: '/dashboard/user',
          children: [
            { element: <Navigate to="/dashboard/user/four" replace />, index: true },
            { path: '/dashboard/user/four', element: <PageFour /> },
            { path: '/dashboard/user/five', element: <PageFive /> },
            { path: '/dashboard/user/six', element: <PageSix /> },
          ],
        },
        { path: '/search/product/:id', element: <SearchProductDetail /> },
        { path: '/search/product/PharmacyDetails/:id', element: <SearchPharmacyDetails /> },
      ],
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// Auth
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
const RegisterConfirmEmail = Loadable(lazy(() => import('../pages/auth/RegisterConfirmEmail')));
const SetPassword = Loadable(lazy(() => import('../pages/auth/SetPassword')));

// Dashboard
const DashboardSummary = Loadable(lazy(() => import('../pages/dashboard/dashboardSummary')));
const PageOne = Loadable(lazy(() => import('../pages/PageOne')));
const PageTwo = Loadable(lazy(() => import('../pages/PageTwo')));
const PageThree = Loadable(lazy(() => import('../pages/PageThree')));
const PageFour = Loadable(lazy(() => import('../pages/PageFour')));
const PageFive = Loadable(lazy(() => import('../pages/PageFive')));
const PageSix = Loadable(lazy(() => import('../pages/PageSix')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));

// Pharmacy
const RegisterPharmacy = Loadable(lazy(() => import('../pages/pharmacy/Register')));
const EditPharmacy = Loadable(lazy(() => import('../pages/pharmacy/EditPharmacy')));
const PriceRevision = Loadable(lazy(() => import('../pages/pharmacy/PriceRevision')));

// StockSold
const StockNotSold = Loadable(lazy(() => import('../pages/stocksold/StockNotSold')));

// User
const UserAccount = Loadable(lazy(() => import('../pages/user/UserAccount')));
const UserList = Loadable(lazy(() => import('../pages/user/UserList')));

// Search
const SearchProductDetail = Loadable(lazy(() => import('../pages/search/ProductDetails')));
const SearchPharmacyDetails = Loadable(lazy(() => import('../pages/search/PharmacyDetails')));

// Buy
const BuyGroups = Loadable(lazy(() => import('../pages/buy/Group')));
const BuyGroupCreate = Loadable(lazy(() => import('../pages/buy/GroupCreate')));
const BuyList = Loadable(lazy(() => import('../pages/buy/BuyList')));
const BuyCreate = Loadable(lazy(() => import('../pages/buy/BuyCreate')));
const BuyCreateCatalog = Loadable(lazy(() => import('../pages/buy/BuyCreateCatalog')));
const PharmacyNeed = Loadable(lazy(() => import('../pages/buy/PharmacyNeed')));
const BuyOrders = Loadable(lazy(() => import('../pages/buy/BuyOrders')));
const BuyOrderDetail = Loadable(lazy(() => import('../pages/buy/BuyOrderDetail')));
const OrderShipments = Loadable(lazy(() => import('../pages/buy/OrderShipments')));
const OrderShipmentDetail = Loadable(lazy(() => import('../pages/buy/OrderShipmentDetail')));
const PharmacyItemsTable = Loadable(lazy(() => import('../sections/buy/shipment/PharmacyItemsTable')));

// Reports
const PurchasingReport = Loadable(lazy(() => import('../pages/reports/PurchasingReport')));
const PharmacyPurchasingReport = Loadable(lazy(() => import('../pages/reports/PharmacyPurchasingReport')));

// Pages
const SSKeyInstallation = Loadable(lazy(() => import('../pages/SSKeyInstallation')));
