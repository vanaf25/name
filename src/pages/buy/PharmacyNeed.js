import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Select, MenuItem } from '@mui/material';
import styled from 'styled-components';

// Hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import Image from '../../components/Image';
import { NeedTable } from '../../sections/buy';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getBuyProducts, getBuyNeeds, getParaBuyNeeds, getRelatedPharmacy } from '../../redux/slices/buy';

// Paths
import { calculateDiscount, getMaximumDiscount, calculateTax } from '../../utils/calculateTax';
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Constants
import { BUY_API } from '../../constants/ApiPaths';
import { BUY_TYPE_IMAGES } from '../../constants/AppEnums';

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function PharmacyNeed() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { currentPharmacy } = useAuth();
  const { buys, catalog, relatedPharmacy, buyNeedShorting, isParaPharamcy } = useSelector((state) => state.buy);

  const { buyId = '' } = useParams();
  const navigate = useNavigate();

  const { pathname, state } = useLocation();

  const [currentBuy, setCurrentBuy] = useState();
  const [loadingBuy, setLoadingBuy] = useState(true);
  const [pharmacyNeeds, setPharmacyNeeds] = useState({});
  const [paraPharmacyNeeds, setParaPharmacyNeeds] = useState({});
  const [totalNeeds, setTotalNeeds] = useState({});
  const [paraTotalNeeds, setParaTotalNeeds] = useState({});
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [paraCatalogProducts, setParaCatalogProducts] = useState([]);
  const [pharamcyType, setPharamcyType] = useState('non-para');
  // const [isParaPharamcy, setIsParaPharamcy] = useState(false);
  const [currentPharmacies, setCurrentPharmacies] = useState([]);

  useEffect(() => {
    return () => {
      axios
        .get(`api/buy/buy_action_rebuild/?buy_id=${state.buyId}&pharmacy_id=${state.pharmacyId}`)
        .then((response) => {
         
          // setCurrentBuy({ ...response.data });
          // setLoadingBuy(false);
        })
        .catch((error) => {
          // console.log(error);
          // setLoadingBuy(false);
          // navigate(PATH_BUY.buyList, { replace: true });
        });
    };
  }, []);

  useEffect(() => {
    if (buyId) {
      if (buys && buys.length) {
        const foundBuy = buys.find((buy) => buy.id === parseInt(buyId, 10));
        if (!foundBuy) navigate(PATH_BUY.buyList, { replace: true });
        // console.log("currentBuy==>foundBuy",foundBuy);
        setCurrentBuy(foundBuy);
        setLoadingBuy(false);
      } else {
        axios
          .get(`${BUY_API.BUY}${buyId}/`)
          .then((response) => {
            setCurrentBuy({ ...response.data });
            setLoadingBuy(false);
          })
          .catch((error) => {
            // console.log(error);
            setLoadingBuy(false);
            navigate(PATH_BUY.buyList, { replace: true });
          });
      }

      const pharmacyId = currentPharmacy.id;
      // Load Catalog Products for current buy
      dispatch(getBuyProducts(buyId));
      dispatch(getParaBuyNeeds(buyId, pharmacyId));
      dispatch(getBuyNeeds(buyId, pharmacyId));
      dispatch(getRelatedPharmacy(pharmacyId));
    } else {
      navigate(PATH_BUY.buyList, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Get the pharmacy needs and total needs for the current buy
    const currentNeeds = {};
    const paraCurrentNeeds = {};
    const totalNeeds = {};
    const paraTotalNeeds = {};

    catalog.paraNeeds.forEach((need) => {
      if (need.pharmacy !== currentPharmacy.id) {
        paraCurrentNeeds[need.catalog] = need;
      }
      if (paraTotalNeeds[need.catalog] === undefined) paraTotalNeeds[need.catalog] = 0;
      paraTotalNeeds[need.catalog] += need.total_units;
    });

    catalog.needs.forEach((need) => {
      if (need.pharmacy === currentPharmacy.id) {
        currentNeeds[need.catalog] = need;
      }
      if (totalNeeds[need.catalog] === undefined) totalNeeds[need.catalog] = 0;
      totalNeeds[need.catalog] += need.total_units;
    });

    setParaPharmacyNeeds(paraCurrentNeeds);
    setPharmacyNeeds(currentNeeds);
    setTotalNeeds(totalNeeds);
    setParaTotalNeeds(paraTotalNeeds);
  }, [catalog.needs, catalog.paraNeeds]);

  useEffect(() => {
    // update the catalog products with pharmacy's need and total needs for each product in catalog
    const products = catalog.products.map((row) => {
      if (pharmacyNeeds[row.id] !== undefined) {
        const need = pharmacyNeeds[row.id];
        const amount = +need.units * +row.pvl;
        const discountObj = calculateDiscount(row.catalog_condition, amount, totalNeeds[row.id]);

        const netAmount = discountObj?.amount_after_discount || amount;
        const discountAmount = (amount * discountObj?.discount) / 100;
        const taxAmount = (netAmount * need?.tax) / 100;
        const recargoAmount = ((netAmount + taxAmount) * need?.recargo) / 100;
        const grandTotal = netAmount + taxAmount + recargoAmount;

        return {
          ...row,
          need,
          adjusted_units: need.adjusted_units,
          total_units: totalNeeds[row.id] !== undefined ? totalNeeds[row.id] : null,
          unit_price: amount,
          discount_amount: discountAmount,
          max_discount: getMaximumDiscount(row.catalog_condition),
          net_amount: discountObj?.amount_after_discount || amount,
          tax_amount: taxAmount,
          recargo_amount: recargoAmount,
          discount: discountObj,
          grand_total: grandTotal,
        };
      }

      return {
        ...row,
        need: null,
        adjusted_units: null,
        total_units: totalNeeds[row.id] !== undefined ? totalNeeds[row.id] : null,
        max_discount: getMaximumDiscount(row.catalog_condition),
        net_amount: null,
        discount: null,
        grand_total: null,
      };
    });
    setCatalogProducts(products);
  }, [catalog.products, pharmacyNeeds, totalNeeds]);

  useEffect(() => {
    // update the catalog products with pharmacy's need and total needs for each product in catalog
    const products = catalog.products.map((row) => {
      if (paraPharmacyNeeds[row.id] !== undefined) {
        const need = paraPharmacyNeeds[row.id];
        const amount = +need.units * +row.pvl;
        const discountObj = calculateDiscount(row.catalog_condition, amount, paraTotalNeeds[row.id]);

        const netAmount = discountObj?.amount_after_discount || amount;
        const discountAmount = (amount * discountObj?.discount) / 100;
        const taxAmount = (netAmount * need?.tax) / 100;
        const recargoAmount = ((netAmount + taxAmount) * need?.recargo) / 100;
        const grandTotal = netAmount + taxAmount + recargoAmount;

        return {
          ...row,
          need,
          adjusted_units: need.adjusted_units,
          total_units: paraTotalNeeds[row.id] !== undefined ? paraTotalNeeds[row.id] : null,
          unit_price: amount,
          discount_amount: discountAmount,
          max_discount: getMaximumDiscount(row.catalog_condition),
          net_amount: discountObj?.amount_after_discount || amount,
          tax_amount: taxAmount,
          recargo_amount: recargoAmount,
          discount: discountObj,
          grand_total: grandTotal,
        };
      }

      return {
        ...row,
        need: null,
        adjusted_units: null,
        total_units: paraTotalNeeds[row.id] !== undefined ? paraTotalNeeds[row.id] : null,
        max_discount: getMaximumDiscount(row.catalog_condition),
        net_amount: null,
        discount: null,
        grand_total: null,
      };
    });

    setParaCatalogProducts(products);
  }, [catalog.products, paraPharmacyNeeds, paraTotalNeeds]);

  useEffect(() => {
    setCurrentPharmacies(relatedPharmacy);
  }, []);

  const handleChange = (event) => {
    setPharamcyType(event.target.value);

    if (event.target.value === 'Para') {
      // setIsParaPharamcy(true);
    } else {
      // setIsParaPharamcy(false);
    }
  };

  // console.log("currentBuy==>",currentBuy);
  return (
    <>
      {!loadingBuy ? (
        <Page title="Manage Needs">
          <Container maxWidth={themeStretch ? false : 'xl'}>
            {/* <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 5 }}
              style={{
                'justify-content': 'space-between',
                // position: 'absolute',
                // zIndex: 99999,
                // width:"72.5%",
                // top: '1.5%',
                // marginLeft: "8%",
              }}
            >
              <Box
                sx={{
                  width: 65,
                  height: 65,
                  flexShrink: 0,
                  display: 'flex',
                  borderRadius: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                }}
              >
                <Image src={BUY_TYPE_IMAGES[currentBuy.type]} sx={{ width: 50, height: 50 }} />
              </Box>

              <Box sx={{ minWidth: 160 }} style={{ marginRight: 'auto' }}>
                <Typography variant="h4">{currentBuy.name}</Typography>
                <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 360,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      color: 'text.disabled',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentBuy.type}
                  </Typography>
                </Stack>
              </Box>

              <Box  >
               
                <StyledSelect labelId="pharmacy" id="pharmacy" value={buyNeedShorting} onChange={handleChange}>
                  {relatedPharmacy.map((pharmacy) => {
                    return (
                      <MenuItem value={pharmacy.type} name={pharmacy.name}>
                        {pharmacy.name}
                      </MenuItem>
                    );
                  })}
                </StyledSelect>
              </Box>
            </Stack> */}
            <NeedTable
              currentBuy={currentBuy}
              products={catalogProducts}
              paraProduct={paraCatalogProducts}
              pharamcyType={buyNeedShorting}
              isPharamcy={isParaPharamcy}
            />
          </Container>
        </Page>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}
