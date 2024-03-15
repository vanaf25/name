import PropTypes from 'prop-types';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// pages
import Login from '../pages/auth/Login';
// components
import LoadingScreen from '../components/LoadingScreen';
// paths
import { PATH_PHARMACY, PATH_PAGE } from '../routes/paths';

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized, user, sskeyDetail } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState(null);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  }

  // If user didn't register any pharmacy yet then redirect to register pharmacy that is required to use site
  if ((!user.pharmacyuser_set.length || !sskeyDetail) && pathname !== PATH_PHARMACY.register) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={PATH_PHARMACY.register} />;
  }

  // If user didn't install the sskey software on the pharmacy pc then redirect to the installtion instruction page
  if (user.pharmacyuser_set.length && (!sskeyDetail?.ss_key_ip || false) && pathname !== PATH_PAGE.ssKeyInstallation) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={PATH_PAGE.ssKeyInstallation} />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}
