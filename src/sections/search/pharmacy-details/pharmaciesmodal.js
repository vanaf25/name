import PropTypes from 'prop-types';
// @mui
import { TableContainer, Table, TableHead, TableRow, TableCell, ClickAwayListener, TableBody } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Scrollbar from '../../../components/Scrollbar';
// utils
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------
Pharmaciesmodal.propTypes = {
  pharmaciesmodal: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
};
export default function Pharmaciesmodal({ onClose, Pharmacy }) {
  const EAN = [];
  const tempEAN = Pharmacy?.stocks?.forEach((v) => {
    return v.forEach((j) => {
      EAN.push(j.cn_ean);
      return j;
    });
  });

  const { translate } = useLocales();

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Scrollbar>
        <TableContainer sx={{ mt: 5 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{translate('idarticulo')}</TableCell>
                <TableCell>{translate('cn_ean')}</TableCell>
                <TableCell>{translate('PRODUCT_NAME')}</TableCell>
                <TableCell>{translate('expiration')}</TableCell>
                <TableCell>{translate('avgprice')}</TableCell>
                <TableCell>{translate('uprice')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Pharmacy?.stocks?.map((v) => {
                return (
                  <TableRow key={v[0].idarticulo}>
                    <TableCell>{v[0].idarticulo}</TableCell>
                    <Tooltip title={EAN.toString()} arrow>
                      <TableCell>{v[0].cn_ean}...</TableCell>
                    </Tooltip>
                    <TableCell>{v[0].name}</TableCell>
                    <TableCell>{v[0].expiration}</TableCell>
                    <TableCell>{v[0].avgprice}</TableCell>
                    <TableCell>{v[0].uprice}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </ClickAwayListener>
  );
}
