import { useEffect, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// Mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { LoadingButton } from '@mui/lab';

// forms
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Componenets
import { FormProvider, RHFTextField, RHFSelect } from '../../components/hook-form';
import useLocales from '../../hooks/useLocales';
import { AUTH_API, PHARMACY_API } from '../../constants/ApiPaths';
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Hooks
import useAuth from '../../hooks/useAuth';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { addUser } from '../../redux/slices/user';

UserForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
};

export default function UserForm({ isEdit, currentUser, onClose }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { user, currentPharmacy } = useAuth();
  const dispatch = useDispatch();

  const UserSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        'Debe contener 8 caracteres, una mayúscula, una minúscula y un número.'
      ),
    role: Yup.string().required('Role required'),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      password: currentUser?.password || '',
      role: currentUser?.role || 'USER',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(UserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    control,
    watch,
    setError,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (data) => {
    const formData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      pharmacy: currentPharmacy.id
    };
    // console.log(formData);

    return axios({
      method: isEdit ? 'put' : 'post',
      url: isEdit ? `${AUTH_API.USER_MANAGEMENT}${currentUser.id}/` : `${AUTH_API.USER_MANAGEMENT}`,
      data: formData,
    })
      .then((response) => {
        // console.log(response);
        if (response.status === 201 || response.status === 200) {
          // If Created New User
          if (response.status === 201) {
            dispatch(addUser(response.data));
            reset();
            enqueueSnackbar(!isEdit ? 'User has been created successfully.' : 'User has been Updated successfully.');
            onClose();
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.email) {
          const [errMsg] = error.email;
          setError('email', { type: 'custom', message: errMsg });
        }
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <RHFTextField name="firstName" label={translate('First_Name')} id="firstName" />
        </Grid>
        <Grid item xs={6}>
          <RHFTextField name="lastName" label={translate('Last_Name')} id="lastName" />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField name="email" label={translate('Email_Address')} id="email" />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField name="password" label={translate('password')} id="password" />
        </Grid>
        <Grid item xs={12}>
          <RHFSelect name="role" label="Role">
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">User</option>
          </RHFSelect>
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 3 }}>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          {translate('cancel')}
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {!isEdit ? translate('user_management.create_user') : translate('update')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
