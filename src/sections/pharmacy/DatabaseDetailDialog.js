import React, { useEffect } from 'react';
import PropTypes, { resetWarningCache } from 'prop-types';
// form
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
// Hooks
import { FormProvider, RHFTextField } from '../../components/hook-form';
import useLocales from '../../hooks/useLocales';
import useIsMountedRef from '../../hooks/useIsMountedRef';
// Utils
import axios from '../../utils/axios';
// Constants
import { PHARMACY_API } from '../../constants/ApiPaths';

DatabaseDetailDialog.propTypes = {
  isOpen: PropTypes.bool,
  handleCloseDBModal: PropTypes.func,
  currentDB: PropTypes.object,
  updateDbDetail: PropTypes.func,
  currentPharmacy: PropTypes.object,
};

export default function DatabaseDetailDialog({
  isOpen,
  handleCloseDBModal,
  currentDB,
  updateDbDetail,
  currentPharmacy,
}) {
  const { translate } = useLocales();
  const isMountedRef = useIsMountedRef();

  const FieldSchema = Yup.object().shape({
    host: Yup.string().required('Host is required'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    name: Yup.string().required('Name is required'),
    port: Yup.number().required('Port is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      host: currentDB?.host || '',
      username: currentDB?.username || '',
      password: currentDB?.password || '',
      name: currentDB?.name || '',
      port: currentDB?.port || '',
    }),
    [currentDB]
  );

  const methods = useForm({
    resolver: yupResolver(FieldSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = (formData) =>
    axios
      .post(PHARMACY_API.TEST_CONNECTION, formData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // success
          updateDbDetail(formData);
        } else if (isMountedRef.current) {
          // success false
          setError('afterSubmit', { message: data.error_message });
        }
      })
      .catch((error) => {
        // console.log(error);
      });

  const onDeleteClick = () => {
    updateDbDetail({ host: '', username: '', password: '', name: '', port: '' });
  };

  useEffect(() => {
    reset(defaultValues);
  }, [currentDB]);

  return (
    <Dialog open={isOpen} onClose={handleCloseDBModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{translate("SS_Key_Credentials")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{translate("Please_use_this_detail_to_login_via_SS_Key_Software")}</DialogContentText>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Box
            sx={{
              pt: 3,
              display: 'grid',
              columnGap: 1,
              rowGap: 3,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              gridTemplateAreas: `
                "db_host db_host"
                "db_username db_password"
                "db_name db_port"`,
            }}
          >
            {/* <RHFTextField name="host" label={translate('pharmacy_register.db_host')} sx={{ gridArea: 'db_host' }} /> */}
            <RHFTextField
              name="username"
              label={translate('username')}
              sx={{ gridArea: 'db_username' }}
              value={currentPharmacy?.ss_key?.username || ''}
              InputProps={{
                readOnly: true,
              }}
            />
            <RHFTextField
              name="password"
              label={translate('password')}
              sx={{ gridArea: 'db_password' }}
              value={currentPharmacy?.ss_key?.password || ''}
              InputProps={{
                readOnly: true,
              }}
            />
            {/* <RHFTextField name="name" label={translate('pharmacy_register.db_name')} sx={{ gridArea: 'db_name' }} /> */}
            {/* <RHFTextField name="port" label={translate('pharmacy_register.db_port')} sx={{ gridArea: 'db_port' }} /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          {/* <Button color="error" variant="contained" disabled={isSubmitting} onClick={onDeleteClick}>
            {translate('delete')}
          </Button> */}
          {/* <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {translate('pharmacy_register.test_connection')}
          </LoadingButton> */}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
