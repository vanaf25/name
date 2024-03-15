import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import "../../css/style.css";
import {
  Card,
  Grid,
  CardHeader,
  CardContent,
  TextField,
  Box,
  Tooltip,
  Typography,
  Stack,
  Autocomplete,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { TextEditor } from 'react-data-grid';

// Components
import BuyInfo from './components/BuyInfo';
import ConditionTooltip from './components/ConditionTooltip';
import CustomDataGrid from '../../components/CustomDataGrid';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import { getBuyNeeds, getBuyCategories, getBuyConditions, getParaBuyNeeds } from '../../redux/slices/buy';

// Hooks
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Utils
import { fCurrency } from '../../utils/formatNumber';
import axios from '../../utils/axios';
import { BUY_API } from '../../constants/ApiPaths';

NeedTable.propTypes = {
  currentBuy: PropTypes.object,
  products: PropTypes.array,
};

export default function NeedTable({ currentBuy, products }) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { currentPharmacy } = useAuth();
  const { catalog } = useSelector((state) => state.buy);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [filters, setFilters] = useState({ category: '', condition: '', keyword: '' });

  const getColor = (discount, maxDiscount) => {
    if (parseInt(discount, 10) === parseInt(maxDiscount, 10)) return 'green';
    if (parseInt(discount, 10) >= parseInt(maxDiscount, 10) * 0.7) return 'red';
    return '';
  };
  
  const onChangeKeywordFilter = (e) => {
    setFilters({ ...filters, keyword: e.target.value });
  };
  const onChangeCategoryFilter = (e, value) => {
    setFilters({ ...filters, category: value?.id || '' });
  };
  const onChangeConditionFilter = (e, value) => {
    setFilters({ ...filters, condition: value?.id || '' });
  };

  const onChangeUnits = (rows, updatedRow) => {
    const [index] = updatedRow.indexes;
    const row = rows[index];
    const units = +row.units;
    const data = { pharmacy: currentPharmacy.id, units, catalog: row.id };
    axios({
      method: row.need ? 'put' : 'post',
      url: row.need ? `${BUY_API.BUY_NEED}${row.need.id}/` : BUY_API.BUY_NEED,
      data,
    })
      .then((response) => {
        // console.log(response);
        enqueueSnackbar('Catalog needs has been updated successfully.');
        dispatch(getBuyNeeds(currentBuy.id, currentPharmacy.id));
        dispatch(getParaBuyNeeds(currentBuy.id, currentPharmacy.id));
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  };

  const columns = useMemo(
    () => [
      {
        key: 'units',
        name: 'UD',
        width: 50,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        formatter({ row }) {
          return row.need?.units || '';
        },
      },
      {
        key: 'adjusted_units',
        name: 'UDA',
        width: 50,
        formatter({ row }) {
          return row.adjusted_units || '';
        },
      },
      {
        key: 'total_units',
        name: 'ΣUD',
        width: 50,
        formatter({ row }) {
          return row.total_units || '';
        },
      },
      {
        key: 'catalog_condition',
        name: 'Condition',
        formatter({ row }) {
          return (
            <Tooltip title={<ConditionTooltip condition={row.catalog_condition} />} arrow>
              {/* <Box component="span">{row.catalog_condition?.name || 'N/A'}</Box> */}
              <Box component="span" sx={{ marginTop: '-10px' }}>
                <Typography variant="subtitle2"> {row.catalog_condition?.name || 'N/A'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {row.discount?.condition_str}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
      },
      {
        key: 'name',
        name: 'Name',
        width: 400,
        formatter({ row }) {
          return (
            <Box sx={{ marginTop: '-10px' }}>
              <Typography variant="subtitle2"> {row.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                EAN: {row.ean} CN: {row.cn}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: 'pvl',
        name: 'PVL',
        width: 40,
        formatter({ row }) {
          return fCurrency(row.pvl);
        },
      },
      {
        key: 'discount',
        name: 'DTO%',
        width: 40,
        formatter({ row }) {
          return (
            <Box sx={{ color: getColor(row.need?.discount || 0, row.max_discount) }}>
              {row.need?.discount || ''}
            </Box>
          );
        },
      },
      {
        key: 'max_discount',
        name: 'Max Discount',
        formatter({ row }) {
          return row.max_discount ? `${row.max_discount}%` : '';
        },
      },
      {
        key: 'net_amount',
        name: 'NETO',
        formatter({ row }) {
          return row.net_amount ? fCurrency(row.net_amount) : '';
        },
      },
      {
        key: 'grand_total',
        name: 'BRUTO',
        formatter({ row }) {
          return row.grand_total ? fCurrency(row.grand_total) : '';
        },
      },
    ],
    [catalogProducts]
  );

  const filterCatalog = () => {
    const keyword = filters.keyword.toLowerCase();

    let catalogs = products;
    if (filters.condition) catalogs = catalogs.filter((row) => (row.catalog_condition?.id || '') === filters.condition);
    if (filters.category) catalogs = catalogs.filter((row) => (row.category?.id || '') === filters.category);
    catalogs = catalogs.filter(
      (row) => row.name.toLowerCase().includes(keyword) || row.cn.includes(keyword) || row.ean.includes(keyword)
    );

    // console.log('DEBUG', {catalogs})

    setCatalogProducts(catalogs);
  };

  useEffect(() => {
    // Filters the catelog products by category, commercial condition, EAN, CN, and Name on change the filters or update products in redux store
    filterCatalog();
  }, [filters, products]);

  useEffect(() => {
    // Get the all categories and conditions for a buy to populate the filters autocomplete fields
    if (!catalog.categories.length) dispatch(getBuyCategories(currentBuy.id));
    if (!catalog.conditions.length) dispatch(getBuyConditions(currentBuy.id));
  }, []);

  return (
    <Grid container spacing={3}  >
      <Grid item xs={12} md={12}>
        <BuyInfo currentBuy={currentBuy} />
      </Grid>
      <Grid item xs={12} md={12}>
        <Card>
          <CardHeader
            title={translate('buy.manage_needs')}
            action={
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Autocomplete
                  id="category"
                  size="small"
                  freeSolo
                  fullWidth
                  sx={{ width: 200 }}
                  options={catalog.categories}
                  getOptionLabel={(option) => option?.name || ''}
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
                  onChange={onChangeConditionFilter}
                  renderInput={(params) => (
                    <TextField {...params} label="Condition" placeholder="Filter by Condition" />
                  )}
                />
                <TextField
                  placeholder="EAN/CN, Name"
                  label="Search"
                  size="small"
                  sx={{ width: 200 }}
                  onChange={onChangeKeywordFilter}
                  value={filters.keyword}
                />
              </Stack>
            }
          />
          <CardContent sx={{ p: 1 }}>
            <CustomDataGrid 
              sx={{  width: '100%', p: 1 }}
              loading={catalog.loadingCatalog}
              rowHeight={55}
              rows={catalogProducts}
              columns={columns}
              onRowsChange={onChangeUnits}
              className="needTableScroll"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
