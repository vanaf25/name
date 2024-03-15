import { useCallback, useEffect, useMemo, useState } from 'react';

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
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { LoadingButton } from '@mui/lab';

// forms
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import get from 'lodash/get';

// Componenets
import LoadingScreen from '../../components/LoadingScreen';
import { FormProvider, RHFTextField, RHFSelect } from '../../components/hook-form';
import useLocales from '../../hooks/useLocales';
import { BUY_API } from '../../constants/ApiPaths';
import axios from '../../utils/axios';
import { PATH_BUY } from '../../routes/paths';

// Hooks
import useAuth from '../../hooks/useAuth';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getBuyAction, getParticipatedBuysSuccess } from '../../redux/slices/buy';

// BUY Type Images
import PublicImg from '../../assets/img/BUY_TYPE_PUBLIC.png';
import FarmaciaImg from '../../assets/img/BUY_TYPE_FRIENDS.png';
import InviteImg from '../../assets/img/BUY_TYPE_INVITE.png';
import NegotiationImg from '../../assets/img/BUY_TYPE_NEGOTIATION.png';
// import { ConstructionOutlined } from '@mui/icons-material';

const BUY_TYPES = [
  {
    label: 'FARMACIAS AMIGAS',
    image: FarmaciaImg,
  },
  {
    label: 'PUBLICA',
    image: PublicImg,
  },
  // {
  //   label: 'INVITATION',
  //   image: InviteImg,
  // },
  {
    label: 'NEGOCIADA',
    image: NegotiationImg,
  },
];

BuyForm.propTypes = {
  isEdit: PropTypes.bool,
  currentBuy: PropTypes.object,
};

export default function BuyForm({ isEdit, currentBuy }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { user, currentPharmacy } = useAuth();
  const dispatch = useDispatch();
  const { participatedBuys } = useSelector((state) => state.buy);
  const [currentBuyid, setCurrentBuy] = useState(currentBuy?.id)
  // States
  const [showPublicFields, setShowPublicFields] = useState(false);
  const [editBuy, setEditBuy] = useState(null);
  const [autocompleteValues, setAutocompleteValues] = useState([]);

  // States for Autocomplete
  const [labs, setLabs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [previousBuy, setPreviousBuy] = useState([]);
  const [pharmacy, setPharmacy] = useState([])
  const [isPharmacyValueLoading, setIsPharmacyValueLoading] = useState(false);

  const BuySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    catalog_source: Yup.string().required('Catalog Source is required'),
    type: Yup.object()
      .shape({
        label: Yup.string().required('Required'),
        image: Yup.string().required('Required'),
      })
      .required('Type is required'),
    source_id: Yup.object()
      .shape({
        id: Yup.number(),
        name: Yup.string(),
      })
      .nullable(),
    groups: Yup.array().of(
      Yup.number()
    ).nullable(),
    payment_method: Yup.string().nullable().required('Payment method is required'),
    period_estimation: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
    contact_person: Yup.string().required('Contact person is required'),
    contact_phone: Yup.string().max(10).required('Contact number is required'),
    note: Yup.string(),

    // Optional only for PUBLIC buy
    min_purchase: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
    max_person: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
    cost: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
    commission: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
    distance: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
  });




  const defaultValues = useMemo(
    () => ({
      name: currentBuy?.name || '',
      type: BUY_TYPES.find(bt => bt.label === currentBuy?.type) || BUY_TYPES[0],
      catalog_source: currentBuy?.catalog_source || 'LAB',
      lab: currentBuy?.lab || null,
      previous_buy: previousBuy.find(bt => bt.id === currentBuy?.previous_buy) || null,
      groups: [],
      payment_method: currentBuy?.payment_method || 'COD',
      period_estimation: currentBuy?.period_estimation || '',
      contact_person: currentBuy?.contact_person || user.get_full_name,
      contact_phone: currentBuy?.contact_phone || user?.mobile || '',
      note: currentBuy?.note || '',
      min_purchase: currentBuy?.min_purchase || '',
      max_person: currentBuy?.max_person || '',
      cost: currentBuy?.cost || '',
      commission: currentBuy?.commission || '',
      distance: currentBuy?.distance || '',
      invited_pharmacy: currentBuy?.invited_pharmacy || [],

    }),
    [currentBuy, previousBuy]
  );

  const [type, setType] = useState(false);

  const [selectedPharmacy, setSelectedPharmacy] = useState([]);

  const selectPharmacy = (data) => {
    const pharmacyids = [];

    data.map((obj) => {
      return pharmacyids.push(obj.id)
    })
    setSelectedPharmacy(pharmacyids)

  }

  const methods = useForm({
    resolver: yupResolver(BuySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    control,
    watch,
    setError,
    formState: { isSubmitting }, getValues,
  } = methods;

  const fieldWatch = watch(['catalog_source', 'lab', 'previous_buy']);
  const [buyType, choosedLab, choosedPreviousBuy] = fieldWatch;


  const isFormReady = isEdit ? (!!previousBuy.length) : true;


  const getPharmacyValue = useCallback((BUY_TYPES) => {
    // console.log('buy_type --> ', currentBuy);

    if (currentBuy !== undefined) {
      // console.log('buy_type --> ', currentBuy);
      setIsPharmacyValueLoading(true);
      axios
        .get(BUY_API.BUY_GET_PHARMACIES, { params: { buy_id: currentBuy.id } })
        .then((response) => {
          setPharmacy(response.data.data.map((item) => ({ id: item.id, name: item.name })));
        })
        .catch((error) => {
          // console.log(error);
        })
        .finally(() => {
          setIsPharmacyValueLoading(false);
        });
    }
  }, [currentBuy]);


  const getCurrentPharmacyValues = (currentBuy) => {
    // console.log('Label -1  --> ', defaultValues.type.label);
    // console.log('current buy --> ', currentBuy);
    setIsPharmacyValueLoading(true);
    // console.log('current buy -1 --> ', currentBuy);
    axios
      .get(BUY_API.BUY_GET_PHARMACIES, { params: { buy_id: currentBuy.id } })
      .then((response) => {
        setPharmacy(response.data.data.map((item) => ({ id: item.id, name: item.name })));
      })
      .catch((error) => {
        // console.log(error);
      })
      .finally(() => {
        setIsPharmacyValueLoading(false);
      });
  }

  const fetchGroupsList = useCallback(() => {
    axios
      .get(BUY_API.BUY_GROUP)
      .then((response) => {
        // console.log("grops--", response)
        // console.log("grops 1--", response.data.filter((data) => { return data.group_type === "FRIENDS"; }).map((item) => ({ id: item.id, name: item.name })))
        // setGroups(response.data.map((item) => ({ id: item.id, name: item.name })));
        const data = response.data.filter((data) => { return data.group_type === "FRIENDS"; }).map((item) => ({ id: item.id, name: item.name }));

        setAutocompleteValues(data)
        const groupsID = data.map(({ id }) => id);
        setValue('groups', groupsID);
        setGroups(data);
      })
      .catch((error) => {
        // console.log(error);
      });
  }, [])

  const getData = () => {
    axios
      .get(BUY_API.LABS)
      .then((response) => {
        setLabs(response.data.map((item) => ({ id: item.id, name: item.lab_name })));
        // setLabs(response.data);
      })
      .catch((error) => {
        // console.log(error);
      });
    // Filled the autocomplete input for groups


    axios
      .get(BUY_API.BUY, { params: { pharmacy: currentPharmacy.id } })
      .then((response) => {
        setPreviousBuy(response.data.map((item) => ({ id: item.id, name: item.name })));
      })
      .catch((error) => {
        // console.log(error);
      });
  };


  //--------------------------------------


  useEffect(() => {
    getData();
    fetchGroupsList();
    if (isFormReady && isEdit && currentBuy) {
      if (defaultValues.type.label !== 'NEGOCIADA') {
        setType(true)
      }
      // setShowPublicFields(true);
      getCurrentPharmacyValues(currentBuy);
      reset(defaultValues);
    }
    if (!isEdit) {
      if (defaultValues.type.label !== 'NEGOCIADA') {
        setType(false)
      }
      // setShowPublicFields(true);
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentBuy, isFormReady, fetchGroupsList]);



  const onSubmit = async (data) => {
    // console.log(data);

    // Manualy validate the source of catalog
    if (data.catalog_source === 'LAB' && !data.lab) {
      setError('lab', {
        type: 'manual',
        message: 'Lab is required',
      });
      return false;
    }

    if (data.catalog_source === 'PREVIOUS_BUY' && !data.previous_buy) {
      setError('previous_buy', {
        type: 'manual',
        message: 'Previous Buy is required',
      });
      return false;
    }

    const formData = {
      name: data.name,
      type: data.type.label,
      catalog_source: data.catalog_source,
      lab_id: data.catalog_source === 'LAB' ? data.lab.id : null,
      lab_name: data.catalog_source === 'LAB' ? data.lab.name : null,
      previous_buy: data.catalog_source === 'PREVIOUS_BUY' ? data.previous_buy.id : null,
      payment_method: data.payment_method,
      period_estimation: data.period_estimation,
      contact_person: data.contact_person,
      contact_phone: data.contact_phone,
      min_purchase: data.min_purchase,
      max_person: data.max_person,
      cost: data.cost,
      commission: data.commission,
      distance: data.distance,
      groups: (data.groups || []).join(','),
      pharmacy: currentPharmacy.id,
      invited_pharmacy: selectedPharmacy,
    };


    return axios({
      method: isEdit ? 'put' : 'post',
      url: isEdit ? `${BUY_API.BUY}${currentBuy.id}/` : `${BUY_API.BUY}`,
      data: formData,
    })
      .then((response) => {
        // console.log(response);
        let updatedBuys = [];
        if (response.status === 201 || response.status === 200) {
          // If Created New Buy
          if (!isEdit) {
            updatedBuys = [{ ...response.data }, ...participatedBuys];
          } else {
            // If Update Existing Buy
            updatedBuys = participatedBuys.map((buy) => {
              if (editBuy && buy.id === editBuy.id) {
                return { ...response.data };
              }
              return { ...buy };
            });
          }
          dispatch(getParticipatedBuysSuccess(updatedBuys));

          // dispatch(getBuyAction(response.data.id, currentPharmacy.id));
          setEditBuy(null);
          reset();
          enqueueSnackbar(!isEdit ? 'Buy has been created successfully.' : 'Buy has been Updated successfully.');
          navigate(PATH_BUY.buyCatalog.replace(':id', response.data.id), { replace: true,state:{buyId:response.data.id,pharmacyId:currentPharmacy.id} });
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };


  if (!isFormReady || isPharmacyValueLoading) {
    return <LoadingScreen />
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField name="name" label={translate('name')} id="name" />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      onChange={(event, newValue) => {
                        if (newValue.label === 'NEGOCIADA') {
                          // setType(false)
                          setShowPublicFields(false);
                        } else {
                          // setType(true)
                          getPharmacyValue(newValue)
                          setShowPublicFields(true);
                        }
                        field.onChange(newValue);
                      }}
                      options={BUY_TYPES}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.label === value.label}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          <img loading="lazy" width="20" src={option.image} srcSet={option.image} alt="" />
                          {option.label}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <RHFTextField
                          label={translate('type')}
                          error={!!error}
                          helperText={error?.message}
                          {...params}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {type ? (<Grid item xs={6}>
                <Controller
                  name="Pharmacy"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      multiple
                      {...field}
                      onChange={(event, newValue) => {
                        selectPharmacy(newValue)
                        field.onChange(newValue)
                      }}
                      options={pharmacy}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.name === value.name}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
                        ))
                      }
                      renderInput={(params) => (
                        <RHFTextField
                          label={translate('Pharmacy')}
                          error={!!error}
                          helperText={error?.message}
                          {...params}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              ) : null}
              <Grid item xs={3}>
                <RHFSelect name="catalog_source" label={translate('buy.catalog_source')}>
                  <option value="LAB">{translate('lab')}</option>
                  <option value="PREVIOUS_BUY">{translate('buy.previous_buy')}</option>
                  <option value="MANUAL">Manual</option>
                </RHFSelect>
              </Grid>
              {buyType === 'LAB' && (
                <Grid item xs={3}>
                  <Controller
                    name="lab"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        {...field}
                        onChange={(event, newValue) => field.onChange(newValue)}
                        options={labs}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderInput={(params) => (
                          <RHFTextField
                            label={translate('lab')}
                            id="lab"
                            error={!!error}
                            helperText={error?.message}
                            {...params}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              )}
              {buyType === 'PREVIOUS_BUY' && (
                <Grid item xs={3}>
                  <Controller
                    name="previous_buy"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        {...field}
                        onChange={(event, newValue) => field.onChange(newValue)}
                        options={previousBuy}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id}>
                              {option.name}
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <RHFTextField
                            label={translate('buy.previous_buy')}
                            error={!!error}
                            helperText={error?.message}
                            {...params}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={6}>
                <Controller
                  name="groups"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const selectedGroupOptions = groups.filter(g => field.value.includes(g.id))
                    return (
                      <Autocomplete
                        multiple
                        {...field} loading
                        onChange={(event, newValue) => {
                          const groupsID = newValue.map(({ id }) => id);
                          setValue('groups', groupsID);
                          field.onChange(groupsID)
                        }}
                        options={groups}
                        value={selectedGroupOptions}
                        defaultValue={selectedGroupOptions}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.name === value}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
                          ))
                        }
                        renderInput={(params) => (
                          <RHFTextField
                            label={translate('groups')}
                            error={!!error}
                            helperText={error?.message}
                            {...params}
                          />
                        )}
                      />
                    )
                  }}
                />
              </Grid>

              <Grid item xs={3}>
                <RHFSelect name="payment_method" label={translate('buy.payment_method')}>
                  <option key="COD" value="COD">
                    COD
                  </option>
                </RHFSelect>
              </Grid>
              <Grid item xs={3}>
                <RHFTextField
                  type="number"
                  name="period_estimation"
                  label={translate('buy.estimation_period')}
                  id="period_estimation"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{translate('buy.months')}</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField name="contact_person" label={translate('buy.contact_person')} id="contact_person" />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField name="contact_phone" label={translate('buy.contact_phone')} id="contact_phone" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField multiline rows={4} name="note" label={translate('note')} id="note" />
              </Grid>
            </Grid>

            {/* Optional fields for PUBLIC buy */}
            {showPublicFields && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={3}>
                  <RHFTextField
                    type="number"
                    name="min_purchase"
                    label={translate('buy.min_purchase')}
                    id="min_purchase"
                  />
                </Grid>
                <Grid item xs={3}>
                  <RHFTextField type="number" name="max_person" label={translate('buy.max_person')} id="max_person" />
                </Grid>
                <Grid item xs={3}>
                  <RHFTextField type="number" name="cost" label={translate('buy.cost')} id="cost" />
                </Grid>
                <Grid item xs={3}>
                  <RHFTextField
                    type="number"
                    name="commission"
                    label={translate('buy.commission')}
                    id="commission"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField
                    type="number"
                    name="distance"
                    label={translate('buy.distance')}
                    id="distance"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">KM</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            )}
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                {!isEdit ? translate('buy.create_buy') : translate('update')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
