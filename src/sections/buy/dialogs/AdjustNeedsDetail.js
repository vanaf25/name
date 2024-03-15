import React, { useState, useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';

import { TextEditor } from 'react-data-grid';

// Components
import CustomDataGrid from '../../../components/CustomDataGrid';
import Iconify from '../../../components/Iconify';

// Utils
import { calculateDiscount, calculateTax } from '../../../utils/calculateTax';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';
import { fCurrency } from '../../../utils/formatNumber';

// Redux
import { useDispatch, useSelector } from '../../../redux/store';
import { setConditionWiseProducts } from '../../../redux/slices/buy';
import useLocales from '../../../hooks/useLocales';

AdjustNeedsDetail.propTypes = {
  needsCatalog: PropTypes.object,
  handleClose: PropTypes.func,
};

function AdjustNeedsDetail({ needsCatalog, handleClose }) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { catalog } = useSelector((state) => state.buy);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogCondition, setCatalogCondition] = useState({});
  const [adjustTo, setAdjustTo] = useState('');
  const [isUpdatingNeeds, setIsUpdatingNeeds] = useState(false);

  const getDiscount = (row) => {
    const discountObj = calculateDiscount(
      row.catalog_condition,
      row.amount,
      row.total_needs + row.total_adjusted_needs
    );
    return discountObj;
  };
  const calculatePercentage = (units, totalUnits) => Math.round((100 * units) / totalUnits);

  const applyAdjustTo = (e, reset = false) => {
    // console.log(reset);
    const totalNewUnits = adjustTo;
    if (!totalNewUnits && !reset) return;

    // Set the flag data is updating
    setIsUpdatingNeeds(true);

    const key = needsCatalog.catalog_condition.id;
    const apiData = [];
    const condition = {};

    let totalAdjusted = 0;

    // Calculate the new units according to the new adjustement values and divide that to all pharmacies
    condition[key] = {
      ...catalog.conditionWiseProducts[key],
      products: catalog.conditionWiseProducts[key].products.map((product) => {
        let adjustedUnits = 0;
        let totalUnits = 0;
        let amount = 0;

        return {
          ...product,
          needs: product.needs.map((need) => {
            const newUnits = !reset ? getNewUnits(need.units_percentage, totalNewUnits) - need.units : 0;
            totalAdjusted += newUnits;
            adjustedUnits += newUnits;
            totalUnits += need.units;
            // Calculate the amount for total units
            amount = (totalUnits + adjustedUnits) * +product.pvl;

            apiData.push({ id: need.id, adjusted_units: newUnits });
            return {
              ...need,
              adjusted_units: newUnits,
              total_units: need.units + newUnits,
            };
          }),
          adjusted_units: adjustedUnits,
          amount,
        };
      }),
    };
    condition[key].total_adjusted_needs = totalAdjusted;
    // console.log('apiData: ', apiData);

    const totalNeeds = condition[key].total_needs + condition[key].total_adjusted_needs;
    let totalAmount = 0;
    let totalIVA = 0;
    let totalRecargo = 0;

    // Calculate the discount for each product and tax to show in the total in need summary
    condition[key] = {
      ...condition[key],
      products: condition[key].products.map((product) => {
        const discountObj = calculateDiscount(condition[key].catalog_condition, product.amount, totalNeeds);
        const taxObj = calculateTax(discountObj?.amount_after_discount || product.amount, product.tax, 0, 0);

        totalAmount += discountObj?.amount_after_discount || 0;
        totalIVA += taxObj.iva.tax_amount;
        totalRecargo += taxObj.recargo.tax_amount;

        return {
          ...product,
          discount: discountObj,
          total_iva: taxObj.iva.tax_amount,
          total_recargo: taxObj.recargo.tax_amount,
          needs: product.needs.map((need) => ({
            ...need,
            units_percentage: calculatePercentage(need.units, condition[key].total_needs),
          })),
        };
      }),
      tax: totalIVA,
      recargo: totalRecargo,
      total: totalAmount + totalIVA + totalRecargo,
    };

    axios({
      method: 'patch',
      url: BUY_API.BUY_NEED_BULK_UPDATE,
      data: apiData,
    })
      .then((response) => {
        // console.log(response);
        dispatch(setConditionWiseProducts({ ...catalog.conditionWiseProducts, ...condition }));
        enqueueSnackbar('Needs has been updated successfully.');
        setIsUpdatingNeeds(false);
      })
      .catch((error) => {
        // console.log(error);
      });
    // dispatch(setConditionWiseProducts({ ...catalog.conditionWiseProducts, ...condition }));
  };

  const onChangeAdjustUnits = (e) => setAdjustTo(e.target.value);
  const resetUnits = () => applyAdjustTo(null, true);

  const getNewUnits = (percent, total) => Math.round((percent / 100) * total);

  const onChangeAdjustedUnits = (rows, updatedRow) => {
    // Handle Needs DataGrid AUD cell change
    // console.log(updatedRow, rows);
    const [rowIndex] = updatedRow.indexes;
    const pharmacyNeed = rows[rowIndex];
    // console.log(pharmacyNeed);

    const key = needsCatalog.catalog_condition.id;
    const apiData = [];
    const condition = {};

    let totalAdjusted = 0;

    // Calculate the new units according to the new adjustement values and divide that to all pharmacies
    condition[key] = {
      ...catalog.conditionWiseProducts[key],
      products: catalog.conditionWiseProducts[key].products.map((product) => {
        let adjustedUnits = 0;
        let totalUnits = 0;
        let amount = 0;

        return {
          ...product,
          needs: product.needs.map((need) => {
            const newUnits = need.id === pharmacyNeed.id ? +pharmacyNeed.adjusted_units : need.adjusted_units;
            totalAdjusted += newUnits;
            adjustedUnits += newUnits;
            totalUnits += need.units;
            // Calculate the amount for total units
            amount = (totalUnits + adjustedUnits) * +product.pvl;

            if (need.id === pharmacyNeed.id) apiData.push({ id: need.id, adjusted_units: newUnits });

            return {
              ...need,
              adjusted_units: newUnits,
              total_units: need.units + newUnits,
            };
          }),
          adjusted_units: adjustedUnits,
          amount,
        };
      }),
    };

    condition[key].total_adjusted_needs = totalAdjusted;
    // console.log('apiData: ', apiData);

    const totalNeeds = condition[key].total_needs + condition[key].total_adjusted_needs;
    let totalAmount = 0;
    let totalIVA = 0;
    let totalRecargo = 0;

    // Calculate the discount for each product and tax to show in the total in need summary
    condition[key] = {
      ...condition[key],
      products: condition[key].products.map((product) => {
        const discountObj = calculateDiscount(condition[key].catalog_condition, product.amount, totalNeeds);
        const taxObj = calculateTax(discountObj?.amount_after_discount || product.amount, product.tax, 0, 0);

        totalAmount += discountObj?.amount_after_discount || 0;
        totalIVA += taxObj.iva.tax_amount;
        totalRecargo += taxObj.recargo.tax_amount;

        return {
          ...product,
          discount: discountObj,
          total_iva: taxObj.iva.tax_amount,
          total_recargo: taxObj.recargo.tax_amount,
          needs: product.needs.map((need) => ({
            ...need,
            units_percentage: calculatePercentage(need.units, condition[key].total_needs),
          })),
        };
      }),
      tax: totalIVA,
      recargo: totalRecargo,
      total: totalAmount + totalIVA + totalRecargo,
    };

    axios({
      method: 'patch',
      url: BUY_API.BUY_NEED_BULK_UPDATE,
      data: apiData,
    })
      .then((response) => {
        // console.log(response);
        dispatch(setConditionWiseProducts({ ...catalog.conditionWiseProducts, ...condition }));
        enqueueSnackbar('Needs has been updated successfully.');
        setIsUpdatingNeeds(false);
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const needsColumn = useMemo(() => [
    {
      key: 'pharmacy',
      name: 'Pharmacy',
      width: 200,
      formatter({ row }) {
        return row.pharmacy_name;
      },
    },
    {
      key: 'units',
      name: 'UD',
      width: 30,
      formatter({ row }) {
        return (
          <Tooltip title={`${row.units_percentage}%`} arrow>
            <Box component="span">{row.units}</Box>
          </Tooltip>
        );
      },
    },
    {
      key: 'adjusted_units',
      name: 'AUD',
      width: 30,
      editor: TextEditor,
      editorOptions: {
        editOnClick: true,
      },
      formatter({ row }) {
        return row.adjusted_units;
      },
    },
    {
      key: 'new_units',
      name: 'Total',
      width: 30,
      formatter({ row }) {
        return row.units + row.adjusted_units;
      },
    },
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const catalogColumns = useMemo(
    () => [
      {
        key: 'name',
        name: 'Name',
        width: 150,
        colSpan(args) {
          return args.type === 'ROW' && args.row.type === 'Need' ? 9 : undefined;
        },
        cellClass(row) {
          return row.type === 'Need' ? 'subrow' : undefined;
        },
        formatter({ row }) {
          if (row.type === 'Need') {
            return (
              <CustomDataGrid
                sx={{ height: 150, width: '100%', p: 1 }}
                columns={needsColumn}
                rows={row.needs}
                style={{ blockSize: 250 }}
                onRowsChange={onChangeAdjustedUnits}
              />
            );
          }
          return row.name;
        },
      },
      {
        key: 'total_units',
        name: 'UD',
      },
      {
        key: 'adjusted_units',
        name: 'AUD',
      },
      {
        key: 'total_needs',
        name: 'ΣUD',
        formatter({ row }) {
          return row.total_units + row.adjusted_units;
        },
      },
      {
        key: 'amount',
        name: 'Sub Total',
        formatter({ row }) {
          return fCurrency(row.amount);
        },
      },
      {
        key: 'discount_amount',
        name: 'Discount',
        formatter({ row }) {
          return `-${fCurrency(row.amount - row.discount?.amount_after_discount || 0)}`;
        },
      },
      {
        key: 'total_iva',
        name: 'IVA',
        formatter({ row }) {
          return fCurrency(row.total_iva);
        },
      },
      {
        key: 'total_recargo',
        name: 'Recargo',
        formatter({ row }) {
          return fCurrency(row.total_recargo);
        },
      },

      {
        key: 'total_amount',
        name: 'Amount',
        formatter({ row }) {
          return fCurrency((row.discount?.amount_after_discount || 0) + row.total_iva + row.total_recargo);
        },
      },
    ],
    [catalogProducts]
  );

  useEffect(() => {
    if (needsCatalog.products === undefined) return;
    const condition = catalog.conditionWiseProducts[needsCatalog.catalog_condition.id];
    // console.log(needsCatalog, condition);
    setCatalogCondition(condition);
    const rows = [];
    condition.products.forEach((element) => {
      rows.push({ ...element, type: 'Catalog' });
      rows.push({ type: 'Need', needs: element.needs });
    });
    setCatalogProducts(rows);
  }, [needsCatalog, catalog.conditionWiseProducts]);

  return (
    <>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <Iconify icon="eva:close-fill" />
          </IconButton>

          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {translate("Prepare_the_needs")}
          </Typography>
          <Button autoFocus color="inherit" onClick={handleClose}>
            {translate("Back")}
          </Button>
        </Toolbar>
      </AppBar>
      <Grid container spacing={3} sx={{ pt: 3, px: 3 }}>
        <Grid item md={8}>
          {catalogProducts.length && (
            <Card>
              <CardContent sx={{ p: 0 }}>
                <CustomDataGrid
                  sx={{ minHeight: '100%', height: '100%', width: '100%', p: 1 }}
                  columns={catalogColumns}
                  rows={catalogProducts}
                  headerRowHeight={45}
                  // style={{ blockSize: '100%' }}
                  rowHeight={(args) => (args.type === 'ROW' && args.row.type === 'Need' ? 200 : 45)}
                  enableVirtualization={false}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
        {catalogCondition?.catalog_condition && (
          <Grid item md={4}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Condition Info"
                action={
                  <Button size="small" onClick={resetUnits}>
                    {translate("reset")}
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {catalogCondition.catalog_condition?.name}
                  </Typography>
                  <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                    {getDiscount(catalogCondition)?.condition_str || ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {translate("Discount")}
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {getDiscount(catalogCondition)?.discount || 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ΣUD
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {catalogCondition.total_needs}
                    </Typography>
                  </Box>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      AUD
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {catalogCondition.total_adjusted_needs}
                    </Typography>
                  </Box>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {translate("Total_Units")}
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {catalogCondition.total_needs + catalogCondition.total_adjusted_needs}
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {translate("Adjust_To")}
                  </Typography>
                  <OutlinedInput
                    value={adjustTo}
                    onChange={onChangeAdjustUnits}
                    placeholder="Enter new units"
                    endAdornment={
                      <InputAdornment position="end">
                        <LoadingButton
                          variant="contained"
                          color="primary"
                          onClick={applyAdjustTo}
                          loading={isUpdatingNeeds}
                        >
                          {translate("Apply")}
                        </LoadingButton>
                      </InputAdornment>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default AdjustNeedsDetail;
