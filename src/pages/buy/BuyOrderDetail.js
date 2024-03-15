import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import Iconify from '../../components/Iconify';
import { OrderCart } from '../../sections/buy/order';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// Redux
import { useSelector, useDispatch } from '../../redux/store';

// Paths
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Constants
import { BUY_API } from '../../constants/ApiPaths';

export default function BuyOrderDetail() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.buy);

  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { translate } = useLocales();

  const [currentBuy, setCurrentBuy] = useState({});
  const [editOrder, setEditOrder] = useState();
  const [loadingOrder, setLoadingOrder] = useState(true);
  const { pathname ,state} = useLocation();

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
  
  // Load the Buy and Catalogs for Order Preparation
  useEffect(() => {
    if (id) {
      if (orders && orders.length) {
        const foundOrder = orders.find((order) => order?.id === parseInt(id, 10));

        if (!foundOrder) navigate(PATH_BUY.buyList, { replace: true });
        setEditOrder(foundOrder);
        setLoadingOrder(false);
      } else {
        axios
          .get(`${BUY_API.BUY_ORDER}${id}/`)
          .then((response) => {
            setEditOrder({ ...response.data });
            setLoadingOrder(false);
          })
          .catch((error) => {
            // console.log(error);
            setLoadingOrder(false);
            navigate(PATH_BUY.buyList, { replace: true });
          });
      }
    } else {
      navigate(PATH_BUY.buyList, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editOrder?.buy || false) {
      axios
        .get(`${BUY_API.BUY}${editOrder.buy}/`)
        .then((response) => {
          setCurrentBuy(response.data);
        })
        .catch((error) => {
          // console.log(error);
        });
    }
  }, [editOrder]);

  return (
    <Page title="Order">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* <HeaderBreadcrumbs
          heading="Order Detail"
          // links={[{ name: 'Create Order Subheading' }]}
          links={[
            // { name: 'Order List', href: PATH_BUY.buyOrders.replace(':buyId', editOrder?.buy || '') },
            {
              name: sentenceCase(currentBuy?.name || ''),
              href: PATH_BUY.buyOrders.replace(':buyId', editOrder?.buy || ''),
            },
            { name: 'Order' },
          ]}
          action={
            <Button
              color="inherit"
              component={RouterLink}
              to={PATH_BUY.buyOrders.replace(':buyId', editOrder?.buy || '')}
              startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} />}
            >
              {translate("Back")}
            </Button>
          }
        /> */}
        {loadingOrder ? <LoadingScreen /> : <OrderCart editOrder={editOrder} currentBuy={currentBuy} />}
      </Container>
    </Page>
  );
}
