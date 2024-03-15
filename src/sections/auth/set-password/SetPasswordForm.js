import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// componenets
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { AUTH_API } from '../../../constants/ApiPaths';

// ----------------------------------------------------------------------

export default function SetPasswordForm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // const isMountedRef = useIsMountedRef();

  const [showPassword, setShowPassword] = useState(false);

  const SetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        'Debe contener 8 caracteres, una mayúscula, una minúscula y un número.'
      ),
  }); //eslint-disable-line

  const defaultValues = {
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(SetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = (data) => {
    // console.log(data);
    try {
      const postData = { uid, token, new_password1: data.password, new_password2: data.newPassword };
      axios
        .post(AUTH_API.RESET_PASSWORD_CONFIRM, postData)
        .then((response) => {
          const { detail } = response.data;
          enqueueSnackbar(detail, { variant: 'success' });
          navigate(PATH_AUTH.login, { replace: true });
        })
        .catch((error) => {
          // console.log(error);
          enqueueSnackbar(error.new_password2[0], { variant: 'error' });
          // enqueueSnackbar('Invalid/Expired URL', { variant: 'error' });
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2} justifyContent="center">
        <RHFTextField
          name="password"
          label="New Password"
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
          name="newPassword"
          label="Confirm Password"
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
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} sx={{ mt: 3 }}>
        Set Password
      </LoadingButton>
    </FormProvider>
  );
}
