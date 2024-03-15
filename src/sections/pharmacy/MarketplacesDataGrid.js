import React, { useEffect, useState, useMemo } from 'react';
import throttle from 'lodash/throttle';
import { useSnackbar } from 'notistack';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Link from '@mui/material/Link';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { useTheme } from '@mui/material/styles';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import { setProductPrices, getSellersList, getPreferredSellers } from '../../redux/slices/pharmacy_product';

// Hooks
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Utils
import { fCurrency } from '../../utils/formatNumber';
import { fDate2 } from '../../utils/formatTime';
import axios from '../../utils/axios';
import { PHARMACY_API } from '../../constants/ApiPaths';

// Components
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import Iconify from '../../components/Iconify';
import DialogModal from '../../components/DialogModal';

// ----------------------------------------------------------------------

import { ReactComponent as MainLogo } from './logo.svg';

export default function MarketplacesDataGrid() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { currentPharmacy } = useAuth();
  const { marketplace, productPrices, sellers, preferredSellers } = useSelector((state) => state.pharmacy_product);
  const [mktFilters, setMKTFilter] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [totalShops, setTotalShops] = useState(0);

  // States for Preferred Sellers Modal
  const [openModal, setOpenModal] = useState(false);
  const [value, setValue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  const totalMKTShops = () => {
    let shops = 0;
    marketplace.marketplaces.forEach((mkt) => {
      shops += mkt.num_of_shops;
    });
    return shops;
  };

  const minMKTPrice = () => {
    const prices = [];
    // If the MKT filter applied then show the min price only from that products
    marketplace.marketplaces.forEach((mkt) => {
      if (mktFilters.includes(mkt.name)) {
        prices.push(mkt.min_sale_price);
      }
    });
    const minPrice = Math.min(...prices);

    return minPrice;
  };

  const maxMKTPrice = () => {
    const prices = [];
    // If the MKT filter applied then show the max price only from that products
    marketplace.marketplaces.forEach((mkt) => {
      if (mktFilters.includes(mkt.name)) {
        prices.push(mkt.max_sale_price);
      }
    });

    return Math.max(...prices);
  };

  const updateMktFilter = (market) => {
    const filters = mktFilters;
    if (!mktFilters.includes(market)) {
      filters.push(market);
    } else {
      filters.splice(mktFilters.indexOf(market), 1);
    }
    setMKTFilter([...filters]);
  };

  // Functions for Preferred Sellers Modal
  const closeModal = () => {
    setOpenModal(false);
  };

  const clickModalHandler = () => {
    setOpenModal(true);
  };

  const updatePreferredSeller = () => {
    // Update the preferred sellers in the pharmacy settings with key=PREFERRED_SELLERS
    const sellectedSellers = value.map((row) => ({ id: row.id, name: row.name }));
    // console.log(JSON.stringify(sellectedSellers));
    // TODO:: Update the Preferred Sellers Setting Via API Call

    return axios({
      method: preferredSellers?.id ? 'patch' : 'post',
      url: preferredSellers?.id
        ? `${PHARMACY_API.PHARMACY_SETTINGS}${preferredSellers.id}/`
        : `${PHARMACY_API.PHARMACY_SETTINGS}`,
      data: preferredSellers?.id
        ? { value: JSON.stringify(sellectedSellers) }
        : { key: 'PREFERRED_SELLERS', value: JSON.stringify(sellectedSellers), pharmacy: currentPharmacy.id },
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          enqueueSnackbar('Preferred sellers updated successfully.');
          dispatch(getPreferredSellers());
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const fetchSellers = useMemo(
    () =>
      throttle((inputValue) => {
        dispatch(getSellersList(inputValue));
      }, 200),
    []
  );

  useEffect(() => {
    fetchSellers(inputValue);
  }, [inputValue, fetchSellers]);

  // [END] Preferred Sellers Modal

  useEffect(() => {
    const filters = [];
    marketplace.marketplaces.forEach((market) => {
      filters.push(market.name);
    });
    setMKTFilter(filters);
  }, [marketplace.marketplaces]);

  useEffect(() => {
    if (marketplace.marketplaces.length) {
      setTotalShops(totalMKTShops());
      setMinPrice(minMKTPrice());
      setMaxPrice(maxMKTPrice());
      dispatch(
        setProductPrices({
          ...productPrices,
          competitive_price: minMKTPrice() * 1.22,
        })
      );
    } else {
      setTotalShops(0);
      setMinPrice(0);
      setMaxPrice(0);
    }
  }, [mktFilters]);

  useEffect(() => {
    if (value) {
      const selectedSellers = value.map((row) => row.id);
      if(sellers && sellers.length > 0) {
        const newSellers = sellers.filter((row) => !selectedSellers.includes(row.id));
        setOptions([...newSellers, ...value]);
      }
    } else setOptions(sellers);
  }, [sellers, value]);

  useEffect(() => {
    // Load the preferred sellers settings record in the redux store
    dispatch(getPreferredSellers());
  }, []);

  useEffect(() => {
    // If there are preferred sellers then make them seletected in the autocomplete box
    if (preferredSellers?.value || false) {
      const sellers = JSON.parse(preferredSellers.value);
      setValue(sellers);
    }
  }, [preferredSellers]);
  return (
    <Stack sx={{ mt: 3, pb: 2, pl: 2, height: '100%' }}>
      <Grid
        container
        sx={{
          mb: 2,
        }}
      >
        <Grid item sm={2}>
          <Box>
            {marketplace.images.length ? (
              <Image
                disabledEffect
                src={marketplace.images[0]}
                sx={{ borderRadius: 1.5, mr: 2, height: '100px', width: '100px' }}
              />
            ) : (
              <Skeleton
                sx={{ bgcolor: 'grey.200' }}
                variant="rectangular"
                height="100px"
                width="100px"
                animation={false}
              />
            )}
          </Box>
        </Grid>
        <Grid item md={8} sm={10} style={{ marginLeft: '16px' }}>
          <Grid container>
            <Grid item sm={12}>
              <Typography variant="subtitle2" gutterBottom>
                {translate('no_of_shops')} : {totalShops}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                {translate('price_range')} : {fCurrency(minPrice)} - {fCurrency(maxPrice)}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item sm={12}>
              {marketplace.marketplaces.map((market, index) => (
                <Button
                  key={`${market.id}${market.name}${index}`}
                  sx={{
                    bgcolor: mktFilters.includes(market.name) ? 'info.light' : 'text.disabled',
                    boxShadow: theme.customShadows.info,
                    display: 'inline-block',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    width: '125px',
                    height: '50px',
                    // p: '10px 15px',
                    mr: '13px',
                    borderRadius: '0.25rem',
                    fontSize: '11px',
                    '&:hover': {
                      outline: 'none',
                      bgcolor: mktFilters.includes(market.name) ? 'info.light' : 'text.disabled',
                      border: 'none',
                      color: '#FFFFFF',
                    },
                    '&:focus': {
                      outline: 'none',
                      bgcolor: mktFilters.includes(market.name) ? 'info.light' : 'text.disabled',
                      border: 'none',
                      color: '#FFFFFF',
                    },
                  }}
                  variant="outlined"
                  color="success"
                  onClick={() => updateMktFilter(market.name)}
                >
                  <div
                    title={`${market.num_of_shops} ${market.name}`}
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {market.num_of_shops} {market.name}
                  </div>
                  <div style={{ flexDirection: 'column' }}>
                    {fCurrency(market.min_sale_price)} - {fCurrency(market.max_sale_price)}
                  </div>
                </Button>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Card sx={{ pl: 2, py: 2, height: 'fit-content', maxHeight: '265px', minHeight: '130px', overflow: 'hidden' }}>
        {marketplace.isLoadingPrefProducts ? (
          <Loader />
        ) : (
          <>
            <CardHeader
              title={
                <Box>
                  <Typography variant="subtitle2" paragraph>
                    {translate('price_revision.preffered_sellers')}
                  </Typography>
                </Box>
              }
              sx={{ p: 0 }}
              action={
                <Iconify
                  icon={'eva:settings-2-outline'}
                  sx={{ mr: 3, height: 20, width: 20, cursor: 'pointer' }}
                  onClick={clickModalHandler}
                />
              }
            />

            <TableContainer sx={{ maxHeight: '200px', height: '100%' }}>
              <Table stickyHeader size="small">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>{translate('product')}</TableCell>
                    <TableCell />
                    <TableCell>{translate('price')}</TableCell>
                    <TableCell>{translate('update')}</TableCell>
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  {marketplace.preffered_products && marketplace.preffered_products.length ? (
                    marketplace.preffered_products.map(

                      (row, index) =>
                        mktFilters.includes(row.marketplace_name) && (
                          <TableRow key={`${row.id}${row.product_name}${index}`} hover>
                            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                              <Image
                                disabledEffect
                                alt={row.product_name}
                                src={row.product_image}
                                sx={{ borderRadius: 1.5, width: '64px', height: '64px', mr: 2, display: 'inline' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ ml: 2 }}>
                                <Link target={'_blank'} href={row.product_url}>
                                  <Typography variant="subtitle2">{row.product_name}</Typography>
                                </Link>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {' '}
                                  {row.seller_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{fCurrency(row.sale_price)}</TableCell>
                            <TableCell>{fDate2(row.process_modification_date)}</TableCell>
                          </TableRow>
                        )
                    )
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'text.secondary' }}>
                        <span>{translate('price_revision.no_product_found')}</span>
                      </td>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Dialog Modal for Preferred Sellers settings */}
            <DialogModal
              open={openModal}
              onClose={closeModal}
              DialogContentItems={
                <>
                  <Autocomplete
                    multiple
                    id="preferred-sellers"
                    options={options}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => (option.name ? option.name : '')}
                    filterOptions={(x) => x}
                    autoComplete
                    includeInputInList
                    filterSelectedOptions
                    value={value}
                    onChange={(event, newValue) => {
                      setOptions(newValue ? [newValue, ...options] : options);
                      setValue(newValue);
                      // console.log(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                      setInputValue(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Choose Preferred Sellers" placeholder="Type for search" />
                    )}
                    sx={{ mt: 4 }}
                  />
                  <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={updatePreferredSeller}>
                    Update
                  </Button>
                </>
              }
              fullWidth={false}
              maxWidth="sm"
            />
          </>
        )}
      </Card>
      <Card
        sx={{
          mt: 2,
          pl: 2,
          py: 2,
          overflow: 'auto',
          height: marketplace.preffered_products && marketplace.preffered_products.length ? '100%' : '100%',
        }}
      >
        {marketplace.isLoadingProducts ? (
          <Loader />
        ) : (
          <>
            <Box>
              <Typography variant="subtitle2" paragraph>
                {translate('price_revision.marketplace_products')}
              </Typography>
            </Box>
            <TableContainer
              sx={{
                overflow: 'auto',
                height: 'calc(100% - 35px)',
              }}
            >
              <Table stickyHeader size="small">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>{translate('product')}</TableCell>
                    <TableCell />
                    <TableCell>{translate('price')}</TableCell>
                    <TableCell>{translate('update')}</TableCell>
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  {marketplace.products.map(
                    (row, index) =>
                      mktFilters.includes(row.marketplace_name) && (

                        <TableRow key={`${row.id}${row.product_name}${index}`} hover>
                          <TableCell style={{ width: 50, height: 50 }}>
                            {row.product_image ? (
                              <Image
                                // disabledEffect
                                title={row.product_name}
                                src={row.product_image}
                                sx={{ borderRadius: 1.5, width: 50, height: 50 }}
                              />
                            ) : (
                              <MainLogo height={50} width={50} />
                            )}
                          </TableCell>
                          <TableCell sx={{ padding: '1px 5px' }}>
                            <Box sx={{ ml: 2 }}>
                              <Link target={'_blank'} href={row.product_url}>
                                <Typography variant="subtitle2">{row.product_name}</Typography>
                              </Link>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                <div
                                  title={row.seller_name}
                                  style={{
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.seller_name}
                                </div>
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{fCurrency(row.sale_price)}</TableCell>
                          <TableCell>{fDate2(row.process_modification_date)}</TableCell>
                        </TableRow>
                      )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Card>
    </Stack>
  );
}
