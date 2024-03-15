import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { LoadingButton } from '@mui/lab';
import { MenuItem, Select } from '@mui/material';

// Redux
import { useDispatch } from '../../../../redux/store';
import { addShipment, getShipmentList } from '../../../../redux/slices/shipment';

// Hooks
import useLocales from '../../../../hooks/useLocales';
import useAuth from '../../../../hooks/useAuth';

// Components
import { FormProvider, RHFTextField, RHFDesktopDatePicker } from '../../../../components/hook-form';

// Utils
import axios from '../../../../utils/axios';
import { fDateForDB } from '../../../../utils/formatTime';

// Paths
import { BUY_API } from '../../../../constants/ApiPaths';

ShipmentForm.propTypes = {
  order: PropTypes.object,
  openDialog: PropTypes.bool,
  handleCloseDialog: PropTypes.func,
};

function ShipmentForm({ order, openDialog, handleCloseDialog }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { user } = useAuth();

  const ShipmentSchema = Yup.object().shape({
    shipment_number: Yup.string().required('Shipment Number is required'),
    shipment_date: Yup.string().required('Shipment Date is required'),
  });

  const defaultValues = {
    shipment_number: '',
    shipment_date: new Date(),
    shipmentType: '',
  };

  const methods = useForm({
    resolver: yupResolver(ShipmentSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    // console.log('Hey: ', {data, order});

    // console.log(fDateForDB(data.shipment_date));
    return axios
      .post(BUY_API.SHIPMENT, {
        shipment_number: data.shipment_number,
        shipment_date: fDateForDB(data.shipment_date),
        order: order.id,
        created_by: user.id,
      })
      .then((response) => {
        if (response.status === 201) {
          handleResetForm();
          handleCloseDialog();
          enqueueSnackbar('Shipment has been created successfully.');
          dispatch(addShipment(response.data));
          dispatch(getShipmentList({ order: order.id }));
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleResetForm = () => {
    reset({ shipment_number: '', shipment_date: new Date() });
  };


  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{translate('shipment.new_shipment')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <RHFTextField name="shipment_number" label={translate('shipment.shipment_number')} autoFocus />
            </Grid>
            <Grid item md={12}>
              <RHFDesktopDatePicker
                label={translate('shipment.shipment_date')}
                name="shipment_date"
                inputFormat="MM/dd/yyyy"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleCloseDialog}>
            {translate('cancel')}
          </Button>
          <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
            {translate('save')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default ShipmentForm;
