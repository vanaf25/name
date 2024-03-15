import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, TextField, TableCell, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

// Redux
import { useDispatch, useSelector } from '../../../redux/store';

// Hooks
import useLocales from '../../../hooks/useLocales';

// Utils
import axios from '../../../utils/axios';
import { fCurrency } from '../../../utils/formatNumber';
import { calculateTax, calculateDiscount } from '../../../utils/calculateTax';

const Input = styled('input')({
  display: 'none',
});

NeedTableRow.propTypes = {
  catalog: PropTypes.object,
};

export default function NeedTableRow({ catalog }) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  // Declare states
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [discountObj, setDiscountObj] = useState(0);

  const getMax = (catalogCondition) => {
    if (!catalogCondition) return;

    const discounts = [];
    if (catalogCondition.annual) discounts.push(catalogCondition.annual);

    if (catalogCondition.condition_1) {
      discounts.push(...catalogCondition.condition_1.split(' ').map((i) => i.split('-')[1]));
    }

    if (catalogCondition.condition_2) {
      discounts.push(...catalogCondition.condition_2.split(' ').map((i) => i.split('-')[1]));
    }

    const campaignStart = catalogCondition.campaign_start_date;
    const campaignEnds = catalogCondition.campaign_end_date;
    const now = new Date();
    if (
      campaignStart &&
      campaignEnds &&
      catalogCondition.campaign_condition &&
      now >= new Date(campaignStart) &&
      now <= new Date(campaignEnds)
    ) {
      discounts.push(...catalogCondition.campaign_condition.split(' ').map((i) => i.split('-')[1]));
    }

    const intDiscount = discounts.map((item) => (item && parseInt(item, 10) !== 'NaN' ? parseInt(item, 10) : 0));
    return Math.max(...intDiscount);
  };

  const getColor = (discount) => {
    if (parseInt(discount, 10) === parseInt(maxDiscount, 10)) return 'green';
    if (parseInt(discount, 10) >= parseInt(maxDiscount, 10) * 0.7) return 'red';
  };

  React.useEffect(() => {
    setMaxDiscount(getMax(catalog.catalog_condition));
    const amount = (catalog.need?.units || 0) * catalog.pvl;
    setNetAmount(amount);
    setDiscountObj(calculateDiscount(catalog.catalog_condition, amount, catalog.need?.units || 0, 0));
  }, [catalog]);

  return (
    <TableRow key={catalog.id}>
      <TableCell>
        {/* <TextField name="units" label={translate('units')} size="small" sx={{ p: 0 }} /> */}
        {catalog.need?.units || 0}
      </TableCell>
      <TableCell>0</TableCell>
      <TableCell>{catalog.cn || catalog.ean}</TableCell>
      <TableCell>{catalog.name}</TableCell>
      {/* <TableCell>{fCurrency(catalog.pvl)}</TableCell> */}
      {/* <TableCell sx={{ color: getColor(discountObj.discount) }}>{discountObj.discount}</TableCell> */}
      {/* <TableCell sx={{ color: '#91cfd4' }}>{maxDiscount}%</TableCell> */}
      <TableCell>0</TableCell>
      {/* <TableCell>{fCurrency(netAmount)}</TableCell> */}
    </TableRow>
  );
}
