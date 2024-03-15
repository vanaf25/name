import * as Yup from 'yup';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import axios from '../../../utils/axios';
import { AUTH_API } from '../../../constants/ApiPaths';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export default function ReferralForm() {
  const { setReferralCode } = useAuth();

  const isMountedRef = useIsMountedRef();

  const FormSchema = Yup.object().shape({
    referralCode: Yup.string()
      .required('Referral code required')
      .min(8, 'Must be exactly 8 characters')
      .max(8, 'Must be exactly 8 characters'),
  }); //eslint-disable-line

  const defaultValues = {
    referralCode: '',
  };

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => axios
      .get(`${AUTH_API.VERIFY_REFERRAL_CODE}${data.referralCode}/`)
      .then((response) => {
        // console.log(response.data);
        setReferralCode(response.data);
      })
      .catch((error) => {
        // console.log(error);
        if (isMountedRef.current) {
          setError('afterSubmit', { message: 'Invalid Referral Code' });
        }
      });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="referralCode" label="Código de Invitación" inputProps={{ maxLength: 8 }} />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Continue
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
