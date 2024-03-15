import { Link as RouterLink } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';

// Paths
import { PATH_BUY } from '../../routes/paths';
import { BuyTable, BuyTableDetails } from '../../sections/buy';

export default function BuyList() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();

  return (
    <Page title="Listado de Compras">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* <HeaderBreadcrumbs
          heading={translate('buy.buy_list_heading')}
          links={[{ name: translate('buy.buy_group_subheading') }]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_BUY.newBuy}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              {translate('buy.new_buy')}
            </Button>
          }
        /> */}
        <BuyTableDetails />
      </Container>
    </Page>
  );
}
