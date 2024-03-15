import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { AUTH_API } from '../../../constants/ApiPaths';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const ChangePassWordSchema = Yup.object().shape({
    old_password: Yup.string().required('Old Password is required'),
    new_password1: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        'Debe contener 8 caracteres, una mayúscula, una minúscula y un número.'
      ),
    new_password2: Yup.string().oneOf([Yup.ref('new_password1'), null], 'Passwords must match'),
  });

  const defaultValues = {
    old_password: '',
    new_password1: '',
    new_password2: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      axios
        .post(AUTH_API.CHANGE_PASSWORD, data)
        .then((response) => {
          if (response.status === 200) {
            const { detail } = response.data;
            reset();
            enqueueSnackbar(detail);
          }
        })
        .catch((errors) => {
          // console.log(errors);
          Object.keys(errors).forEach((field) => {
            setError(field, {
              type: 'manual',
              message: errors[field][0],
            });
          });
          // enqueueSnackbar(error, { variant: 'error' });
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} alignItems="flex-end">
          <RHFTextField name="old_password" type="password" label={translate("Old_Password")} />

          <RHFTextField name="new_password1" type="password" label={translate("New_Password")} />

          <RHFTextField name="new_password2" type="password" label={translate("Confirm_New_Password")} />

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {translate("Save_Changes")}
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Card>
  );
}
