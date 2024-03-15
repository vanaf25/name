import * as Yup from 'yup';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useLocales from '../../../hooks/useLocales';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export default function RegisterForm() {
  const { register, referralCode, referrer } = useAuth();

  const isMountedRef = useIsMountedRef();

  const { translate } = useLocales();

  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required(translate('first_name_required')),
    lastName: Yup.string().required(translate('last_name_required')),
    email: Yup.string().email(translate('email_valid')).required(translate('email_required')),
    confirmemail: Yup.string().email(translate('email_valid')).required(translate('confirm_email')),
    password: Yup.string()
      .required(translate('password_required'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        'Debe contener 8 caracteres, una mayúscula, una minúscula y un número.'
      ),
    confirmpassword: Yup.string().required(translate('confirm_password_required')),
  }); //eslint-disable-line

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    if (data.email !== data.confirmemail) {
      setError('confirmemail', { message: 'Email is not matched' });
      return;
    }

    if (data.password !== data.confirmpassword) {
      setError('confirmpassword', { message: 'Password is not matched' });
      return;
    }

    try {
      await register(data.email, data.password, data.firstName, data.lastName, referrer);
    } catch (error) {
      console.error(error);
      // reset();
      if (isMountedRef.current) {
        const { email, password1 } = error;
        email?.forEach((val) => setError('email', { message: val }));
        password1?.forEach((val) => setError('password', { message: val }));
        setError('afterSubmit', error);
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField name="firstName" label={translate('First_Name')} />
          <RHFTextField name="lastName" label={translate('Last_Name')} />
        </Stack>

        <RHFTextField name="email" label={translate('Email_Address')} />
        <RHFTextField name="confirmemail" label={translate('Confirm_Email')} />

        <RHFTextField
          name="password"
          label={translate('password')}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="confirmpassword"
          label={translate('confirm_password')}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        {translate('Register')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
