import { useEffect, useState } from 'react';
// @mui
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import styled from 'styled-components';
// hooks
import useLocales from '../../../hooks/useLocales';
import useAuth from '../../../hooks/useAuth';
// components
import Image from '../../../components/Image';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { BUY_TYPE_IMAGES } from '../../../constants/AppEnums';
import { PATH_BUY } from '../../../routes/paths';
import axios from '../../../utils/axios';

import { BUY_API } from '../../../constants/ApiPaths';
import { dispatch } from '../../../redux/store';
import { getBuyNeedShorting, getBuyNeeds, getBuyProducts, getIsParaPharamcy, getParaBuyNeeds, getRelatedPharmacy } from '../../../redux/slices/buy';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyNeedHeader() {
  const { allLang, currentLang, onChangeLang } = useLocales();
  const { buyId = '' } = useParams();
  const navigate = useNavigate();
  const { currentPharmacy } = useAuth();

  const [currentBuy, setCurrentBuy] = useState();
  const [pharamcyType, setPharamcyType] = useState('non-para');
  const [isParaPharamcy, setIsParaPharamcy] = useState(false);
  const { buys, catalog, relatedPharmacy ,buyNeedShorting} = useSelector((state) => state.buy);
  // const { buys, catalog, relatedPharmacy } = useSelector((state) => state.buy);
  const [loadingBuy, setLoadingBuy] = useState(true);

  const [open, setOpen] = useState(null);


  // console.log("buyNeedShorting==>",buyNeedShorting);
  // console.log("currentBuy==>",buys);

  useEffect(() => {
    if (buyId) {
      if (buys && buys.length) {
        const foundBuy = buys.find((buy) => buy.id === parseInt(buyId, 10));
        if (!foundBuy) navigate(PATH_BUY.buyList, { replace: true });

        setCurrentBuy(foundBuy);
        setLoadingBuy(false);
      } else {
        // console.log("response--->",);
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

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleChange = (event) => {
    // setPharamcyType(event.target.value);

    dispatch(getBuyNeedShorting(event.target.value));
    if (event.target.value === 'Para') {
      setIsParaPharamcy(true);
      dispatch(getIsParaPharamcy(true));
     
    } else {
      dispatch(getIsParaPharamcy(false));
      setIsParaPharamcy(false);
    }
  };

  const handleClose = () => {
    setOpen(null);
  };

  

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
                width:"100%",
                marginTop:40               
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
                <Typography variant="h4" style={{color:"#212B36"}}>{currentBuy?.name}</Typography>
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

              <Box>
                <StyledSelect labelId="pharmacy" id="pharmacy" value={buyNeedShorting} onChange={handleChange}>
                  {relatedPharmacy?.map((pharmacy) => {
                    return (
                      <MenuItem value={pharmacy?.type} name={pharmacy?.name}>
                        {pharmacy?.name}
                      </MenuItem>
                    );
                  })}
                </StyledSelect>
              </Box>
            </Stack>
      {/* <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          ...(open && { bgcolor: 'action.selected' }),
        }}
      >
        <Image disabledEffect src={currentLang.icon} alt={currentLang.label} />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <Stack spacing={0.75}>
          {allLang.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => {
                onChangeLang(option.value);
                handleClose();
              }}
            >
              <Image disabledEffect alt={option.label} src={option.icon} sx={{ width: 28, mr: 2 }} />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover> */}
    </>
  );
}
