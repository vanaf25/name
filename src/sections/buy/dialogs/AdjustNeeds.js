import React, { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';

import { Card, Grid, Box, Typography, CardHeader, TextField, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { TextEditor } from 'react-data-grid';
import CustomDataGrid from '../../../components/CustomDataGrid';

import Loader from '../../../components/Loader';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';
import { fCurrency } from '../../../utils/formatNumber';

// Redux
import { useDispatch, useSelector } from '../../../redux/store';
import useLocales from '../../../hooks/useLocales';



function AdjustNeeds({ needsCatalog, handleClose }) {  
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { catalog } = useSelector((state) => state.buy);
  
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [catalogCondition, setCatalogCondition] = useState({});
    const [adjustTo, setAdjustTo] = useState('');
    const [isUpdatingNeeds, setIsUpdatingNeeds] = useState(false);
    const [loadingItemPharmacies, setLoadingItemPharmacies] = useState(false);

    // console.log("DEBUG", {catalog, needsCatalog})


    const onUpdateNeedRow = (row, updatedRow) => {
        row = row[0];
        // console.log({row, updatedRow});

        const formData = {
            condition: row.catalog_condition.id,
            buyID: row.catalog_condition.buy,
            amount: row.total,
            adjusted_units: +row.adjusted_units,
            catalogID: row.product[0].id
          };
    
          // console.log("DATA",{formData});

        axios
        .post(`${BUY_API.ADJUST_NEED}`, formData)
        .then((response) => {
          // console.log("DEBUG",{response});
          enqueueSnackbar('Item has been updated successfully.');
        })
        .catch((error) => {
            enqueueSnackbar('Oops something went wrong.', {
              variant: 'error',
            });
          });
    }

    const needColumns = useMemo(
        () => [
          {
            key: 'units',
            name: 'units',
          },
          {
            key: 'adjusted_units',
            name: 'Adjusted Units',
            editor: TextEditor,
            editorOptions: {
              editOnClick: true,
            },
          },
          {
            key: 'total',
            name: 'Total',
            formatter({ row }) {
              return fCurrency(row.total);
            },
          },
        ],
        [needsCatalog]
      );

    return (
        <>
        {!loadingItemPharmacies ? (
              <DialogContent>
                <DialogTitle>
                  <Typography variant="h3" align="center">
                    Adjust Needs
                  </Typography>
                </DialogTitle>

                <Grid spacing={3} sx={{ mt: 2, width:300, minWidth:"100%" }}>
                  <Grid item md={12}>
                    <CustomDataGrid
                        sx={{ p: 1 }}
                        // loading={loadingItemPharmacies}
                        // rowHeight={55}
                        rows={[needsCatalog]}
                        columns={needColumns}
                        onRowsChange={onUpdateNeedRow}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
            ) : (
              <Loader />
            )}
        </>
    )
}

export default AdjustNeeds;