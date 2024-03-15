import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LoadingButton, MobileDatePicker } from '@mui/lab';
// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getBuyConditionsSuccess } from '../../../redux/slices/buy';
// Hooks
import useLocales from '../../../hooks/useLocales';
import ActionMenu from './ActionMenu';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// Utils
import axios from '../../../utils/axios';

// Paths
import { BUY_API } from '../../../constants/ApiPaths';

CatalogConditions.propTypes = {
  currentBuy: PropTypes.object,
};

export default function CatalogConditions({ currentBuy }) {
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { catalog } = useSelector((state) => state.buy);

  // States
  const [editCondition, setEditCondition] = useState(null);

  const ConditionSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    condition_1: Yup.string().required('Family is required'),
    condition_2: Yup.string(),
    campaign_condition: Yup.string(),
    campaign_start_date: Yup.string(),
    campaign_end_date: Yup.string(),
    annual: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
  });

  const defaultValues = useMemo(
    () => ({
      name: editCondition?.name || '',
      condition_1: editCondition?.condition_1 || '',
      condition_2: editCondition?.condition_2 || '',
      campaign_condition: editCondition?.campaign_condition || '',
      campaign_start_date: editCondition?.campaign_start_date || '',
      campaign_end_date: editCondition?.campaign_end_date || '',
      annual: editCondition?.annual || '',
      note: editCondition?.note || '',
    }),
    [editCondition]
  );

  const methods = useForm({
    resolver: yupResolver(ConditionSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    // console.log('Hey: ', data);
    const startDate = data.campaign_start_date ? format(new Date(data.campaign_start_date), 'yyyy-MM-dd') : null;
    const endDate = data.campaign_end_date ? format(new Date(data.campaign_end_date), 'yyyy-MM-dd') : null;
    return axios({
      method: editCondition ? 'put' : 'post',
      url: editCondition ? `${BUY_API.BUY_CONDITION}${editCondition.id}/` : `${BUY_API.BUY_CONDITION}`,
      data: {
        name: data.name,
        condition_1: data.condition_1,
        condition_2: data.condition_2,
        campaign_condition: data.campaign_condition,
        campaign_start_date: startDate,
        campaign_end_date: endDate,
        annual: data.annual,
        buy: currentBuy.id,
      },
    })
      .then((response) => {
        let updatedConditions = [];
        if (response.status === 201 || response.status === 200) {
          // If Created New Condition
          if (response.status === 201) {
            updatedConditions = [{ ...response.data }, ...catalog.conditions];
          } else {
            // If Update Existing Condition
            updatedConditions = catalog.conditions.map((condition) => {
              if (condition.id === editCondition.id) {
                return { ...response.data };
              }
              return { ...condition };
            });
          }
          dispatch(getBuyConditionsSuccess(updatedConditions));
          setEditCondition(null);
          handleResetForm();
          enqueueSnackbar(
            !editCondition ? 'Condition has been created successfully.' : 'Condition has been Updated successfully.'
          );
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleDelete = (condition) => {
    axios
      .delete(`${BUY_API.BUY_CONDITION}${condition.id}`)
      .then(() => {
        enqueueSnackbar('Condition has been deleted successfully.');
        const updatedConditions = catalog.conditions.filter((row) => row.id !== condition.id);
        dispatch(getBuyConditionsSuccess(updatedConditions));
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleEdit = (condition) => {
    setEditCondition(condition);
  };

  const handleResetForm = () => {
    setEditCondition(null);
    reset({
      name: '',
      condition_1: '',
      condition_2: '',
      campaign_condition: '',
      campaign_start_date: '',
      campaign_end_date: '',
      annual: '',
    });
  };

  //   Effect Hooks
  useEffect(() => {
    if (editCondition)
      reset({
        name: editCondition.name,
        condition_1: editCondition?.condition_1 || '',
        condition_2: editCondition?.condition_2 || '',
        campaign_condition: editCondition?.campaign_condition || '',
        campaign_start_date: editCondition?.campaign_start_date || '',
        campaign_end_date: editCondition?.campaign_end_date || '',
        annual: editCondition.annual ? editCondition.annual : '',
      });
  }, [editCondition]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={3}>
      <Grid item md={12}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item md={3}>
              <RHFTextField name="name" placeholder={translate('name')} size="small" />
            </Grid>
            <Grid item md={3}>
              <RHFTextField name="annual" placeholder={translate('buy.annual')} size="small" />
            </Grid>
            <Grid item md={3}>
              <RHFTextField name="condition_1" placeholder={translate('buy.family')} size="small" />
            </Grid>
            <Grid item md={3}>
              <RHFTextField name="condition_2" placeholder={translate('buy.individual')} size="small" />
            </Grid>
            <Grid item md={4}>
              <RHFTextField name="campaign_condition" placeholder={translate('buy.campaign')} size="small" />
            </Grid>
            <Grid item md={4}>
              <Controller
                name="campaign_start_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <MobileDatePicker
                    label={translate('start_date')}
                    inputFormat="MM/dd/yyyy"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <RHFTextField {...params} size="small" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item md={4}>
              <Controller
                name="campaign_end_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <MobileDatePicker
                    label={translate('end_date')}
                    inputFormat="MM/dd/yyyy"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <RHFTextField {...params} size="small" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={12} display="flex" alignItems="end" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="small">
                {editCondition ? translate('Update_Condition') : translate('Add_Condition')}
              </LoadingButton>
              <Button onClick={() => handleResetForm()}>{translate('reset')}</Button>
            </Grid>
          </Grid>
        </FormProvider>
      </Grid>
      <Grid item md={12}>
        <TableContainer sx={{ maxHeight: 200 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>{translate('buy.commercial_condition')}</TableCell>
                <TableCell>{translate('buy.family')}</TableCell>
                <TableCell>{translate('buy.individual')}</TableCell>
                <TableCell>{translate('buy.annual')}</TableCell>
                <TableCell>{translate('buy.campaign')}</TableCell>
                <TableCell>{null}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalog.conditions.map((condition) => (
                <TableRow key={condition.id}>
                  <TableCell>{condition.name}</TableCell>
                  <TableCell>{condition.condition_1}</TableCell>
                  <TableCell>{condition.condition_2}</TableCell>
                  <TableCell>{condition.annual}</TableCell>
                  <TableCell>{condition.campaign_condition}</TableCell>
                  <TableCell>
                    <ActionMenu onDelete={() => handleDelete(condition)} onEdit={() => handleEdit(condition)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
