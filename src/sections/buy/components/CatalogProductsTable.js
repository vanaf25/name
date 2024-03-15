import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Autocomplete,
  TextField,
  Button,
  TableContainer,
  Paper,
} from '@mui/material';
import { debounce } from 'lodash';

import { useBuyCreateCatalogContext } from '../../../pages/buy/BuyCreateCatalog';
// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getBuyCategories, getBuyConditions } from '../../../redux/slices/buy';

// Utils 
import axios, { axiosRawInstance } from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';
import useLocales from '../../../hooks/useLocales';

import CatalogProductFormAdd from './CatalogProductFormAdd';
import DialogModal from '../../../components/DialogModal';

import Loader from '../../../components/Loader'

// Componenets
import ActionMenu from '../dialogs/ActionMenu';
import CatalogProductsTableComponent from './CatalogProductsTableComponent';

CatalogProductsTable.propTypes = {
  currentBuy: PropTypes.object,
  handleEdit: PropTypes.func,
};


const generateRandomItem = (idx) => ({
  id: idx,
  name: `USER ${idx}`,
  email: `EMAIL ${idx}`,
})

const CatalogProductsTableAction = (props) => {
  const { currentBuy, product, handleDelete } = props;
  const [openEditModal, setOpenEditModal] = useState(false);
  const { translate } = useLocales();

  return (
    <>
      <ActionMenu
        onDelete={() => {
          handleDelete(product);
        }}
        onEdit={() => {
          setOpenEditModal(true)
        }}
      />
      <DialogModal
        title={translate('update_product')}
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        DialogContentItems={<CatalogProductFormAdd currentBuy={currentBuy} editProductdata={product} />}
      />
    </>
  )
}

const INITIAL_FILTERS = { category: '', condition: '', keyword: '' }

// eslint-disable-next-line no-unused-vars
export default function CatalogProductsTable({ currentBuy }) {
  const dispatch = useDispatch();
  const { catalog } = useSelector((state) => state.buy);
  const { translate } = useLocales();
  const { setProductLoaderFunction } = useBuyCreateCatalogContext();

  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [products, setProducts] = useState([]);
  const [totalProductCount, setTotalProductCount] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedConditionOption, setSelectedConditionOption] = useState(null);

  const productsRef = useRef(products);
  productsRef.current = products;

  const nextProductsUrlRef = useRef("");
  const didFetchedInitialOnceRef = useRef("");
  const filtersRef = useRef(filters);
  filtersRef.current = filters
  const productsFetchingInProgressRef = useRef(false);

  const loadProducts = useCallback((filtersFromArgs, reset) => {
    if (!reset && ((productsFetchingInProgressRef.current) || (didFetchedInitialOnceRef.current && !nextProductsUrlRef.current))) {
      return Promise.resolve()
    }

    const filters_ = filtersFromArgs || filtersRef.current;

    let axios_ = (nextProductsUrlRef.current ? axiosRawInstance : axios);


    let customRoute = `/${BUY_API.BUY_PRODUCT}?buy=${currentBuy.id}`;
    customRoute += `&name=${filters_.keyword}`;
    customRoute += `&category=${filters_.category}`;
    customRoute += `&condition=${filters_.condition}`;

    let apiRoute = nextProductsUrlRef.current || customRoute;


    if (reset) {
      axios_ = axios;
      apiRoute = customRoute;
    }

    productsFetchingInProgressRef.current = true;

    return axios_
      .get(apiRoute)
      .then((response) => {
        const newProducts = response.data;
        const totalProductCount = response.data.count;
        const nextProductsUrl = response.data.next;
        setProducts(products => reset ? newProducts : products.concat(newProducts));
        setTotalProductCount(totalProductCount);
        didFetchedInitialOnceRef.current = true;
        nextProductsUrlRef.current = nextProductsUrl;
        setLoadingCatalog(false);
        return response
      })
      .catch((error) => {
        // console.log(error);
      }).finally(() => {
        productsFetchingInProgressRef.current = false;
      });
  }, [currentBuy.id]);

  const loadProductsloadProductsDebounced = useMemo(() => debounce(loadProducts, 500), [loadProducts]);

  const handleSetFilter = useCallback((key, value) => {
    let updatedFilters = []

    if ( key === "category"){
       updatedFilters = products.filter((item) => item.category.id === value);
    }
    if ( key === "condition"){
      updatedFilters = products.filter((item) => item.catalog_condition.id === value);
    }

    if ( key === "keyword"){
      updatedFilters = catalog.products.filter((item) =>[ item.ean, item.cn , item.name  ].map(String).some(item => item.includes(value.toUpperCase())));
    }
    
    setProducts(updatedFilters)

    if (value === ''){
      setProducts(catalog.products)
    }

    setFilters(value)
  }, [loadProductsloadProductsDebounced, products])

  const onChangeKeywordFilter = (e) => {
    handleSetFilter('keyword', e.target.value)
  };

  const onChangeCategoryFilter = (_, value) => {
    handleSetFilter('category', value?.id || '');
    setSelectedCategoryOption(value);
  };

  const onChangeConditionFilter = (_, value) => {
    handleSetFilter('condition', value?.id || '')
    setSelectedConditionOption(value);
  };


  const resetFilters = useCallback(() => {
    // console.log("DEBUG: asdf", {INITIAL_FILTERS, loadProducts})
    setFilters(INITIAL_FILTERS);
    productsFetchingInProgressRef.current = false
    setSelectedCategoryOption('');
    setSelectedConditionOption('');
    setProducts(catalog.products)
  }, [loadProductsloadProductsDebounced])


  useEffect(() => {
    setProducts(catalog.products);
  }, [catalog.products]);

  useEffect(() => {
    // Get the all categories and conditions for a buy to populate the filters autocomplete fields
    if (!catalog.categories.length) dispatch(getBuyCategories(currentBuy.id));
    if (!catalog.conditions.length) dispatch(getBuyConditions(currentBuy.id));
  }, []);

  useEffect(() => {
    if (!didFetchedInitialOnceRef.current) {
      loadProducts(null, true);
    }
  }, [loadProducts]);


  useEffect(() => {
    setProductLoaderFunction(() => () => {
      loadProducts(null, true);
    })
  }, [setProductLoaderFunction, loadProducts]);



  return (
    <> {loadingCatalog ? (
      <>
        <Loader />
      </>
    ) : (
      <> <Stack direction="column" spacing={1}>

        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1} sx={{ pl: 0.5, pb: 0.5, }}>
          <Autocomplete
            id="category"
            size="small"
            freeSolo
            fullWidth
            sx={{ width: 200 }}
            options={catalog.categories}
            getOptionLabel={(option) => option?.name || ''}
            value={selectedCategoryOption}
            onChange={onChangeCategoryFilter}
            renderInput={(params) => <TextField {...params} label="Category" placeholder="Filter by Category" />}
          />
          <Autocomplete
            id="conditions"
            size="small"
            freeSolo
            fullWidth
            sx={{ width: 200 }}
            options={catalog.conditions}
            getOptionLabel={(option) => option?.name || ''}
            value={selectedConditionOption}
            onChange={onChangeConditionFilter}
            renderInput={(params) => <TextField {...params} label={translate("Condition")} placeholder="Filter by Condition" />}
          />
          <TextField
            placeholder="EAN/CN, Name"
            label={translate('Search')}
            size="small"
            sx={{ width: 200 }}
            onChange={onChangeKeywordFilter}
            value={filters.keyword}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </Stack>

        <TableContainer component={Paper} sx={{ flex: '1' }}>
          <CatalogProductsTableComponent
            products={products}
            totalProductsCount={totalProductCount}
            loadProducts={loadProducts} />
        </TableContainer>
      </Stack>

      </>
    )}
    </>
  );
}

CatalogProductsTableAction.propTypes = {
  currentBuy: PropTypes.object,
  product: PropTypes.object,
  handleDelete: PropTypes.func,
};