import PropTypes from 'prop-types';
// @mui
import { Box, Card, Stack, Divider, CardHeader, Typography, CardContent } from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
import useLocales from '../../../../hooks/useLocales';

// ----------------------------------------------------------------------

ShipmentSummary.propTypes = {
  editShipment: PropTypes.array,
};

export default function ShipmentSummary({ editShipment, title }) {
  const { translate } = useLocales();

  let sumResult = {};

  // console.log({ editShipment })
  if (editShipment.length > 0) {
    sumResult = editShipment.reduce((accumulator, currentValue) => {
      return {
        grand_total: accumulator.grand_total + currentValue.grand_total,
        discount_amount: accumulator.discount_amount + currentValue.discount_amount,
        subtotal: accumulator.subtotal + currentValue.subtotal,
        units: accumulator.units + currentValue.units,
        recargo_amount: accumulator.recargo_amount + currentValue.recargo_amount,
        tax_amount: accumulator.tax_amount + currentValue.tax_amount,
      };
    });

    // console.log(sumResult);
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader title={title} />

      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Total_Units")}
            </Typography>
            <Typography variant="subtitle2">{sumResult.units}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Sub_Total")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(sumResult.subtotal)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Discount")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(-sumResult.discount_amount)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              IVA
            </Typography>
            <Typography variant="subtitle2">{fCurrency(sumResult.tax_amount)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Recargo")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(sumResult.recargo_amount)}</Typography>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">Total</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                {fCurrency(
                  +sumResult.grand_total
                )}
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                (VAT included if applicable)
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
