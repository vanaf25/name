import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack, Typography, Avatar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../../hooks/useAuth';
import useLocales from '../../../hooks/useLocales';

// utils
import { fData } from '../../../utils/formatNumber';
import axios from '../../../utils/axios';

// components
import { FormProvider, RHFSwitch, RHFTextField, RHFUploadAvatar } from '../../../components/hook-form';
import Image from '../../../components/Image';
import { AUTH_API } from '../../../constants/ApiPaths';
import CopyClipboard from '../../../components/CopyClipboard';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const { user, userUpdate, currentPharmacy } = useAuth();

  const UpdateUserSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    second_last_name: Yup.string(),
    email: Yup.string().required('Email Address is required').email(),
    mobile: Yup.string(),
    city: Yup.string(),
    zip: Yup.number(),
    state: Yup.string(),
    address: Yup.string(),
    club_province: Yup.string(),
    num_of_club_member: Yup.number(),
    photoUrl: Yup.mixed().test('required', 'Avatar is required', (value) => value !== ''),
  });

  const defaultValues = useMemo(
    () => ({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      second_last_name: user?.second_last_name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      city: user?.city || '',
      zip: user?.zip || 0,
      state: user?.state || '',
      address: user?.address || '',
      club_province: user?.club_province || '',
      num_of_club_member: user?.num_of_club_member || 0,
      photoURL: user?.photo || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      axios
        .put(AUTH_API.USER, data)
        .then((response) => {
          userUpdate(response.data);
          enqueueSnackbar('Account detail updated successfully.');
        })
        .catch((error) => {
          // console.log(error);
          enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      // console.log(file);

      if (file) {
        setValue(
          'photoURL',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );

        const formData = new FormData();
        formData.append('photo', file, file.name);
        formData.append('email', user.email);

        axios
          .put(AUTH_API.USER, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => {
            userUpdate(response.data);
            enqueueSnackbar('Photo has been updated successfully.');
          })
          .catch((error) => {
            // console.log(error);
            enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
          });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              accept="image/*"
              // maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  {translate('Allowed')} *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  {translate('max_size_of')} {fData(3145728)}
                </Typography>
              }
            />

            {/* <RHFSwitch name="isPublic" labelPlacement="start" label={translate("Public_Profile")} sx={{ mt: 5 }} /> */}
            <CopyClipboard
              value={currentPharmacy.referral_code}
              sx={{ mt: 3 }}
              label="Referral Code"
              inputProps={{ readOnly: true }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="first_name" label={translate('First_Name')} />
              <RHFTextField name="last_name" label={translate('Last_Name')} />
              <RHFTextField name="second_last_name" label={translate('Second_Last_Name')} />
              <RHFTextField name="email" label={translate('Email_Address')} disabled />

              <RHFTextField name="mobile" label={translate('Mobile')} />
              <RHFTextField name="zip" label={translate('Zip_Code')} />
            </Box>
            <Stack spacing={3} alignItems="flex-end" sx={{ my: 3 }}>
              <RHFTextField name="address" multiline rows={4} label={translate('address')} />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="state" label={translate('State_Region')} />
              <RHFTextField name="city" label={translate('city')} />

              <RHFTextField name="club_province" label={translate('Club_Province')} />
              <RHFTextField name="num_of_club_member" label={translate('of_Club_Member')} />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {translate('Save_Changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
