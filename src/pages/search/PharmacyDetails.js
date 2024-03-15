import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// @mui
import {
  Box,
  Card,
  Container,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  Avatar,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { LoadingButton } from '@mui/lab';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import _ from 'lodash';
// routes
import { VITALFAR_HOST_API, HOST_API } from '../../config';

// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import Image from '../../components/Image';
// sections
import useLocales from '../../hooks/useLocales';
import { BUY_TYPE_IMAGES } from '../../constants/AppEnums';

import DialogModal from '../../components/DialogModal';
import Pharmaciesmodal from '../../sections/search/pharmacy-details/pharmaciesmodal';
import Loader from '../../components/Loader';
import Login from '../auth/Login';

// ----------------------------------------------------------------------

export default function PharmacyDetails() {
  const { themeStretch } = useSettings();
  const { id = '' } = useParams();
  const [product, setProduct] = useState();
  const [error, setError] = useState(false);
  const [productselect, setproductselect] = useState();
  const { translate } = useLocales();
  const [Pharmacy, setPharmacy] = useState([]);
  const [Pharmacystoks, setPharmacystoks] = useState([]);
  const [distanceSarch, setDistanceSarch] = useState(500);
  const { user } = useAuth();
  const pharmacyId = user.pharmacy_detail.id;
  const { state } = useLocation();
  const [openSearch, setOpenSearch] = useState(false);
  const [showstockicon, setShowstockicon] = useState({});
  const tempcode = state?.product?.code?.join(',');

  useEffect(async () => {
    setPharmacy([]);
    axios
      .get(`${VITALFAR_HOST_API}/S03_crw/product/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        // console.log(error);
      });

    const [response, responsenoGroupData] = await Promise.all([
      axios.get(`${HOST_API}/api/ps/ph-grp/${pharmacyId}/`).catch((error) => {
        // console.log(error);
      }),
      axios.get(`${HOST_API}/api/ps/ph-no-grp/${pharmacyId}/${distanceSarch}`).catch((error) => {
        // console.log(error);
      }),
    ]);
    const groupData = response.data['group-pharmacies'];
    const noGroupData = responsenoGroupData.data['no-group-pharmacies'];

    const updatedGroupData = await groupPharmacieshandler(groupData, 'group');
    const updatedNoGroupData = await groupPharmacieshandler(noGroupData, 'no-group');

    const datastoks = [...updatedGroupData, ...updatedNoGroupData];
    setPharmacy(datastoks);

    datastoks.map((i) => {
      i.isLoading = true;
      setPharmacystoks((value) => {
        return {
          ...value,
          [i.id]: i,
        };
      });
      return i;
    });
  }, [id, distanceSarch]);

  const groupPharmacieshandler = async (data, type) => {
    const tempdata = [];
    await Promise.all(
      data.map(async (i) => {
        i.type = type;
        if (i.distance >= 1000) {
          const tempdistance = i.distance / 1000;
          i.distance = tempdistance.toFixed(1);
          i.distancetype = 'km';
        } else {
          const tempdistance = i.distance;
          i.distance = tempdistance;
          i.distancetype = 'm';
        }
        if (pharmacyId === i.ph1) {
          i.ph = i.ph2;
          i.ph_name = i.ph2_name;
        } else {
          i.ph = i.ph1;
          i.ph_name = i.ph1_name;
        }
        tempdata.push(i);
      })
    );
    return tempdata;
  };

  useEffect(async () => {
    Pharmacy.map(async (i) => {
      const response = await stockHandler(i);
      const stockData = [];
      const total = [];
      if (!response) {
        i.bgcolor = '#F4F6F8';
        i.color = '#637381';
      } else if (
        typeof response?.data?.data === 'string' &&
        response?.data?.data?.endsWith('Receive operation timed out')
      ) {
        i.color = 'orange';
      } else if (response?.data?.data === 'sSkey not Available on client') {
        i.bgcolor = '#F4F6F8';
        i.color = '#637381';
      } else {
        const tempIds = [];
        const resdata = response?.data?.data;
        resdata?.forEach((item) => {
          total.push(item.stock);
          if (!tempIds.includes(item.idarticulo)) {
            tempIds.push(item.idarticulo);
          }
        });
        tempIds?.map((item) => {
          const array = resdata?.filter((i) => item === i.idarticulo);
          stockData.push(array);
          return array;
        });
        if (!stockData) {
          i.bgcolor = '#F4F6F8';
          i.color = '#637381';
        } else if (stockData.length === 0) {
          i.color = 'red';
        } else if (stockData.length > 1) {
          i.bgcolor = '#FFC107';
          i.color = 'gray';
        } else if (stockData[0]?.[0]?.stock > 0) {
          i.bgcolor = 'darkgreen';
          i.color = '#ffffff';
        } else {
          i.color = 'red';
        }
      }

      if (total?.length > 0) {
        const sum = total?.reduce((x, y) => x + y);
        i.totalstocks = sum;
      }
      i.stocks = stockData;
      i.isLoading = false;
      stockDatahandler();
      setPharmacystoks((value) => {
        return {
          ...value,
          [i.id]: i,
        };
      });
      return i;
    });
  }, [Pharmacy]);

  useEffect(() => {
    stockDatahandler();
  }, [Pharmacystoks]);

  const stockDatahandler = () => {
    const tmpPharmacy = [...Pharmacy];
    const max = _.maxBy(tmpPharmacy, 'totalstocks');
    const min = _.minBy(tmpPharmacy, 'totalstocks');

    tmpPharmacy?.forEach((item) => {
      let avastock = '';
      if (max?.totalstocks > 1 && max?.totalstocks === item?.totalstocks) {
        avastock = 'green';
      } else if (item?.totalstocks > min && item?.totalstocks < max) {
        avastock = 'orange';
      }
      setShowstockicon((value) => {
        return {
          ...value,
          [item.id]: avastock,
        };
      });
    });
  };

  const stockHandler = async (i, counter = 0) => {
    if (counter > 2) return { isTimeout: true };
    const response = await axios.get(`${HOST_API}/api/ps/ph-stock/${i.ph}/${tempcode}`).catch((error) => {
      if (error.response) {
        if (error.response?.data?.message?.endsWith(' Receive operation timed out')) {
          return stockHandler(i, counter + 1);
        }
      }
    });
    if (response?.data?.message?.endsWith(' Receive operation timed out')) {
      return stockHandler(i, counter + 1);
    }
    return response;
  };

  const handleClose = () => {
    setOpenSearch(false);
  };

  const handleOpen = (i) => {
    setproductselect(i);
    setOpenSearch(true);
  };

  return (
    <Page title="Search: Product Details">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Box sx={{ width: 60, height: 60, borderRadius: 10 }}>
            <Image
              key={product?.images[0]}
              alt="large image"
              src={product?.images[0]}
              ratio="1/1"
              sx={{ cursor: 'zoom-in' }}
            />
          </Box>
          <Box sx={{ ml: 10 }}>
            <Typography variant="subtitle2">CN</Typography>
            <Typography variant="subtitle2">{product?.cn_dot_7}</Typography>
          </Box>
          <Box sx={{ ml: 10 }}>
            <Typography variant="subtitle2">EAN</Typography>
            <Typography variant="subtitle2">{product?.ean}</Typography>
          </Box>
          <Box sx={{ ml: 10 }}>
            <Typography variant="subtitle2">{translate('Product_name')}</Typography>
            <Typography variant="subtitle2">{product?.product_name}</Typography>
          </Box>
        </Card>
        <Box sx={{ width: '100%', height: 40, p: 1 }}>
          <Typography sx={{ pb: 0 }} variant="subtitle2">
            {translate('distance')}
          </Typography>
          <Slider
            aria-label="Always visible"
            defaultValue={distanceSarch}
            onChangeCommitted={(_, newValue) => setDistanceSarch(newValue)}
            max={10000}
            valueLabelDisplay="on"
          />
        </Box>
        <Card sx={{ mt: 3 }}>
          <Scrollbar>
            <TableContainer
              sx={{
                height: 'calc(100vh - 290px)',
                overflow: 'auto',
              }}
            >
              {!Pharmacy.length ? (
                <Loader />
              ) : (
                <Table sx={{ pt: 3, pl: 2 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ p: 1 }}>{translate('pharmacy_register.pharmacy_name')}</TableCell>
                      <TableCell sx={{ p: 1 }}>{translate('distance')}</TableCell>
                      <TableCell sx={{ p: 1 }}>{translate('availability')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Pharmacy.map((row, index) => {
                      return (
                        <TableRow
                          onClick={() =>
                            row?.stocks?.length && row.type === 'group' ? handleOpen(Pharmacystoks[row.id]) : null
                          }
                          key={row.id}
                          sx={{
                            cursor: Pharmacystoks[row.id]?.bgcolor === '#F4F6F8' ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <TableCell
                            sx={{
                              bgcolor: Pharmacystoks[row.id]?.bgcolor,
                              p: 1,
                              color: Pharmacystoks[row.id]?.color,
                              borderTopLeftRadius: '8px',
                              borderBottomLeftRadius: '8px',
                              boxShadow: 'inset 8px 0 0 #fff',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {row?.isLoading && <LoadingButton loading>&nbsp;</LoadingButton>}
                              {row.type === 'group' ? (
                                <Avatar src={BUY_TYPE_IMAGES['FARMACIAS AMIGAS']} sx={{ width: 20, height: 20 }} />
                              ) : (
                                <Avatar src={BUY_TYPE_IMAGES['no pharmacy']} sx={{ width: 20, height: 20 }} />
                              )}
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle2">{row?.ph_name}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              bgcolor: Pharmacystoks[row.id]?.bgcolor,
                              color: Pharmacystoks[row.id]?.color,
                              p: 1,
                            }}
                          >
                            {row?.distance} {row?.distancetype}
                          </TableCell>

                          <TableCell
                            sx={{
                              bgcolor: Pharmacystoks[row.id]?.bgcolor,
                              color: Pharmacystoks[row.id]?.color,
                              p: 1,
                              borderTopRightRadius: '8px',
                              borderBottomRightRadius: '8px',
                              boxShadow: 'inset -8px 0 0 #fff',
                            }}
                          >
                            {row.type === 'group' && !row.isLoading && showstockicon[row.id] && (
                              <Box>
                                <ThumbUpIcon sx={{ color: showstockicon[row.id] }} />
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Scrollbar>
        </Card>
        {error && <Typography variant="h6">404 {translate('Product_not_found')}</Typography>}
      </Container>
      <DialogModal
        open={Boolean(openSearch)}
        onClose={handleClose}
        DialogContentItems={<Pharmaciesmodal Pharmacy={productselect} onClose={handleClose} />}
      />
    </Page>
  );
}
