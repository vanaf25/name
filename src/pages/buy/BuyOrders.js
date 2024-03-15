import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

// Hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import { NeedSummaryTable, NewNeedSummaryTable } from '../../sections/buy';
import { OrderTable } from '../../sections/buy/order';
import BuyInfo from '../../sections/buy/components/BuyInfo';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getBuyProducts, getBuyNeeds, setConditionWiseProducts, getBuyOrders, getParaBuyNeeds } from '../../redux/slices/buy';

// Paths
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Constants
import { BUY_API } from '../../constants/ApiPaths';

export default function BuyOrders() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { currentPharmacy, user } = useAuth();
  const { buys, catalog } = useSelector((state) => state.buy);

  const { buyId = '' } = useParams();
  const { pharmacyId = '' } = useParams();
  const navigate = useNavigate();

  const [currentBuy, setCurrentBuy] = useState();
  const [loadingBuy, setLoadingBuy] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [pharmacyList, setPharmacyList] = useState([]);

  const { pathname ,state} = useLocation();

  useEffect(() => {
    return () => {
      axios
        .get(`api/buy/buy_action_rebuild/?buy_id=${state.buyId}&pharmacy_id=${state.pharmacyId}`)
        .then((response) => {
          // setCurrentBuy({ ...response.data });
          // setLoadingBuy(false);
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
          // setLoadingBuy(false);
          // navigate(PATH_BUY.buyList, { replace: true });
        });
    };
  }, []);


  const isV1BuyNeedsLoaded = useRef(false);

  const pharmacyToCatalogMap = (conditionSummary) => {
    // Calculate the own percentage of total units to each pharmacy
    const calculatedConditions = Object.values(conditionSummary);

    const pharmacyToCatalogMap = calculatedConditions.reduce((map, item) => {
      (item.order_pharmacy || []).forEach(pharmacy => {
        const pharmacyId = pharmacy.id
        if (!map[pharmacyId]) {
          map[pharmacyId] = []
        }

        const conditionId = item.id
        map[pharmacyId].push(conditionId)
      })

      return map;
    }, {})

    return pharmacyToCatalogMap
  };


  const handleCreateOrder = useCallback((conditionSummary, currentBuy) => {
    const parmacyOrderData = {};
    const pharmacyData = [];

    try {
      Object.values(conditionSummary).forEach(product => {
        product.order_pharmacy.forEach(pharmacy => {
          if (!parmacyOrderData[pharmacy.id]) {
            pharmacyData.push(pharmacy.id);
            parmacyOrderData[pharmacy.id] = {
              pharmacyDetails: pharmacy,
              productList: []
            }
          }

          parmacyOrderData[pharmacy.id].productList.push(product)
        })
      })
    }
    catch (error) {
      enqueueSnackbar('Please select Pharmacies for creating order.', { variant: 'error' });
    };
    
    const pharmacyIds = Object.keys(pharmacyToCatalogMap(conditionSummary));

    const payload = {
      buy: currentBuy.id,
      pharmacy_ids: pharmacyIds,
      condition: pharmacyToCatalogMap(conditionSummary)
    }

    setIsCreatingOrder(true);

    if (pharmacyIds.length === 0) {
      setIsCreatingOrder(false);
      enqueueSnackbar('Please select Pharmacies for creating order.', { variant: 'error' });
      return Promise.resolve();
    }

    return axios
    .post(BUY_API.BUY_ORDER_CALCULATED, payload)
    .then(() => {
        setIsCreatingOrder(false);
        dispatch(getBuyOrders(currentBuy.id));
        enqueueSnackbar('Order has been created successfully.');
      })
      .catch((error) => {
        // console.log(error);
        setIsCreatingOrder(false);
        enqueueSnackbar('Opps something went wrong', { variant: 'error' });
      });

  }, [])


  useEffect(() => {
    if (buyId) {
      if (buys && buys.length) {
        const foundBuy = buys.find((buy) => buy.id === parseInt(buyId, 10));
        if (!foundBuy) navigate(PATH_BUY.buyList, { replace: true });
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
      // const pharmacyId = currentPharmacy.id;
      // Load Catalog Products for current buy
      // dispatch(getBuyProducts(buyId));
      // dispatch(getBuyNeeds(buyId, pharmacyId));
      // dispatch(getParaBuyNeeds(buyId, pharmacyId));
      dispatch(getBuyOrders(buyId));
    } else {
      navigate(PATH_BUY.buyList, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Load the participated pharmacies in the select box
    if (currentBuy)
      axios
        .get(BUY_API.BUY_PARTICIPATED_PHARMACIES, { params: { buy: currentBuy.id } })
        .then((response) => {
          setPharmacyList(response.data);
        })
        .catch((error) => {
          // console.log(error);
        });
  }, [currentBuy]);

  return (
    <>
      {!loadingBuy ? (
        <Page title="Manage Orders">
          <Container maxWidth={themeStretch ? false : 'xl'}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <BuyInfo currentBuy={currentBuy} />
              </Grid>
            </Grid>
            {user.id === currentBuy.created_by && (
              <NewNeedSummaryTable
                currentBuy={currentBuy}
                onCreateOrder={handleCreateOrder}
                creatingOrder={isCreatingOrder}
                pharmacyList={pharmacyList}
              />
            )}

            <OrderTable currentBuy={currentBuy} />
          </Container>
        </Page>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}
