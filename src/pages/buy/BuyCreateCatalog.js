import { useEffect, useState , createContext , useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Hooks
import useSettings from '../../hooks/useSettings';

// Componenets
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import Image from '../../components/Image';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getBuyCategories, getBuyConditions, getBuyProducts } from '../../redux/slices/buy';

// Paths
import { PurchaseCatalog } from '../../sections/buy';
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Constants
import { BUY_API } from '../../constants/ApiPaths';
import { BUY_TYPE_IMAGES } from '../../constants/AppEnums';
import ManageMenuPopover from './ManageMenuPopover';


const BuyCreateCatalogContext = createContext({});

export const useBuyCreateCatalogContext = ()  => useContext(BuyCreateCatalogContext);

export default function BuyCreateCatalog() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { buys } = useSelector((state) => state.buy);

  const { pathname ,state} = useLocation();


  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [currentBuy, setCurrentBuy] = useState();
  const [loadingBuy, setLoadingBuy] = useState(true);

  const [productLoaderFunction, setProductLoaderFunction] = useState(null);


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
    <BuyCreateCatalogContext.Provider value={{productLoaderFunction, setProductLoaderFunction}}>
      {!loadingBuy ? (
        <Page title="Buy Catalog">
          <Container maxWidth={themeStretch ? false : 'xl'}>
            {/* <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 5 }}>
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

              <Box sx={{ minWidth: 160 }}>
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
              <Box sx={{ flexGrow: 1 }}>
                <Stack alignItems="flex-end">
                  <ManageMenuPopover currentBuy={currentBuy} />
                </Stack>
              </Box>
            </Stack> */}
            <PurchaseCatalog currentBuy={currentBuy} />
          </Container>
        </Page>
      ) : (
        <LoadingScreen />
      )}
    </BuyCreateCatalogContext.Provider>
  );
}
