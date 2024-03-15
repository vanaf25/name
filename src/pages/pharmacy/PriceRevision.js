import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { useWindowSize } from '../../hooks/useResponsive';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import PharmacyDataGrid from '../../sections/pharmacy/PharmacyDataGrid';
import ProductPrices from '../../sections/pharmacy/ProductPrices';
import ClientsDataGrid from '../../sections/pharmacy/ClientsDataGrid';
import MarketplacesDataGrid from '../../sections/pharmacy/MarketplacesDataGrid';
import { filterProducts, resetProducts } from '../../redux/slices/pharmacy_product';

// ----------------------------------------------------------------------

export default function PriceRevision() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { height } = useWindowSize();
  const modifiedHeights = height - height * 0.08;
  const { currentPharmacy } = useAuth();

  const startTime = new Date();
  const endTime = new Date();

  useEffect(() => {
    dispatch(filterProducts({ dateRange: [startTime, endTime], pharmacy_id: currentPharmacy.id }));
    dispatch(resetProducts());
  }, []);

  return (
    <Page title="Price Revision" style={{ height: '100%' }}>
      <Container maxWidth={themeStretch ? false : 'xl'} style={{ height: '100%' }}>
        <Grid container spacing={2} sx={{ maxHeight: modifiedHeights, height: '100%' }}>
          <Card sx={{ padding: 2, display: 'flex', maxHeight: modifiedHeights, width: '100%', height: '100%' }}>
            <Grid item xs={6} md={7} sx={{ maxHeight: '100%', alignItems: 'strech', height: '100%', gap: '16px' }}>
              <ProductPrices />
              <Grid
                style={{
                  height: 'calc(100% - 155px)',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  flex: '0 1',
                  flexDirection: 'column',
                }}
              >
                <PharmacyDataGrid />
                <ClientsDataGrid />
              </Grid>
            </Grid>
            <Grid item xs={6} md={7}>
              <MarketplacesDataGrid />
            </Grid>
          </Card>
        </Grid>
      </Container>
    </Page>
  );
}
