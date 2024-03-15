import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// Redux
import { useSelector } from '../../redux/store';

// Paths
import { BuyForm } from '../../sections/buy';
import axios from '../../utils/axios';
import { BUY_API } from '../../constants/ApiPaths';

export default function BuyCreate() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { groups } = useSelector((state) => state.buy);
  const obj = useSelector((state) => state.buy);
  const { id = '' } = useParams();
  const { pathname ,state} = useLocation();
  const isEdit = pathname.includes('update');
  const [currentBuy, setCurrentBuy] = useState(); 

  useEffect(() => {
    return () => {
      if(isEdit){
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
      }
  }, []);
  
  useEffect(() => {
    if (isEdit) {
      // if (groups.length) {
      //   setCurrentBuy(groups.find((group) => group.id === parseInt(id, 10)));
      // } else {
        axios
          .get(`${BUY_API.BUY}${id}/`)
          .then((response) => {
            setCurrentBuy({ ...response.data });
          })
          .catch((error) => {
            // console.log(error);
          });
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Page title="New Buy">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        {/* <HeaderBreadcrumbs
          heading={translate('buy.buy_new_heading')}
          links={[{ name: translate('buy.buy_group_subheading') }]}
        /> */}
        <BuyForm isEdit={isEdit} currentBuy={currentBuy} />
      </Container>
    </Page>
  );
}
