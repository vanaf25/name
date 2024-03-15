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

import { PATH_BUY } from '../../../routes/paths';
import { getShipmentList } from '../../../redux/slices/shipment';
import ShipmentForm from '../../../sections/buy/shipment/components/ShipmentForm';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyOrderShipmentsHeader() {
  const { translate } = useLocales();

  const dispatch = useDispatch();
  const { user, currentPharmacy } = useAuth();

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
            if(response.data.shipment_count === 0){
              setOpenDialog(true);
            }
          })
          .catch((error) => {
            // console.log(error);
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
            heading={translate('shipment.shipment_list_heading')}
            links={[
              { name: translate('buy.catalog_orders'), href: PATH_BUY.buyOrders.replace(':buyId', order?.buy) },
              { name: translate('shipment.shipment_list_subheading') },
            ]}
          />
        </Box>

        {(currentPharmacy.id === order?.pharmacy || user.id === order?.created_by) && (
          <Button style={{ marginRight:20}}  variant="contained" onClick={handleOpenDialog} startIcon={<Iconify icon={'eva:plus-fill'} />}>
            {translate('shipment.new_shipment')}
          </Button>
        )}
      </Stack>
      <ShipmentForm order={order} openDialog={openDialog} handleCloseDialog={handleCloseDialog}/>
    </>
  );
}
