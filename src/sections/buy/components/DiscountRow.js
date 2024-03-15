import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip } from '@mui/material';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useLocales from '../../../hooks/useLocales';
import ConditionTooltip from './ConditionTooltip';
import axios from '../../../utils/axios';
import { useDiscountContext } from '../NewNeedTable';
// import { BUY_API } from '../../../constants/ApiPaths';


DiscountRow.propTypes = {
  row: PropTypes.object,
  filters:PropTypes.object
};

export default function DiscountRow({ row,val ,filters}) {
  const { translate } = useLocales();
  const { discountValue, setDiscountValue } = useDiscountContext();
  const [discount , setDiscount]= useState( 0)
  const [totalUnits , setTotalUnits]= useState(0)
  const getColor = (discount, maxDiscount) => {
    if(totalUnits >   0  ){
      if (parseInt(discount, 10) === parseInt(maxDiscount, 10)) return 'green';
      if (parseInt(discount, 10) <= parseInt(maxDiscount, 10) ) return 'red';
    }
    return '';
  };
  useEffect(()=>{

    if(discountValue?.id===row?.original?.id || discountValue?.conditionId===row?.original?.catalog_condition?.id){
      axios
        .get(`/api/buy/needs_discount/?cat_id=${row.original?.id}`)
        .then((response) => {
          if(JSON.parse(response?.data?.dto) == null){
            setDiscount(0)
            setTotalUnits(0)
          }else{
            setDiscount(JSON.parse(response?.data?.dto)[2]*100)
            setTotalUnits(JSON.parse(response?.data?.dto)[1])
          }
          // window.location.reload();
          // enqueueSnackbar('Item has been updated successfully.');
        })
        .catch((error) => {
          // enqueueSnackbar('Oops something went wrong.', {
          //   variant: 'error',
          // });
        });
    }else{
      setDiscount(row?.original?.catalog_condition?.current_total_discount * 100)
            setTotalUnits(row?.original?.catalog_condition?.current_total_units  )
    }

  },[discountValue,filters,row.original])

  return (
    <Tooltip title={<ConditionTooltip totalUnits={totalUnits} condition={row.original.catalog_condition} />} arrow>
      <Box sx={{ color: getColor(discount , row.original.max_discount) }}>
        {discount.toFixed(0)}%
      </Box>
    </Tooltip>
  );
}
