import { Link as RouterLink } from 'react-router-dom';
// @mui

import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import styled from 'styled-components';

// hooks
import useLocales from '../../../hooks/useLocales';

// components
import HeaderBreadcrumbs from '../../../components/Breadcrumbs';

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyNewHeader() {
  const { translate } = useLocales();

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
            New Buy
          </Typography>

          <HeaderBreadcrumbs
            heading={translate('buy.buy_new_heading')}
            links={[{ name: translate('buy.buy_group_subheading') }]}
          />
        </Box>
      </Stack>
    </>
  );
}
