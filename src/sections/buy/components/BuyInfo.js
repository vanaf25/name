import PropTypes from 'prop-types';
// @mui
import { Card, Typography, CardContent, Stack, Box, Chip } from '@mui/material';
import Divider from '@mui/material/Divider';

// Hooks
import useLocales from '../../../hooks/useLocales';

FieldWidget.propTypes = {
  title: PropTypes.string,
  summary: PropTypes.any,
};
function FieldWidget({ title, summary }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {summary || 'N/A'}
      </Typography>
    </Box>
  );
}

BuyInfo.propTypes = {
  currentBuy: PropTypes.object,
};

export default function BuyInfo({ currentBuy }) {
  const { translate } = useLocales();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          justifyContent="space-between"
          alignItems="center"
        >
          <FieldWidget title={translate('lab')} summary={currentBuy.lab_name} />
          <FieldWidget
            title={translate('buy.contact_person')}
            summary={
              <>
                {currentBuy.contact_person}
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ({currentBuy.contact_phone})
                </Typography>
              </>
            }
          />
          <FieldWidget title={translate('buy.payment_method')} summary={currentBuy.payment_method} />
          <FieldWidget title={translate('buy.estimation_period')} summary={currentBuy.period_estimation} />
          <FieldWidget title={translate('status')} summary={currentBuy.status} />
          <FieldWidget
            title={translate('groups')}
            summary={currentBuy.buygroup_set.map((row) => (
              <Chip
                key={row.id}
                label={row.group.name}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
