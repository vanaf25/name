import { createSlice } from '@reduxjs/toolkit';
import { CancelToken } from 'axios';
import { dispatch } from '../store';

// Utils
import axios from '../../utils/axios';

// Paths
import { BUY_API } from '../../constants/ApiPaths';

// Token Varialbles
let cancelAvailableBuy = null;
let cancelParticipatedBuy = null;
let cancelBuyProduct = null;
let cancelBuyOrders = null;

const initialState = {
  isGroupsLoading: false,
  isAvailableBuysLoading: false,
  isParticipatedBuysLoading: false,
  groups: [],
  availableBuys: [],
  participatedBuys: [],
  catalog: {
    categories: [],
    conditions: [],
    products: [],
    loadingCatalog: false,
    needs: [], // Store all needs related to the buy
    paraNeeds: [],
    conditionWiseProducts: {}, // Store the catalog product group by condition
  },
  // Orders
  orderLoading: false,
  buyNeedShorting:'non-para',
  isParaPharamcy:false,
  orders: [],
  buyAction: [],
  buyOrderItem: [],
  buyPharmacyList: [],
  OrderNeedItem: [],
  relatedPharmacy: [],
  conditionSummary: []
};

const slice = createSlice({
  name: 'buy',
  initialState,
  reducers: {
    startGroupLoading(state) {
      state.isGroupsLoading = true;
      state.groups = [];
    },
    // GET GROUPS
    getGroupsSuccess(state, action) {
      state.isGroupsLoading = false;
      state.groups = action.payload;
    },

    startBuyLoading(state) {
      state.isAvailableBuysLoading = true;
      state.isParticipatedBuysLoading = true;
      state.availableBuys = [];
      state.participatedBuys = [];
    },

    // GET BUYS LIST
    getAvailableBuysSuccess(state, action) {
      state.isAvailableBuysLoading = false;
      state.availableBuys = action.payload;
    },

    // GET BUYS LIST
    getParticipatedBuysSuccess(state, action) {
      state.isParticipatedBuysLoading = false;
      state.participatedBuys = action.payload;
    },

     // GET BUYS LIST
     addParticipatedBuysSuccess(state, action) {
      state.isParticipatedBuysLoading = false;
      state.participatedBuys.unshift(action.payload);
    },

    // GET BUY'S CATEGORIES LIST
    getBuyCategoriesSuccess(state, action) {
      state.catalog = {
        ...state.catalog,
        categories: action.payload,
      };
    },

    // GET BUY'S CONDITIONS LIST
    getBuyConditionsSuccess(state, action) {
      state.catalog = {
        ...state.catalog,
        conditions: action.payload,
      };
    },

    // START BUY's Catalog Loading
    startBuyProductLoading(state) {
      state.catalog = {
        ...state.catalog,
        loadingCatalog: true,
        products: [],
      };
    },
    // GET BUY'S Catalog LIST
    getBuyProductsSuccess(state, action) {
      state.catalog = {
        ...state.catalog,
        loadingCatalog: false,
        products: action.payload,
      };
    },
    // GET BUY'S Catalog Needs
    getBuyNeedsSuccess(state, action) {
      state.catalog = {
        ...state.catalog,
        needs: action.payload,
      };
    },
    // GET BUY'S Catalog Needs
    getBuyParaNeedsSuccess(state, action) {
      state.catalog = {
        ...state.catalog,
        paraNeeds: action.payload,
      };
    },
    // Set the state for condition wise products [Group by condition]
    setConditionWiseProducts(state, action) {
      state.catalog = {
        ...state.catalog,
        loadingCatalog: true,
        conditionWiseProducts: action.payload,
      };
    },
    // START GETTING BUY's ORDER
    startOrderLoading(state) {
      state.orderLoading = true;
      state.orders = [];
    },
    // GET BUY'S Order LIST
    getBuyOrderSuccess(state, action) {
      state.orderLoading = false;
      state.orders = action.payload;
    },

    // GET BUY'S Action LIST
    getBuyActionSuccess(state, action) {
      state.buyAction = action.payload;
    },

    // GET BUY'S Order LIST
    getBuyOrderItemSuccess(state, action) {
      state.buyOrderItem = action.payload;
    },

     // GET BUY'S Order LIST
     getBuyNeedShorting(state, action) {
      state.buyNeedShorting = action.payload;
    },

    
      // GET isParaPharamcy
      getIsParaPharamcy(state, action) {
        state.isParaPharamcy = action.payload;
      },

    // GET BUY'S Order LIST
    setBuyOrderItemSuccess(state, action) {
      state.buyOrderItem = action.payload;
    },

    setRelatedPharmacy(state, action) {
      state.relatedPharmacy = action.payload;
    },
    // GET BUY'S Order LIST
    updateBuyOrderItem(state, action) {
      const orderItems = state.buyOrderItem.map((row) => {
        if (row.id === action.payload.id) {
          return action.payload;
        }
        return row;
      });
      state.buyOrderItem = orderItems;
    },

    // GET BUY'S Order LIST
    addBuyOrderItem(state, action) {
      state.buyOrderItem.push(action.payload);
    },

    // GET BUY'S Order LIST
    setBuyPharmacyListSuccess(state, action) {
      state.buyPharmacyList = action.payload;
    },

    // GET BUY'S Order LIST
    setBuyOrderNeedItemsSuccess(state, action) {
      state.OrderNeedItem = action.payload;
    },
    // GET BUY'S Order LIST
    updateBuyOrderNeedItems(state, action) {
      const needItems = state.OrderNeedItem.map((row) => {
        if (row.id === action.payload.id) {
          return action.payload;
        }
        return row;
      });
      state.OrderNeedItem = needItems;
    },

    addBuyOrderNeedItems(state, action) {
      state.OrderNeedItem.push(action.payload)
    },

    setConditionSummary(state, action) {
      state.conditionSummary = action.payload
    },

    // GET BUY'S Order LIST
    updateConditionSummary(state, action) {
      const needItem = state.conditionSummary.map((row) => {
        if (row.id === action.payload.id) {
          return action.payload;
        }
        return row;
      });
      state.conditionSummary = needItem;
    },
  },
});

// Reducers
export default slice.reducer;

// Actions
export const {
  getGroupsSuccess,
  getBuyNeedShorting,
  getIsParaPharamcy,
  getAvailableBuysSuccess,
  getParticipatedBuysSuccess,
  addParticipatedBuysSuccess,
  getBuyCategoriesSuccess,
  getBuyConditionsSuccess,
  getBuyProductsSuccess,
  setConditionWiseProducts,
  setBuyOrderItemSuccess,
  setRelatedPharmacy,
  updateBuyOrderItem,
  addBuyOrderItem,
  setBuyPharmacyListSuccess,
  setBuyOrderNeedItemsSuccess,
  updateBuyOrderNeedItems,
  addBuyOrderNeedItems,
  setConditionSummary,
  updateConditionSummary
} = slice.actions;

// ------------------------------------------------
export function getGroups() {
  return async () => {
    dispatch(slice.actions.startGroupLoading());
    axios
      .get(BUY_API.BUY_GROUP)
      .then((response) => {
        // console.log(response);
        dispatch(slice.actions.getGroupsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getAvailableBuys(search) {
  return async () => {
    dispatch(slice.actions.startBuyLoading());

    // Cancel the previous running request
    if (cancelAvailableBuy) cancelAvailableBuy();

    // Get Available Buy List
    axios
      .get(BUY_API.BUY, {
        params: { list_type: 'NOT_PARTICIPATED', search },
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelAvailableBuy = c;
        }),
      })
      .then((response) => {
        // console.log('Available Buys: ', response);
        dispatch(slice.actions.getAvailableBuysSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getParticipatedBuys(search, currentPharmacyID) {
  return async () => {
    dispatch(slice.actions.startBuyLoading());
    // Cancel the previous request
    if (cancelParticipatedBuy) cancelParticipatedBuy();
    // Get Participated Buy List
    axios
      .get(BUY_API.BUY, {
        params: { list_type: 'PARTICIPATED', search },
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelParticipatedBuy = c;
        }),
      })
      .then((response) => {
        // console.log('Participated Buys: ', response);

        if (response.data.length > 0) {
          response.data.forEach((element) => {
          });
          dispatch(getBuyAction(null, currentPharmacyID));
        }
        
        dispatch(slice.actions.getParticipatedBuysSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyCategories(buyId) {
  return async () => {
    axios
      .get(BUY_API.BUY_CATEGORY, { params: { buy: buyId } })
      .then((response) => {
        // console.log('Buy Categories: ', response);
        dispatch(slice.actions.getBuyCategoriesSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyConditions(buyId) {
  return async () => {
    axios
      .get(BUY_API.BUY_CONDITION, { params: { buy: buyId } })
      .then((response) => {
        // console.log('Buy Conditions: ', response.data);
        dispatch(slice.actions.getBuyConditionsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyProducts(buyId, catalogCondition = null) {
  return async () => {
    // Cancel the previous running request
    if (cancelBuyProduct) cancelBuyProduct();
    dispatch(slice.actions.startBuyProductLoading());
    const queryParams = catalogCondition
      ? { buy: buyId, catalog_condition: catalogCondition === 0 ? null : catalogCondition }
      : { buy: buyId };
    axios
      .get(BUY_API.BUY_PRODUCT, {
        params: queryParams,
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelBuyProduct = c;
        }),
      })
      .then((response) => {
        // console.log('Buy Products: ', response);
        dispatch(slice.actions.getBuyProductsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyNeeds(buyId, pharmacyId = '') {
  // Get the needs for a buy
  return async () => {
    axios
      .get(BUY_API.BUY_NEED, { params: { catalog__buy: buyId, pharmacy: pharmacyId } })
      .then((response) => {
        // console.log('Buy Needs: ', response);
        dispatch(slice.actions.getBuyNeedsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getParaBuyNeeds(buyId, pharmacyId = '') {
  // Get the needs for a buy
  return async () => {
    axios
      .get(BUY_API.BUY_PARA_NEED, { params: { catalog__buy: buyId, pharmacy: pharmacyId } })
      .then((response) => {
        // console.log('Buy PARA Needs: ', response);
        dispatch(slice.actions.getBuyParaNeedsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyOrders(buyId) {
  return async () => {
    // Cancel the previous running request
    if (cancelBuyOrders) cancelBuyOrders();
    dispatch(slice.actions.startOrderLoading());
    axios
      .get(BUY_API.BUY_ORDER, {
        params: { buy: buyId },
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelBuyOrders = c;
        }),
      })
      .then((response) => {
        // console.log('Buy Orders: ', response);
        dispatch(slice.actions.startOrderLoading());
        dispatch(slice.actions.getBuyOrderSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}


export function getBuyAction(buyId = null, pharmacyId = null) {
  // Get the needs for a buy
  return async () => {
    axios
      .get(BUY_API.BUY_ACTION, { params: {pharmacy: pharmacyId } })
      .then((response) => {
        dispatch(slice.actions.getBuyActionSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}

export function getBuyOrderItem(orderId) {
  // Get the needs for a buy
  return async () => {
      axios
      .get(BUY_API.BUY_ORDER_ITEM, { params: { order: orderId } })
      .then((response) => {
        dispatch(slice.actions.setBuyOrderItemSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}


export function getRelatedPharmacy(pharmacyId) {
  // Get the needs for a buy
  return async () => {
    axios
    .get(BUY_API.GET_CURRENT_PHARMACIES, {
        params: { pharmacy: pharmacyId }
    })
    .then((response) => {
        dispatch(slice.actions.setRelatedPharmacy(response.data));
    })
    .catch((error) => {
        // console.log(error);
    })
  };
}
