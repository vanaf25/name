import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sentenceCase } from 'change-case';
// @mui

import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import styled from 'styled-components';
import Button from '@mui/material/Button';
// hooks
import useLocales from '../../../hooks/useLocales';

// components
import HeaderBreadcrumbs from '../../../components/Breadcrumbs';
import Iconify from '../../../components/Iconify';

import { PATH_BUY } from '../../../routes/paths';
import axios from '../../../utils/axios';

// Constants
import { BUY_API } from '../../../constants/ApiPaths';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyEditOrderHeader() {
  const { orders } = useSelector((state) => state.buy);

  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { translate } = useLocales();

  const [currentBuy, setCurrentBuy] = useState({});
  const [editOrder, setEditOrder] = useState();
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Load the Buy and Catalogs for Order Preparation
  useEffect(() => {
    if (id) {
      if (orders && orders.length) {
        const foundOrder = orders.find((order) => order.id === parseInt(id, 10));

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
            {translate('order_detail')}
          </Typography>

          <HeaderBreadcrumbs
            heading={translate('order_detail')}
            // links={[{ name: 'Create Order Subheading' }]}
            links={[
              // { name: 'Order List', href: PATH_BUY.buyOrders.replace(':buyId', editOrder?.buy || '') },
              {
                name: sentenceCase(currentBuy?.name || ''),
                href: PATH_BUY.buyOrders.replace(':buyId', editOrder?.buy || ''),
              },
              { name: translate('report_data.order') },
            ]}
            action={ <></>}
          />
        </Box>

        <Box>
        <Button
              style={{ marginRight:20}}
              component={RouterLink}
              to={PATH_BUY?.buyOrders?.replace(':buyId', editOrder?.buy || '')}
              startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} />}
            >
              {translate('Back')}
            </Button>
        </Box>

      </Stack>
    </>
  );
}
