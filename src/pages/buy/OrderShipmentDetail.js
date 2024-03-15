import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { ShipmentItemsTable, PharmacyItemsTable } from '../../sections/buy/shipment';
import DialogModal from '../../components/DialogModal';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getShipmentItems, getPharmacyItems } from '../../redux/slices/shipment';
import ShipmentProductFormAdd from '../../sections/buy/components/ShipmentProductFormAdd';

// Paths
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';
import useLocales from '../../hooks/useLocales';

// Constants
import { BUY_API } from '../../constants/ApiPaths';
import { getBuyCategories, getBuyConditions, setBuyPharmacyListSuccess } from '../../redux/slices/buy';

export default function OrderShipmentDetail(props) {
  const { currentBuy } = props;
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { user, currentPharmacy } = useAuth();

  
  const { pathname ,state} = useLocation();
  // console.log("DEBUG1",{currentBuy, state, currentPharmacy})



  const { shipmentList } = useSelector((state) => state.shipment);

  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState();
  const [AddProduct, setOpenAddProduct] = useState(false);
  const [loadingShipment, setLoadingShipment] = useState(true);
  const handleCloseAddProduct = () => setOpenAddProduct(false);
  const [products, setProducts] = useState([]);
  // const [pharmacyList, setPharmacyList] = useState([]);


  useEffect(() => {
    if (id) {
      if (shipmentList && shipmentList.length) {
        // console.log('shipmentList',{shipmentList, currentBuy})
        const found = shipmentList.find((shipment) => shipment.id === parseInt(id, 10));
        if (!found) navigate(PATH_BUY.buyList, { replace: true });
        setShipment(found);
        setLoadingShipment(false);
      } else {
        axios
          .get(`${BUY_API.SHIPMENT}${id}/`)
          .then((response) => {
            // Load the item needs to show in the popup when user want to see the needs for each pharmacy      
            axios
            .get(BUY_API.BUY_PRODUCT, {
              params:  { buy: response.data.buy_id },
            })
            .then((response) => {
              setProducts(response.data);
            })
            .catch((error) => {
              // console.log(error);
            });
            
            // console.log("DEBUG: ",response.data);

            if(response.data) {
              setLoadingShipment(false);
              // Load Catalog Categories for current buy
              dispatch(getBuyCategories(response.data.buy_id));
              // Load Catalog Conditions for current buy
              dispatch(getBuyConditions(response.data.buy_id));
  
              setShipment(response.data);
            }
          })
          .catch((error) => {
            // console.log(error);
            setLoadingShipment(false);
            navigate(PATH_BUY.buyList, { replace: true });
          });
      }
      // Load the shipment list for current order
      dispatch(getShipmentItems({ shipment: id }));
      dispatch(getPharmacyItems({ shipment_item__shipment: id, pharmacy: currentPharmacy.id }));
    } else {
      navigate(PATH_BUY.buyList, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAddProduct = () => {
    setOpenAddProduct(true);
  };

  useEffect(() => {
    return () => {
      axios
        .get(`api/buy/buy_action_rebuild/?buy_id=${state?.buyId}&pharmacy_id=${state?.pharmacyId}`)
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


  return (
    <>
      {!loadingShipment ? (
        <Page title="Manage Shipments">
          <Container maxWidth={themeStretch ? false : 'xl'}>
            {currentPharmacy.id === shipment?.order.pharmacy && <ShipmentItemsTable shipment={shipment} user={user} buyId={state.buyId}/>}
            {currentPharmacy.id !== shipment?.order.pharmacy && <ShipmentItemsTable shipment={shipment} user={user} buyId={state.buyId}/>}
            {/* {currentPharmacy.id !== shipment?.order.pharmacy && <PharmacyItemsTable shipment={shipment} />} */}
            <DialogModal
              title={'add_product'}
              open={Boolean(AddProduct)}
              onClose={handleCloseAddProduct}
              DialogContentItems={<ShipmentProductFormAdd currentBuy={currentBuy} shipmentItems={shipment} products={products} />}
            />
          </Container>
        </Page>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}
