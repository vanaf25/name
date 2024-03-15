import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import pharmacyProductReducer from './slices/pharmacy_product';
import buyReducer from './slices/buy';
import shipmentReducer from './slices/shipment';
import userReducer from './slices/user';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const productPersistConfig = {
  key: 'pharmacy_product',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'filters'],
};

const rootReducer = combineReducers({
  buy: buyReducer,
  shipment: shipmentReducer,
  user: userReducer,
  pharmacy_product: persistReducer(productPersistConfig, pharmacyProductReducer),
});

export { rootPersistConfig, rootReducer };
