import { createSlice } from '@reduxjs/toolkit';
import { CancelToken } from 'axios';
import { dispatch } from '../store';

// Utils
import axios from '../../utils/axios';

// Paths
import { BUY_API } from '../../constants/ApiPaths';

// Token Varialbles
let cancelShipmentList = null;
let cancelShipmentItems = null;
let cancelShipmentItemPharmacies = null;
let cancelPharmacyItems = null;

const initialState = {
  // States for Pharmacy Cordinator
  loadingList: false,
  loadingItems: false,
  loadingItemPharmacies: false,
  shipmentList: [],
  shipmentItems: [],
  item_pharmacies: [],
  // States for Pharmacy [Friend]
  loadingPharmacyItems: false,
  pharmacyItems: [],
};

const slice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {
    // Shipments
    startShipmentLoading(state) {
      state.loadingList = true;
    },
    startShipmentItemsLoading(state) {
      state.loadingItems = true;
    },
    startShipmentItemPharmaciesLoading(state) {
      state.loadingItemPharmacies = true;
    },
    getShipmentSuccess(state, action) {
      state.loadingList = false;
      state.shipmentList = action.payload;
    },
    getShipmentItemsSuccess(state, action) {
      state.loadingItems = false;
      state.shipmentItems = action.payload;
    },
    getShipmentItemPharmaciesSuccess(state, action) {
      state.loadingItemPharmacies = false;
      state.item_pharmacies = action.payload;
    },
    addShipment(state, action) {
      state.shipmentList = [...state.shipmentList, action.payload];
    },
    addShipmentItem(state, action) {
      state.pharmacyItems.push(action.payload);
    },
    updateShipmentItem(state, action) {
      const shipmentItems = state.shipmentItems.map((row) => {
        if (row.id === action.payload.id) {
          return action.payload;
        }
        return row;
      });
      state.shipmentItems = shipmentItems;
    },

    // Actions for Pharmacy [Friend]
    startPharmacyItemsLoading(state) {
      state.loadingPharmacyItems = true;
    },

    getPharmacyItemsSuccess(state, action) {
      state.loadingPharmacyItems = false;
      state.pharmacyItems = action.payload;
    },

    updatePharmacyItem(state, action) {
      const pharmacyItems = state.pharmacyItems.map((row) => {
        if (row.id === action.payload.id) {
          return action.payload;
        }
        return row;
      });
      state.pharmacyItems = pharmacyItems;
    },
  },
});

// Reducers
export default slice.reducer;

// Actions
export const { addShipment, addShipmentItem, updateShipmentItem, updatePharmacyItem } = slice.actions;

// ------------------------------------------------

export function getShipmentList(search) {
  // Get the list of shipments for an order and store in the redux store
  return async () => {
    dispatch(slice.actions.startShipmentLoading());

    // Cancel the previous running request
    if (cancelShipmentList) cancelShipmentList();

    // Get Shipment List
    axios
      .get(BUY_API.SHIPMENT, {
        params: search,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelShipmentList = c;
        }),
      })
      .then((response) => {
        // console.log('Shipment List: ', response);
        dispatch(slice.actions.getShipmentSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getShipmentItems(search) {
  // Get the list if items for an shipment and stores in the redux store
  return async () => {
    dispatch(slice.actions.startShipmentItemsLoading());

    // Cancel the previous running request
    if (cancelShipmentItems) cancelShipmentItems();

    // Get Shipment Items
    axios
      .get(BUY_API.SHIPMENT_ITEM, {
        params: search,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelShipmentItems = c;
        }),
      })
      .then((response) => {
        // console.log('Shipment Items: ', response);
        dispatch(slice.actions.getShipmentItemsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getShipmentItemPharmacies(search) {
  // Get the list of pharmacies and ordered units and received units for an shipment items
  return async () => {
    dispatch(slice.actions.startShipmentItemPharmaciesLoading());

    // Cancel the previous running request
    if (cancelShipmentItemPharmacies) cancelShipmentItemPharmacies();

    // Get Shipment Item Pharmacies
    axios
      .get(BUY_API.SHIPMENT_ITEM_PHARMACIES, {
        params: search,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelShipmentItemPharmacies = c;
        }),
      })
      .then((response) => {
        // console.log('Shipment Item Pharmacies: ', response);
        dispatch(slice.actions.getShipmentItemPharmaciesSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getPharmacyItems(search) {
  // Get the list if items for an pharmacy sent from cordinator and stores in the redux store
  return async () => {
    dispatch(slice.actions.startPharmacyItemsLoading());

    // Cancel the previous running request
    if (cancelPharmacyItems) cancelPharmacyItems();

    // Get Pharmacy Items
    axios
      .get(BUY_API.SHIPMENT_PHARMACY_ITEMS, {
        params: search,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelPharmacyItems = c;
        }),
      })
      .then((response) => {
        // console.log('Pharmacy Items: ', response);
        dispatch(slice.actions.getPharmacyItemsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}
