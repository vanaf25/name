import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
// @mui
import {
  Card,
  Grid,
  Container,
  Typography,
  Stack,
  TableRow,
  Autocomplete,
  TextField,
  TableCell,
  Box,
  Button,
  useTheme,
  Accordion,
  AccordionDetails,
  TableContainer,
  Table,
  TableBody,
  Link,
  CardHeader,
  Skeleton,
} from '@mui/material';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import styled from '@emotion/styled';
import { useSnackbar } from 'notistack';
// routes
import { VITALFAR_HOST_API } from '../../config';
import { PATH_DASHBOARD } from '../../routes/paths';
import { PHARMACY_API } from '../../constants/ApiPaths';
// hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import Markdown from '../../components/Markdown';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import DialogModal from '../../components/DialogModal';
// redux
import { getMarketplacesProducts, getPreferredSellers, getSellersList } from '../../redux/slices/pharmacy_product';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { fDate2 } from '../../utils/formatTime';

// ----------------------------------------------------------------------

import { ReactComponent as MainLogo } from '../../sections/pharmacy/logo.svg';

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: `${theme.spacing(1)} !important`,
  },
}));

export default function ProductDetails() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const cardRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { currentPharmacy } = useAuth();
  const { sellers, preferredSellers, marketplace } = useSelector((state) => state.pharmacy_product);
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const [product, setProduct] = useState();
  const [error, setError] = useState(false);
  const [mktFilters, setMKTFilter] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [totalShops, setTotalShops] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const { translate } = useLocales();
  // States for Preferred Sellers Modal
  const [openModal, setOpenModal] = useState(false);
  const [value, setValue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  // table height state
  const [cardHeight, setCardHeight] = useState();

  const totalMKTShops = useMemo(() => {
    let shops = 0;
    product?.master_details?.forEach((mkt) => {
      shops += mkt.no_of_shops;
    });
    return shops;
  }, [product?.master_details]);

  const minMKTPrice = useMemo(() => {
    const prices = [];
    // If the MKT filter applied then show the min price only from that products
    product?.master_details?.forEach((mkt) => {
      if (mktFilters.includes(mkt.marketplace)) {
        prices.push(mkt.min_price);
      }
    });
    const minPrice = Math.min(...prices);

    return minPrice;
  }, [product?.master_details, mktFilters]);

  const maxMKTPrice = useMemo(() => {
    const prices = [];
    // If the MKT filter applied then show the max price only from that products
    product?.master_details?.forEach((mkt) => {
      if (mktFilters.includes(mkt.marketplace)) {
        prices.push(mkt.max_price);
      }
    });

    return Math.max(...prices);
  }, [product?.master_details, mktFilters]);

  useEffect(() => {
    axios
      .get(`${VITALFAR_HOST_API}/S03_crw/product/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        // console.log(error);
        setError(true);
      });
  }, [id]);

  useEffect(() => {
    if (product?.master_details?.length) {
      setMKTFilter([...product?.master_details?.map((item) => item?.marketplace)]);
    } else {
      setMKTFilter([]);
    }
  }, [product?.master_details]);

  useEffect(() => {
    if (product) {
      const productData = {
        ...product,
        cn_ean: product?.ean,
        id,
      };
      getData(productData);
    }
  }, [product]);

  useEffect(() => {
    // Load the preferred sellers settings record in the redux store
    dispatch(getPreferredSellers());
  }, []);

  function getData(row) {
    // Get Marketplaces products
    let sellersID = '';
    if (preferredSellers?.value || false) {
      const sellersValue = JSON.parse(preferredSellers.value);
      const ids = sellersValue.map((row) => row.id);
      sellersID = ids.join(',');
    }
    dispatch(getMarketplacesProducts(row, sellersID));
  }

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
          closeModal();
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
      setTotalShops(totalMKTShops);
      setMinPrice(minMKTPrice);
      setMaxPrice(maxMKTPrice);
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

  useEffect(() => {
    setTimeout(() => {
      setCardHeight(cardRef?.current?.offsetHeight);
    }, 500);
  }, [isDescriptionOpen, marketplace.preffered_products]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        setCardHeight(cardRef?.current?.offsetHeight);
      }, 500);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cardRef.current]);

  return (
    <Page title="Search: Product Details">
      <Container
        spacing={0}
        sx={{ marginTop: -7, width: 'calc(100vw - 130px)' }}
        maxWidth={themeStretch ? false : 'xxl'}
      >
        {product && (
          <>
            <Grid ref={cardRef} container spacing={0}>
              <Card sx={{ padding: 2, width: '100%', marginBottom: 1 }}>
                <Grid container spacing={0}>
                  <Grid item md={2} sm={2}>
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={'100%'}>
                      {product?.images?.length ? (
                        <Image
                          disabledEffect
                          src={product?.images[0]}
                          sx={{ borderRadius: 1.5, mr: 2, height: '100%', width: '100%' }}
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
                  <Grid item md={10} sm={10} pl={3}>
                    <HeaderBreadcrumbs
                      links={[{ name: 'Search', href: PATH_DASHBOARD.root }, { name: `Product-${product.mst_prd_id}` }]}
                    />
                    <Stack
                      padding={'6px 16px 0px'}
                      borderRadius={'10px'}
                      direction="row"
                      alignItems="center"
                      gap={8}
                      backgroundColor={'#75c5ff'}
                      sx={{mt:-5}}
                    >
                      <Box>
                        <Typography textAlign={'center'} variant="subtitle1" sx={{ color: 'common.white' }}>
                          {product.ean}
                        </Typography>
                        <Typography textAlign={'center'} variant="subtitle2">
                          {translate('EAN')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography textAlign={'center'} variant="subtitle1" sx={{ color: 'common.white' }}>
                          {product.cn_dot_7}
                        </Typography>
                        <Typography textAlign={'center'} variant="subtitle2">
                          {translate('CN')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography textAlign={'center'} variant="subtitle1" sx={{ color: 'common.white' }}>
                          {product.product_name}
                        </Typography>
                        <Typography textAlign={'center'} variant="subtitle2">
                          {translate('Product_name')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Card sx={{ mb: 1,mt:1 }}>
                      <Accordion
                        expanded={isDescriptionOpen}
                        onChange={(e, expanded) => {
                          setIsDescriptionOpen(expanded);
                        }}
                      >
                        <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
                          <Typography textTransform={'capitalize'}>{translate('product_detail.description')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ p: 3 }}>
                            <Markdown children={product.product_description} />
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </Card>
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
                        {product?.master_details?.map((market, index) => (
                          <Button
                            key={`${market.id}${market.marketplace}${index}`}
                            sx={{
                              bgcolor: mktFilters.includes(market.marketplace) ? 'info.light' : 'text.disabled',
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
                                bgcolor: mktFilters.includes(market.marketplace) ? 'info.light' : 'text.disabled',
                                border: 'none',
                                color: '#FFFFFF',
                              },
                              '&:focus': {
                                outline: 'none',
                                bgcolor: mktFilters.includes(market.marketplace) ? 'info.light' : 'text.disabled',
                                border: 'none',
                                color: '#FFFFFF',
                              },
                            }}
                            variant="outlined"
                            color="success"
                            onClick={() => updateMktFilter(market.marketplace)}
                          >
                            <div
                              title={`${market.no_of_shops} ${market.marketplace}`}
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {market.no_of_shops} {market.marketplace}
                            </div>
                            <div style={{ flexDirection: 'column' }}>
                              {fCurrency(market.min_price)} - {fCurrency(market.max_price)}
                            </div>
                          </Button>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
              <Card sx={{ py: 1, width: '100%', marginBottom: 1 }}>
                <Grid container>
                  <Grid item md={12} sm={12}>
                    <Box sx={{ pl: 1, height: 'fit-content', maxHeight: '265px', overflow: 'hidden' }}>
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
                            sx={{ pt: 1 }}
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
                                              sx={{
                                                borderRadius: 1.5,
                                                width: '64px',
                                                height: '64px',
                                                mr: 2,
                                                display: 'inline',
                                              }}
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
                                    <TextField
                                      {...params}
                                      label="Choose Preferred Sellers"
                                      placeholder="Type for search"
                                    />
                                  )}
                                  sx={{ mt: 4 }}
                                />
                                <Button
                                  variant="contained"
                                  color="primary"
                                  sx={{ mt: 2 }}
                                  onClick={updatePreferredSeller}
                                >
                                  Update
                                </Button>
                              </>
                            }
                            fullWidth={false}
                            maxWidth="sm"
                          />
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid container>
              <Card sx={{ padding: 1, width: '100%' }}>
                <Grid container>
                  <Grid item md={12} sm={12}>
                    {marketplace.isLoadingProducts ? (
                      <Loader />
                    ) : (
                      <>
                        <Box sx={{ pl: 3 }}>
                          <Typography variant="subtitle2" paragraph mt={1}>
                            {translate('price_revision.marketplace_products')}
                          </Typography>
                        </Box>
                        <TableContainer
                          sx={{
                            overflow: 'auto',
                            minHeight: '100px',
                            height: `calc(100vh - ${cardHeight + 150}px)`,
                          }}
                        >
                          <Table stickyHeader size="small">
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
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </>
        )}
        {error && <Typography variant="h6">404 {translate('Product_not_found')}</Typography>}
      </Container>
    </Page>
  );
}
