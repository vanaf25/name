import { useEffect, useState } from 'react';
// @mui
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import styled from 'styled-components';
// hooks
import useLocales from '../../../hooks/useLocales';
import useAuth from '../../../hooks/useAuth';
// components
import Image from '../../../components/Image';
import { BUY_TYPE_IMAGES } from '../../../constants/AppEnums';
import { PATH_BUY } from '../../../routes/paths';
import axios from '../../../utils/axios';

import { BUY_API } from '../../../constants/ApiPaths';
import {
  getBuyCategories,
  getBuyConditions,
  getBuyNeedShorting,
  getBuyNeeds,
  getBuyProducts,
  getIsParaPharamcy,
  getParaBuyNeeds,
  getRelatedPharmacy,
} from '../../../redux/slices/buy';

import ManageMenuPopover from '../../../pages/buy/ManageMenuPopover';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyCatalogHeader() {
  const dispatch = useDispatch();
  const { buys } = useSelector((state) => state.buy);

  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [currentBuy, setCurrentBuy] = useState();
  const [loadingBuy, setLoadingBuy] = useState(true);

  useEffect(() => {
    if (id) {
      if (buys && buys.length) {
        const foundBuy = buys.find((buy) => buy.id === parseInt(id, 10));
        if (!foundBuy) navigate(PATH_BUY.buyList, { replace: true });
        setCurrentBuy(foundBuy);
        setLoadingBuy(false);
      } else {
        axios
          .get(`${BUY_API.BUY}${id}/`)
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

      // Load Catalog Categories for current buy
      dispatch(getBuyCategories(id));
      // Load Catalog Conditions for current buy
      dispatch(getBuyConditions(id));
      // Load Catalog Products for current buy
      dispatch(getBuyProducts(id));
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
          // zIndex: 99999,
          width: '100%',
          marginTop: 40,
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
          <Image src={BUY_TYPE_IMAGES[currentBuy?.type]} sx={{ width: 50, height: 50 }} />
        </Box>

        <Box sx={{ minWidth: 160 }} style={{ marginRight: 'auto' }}>
          <Typography variant="h4" style={{ color: '#212B36' }}>
            {currentBuy?.name}
          </Typography>
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
              {currentBuy?.type}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Stack alignItems="flex-end" sx={{marginRight:'2%'}}>
            <ManageMenuPopover currentBuy={currentBuy} />
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
