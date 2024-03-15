/* eslint-disable-next-line jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
// @mui
import { MobileDateRangePicker } from '@mui/lab';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useWindowSize } from '../../hooks/useResponsive';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import { setProductPrices, updatePrice, filterProducts } from '../../redux/slices/pharmacy_product';

// Hooks
import useLocales from '../../hooks/useLocales';
// Utils
import { fCurrency } from '../../utils/formatNumber';

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  backgroundColor: theme.palette.primary.lighter,
}));

const bgDanger = {
  bgcolor: 'rgb(244, 67, 54)',
  color: '#fff',
};
const bgWarning = {
  bgcolor: 'rgb(255, 152, 0)',
};
const bgSuccess = {
  bgcolor: 'rgb(76, 175, 80)',
  color: '#fff',
};

export default function ProductPrices() {
  const dispatch = useDispatch();
  const { product, products, productPrices, totalIstock, filters, isUpdatingPrice } = useSelector(
    (state) => state.pharmacy_product
  );
  const { translate } = useLocales();
  const { height } = useWindowSize();

  const { enqueueSnackbar } = useSnackbar();

  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [openPicker, setOpenPicker] = useState(false);

  const startTime = new Date();
  const endTime = new Date();

  const handleChangeDate = (newValue) => {
    setDateRange(newValue);
  };

  const handleOpenPicker = () => {
    setOpenPicker(true);
  };

  const handleClosePicker = () => {
    if (startTime && endTime) {
      dispatch(filterProducts({ dateRange }));
    }
    setOpenPicker(false);
  };

  const calculateMargins = (sellingPrice) => {
    const buyingPrice = productPrices.buying_price;

    const sellingMargin = ((sellingPrice - buyingPrice) / sellingPrice) * 100;
    const buyingMargin = ((sellingPrice - buyingPrice) / buyingPrice) * 100;

    dispatch(
      setProductPrices({
        ...productPrices,
        buying_price_margin: buyingMargin.toFixed(2),
        selling_price_margin: sellingMargin.toFixed(2),
        new_selling_price: sellingPrice,
      })
    );
  };

  const copyPriceToNewSellingPrice = (price) => {
    calculateMargins(price);
  };

  const onChangeBuyingPriceMargin = (event) => {
    // Formula S=B*(1+MB) then MS=(S-B)/S
    const buyingMargin = parseFloat(event.target.value);
    const buyingPrice = productPrices.buying_price;

    const newSellingPrice = buyingPrice * (1 + buyingMargin / 100);
    const sellingMargin = ((newSellingPrice - buyingPrice) / newSellingPrice) * 100;

    dispatch(
      setProductPrices({
        ...productPrices,
        buying_price_margin: buyingMargin,
        selling_price_margin: sellingMargin,
        new_selling_price: newSellingPrice,
      })
    );
  };

  const onChangeSellingPriceMargin = (event) => {
    // Formulas S=B/(1-MS) then MB=(S-B)/B

    const sellingMargin = parseFloat(event.target.value);
    const buyingPrice = productPrices.buying_price;

    const newSellingPrice = buyingPrice / (1 - sellingMargin / 100);
    const buyingMargin = ((newSellingPrice - buyingPrice) / buyingPrice) * 100;

    dispatch(
      setProductPrices({
        ...productPrices,
        buying_price_margin: buyingMargin,
        selling_price_margin: sellingMargin,
        new_selling_price: newSellingPrice,
      })
    );
  };

  const onChangeNewSellingPrice = (event) => {
    if (event.value === 'increment') {
      const newprice = productPrices.new_selling_price + 0.1;
      calculateMargins(newprice);
    } else if (event.value === 'decrement') {
      const newprice = productPrices.new_selling_price - 0.1;
      calculateMargins(newprice);
    } else if (event.value === 0) {
      const newprice = Math.trunc(productPrices.new_selling_price);
      calculateMargins(newprice);
    } else if (event.value === 0.45) {
      const tempvalu = Math.trunc(productPrices.new_selling_price);
      const newprice = tempvalu + 0.45;
      calculateMargins(newprice);
    } else if (event.value === 0.95) {
      const tempvalu = Math.trunc(productPrices.new_selling_price);
      const newprice = tempvalu + 0.95;
      calculateMargins(newprice);
    } else {
      calculateMargins(event.target.value);
    }
  };

  const getMarginInputStyles = (type) => {
    let styles = {};
    if (type === 'Margin') {
      const margin = productPrices.selling_price_margin;
      if (margin > 0 && margin < 10) {
        styles = bgDanger;
      } else if (margin >= 10 && margin < 25) {
        styles = bgWarning;
      } else if (margin >= 25) {
        styles = bgSuccess;
      }
    }

    if (type === 'NewSalePrice') {
      const buyingPrice = productPrices.buying_price;
      const newSellingPrice = productPrices.new_selling_price;
      if (newSellingPrice < buyingPrice || (products.length > 0 && newSellingPrice > products[0].sale_price)) {
        styles = bgDanger;
      }
    }
    return styles;
  };

  const updatePriceSubmit = () => {
    if (product && productPrices.new_selling_price > 0) {
      dispatch(updatePrice(filters.pharmacy_id, product, productPrices.new_selling_price, enqueueSnackbar));
    }
  };

  const conTwoDecDigit = (digit = 0) => {
    digit = digit.toString();
    if (digit.indexOf('.') > 0) {
      if (digit.split('.').length >= 2) {
        const twofixedDecimalDigit = `${digit.split('.')[0]}.${digit.split('.')[1].substring(-1, 2)}`;
        return twofixedDecimalDigit;
      }
    }
    return digit;
  };

  const isNumber = (digit) => {
    if (Number.isNaN(digit)) {
      return 0;
    }
    return digit;
  };

  return (
    <RootStyle
      sx={{
        padding: '10px',
        backgroundColor: '#f4f6f8',
        minHeight: (height - height * 0.1) / 8,
        font: '#231A18',
        fontWeight: '600',
        height: '165px',
        overflow: 'auto',
      }}
    >
      <CardHeader
        sx={{ p: 0, color: '#231A18', fontWeight: '600' }}
        subheader={
          <Typography variant="subtitle1" paragraph sx={{ display: 'table', width: '100%', marginBottom: '5px' }}>
            {product && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', flexFlow: 'row wrap' }}>
                <div style={{ display: 'table-cell', fontSize: '12px' }}>{product.cn_ean}</div>
                <div
                  title={product.name}
                  style={{
                    fontSize: '12px',
                    maxWidth: '60%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.name}
                </div>
                <Typography variant="subtitle2" paragraph style={{ marginBottom: '0' }}>
                  {translate('Total_iStock')}: {totalIstock}
                </Typography>
              </div>
            )}
          </Typography>
        }
      />
      <MobileDateRangePicker
        open={openPicker}
        onClose={handleClosePicker}
        onOpen={handleOpenPicker}
        value={dateRange}
        onChange={handleChangeDate}
        renderInput={() => {}}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Tooltip title={translate('price_revision.purchase_price')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: 'auto',
              alignItems: 'center',
              margin: '5px 0 0',
              minWidth: '100px',
            }}
          >
            <p style={{ fontSize: '12px' }}>PC:</p>
            <Chip
              label={`${fCurrency(productPrices.buying_price)}`}
              color="warning"
              style={{ fontSize: '12px', padding: 0, height: '22px' }}
              onClick={() => {
                copyPriceToNewSellingPrice(productPrices.buying_price);
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title={translate('price_revision.average_purchase_price')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: 'auto',
              alignItems: 'center',
              margin: '5px 0 0',
              minWidth: '100px',
            }}
          >
            <p style={{ fontSize: '12px' }}>PCM:</p>
            <Chip
              label={`${fCurrency(productPrices.average_buying_price)}`}
              color="warning"
              style={{ fontSize: '12px', padding: 0, height: '22px' }}
              onClick={() => {
                copyPriceToNewSellingPrice(productPrices.average_buying_price);
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title={translate('price_revision.sale_price')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: 'auto',
              alignItems: 'center',
              margin: '5px 0 0',
              minWidth: '100px',
            }}
          >
            <p style={{ fontSize: '12px' }}>PV:</p>
            <Chip
              label={`${fCurrency(productPrices.selling_price)}`}
              color="warning"
              style={{ fontSize: '12px', padding: 0, height: '22px' }}
              onClick={() => {
                copyPriceToNewSellingPrice(productPrices.selling_price);
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title={translate('price_revision.competitive_price')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: 'auto',
              alignItems: 'center',
              margin: '5px 0 0',
              minWidth: '100px',
            }}
          >
            <p style={{ fontSize: '12px' }}>CP:</p>
            <Chip
              label={`${fCurrency(productPrices.competitive_price)}`}
              color="warning"
              style={{ fontSize: '12px', padding: 0, height: '22px' }}
              onClick={() => {
                copyPriceToNewSellingPrice(productPrices.competitive_price);
              }}
            />
          </div>
        </Tooltip>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        // divider={<Divider orientation="vertical" flexItem />}
        sx={{ mt: 1 }}
      >
        <Stack spacing={1}>
          <FormControl variant="outlined">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tooltip title={translate('price_revision.margin_on_purchase')}>
                <Typography sx={{ justifyContent: 'flex-end', fontSize: '12px', textOverflow: 'ellipsis' }}>
                  {translate('price_revision.margin_on_purchase')}
                </Typography>
              </Tooltip>

              <OutlinedInput
                id="marginOnPurchase"
                type="number"
                variant="outlined"
                step="any"
                value={conTwoDecDigit(isNumber(productPrices.buying_price_margin))}
                onChange={onChangeBuyingPriceMargin}
                endAdornment={
                  <InputAdornment sx={{ m: 0, textOverflow: 'ellipsis' }} position="end">
                    %
                  </InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                onFocus={(event) => event.target.select()}
                inputProps={{
                  style: {
                    width: '100px',
                    padding: '5px',
                  },
                }}
                sx={{ width: '32%', height: '35px', fontSize: '12px', ...getMarginInputStyles('Margin') }}
              />
            </div>
          </FormControl>
          <FormControl variant="outlined">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ justifyContent: 'flex-end', fontSize: '12px', textOverflow: 'ellipsis' }}>
                {translate('price_revision.margin_on_sale')}
              </Typography>
              <OutlinedInput
                id="marginOnSale"
                type="number"
                variant="outlined"
                step="any"
                value={conTwoDecDigit(isNumber(productPrices.selling_price_margin))}
                onChange={onChangeSellingPriceMargin}
                endAdornment={
                  <InputAdornment sx={{ m: 0, textOverflow: 'ellipsis' }} position="end">
                    %
                  </InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                onFocus={(event) => event.target.select()}
                inputProps={{
                  style: {
                    width: '100px',
                    padding: '5px',
                  },
                }}
                sx={{ width: '32%', height: '35px', fontSize: '12px', ...getMarginInputStyles('Margin') }}
              />
            </div>
          </FormControl>
        </Stack>
        <Stack>
          <FormControl variant="outlined">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                margin: '8px',
              }}
            >
              <OutlinedInput
                id="newSalePrice"
                variant="outlined"
                step="any"
                value={conTwoDecDigit(isNumber(productPrices.new_selling_price))}
                onChange={onChangeNewSellingPrice}
                aria-describedby="outlined-weight-helper-text"
                sx={{ height: '45px', ...getMarginInputStyles('NewSalePrice') }}
                onFocus={(event) => event.target.select()}
                onKeyDown={(e) => {
                  if (e.code === 'ArrowUp') {
                    onChangeNewSellingPrice({ value: 'increment' });
                  }
                  if (e.code === 'ArrowDown') {
                    onChangeNewSellingPrice({ value: 'decrement' });
                  }
                }}
                inputProps={{
                  style: {
                    width: '60px',
                    height: '100%',
                  },
                }}
              />
            </div>
          </FormControl>
          <Stack direction="row" justifyContent="center">
            <LoadingButton
              variant="contained"
              color="warning"
              size="small"
              sx={{ height: '25px', fontSize: '12px', minWidth: '25px', p: 0, fontWeight: '100' }}
              onClick={() => onChangeNewSellingPrice({ value: 0.0 })}
            >
              .00
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color="warning"
              size="small"
              sx={{ height: '25px', fontSize: '12px', minWidth: '25px', ml: 0.5, mr: 0.5, p: 0, fontWeight: '100' }}
              onClick={() => onChangeNewSellingPrice({ value: 0.45 })}
            >
              .45
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color="warning"
              size="small"
              sx={{ height: '25px', fontSize: '12px', minWidth: '25px', p: 0, fontWeight: '100' }}
              onClick={() => onChangeNewSellingPrice({ value: 0.95 })}
            >
              .95
            </LoadingButton>
          </Stack>
        </Stack>
        <Stack maxHeight={'100px'} sx={{ height: '80px', pt: 0.65 }}>
          <LoadingButton
            loading={isUpdatingPrice}
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ height: '100%', fontSize: '12px', flexGrow: 1 }}
            onClick={updatePriceSubmit}
          >
            {translate('update')}
          </LoadingButton>
        </Stack>
      </Stack>
    </RootStyle>
  );
}
