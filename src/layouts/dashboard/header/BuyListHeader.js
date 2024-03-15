import { Link as RouterLink } from 'react-router-dom';
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

// ----------------------------------------------------------------------

const StyledSelect = styled(Select)`
  fieldset {
    border: none;
  }
`;

export default function BuyListHeader() {
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
            Buy List
          </Typography>

          <HeaderBreadcrumbs
            heading={translate('buy.buy_list_heading')}
            links={[{ name: translate('buy.buy_group_subheading') }]}
            action={
              // <Button
              //   variant="contained"
              //   component={RouterLink}
              //   to={PATH_BUY.newBuy}
              //   startIcon={<Iconify icon={'eva:plus-fill'} />}
              // >
              //   {translate('buy.new_buy')}
              // </Button>
              <></>
            }
          />
        </Box>

        <Button
          style={{ marginRight: 20 }}
          variant="contained"
          component={RouterLink}
          to={PATH_BUY.newBuy}
          startIcon={<Iconify icon={'eva:plus-fill'} />}
        >
          {translate('buy.new_buy')}
        </Button>
      </Stack>
    </>
  );
}
