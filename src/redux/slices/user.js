import { createSlice } from '@reduxjs/toolkit';
import { CancelToken } from 'axios';
import { dispatch } from '../store';

// Utils
import axios from '../../utils/axios';

// Paths
import { AUTH_API } from '../../constants/ApiPaths';

// Token Varialbles
let cancelUserList = null;

const initialState = {
  // States for User Management
  loadingList: false,
  userList: [],
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Users
    startUserLoading(state) {
      state.loadingList = true;
    },
    getUserSuccess(state, action) {
      state.loadingList = false;
      state.userList = action.payload;
    },
    addUser(state, action) {
      state.userList = [...state.userList, action.payload];
    },
  },
});

// Reducers
export default slice.reducer;

// Actions
export const { addUser, getUserSuccess } = slice.actions;

// ------------------------------------------------

export function getUserList(search) {
  // Get the list of shipments for an order and store in the redux store
  return async () => {
    dispatch(slice.actions.startUserLoading());

    // Cancel the previous running request
    if (cancelUserList) cancelUserList();

    // Get User List
    axios
      .get(AUTH_API.USER_MANAGEMENT, {
        params: search,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelUserList = c;
        }),
      })
      .then((response) => {
        // console.log('User List: ', response);
        dispatch(slice.actions.getUserSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}
