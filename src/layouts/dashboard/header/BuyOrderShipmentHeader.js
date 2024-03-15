import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// @mui

import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import styled from 'styled-components';
import Button from '@mui/material/Button';
// hooks
import useLocales from '../../../hooks/useLocales';
import useAuth from '../../../hooks/useAuth';

import axios from '../../../utils/axios';

import { BUY_API } from '../../../constants/ApiPaths';

// components
import HeaderBreadcrumbs from '../../../components/Breadcrumbs';
import Iconify from '../../../components/Iconify';
import DialogModal from '../../../components/DialogModal';

import { PATH_BUY } from '../../../routes/paths';
import { getPharmacyItems, getShipmentItems, getShipmentList } from '../../../redux/slices/shipment';
import ShipmentForm from '../../../sections/buy/shipment/components/ShipmentForm';
import { getBuyCategories, getBuyConditions } from '../../../redux/slices/buy';
import ShipmentProductFormAdd from '../../../sections/buy/components/ShipmentProductFormAdd';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyOrderShipmentHeader(props) {
  const { currentBuy } = props;

  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { user, currentPharmacy } = useAuth();

  const { shipmentList } = useSelector((state) => state.shipment);

  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState();
  const [AddProduct, setOpenAddProduct] = useState(false);
  const [loadingShipment, setLoadingShipment] = useState(true);
  const handleCloseAddProduct = () => setOpenAddProduct(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (id) {
      if (shipmentList && shipmentList.length) {
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
                params: { buy: response.data.buy_id },
              })
              .then((response) => {
                setProducts(response.data);
              })
              .catch((error) => {
                // console.log(error);
              });

            // Load Catalog Categories for current buy
            dispatch(getBuyCategories(response.data.buy_id));
            // Load Catalog Conditions for current buy
            dispatch(getBuyConditions(response.data.buy_id));

            setShipment({ ...response.data });
            setLoadingShipment(false);
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

  }, []);

  const handleOpenAddProduct = () => {
    setOpenAddProduct(true);
  };

  let orderId = "";

  if(shipment !== undefined){
    orderId = shipment?.order.id ? shipment.order.id : shipment.order;
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 5 }}
        style={{
          'justify-content': 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <Box>
          <Typography variant="h4" style={{ color: '#212B36' }}>
            {translate('shipment.shipment_list_heading')}
          </Typography>

          <HeaderBreadcrumbs
            heading={translate('shipment.shipment_detail_heading')}
            links={[
              {
                name: translate('shipment.shipment_list_heading'),
                href: PATH_BUY.buyShipments.replace(':orderId', orderId),
              },
              { name: `Shipment: ${shipment?.shipment_number || ''}` },
            ]}
            action={<></>}
          />
        </Box>

        <Button
          style={{ marginRight: 20 }}
          variant="contained"
          onClick={handleOpenAddProduct}
          startIcon={<Iconify icon={'eva:plus-fill'} />}
        >
          {translate('shipment.add_product')}
        </Button>

      </Stack>
      <DialogModal
        title={'add_product'}
        open={Boolean(AddProduct)}
        onClose={handleCloseAddProduct}
        DialogContentItems={
          <ShipmentProductFormAdd currentBuy={currentBuy} shipmentItems={shipment} products={products} onClose={handleCloseAddProduct}/>
        }
      />
    </>
  );
}
