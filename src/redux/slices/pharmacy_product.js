import { createSlice } from '@reduxjs/toolkit';
import { CancelToken } from 'axios';
import qs from 'qs';
// utils
import { format } from 'date-fns';
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// API PATHS
import { PHARMACY_API, VITALFAR_API, BUY_API } from '../../constants/ApiPaths';

import { VITALFAR_HOST_API } from '../../config';

let cancelClients = null;
let cancelBuyerClients = null;
let cancelIstock = null;
let cancelMarketplaceProducts = null;
let cancelMarketplacePrefProducts = null;
let cancelMarketplaces = null;
let cancelSellersList = null;
let cancelPreferredSellersList = null;

// ----------------------------------------------------------------------
// TODO: TRY const { user, currentPharmacy } = useAuth();
const startTime = new Date();
const endTime = new Date();

const initialState = {
  isLoading: false,
  isLoadingPriceRevision: false,
  isUpdatingPrice: false,
  isToggleSelected: false,
  error: null,
  products: [],
  product: null,
  clients: [],
  buyerClients: [],
  totalIstock: 0,
  sortBy: null,
  filters: {
    pharmacy_id: 0,
    dateRange: [startTime, endTime],
  },
  productPrices: {
    buying_price: 0,
    average_buying_price: 0,
    selling_price: 0,
    competitive_price: 0,
    buying_price_margin: 0,
    selling_price_margin: 0,
    new_selling_price: 0,
  },
  marketplace: {
    isLoadingProducts: false,
    isLoadingPrefProducts: false,
    isLoadingMarketplaces: false,
    products: [],
    preffered_products: [],
    marketplaces: [],
    images: [],
    showicon: false,
  },
  sellers: [],
  preferredSellers: '',
  pharmacyList: [],
};

const slice = createSlice({
  name: 'pharmacy_product',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // Loading Price Revision
    startLoadingPriceRevision(state) {
      state.isLoadingPriceRevision = true;
    },
    endLoadingPriceRevision(state) {
      state.isLoadingPriceRevision = false;
    },
    // RESET STATES for Products and related things
    resetProducts(state) {
      state.products = initialState.products;
      state.product = initialState.product;
      state.clients = initialState.clients;
      state.buyerClients = initialState.buyerClients;
      state.totalIstock = initialState.totalIstock;
      state.productPrices = initialState.productPrices;
      state.marketplace = initialState.marketplace;
    },

    // START LOADING
    startUpdatingPrice(state) {
      state.isUpdatingPrice = true;
    },
    endUpdatingPrice(state) {
      state.isUpdatingPrice = false;
    },

    isToggleSelectedHendler(state) {
      state.isToggleSelected = false;
    },

    // START LOADING
    updatingPriceSuccess(state, action) {
      state.isUpdatingPrice = false;
      let selected = false;
      const updatedData = state.products.map((item) => {
        if (selected) {
          selected = false;
          state.isToggleSelected = true;
          return {
            ...item,
            toggleSelected: true,
          };
        }
        if (state.product.id !== item.id) {
          return {
            ...item,
          };
        }
        selected = true;
        return {
          ...item,
          bpvp1: action.payload,
          toggleSelected: false,
          priceUpdated: true,
        };
      });
      state.products = JSON.parse(JSON.stringify(updatedData));

      // console.log('action.payload', action.payload);
      state.product = { ...state.product, bpvp1: action.payload };
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setNewSellingPrice(state, action) {
      state.productPrices.new_selling_price = action.payload;
    },

    // GET PRODUCTS
    getProductsSuccess(state, action) {
      state.isLoading = false;
      state.products = action.payload;
    },

    // GET CLIENTS
    getClientsSuccess(state, action) {
      state.clients = action.payload;
    },

    // GET BUYER CLIENTS
    getBuyerClientsSuccess(state, action) {
      state.buyerClients = action.payload;
    },

    // GET Total IStock
    getTotalIstockSuccess(state, action) {
      state.totalIstock = action.payload;
    },

    // GET PRODUCTS
    updateProducts(state, action) {
      state.products = action.payload;
    },

    // SET PRODUCT
    setProduct(state, action) {
      state.product = action.payload;
      state.productPrices = initialState.productPrices;
    },

    //  SORT & FILTER PRODUCTS
    sortByProducts(state, action) {
      state.sortBy = action.payload;
    },

    filterProducts(state, action) {
      const tempRange = [action.payload.dateRange[0], action.payload.dateRange[0]];
      const temptodat = [action.payload.dateRange[1], action.payload.dateRange[1]];
      if (!action.payload.dateRange[0]) {
        state.filters.dateRange = temptodat;
      } else if (action.payload.dateRange[1]) {
        state.filters.dateRange = action.payload.dateRange;
      } else {
        state.filters.dateRange = tempRange;
      }
    },

    filterProductsPharmacyDetail(state, action) {
      state.filters.pharmacy_id = action.payload.PharmacyId;
    },

    setProductPrices(state, action) {
      state.productPrices = action.payload;
    },

    // START LOADING MARKETPLACES
    startLoadingMarketplaces(state) {
      state.marketplace = {
        ...state.marketplace,
        isLoadingProducts: true,
        isLoadingPrefProducts: true,
        isLoadingMarketplaces: true,
      };
    },

    showiconMarketplaces(state, action) {
      state.marketplace = {
        ...state.marketplace,
        showicon: action.payload.show,
      };
    },
    // GET MARKETPLACE PRODUCTS
    getMarketplaceProductsSuccess(state, action) {
      state.marketplace = {
        ...state.marketplace,
        isLoadingProducts: false,
        products: action.payload.products,
        images: action.payload.images,
      };
    },

    // GET MARKETPLACE PREFFERED PRODUCTS
    getMarketplacePrefProductsSuccess(state, action) {
      state.marketplace = {
        ...state.marketplace,
        isLoadingPrefProducts: false,
        preffered_products: action.payload,
      };
    },

    // GET MARKETPLACES
    getMarketplacesSuccess(state, action) {
      state.marketplace = {
        ...state.marketplace,
        isLoadingMarketplaces: false,
        marketplaces: action.payload,
      };
    },

    getSellersListSuccess(state, action) {
      state.sellers = action.payload;
    },
    getPreferredSellersSuccess(state, action) {
      state.preferredSellers = action.payload;
    },

    //  Get all pharmacy list
    getPharmacyListSuccess(state, action) {
      // console.log({ action, state });
      state.pharmacyList = action.payload;
      // console.log({ action, state });
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  sortByProducts,
  filterProducts,
  updateProducts,
  setProduct,
  setProductPrices,
  filterProductsPharmacyDetail,
  resetProducts,
  isToggleSelectedHendler,
  showiconMarketplaces,
  getPharmacyListSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

export function getProducts(filters) {
  return async () => {
    dispatch(slice.actions.startLoading());
    dispatch(slice.actions.resetProducts());
    try {
      // todo: we need to add pharmacy_id to the filter
      // Get the price update history
      const priceUpdateHistoryRes = await axios.get(
        `${PHARMACY_API.PRICE_UPDATE_HISTORY}${filters.pharmacy_id}/${format(
          new Date(filters.dateRange[0]),
          'yyyy-MM-dd'
        )}/${format(new Date(filters.dateRange[1]), 'yyyy-MM-dd')}/`
      );

      const priceRevisionRes = await axios.get(
        `${PHARMACY_API.PHARMACY_PRODUCTS}${filters.pharmacy_id}/${format(
          new Date(filters.dateRange[0]),
          'yyyy-MM-dd'
        )}/${format(new Date(filters.dateRange[1]), 'yyyy-MM-dd')}/`
      );

      let updatedPrices = [];
      const priceUpdateHistoryData = priceUpdateHistoryRes.data;
      const priceRevisionData = priceRevisionRes.data;

      if (priceUpdateHistoryData) {
        if (priceUpdateHistoryData.success) {
          updatedPrices = priceUpdateHistoryData.price_update_history;
        }
      }

      if (priceRevisionData) {
        if (priceRevisionData.success) {
          const pricesIDCompra = updatedPrices.map((item) => item.idcompra.toString());
          // Update the price in dataset
          const updatedData = priceRevisionData.data.map((item, index) => {
            if (index === 0) item.toggleSelected = true;
            if (pricesIDCompra.indexOf(item.id.toString()) === -1) {
              return {
                ...item,
              };
            }

            return {
              ...item,
              priceUpdated: true,
            };
          });
          dispatch(slice.actions.getProductsSuccess(updatedData));
        }
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getClients(product, filters) {
  dispatch(slice.actions.startLoadingPriceRevision());
  return () => {
    // If request is already running then cancel it
    if (cancelClients) {
      cancelClients();

      if (cancelBuyerClients) {
        cancelBuyerClients();
      }
    }
    if (cancelIstock) {
      cancelIstock();
    }

    // Get Clients
    dispatch(slice.actions.getClientsSuccess([]));
    axios
      .get(`${PHARMACY_API.PHARMACY_PRODUCT_CLIENTS}${filters.pharmacy_id}/${product.idarticulo}`, {
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelClients = c;
        }),
      })
      .then((response) => {
        dispatch(slice.actions.endLoadingPriceRevision());
        dispatch(slice.actions.getClientsSuccess(response.data.data));

        // Get Buyer clients
        dispatch(slice.actions.getBuyerClientsSuccess([]));
        axios
          .get(`${PHARMACY_API.PHARMACY_PRODUCT_BUYER_CLIENTS}${filters.pharmacy_id}/${product.idarticulo}`, {
            cancelToken: new CancelToken((c) => {
              // An executor function receives a cancel function as a parameter
              cancelBuyerClients = c;
            }),
          })
          .then((response) => {
            dispatch(slice.actions.getBuyerClientsSuccess(response.data.data));
            dispatch(slice.actions.endLoadingPriceRevision());
          })
          .catch((error) => {
            // console.log(error);
            dispatch(slice.actions.endLoadingPriceRevision());
          });
      })
      .catch((error) => {
        // console.log(error);
        dispatch(slice.actions.endLoadingPriceRevision());
      });

    dispatch(slice.actions.getTotalIstockSuccess(0));
    axios
      .get(`${PHARMACY_API.PHARMACY_ISTOCK}${filters.pharmacy_id}/${product.idarticulo}`, {
        cancelToken: new CancelToken((c) => {
          // An executor function receives a cancel function as a parameter
          cancelIstock = c;
        }),
      })
      .then((response) => {
        // console.log('iStock: ', response);
        dispatch(slice.actions.getTotalIstockSuccess(response.data.data.current_stock));
        dispatch(slice.actions.endLoadingPriceRevision());
      })
      .catch((error) => {
        // console.log(error);
        dispatch(slice.actions.endLoadingPriceRevision());
      });
  };
}

// -------------------------------------------------------------------------

export function getMarketplacesProducts(product, prefferedSellersID) {
  return () => {
    dispatch(slice.actions.startLoadingMarketplaces());

    // Cancel Previous running requests
    if (cancelMarketplaceProducts || cancelMarketplacePrefProducts || cancelMarketplaces) {
      cancelMarketplaceProducts();
      cancelMarketplacePrefProducts();
      cancelMarketplaces();
    }

    // Get Marketplaces Products
    axios({
      url: VITALFAR_API.INTERNET_PRICES,
      baseURL: VITALFAR_HOST_API,
      params: { product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplaceProducts = c;
      }),
    })
      .then((resp) => {
        // console.log('Testing', { resp });
        if (resp) {
          const { data } = resp;
          const images = [];
          if (data.length > 0) {
            data.forEach((item) => {
              // Collect all images in an array for use
              if (item.product_image) images.push(item.product_image);
            });
            if (!data.length) {
              dispatch(slice.actions.showiconMarketplaces({ show: true }));
            } else {
              dispatch(slice.actions.showiconMarketplaces({ show: false }));
            }

            dispatch(slice.actions.getMarketplaceProductsSuccess({ products: data, images }));
          }
        } else {
          dispatch(slice.actions.getMarketplaceProductsSuccess({ products: [], images: [] }));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplaceProductsSuccess({ products: [], images: [] }));
      });

    // Get Marketplaces Products for Preffered Sellers
    axios({
      url: VITALFAR_API.INTERNET_PRICES,
      baseURL: VITALFAR_HOST_API,
      params: { seller_id: prefferedSellersID || '728,876', product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplacePrefProducts = c;
      }),
    })
      .then((resp) => {
        if (resp.data) {
          const { data } = resp;
          if(data.length > 0) {
            dispatch(slice.actions.getMarketplacePrefProductsSuccess(data));
          }
        } else {
          dispatch(slice.actions.getMarketplacePrefProductsSuccess([]));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplacePrefProductsSuccess([]));
      });

    // Get Marketplaces for the selected product code
    axios({
      url: VITALFAR_API.PRODUCT_MARKETPLACES,
      baseURL: VITALFAR_HOST_API,
      params: { product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplaces = c;
      }),
    })
      .then((resp) => {
        if (resp.data) {
          if (!resp.data.length) {
            dispatch(slice.actions.showiconMarketplaces({ show: true }));
          } else {
            dispatch(slice.actions.showiconMarketplaces({ show: false }));
          }
          dispatch(slice.actions.getMarketplacesSuccess(resp.data));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplacesSuccess([]));
      });
  };
}

export function getMarketplacesProductsSearch(product, prefferedSellersID) {
  return () => {
    dispatch(slice.actions.startLoadingMarketplaces());
    // Cancel Previous running requests
    if (cancelMarketplaceProducts || cancelMarketplacePrefProducts || cancelMarketplaces) {
      cancelMarketplaceProducts();
      cancelMarketplacePrefProducts();
      cancelMarketplaces();
    }

    // Get Marketplaces Products
    axios({
      url: VITALFAR_API.INTERNET_PRICES,
      baseURL: VITALFAR_HOST_API,
      params: { product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplaceProducts = c;
      }),
    })
      .then((resp) => {
        // console.log(resp);
        if (resp.data) {
          const { data } = resp;
          if(data.length > 0) {
            const images = [];

            data.forEach((item) => {
              // Collect all images in an array for use
              if (item.product_image) images.push(item.product_image);
            });
            dispatch(slice.actions.getMarketplaceProductsSuccess({ products: data, images }));
          }
        } else {
          dispatch(slice.actions.getMarketplaceProductsSuccess({ products: [], images: [] }));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplaceProductsSuccess({ products: [], images: [] }));
      });

    // Get Marketplaces Products for Preffered Sellers
    axios({
      url: VITALFAR_API.INTERNET_PRICES,
      baseURL: VITALFAR_HOST_API,
      params: { seller_id: prefferedSellersID || '728,876', product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplacePrefProducts = c;
      }),
    })
      .then((resp) => {
        if (resp.data) {
          const { data } = resp;
          if(data.length > 0) {
            dispatch(slice.actions.getMarketplacePrefProductsSuccess(data));
          }
        } else {
          dispatch(slice.actions.getMarketplacePrefProductsSuccess([]));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplacePrefProductsSuccess([]));
      });

    // Get Marketplaces for the selected product code
    axios({
      url: VITALFAR_API.PRODUCT_MARKETPLACES,
      baseURL: VITALFAR_HOST_API,
      params: { product_code: product.cn_ean },
      cancelToken: new CancelToken((c) => {
        cancelMarketplaces = c;
      }),
    })
      .then((resp) => {
        if (resp.data) {
          dispatch(slice.actions.getMarketplacesSuccess(resp.data));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getMarketplacesSuccess([]));
      });
  };
}

export function updatePrice(pharmacyId, product, newSellingPrice, enqueueSnackbar) {
  return () => {
    // Update the price in the database
    dispatch(slice.actions.startUpdatingPrice());
    axios
      .post(
        `${PHARMACY_API.PRICE_UPDATE}${pharmacyId}/${product.id}/`,
        qs.stringify({
          price: newSellingPrice,
          date: product.date,
          idarticulo: product.idarticulo,
        })
      )
      .then((response) => {
        // console.log(response);
        dispatch(slice.actions.endUpdatingPrice());
        if (response.data.success) {
          enqueueSnackbar('Price has been updated succesfully');

          // Update the price in dataset
          dispatch(slice.actions.setNewSellingPrice(newSellingPrice));
          dispatch(slice.actions.updatingPriceSuccess(newSellingPrice));
        }
      })
      .catch((error) => {
        // console.log(error);
        dispatch(slice.actions.endUpdatingPrice());
      });
  };
}

export function getSellersList(keyword) {
  return () => {
    // Get Sellers
    // If request is already running then cancel it
    if (cancelSellersList) {
      cancelSellersList();
    }
    axios({
      url: VITALFAR_API.SELLERS_LIST,
      baseURL: VITALFAR_HOST_API,
      params: { search: keyword },
      cancelToken: new CancelToken((c) => {
        cancelSellersList = c;
      }),
    })
      .then((resp) => {
        // console.log(resp);
        if (resp.data) {
          const { results } = resp.data;

          dispatch(slice.actions.getSellersListSuccess(results));
        } else {
          dispatch(slice.actions.getSellersListSuccess([]));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getSellersListSuccess([]));
      });
  };
}

export function getPreferredSellers() {
  return () => {
    // Load the preferred sellers
    // If request is already running then cancel it
    if (cancelPreferredSellersList) {
      cancelPreferredSellersList();
    }
    axios({
      url: PHARMACY_API.PHARMACY_SETTINGS,
      params: { key: 'PREFERRED_SELLERS' },
      cancelToken: new CancelToken((c) => {
        cancelPreferredSellersList = c;
      }),
    })
      .then((resp) => {
        // console.log(resp);
        if (resp.data.length) {
          dispatch(slice.actions.getPreferredSellersSuccess(resp.data[0]));
        } else {
          dispatch(slice.actions.getPreferredSellersSuccess(''));
        }
      })
      .catch((error) => {
        // console.log('Error: ', error);
        if (error.response) {
          console.error(error.response);
        }
        dispatch(slice.actions.getPreferredSellersSuccess(''));
      });
  };
}

export function getCurrentBuyPharmacyList(buyId) {
  return () => {
    axios
      .get(BUY_API.BUY_PARTICIPATED_PHARMACIES, { params: { buy: buyId } })
      .then((response) => {
        const pharmacyListData = [];
        response.data.forEach((element) => {
          if (element.is_needs) {
            pharmacyListData.push(element);
          }
        });
        dispatch(slice.actions.getPharmacyListSuccess(pharmacyListData));
      })
      .catch((error) => {
        // console.log(error);
      });
  };
}
