import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import { Card, Typography, CardHeader, CardContent } from '@mui/material';

// utils
import axios from '../../../../utils/axios';
import { PHARMACY_API } from '../../../../constants/ApiPaths';

// ----------------------------------------------------------------------

OrderPharmacyInfo.propTypes = {
  editOrder: PropTypes.object,
};

export default function OrderPharmacyInfo({ editOrder }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader style={{ marginBottom:-10,marginTop:-20}} title="Pharmacy Info" />
      <CardContent>
        <Typography style={{ marginBottom:0}} variant="subtitle2" gutterBottom>
          {editOrder.pharmacy_detail?.name || ''}
        </Typography>
        <Typography style={{ marginBottom:2}} variant="subtitle2" gutterBottom>
          Para-Pharmacy: &nbsp;
          <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
            {editOrder.pharmacy_detail?.para_pharmacy || false ? 'Yes' : 'No'}
          </Typography>
        </Typography>
        <Typography style={{ marginBottom:2}} variant="body2" gutterBottom>
          {editOrder.pharmacy_detail?.formatted_address}
        </Typography>
        <Typography style={{ marginBottom:2}} variant="body2" sx={{ color: 'text.secondary' }}>
          {editOrder.pharmacy_detail?.telephone}
        </Typography>
      </CardContent>
    </Card>
  );
}
