import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';

// Redux
import { useSelector } from '../../../redux/store';

// Components
// import CatalogProductsTable from './CatalogProductsTableTest';

import CatalogProductsTable from './CatalogProductsTable';

CatalogProductForm.propTypes = {
  currentBuy: PropTypes.object,
};

export default function CatalogProductForm({ currentBuy }) {

  const { catalog } = useSelector((state) => state.buy);

  // States
  const [rootCategories, setRootCategories] = useState([]);

  useEffect(() => {
    const rootCategories = catalog.categories.filter((cat) => !cat.parent && cat.name);
    setRootCategories(rootCategories);
  }, [catalog.categories]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item md={12} sx={{ pt: 2 }}>
          <CatalogProductsTable currentBuy={currentBuy} />
        </Grid>
      </Grid>
    </>
  );
}
