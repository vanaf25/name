import PropTypes from 'prop-types';
// @mui
import { Box, Card, Stack, Divider, CardHeader, Typography, CardContent } from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
import useLocales from '../../../../hooks/useLocales';

// ----------------------------------------------------------------------

OrderSummary.propTypes = {
  editOrder: PropTypes.object,
};

export default function OrderSummary({ editOrder, title }) {
  const { translate } = useLocales();
  return (
    <Card sx={{ mb: 0 }}>
      <CardHeader style={{ marginTop:-20,marginBottom:-10}} title={title} />

      <CardContent>
        <Stack spacing={2}>
          <Stack  style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Total_Units")}
            </Typography>
            <Typography variant="subtitle2">{editOrder.total_units}</Typography>
          </Stack>
          <Stack style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Sub_Total")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(editOrder.sub_total)}</Typography>
          </Stack>

          <Stack  style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Discount")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(-editOrder.discount_amount)}</Typography>
          </Stack>

          <Stack style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              IVA
            </Typography>
            <Typography variant="subtitle2">{fCurrency(editOrder.tax_amount)}</Typography>
          </Stack>

          <Stack  style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate("Recargo")}
            </Typography>
            <Typography variant="subtitle2">{fCurrency(editOrder.recargo_amount)}</Typography>
          </Stack>

          <Divider />

          <Stack  style={{marginTop:5}} direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">Total</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                { editOrder?.grand_total ? fCurrency(
                  +editOrder.grand_total
                ) : fCurrency(
                  +editOrder.sub_total - +editOrder.discount_amount + +editOrder.tax_amount + +editOrder.recargo_amount
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
