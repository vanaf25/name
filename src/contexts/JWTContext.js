import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession, removeSession } from '../utils/jwt';

// API Path
import { AUTH_API } from '../constants/ApiPaths';

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  isSentSignupEmail: false, // Email sent for account verification
  signupEmail: null,
  user: null,
  confirmEmailExpired: false,
  currentPharmacy: null,
  settings: null,
  referralCode: null,
  referrer: null,
  sskeyDetail: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      currentPharmacy: user ? user.pharmacy_detail : null,
      settings: user ? user.settings : null,
      sskeyDetail: user ? user.sskey_detail : null,
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      currentPharmacy: user.pharmacy_detail,
      settings: user ? user.settings : null,
      sskeyDetail: user ? user.sskey_detail : null,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  REGISTER: (state, action) => ({
    ...state,
    isSentSignupEmail: true,
    signupEmail: action.payload,
  }),
  CHANGE_STATUS_SIGNUP_EMAIL_FLAG: (state, action) => ({
    ...state,
    isSentSignupEmail: action.payload,
  }),

  CONFIRM_EMAIL_EXPIRED: (state) => ({ ...state, confirmEmailExpired: true }),

  UPDATE_SIGNUP_EMAIL: (state, action) => ({ ...state, signupEmail: action.payload }),

  UPDATE_USER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      user,
      currentPharmacy: user.pharmacy_detail,
      settings: user.settings,
    };
  },
  SET_REFERRAL_CODE: (state, action) => ({
    ...state,
    referralCode: action.payload.referral_code,
    referrer: action.payload.id,
  }),
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  getDetailByEmailConfirmationKey: () => Promise.resolve(),
  userUpdate: () => Promise.resolve(),
  refreshAuthUser: () => Promise.resolve(),
  changeIsSentSignupEmailStatus: () => Promise.resolve(),
  getPharmacySetting: () => Promise.resolve(),
  setReferralCode: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('solosoeAccessToken');

        if (accessToken && isValidToken(accessToken)) {
          removeSession();
          setSession(null);
          setSession(accessToken);

          // console.log("accessToken: ", (accessToken && isValidToken(accessToken)))
          const response = await axios.get(AUTH_API.USER);
          const user = response.data;

          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          // console.log("accessToken1: ", (accessToken && isValidToken(accessToken)))
          removeSession();
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const login = async (email, password) => {
    // Call login api to get token
    const response = await axios.post(AUTH_API.LOGIN, {
      email,
      password,
    });
    const { key } = response.data;
    setSession(key);

    // Call user api to get the logged in user's detail
    const loginResponse = await axios.get(AUTH_API.USER);
    const user = loginResponse.data;
    // console.log(user);
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
    return user;
  };

  const register = async (email, password, firstName, lastName, referrer) => {
    const postData = {
      email,
      password1: password,
      password2: password,
      first_name: firstName,
      last_name: lastName,
      referrer,
    };
    const response = await axios.post(AUTH_API.REGISTER, postData);
    const { detail } = response.data;

    if (detail === 'Verification e-mail sent.')
      dispatch({
        type: 'REGISTER',
        payload: email,
      });
  };

  const getDetailByEmailConfirmationKey = async (key) => {
    try {
      const response = await axios.get(`${AUTH_API.REGISTER}email-confirmation-detail/${key}/`);
      dispatch({ type: 'UPDATE_SIGNUP_EMAIL', payload: response.data.email });
    } catch (error) {
      // console.log(error);
      dispatch({ type: 'CONFIRM_EMAIL_EXPIRED' });
    }
  };

  const userUpdate = async (user) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        user,
      },
    });
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  const refreshAuthUser = async (callback = false) => {
    const response = await axios.get(AUTH_API.USER);
    const user = response.data;

    dispatch({
      type: 'INITIALIZE',
      payload: {
        isAuthenticated: true,
        user,
      },
    });
    if (callback) {
      callback();
    }
  };

  const changeIsSentSignupEmailStatus = (status) => {
    dispatch({
      type: 'CHANGE_STATUS_SIGNUP_EMAIL_FLAG',
      payload: status,
    });
  };

  const setReferralCode = (code) => {
    dispatch({
      type: 'SET_REFERRAL_CODE',
      payload: code,
    });
  };

  const getPharmacySetting = (keyName, settings) => {
    const setting = settings.filter((record) => record.key === keyName);
    return setting.length ? setting[0].value : false;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        getDetailByEmailConfirmationKey,
        userUpdate,
        refreshAuthUser,
        changeIsSentSignupEmailStatus,
        getPharmacySetting,
        setReferralCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
