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
import Chip from '@mui/material/Chip';
import { LoadingButton } from '@mui/lab';

// forms
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Componenets
import { FormProvider, RHFTextField, RHFSwitch, RHFSelect } from '../../../components/hook-form';
import useLocales from '../../../hooks/useLocales';
import { BUY_API } from '../../../constants/ApiPaths';
import axios from '../../../utils/axios';
import { PATH_BUY } from '../../../routes/paths';

// Hooks
import useAuth from '../../../hooks/useAuth';

GroupForm.propTypes = {
  isEdit: PropTypes.bool,
  currentGroup: PropTypes.object,
};

export default function GroupForm({ isEdit, currentGroup }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { currentPharmacy } = useAuth();
  const [fixedPharmacy, setFixedPharmacy] = useState({});
  const [autocompleteValues, setAutocompleteValues] = useState([]);

  const [pharmaciesList, setPharmaciesList] = useState([]);

  const GroupSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    brief: Yup.string().required('Brief is required'),
    active: Yup.boolean(),
    group_type: Yup.string().required('Group type is required'),
    pharmacies: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Required'),
        id: Yup.string().required('Required'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentGroup?.name || '',
      brief: currentGroup?.brief || '',
      active: currentGroup?.active || true,
      group_type: currentGroup?.group_type || 'FRIENDS',
      pharmacies: currentGroup?.pharmacies || [],
    }),
    [currentGroup]
  );

  const methods = useForm({
    resolver: yupResolver(GroupSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentGroup) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentGroup]);

  const onSubmit = async (data) => {
    const pharmaciesID = data.pharmacies.map((pharmacy) => pharmacy.id);
    return axios({
      method: isEdit ? 'put' : 'post',
      url: isEdit ? `${BUY_API.BUY_GROUP}${currentGroup.id}/` : `${BUY_API.BUY_GROUP}`,
      data: {
        name: data.name,
        brief: data.brief,
        active: data.active,
        group_type: data.group_type,
        pharmacies: pharmaciesID.join(','),
      },
    })
      .then((response) => {
        // console.log(response);
        if (response.status === 201 || response.status === 200) {
          reset();
          enqueueSnackbar(!isEdit ? 'Group has been created successfully.' : 'Group has been Updated successfully.');
          navigate(PATH_BUY.groupList, { replace: true });
        }
      })
      .catch((error) => {
        // console.log('asdfa -> ', error[0]);
        if(error){
          enqueueSnackbar(error[0], { variant: 'error' });
        }
        else{
          enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        }
      });
  };

  useEffect(() => {
    axios
      .get(BUY_API.PHARMACIES_LIST)
      .then((response) => {
        if (isEdit && currentGroup) {
          setPharmaciesList([...currentGroup.pharmacies, ...response.data]);
        } else {
          setPharmaciesList(response.data);
        }
      })
      .catch((error) => {
        // console.log(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentPharmacyObj = { id: currentPharmacy.id, name: currentPharmacy.name };
    let autocompletePharmacies = [];
    setFixedPharmacy(currentPharmacyObj);
    if (isEdit && currentGroup) {
      autocompletePharmacies = [...currentGroup.pharmacies, ...autocompleteValues];
    } else {
      autocompletePharmacies = [currentPharmacyObj, ...autocompleteValues];
    }
    setAutocompleteValues(autocompletePharmacies.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPharmacy, currentGroup, isEdit]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <RHFTextField name="name" label={translate('name')} id="name" /> 

              <RHFTextField multiline rows={4} name="brief" label={translate('buy.brief')} id="brief" />

              <RHFSelect  name="group_type" label={translate('buy.group_type')}>
                <option value="FRIENDS">{translate('buy.friends')}</option>
                <option value="ACQUAINTANCES">{translate('buy.acquaintances')}</option>
              </RHFSelect>

              <Autocomplete
                multiple
                name="pharmacies"
                id="pharmacies-list"
                disableClearable
                options={pharmaciesList}
                value={autocompleteValues}
                defaultValue={defaultValues.pharmacies}
                getOptionLabel={(option) => option.name}
                onChange={(event, value) => {
                  setAutocompleteValues([fixedPharmacy, ...value.filter((option) => option.id !== fixedPharmacy.id)]);
                  setValue('pharmacies', [fixedPharmacy, ...value.filter((option) => option.id !== fixedPharmacy.id)]);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.name}
                      {...getTagProps({ index })}
                      disabled={fixedPharmacy.id === option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <RHFTextField
                    {...params}
                    label={translate('buy.search_by_pharmacy')}
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                    }}
                  />
                )}
                sx={{ mb: 3 }}
              />
              <RHFSwitch name="active" label={translate('active')} />
            </Stack>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                {!isEdit ? translate('buy.create_group') : translate('update')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
