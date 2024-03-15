import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Grid,
  CardContent,
} from '@mui/material';

// Components
import CatalogProductForm from './components/CatalogProductForm';
import BuyInfo from './components/BuyInfo';


PurchaseCatalog.propTypes = {
  currentBuy: PropTypes.object,
};

export default function PurchaseCatalog({ currentBuy }) {

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <BuyInfo currentBuy={currentBuy} />
      </Grid>
      <Grid item xs={12} md={12}>
        <Card>
          <CardContent>
            <CatalogProductForm currentBuy={currentBuy} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
