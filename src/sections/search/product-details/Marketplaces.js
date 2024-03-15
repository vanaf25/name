import PropTypes from 'prop-types';
// @mui
import { Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Scrollbar from '../../../components/Scrollbar';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------
Marketplaces.propTypes = {
  marketplaces: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
};
export default function Marketplaces({ marketplaces }) {
  const { translate } = useLocales();

  return (
    <Card>
      <Scrollbar>
        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{translate('product_detail.market')}</TableCell>
                <TableCell>{translate('product_detail.no_of_shops')}</TableCell>
                <TableCell>{translate('product_detail.price_range')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marketplaces.map((market) => (
                <TableRow key={market.id}>
                  <TableCell>{market.marketplace}</TableCell>
                  <TableCell>{market.no_of_shops}</TableCell>
                  <TableCell>
                    {fCurrency(market.min_price)} - {fCurrency(market.max_price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}
