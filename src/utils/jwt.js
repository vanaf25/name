// import jwtDecode from 'jwt-decode';
import { verify, sign } from 'jsonwebtoken';
//
import axios, { axiosRawInstance } from './axios';

// ----------------------------------------------------------------------

const isValidToken = (accessToken) => {
  if (!accessToken || accessToken === 'undefined' || accessToken === undefined) {
    return false;
  }
  return true;
  // ----------------------------------------------------------------------

  // const decoded = jwtDecode(accessToken);
  // const currentTime = Date.now() / 1000;

  // return decoded.exp > currentTime;
};

//  const handleTokenExpired = (exp) => {
//   let expiredTimer;

//   window.clearTimeout(expiredTimer);
//   const currentTime = Date.now();
//   const timeLeft = exp * 1000 - currentTime;
//   // console.log(timeLeft);
//   expiredTimer = window.setTimeout(() => {
//     // console.log('expired');
//     // You can do what ever you want here, like show a notification
//   }, timeLeft);
// };

// ----------------------------------------------------------------------

const setSession = (accessToken) => {
  // console.log('accessToken: ', accessToken);
  if (accessToken) {
    localStorage.setItem('solosoeAccessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Token ${accessToken}`;
    axiosRawInstance.defaults.headers.common.Authorization = `Token ${accessToken}`;
    // This function below will handle when token is expired
    // const { exp } = jwtDecode(accessToken);
    // handleTokenExpired(exp);
  } else {
    localStorage.removeItem('solosoeAccessToken');
    delete axios.defaults.headers.common.Authorization;
    delete axiosRawInstance.defaults.headers.common.Authorization;
  }
};

const removeSession = () => {
  localStorage.removeItem('solosoeAccessToken');
  delete axios.defaults.headers.common.Authorization;
  delete axiosRawInstance.defaults.headers.common.Authorization;
};

export { isValidToken, setSession, verify, sign, removeSession };
