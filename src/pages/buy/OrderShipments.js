import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { ShipmentTable } from '../../sections/buy/shipment';
import ShipmentForm from '../../sections/buy/shipment/components/ShipmentForm';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getShipmentList } from '../../redux/slices/shipment';

// Paths
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Constants
import { BUY_API } from '../../constants/ApiPaths';

export default function OrderShipments() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { pathname ,state} = useLocation();

  const { orders } = useSelector((state) => state.buy);

  const { orderId = '' } = useParams();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [order, setOrder] = useState();
  const [loadingOrder, setLoadingOrder] = useState(true);

  const handleCloseDialog = () => setOpenDialog(false);
  const handleOpenDialog = () => setOpenDialog(true);



  useEffect(() => {
    if (orderId) {
      if (orders && orders.length) {
        const foundOrder = orders.find((order) => order.id === parseInt(orderId, 10));
        if (!foundOrder) navigate(PATH_BUY.buyList, { replace: true });
        setOrder(foundOrder);
        setLoadingOrder(false);
      } else {
        axios
          .get(`${BUY_API.BUY_ORDER}${orderId}/`)
          .then((response) => {
            setOrder({ ...response.data });
            setLoadingOrder(false);
          })
          .catch((error) => {
            setLoadingOrder(false);
            navigate(PATH_BUY.buyList, { replace: true });
          });
      }
      // Load the shipment list for current order
      dispatch(getShipmentList({ order: orderId }));
    } else {
      navigate(PATH_BUY.buyList, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // useEffect(() => {
  //   return () => {
  //     axios
  //       .get(`api/buy/buy_action_rebuild/?buy_id=${state.buyId}&pharmacy_id=${state.pharmacyId}`)
  //       .then((response) => {
  //       })
  //       .catch((error) => {
  //         // console.log(error);
  //       });
  //   };
  // }, []);

  return (
    <>
      {!loadingOrder ? (
        <Page title="Manage Shipments">
          <Container maxWidth={themeStretch ? false : 'xl'}>
            <ShipmentTable order={order} />
          </Container>
        </Page>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}
