// @mui
import { Box, Container, Typography } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import PharmacyForm from '../../sections/pharmacy/PharmacyForm';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function Register() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();

  return (
    <Page title="Register Pharmacy">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {translate('pharmacy_register.heading')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  color: 'text.disabled',
                }}
              >
                {translate('pharmacy_register.subheading')}
              </Typography>
            </Box>
          </Box>
        </Box>
        <PharmacyForm />
      </Container>
    </Page>
  );
}
