import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardHeader, Grid, Stack } from '@mui/material';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
import { FormProvider, RHFSelect, RHFTextField } from '../../components/hook-form';

import { OPENING_TIME_SLOT } from '../../constants/AppEnums';
import { PHARMACY_API } from '../../constants/ApiPaths';
import axios from '../../utils/axios';
// Hooks
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Components
import Map from '../../components/Map/Map';
import DatabaseDetailDialog from './DatabaseDetailDialog';

// ----------------------------------------------------------------------

PharmacyForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPharmacy: PropTypes.object,
};

export default function PharmacyForm({ isEdit, currentPharmacy }) {
  const navigate = useNavigate();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { refreshAuthUser } = useAuth();
  // console.log(isEdit, currentPharmacy);
  // States for Pharmacy Google API
  const [place, setplace] = useState('');
  const [markerPosition, setmarkerPosition] = useState({});
  const [markerAddress, setmarkerAddress] = useState({});

  // States for Para-Pharmacy Google API
  const [paraPlace, setParaPlace] = useState('');
  const [paraMarkerPosition, setParaMarkerPosition] = useState({});
  const [paraMarkerAddress, setParaMarkerAddress] = useState({});

  // States for Pharmacy DB details
  const [openDBModal, setOpenDBModal] = useState(false);
  const [dbDetail, setDBDetail] = useState({
    host: '',
    name: '',
    username: '',
    password: '',
    port: '',
  });
  const [systemTypes, setSystemTypes] = useState([]);

  const PharmacySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email(),
    ccn: Yup.number(),
    ccn_state: Yup.string(),
    soe: Yup.string(),
    nif: Yup.string(),
    opening_year: Yup.string(),
    website: Yup.string(),
    telephone: Yup.string(),
    type_of_road: Yup.string().required('Street name is required'),
    address: Yup.string(),
    street_number: Yup.string().required('Street number is required'),
    postal_code: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    province: Yup.string(),
    latitude: Yup.string(),
    longitude: Yup.string(),
    formatted_address: Yup.string(),
    note: Yup.string(),
    num_of_pharmacist: Yup.number(),
    num_of_assistant: Yup.number(),
    opening_time: Yup.string(),
    system_type: Yup.string().required('System type is required'),
    distributor: Yup.string(),
    distribuidor2: Yup.string(),
    additional_distributor: Yup.string(),
    // ParaPharmacy Detail Fields
    para_name: Yup.string(),
    para_nif: Yup.string(),
    para_email: Yup.string().email(),
    para_website: Yup.string(),
    para_telephone: Yup.string(),
    para_type_of_road: Yup.string(),
    para_address: Yup.string(),
    para_street_number: Yup.string(),
    para_postal_code: Yup.string(),
    para_city: Yup.string(),
    para_state: Yup.string(),
    para_province: Yup.string(),
    para_latitude: Yup.string(),
    para_longitude: Yup.string(),
    para_formatted_address: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPharmacy?.name || '',
      email: currentPharmacy?.email || '',
      ccn: currentPharmacy?.ccn || 0,
      ccn_state: currentPharmacy?.ccn_state || '',
      soe: currentPharmacy?.soe || '',
      nif: currentPharmacy?.nif || '',
      opening_year: currentPharmacy?.opening_year || '',
      website: currentPharmacy?.website || '',
      telephone: currentPharmacy?.telephone || '',
      type_of_road: currentPharmacy?.type_of_road || '',
      address: currentPharmacy?.address || '',
      street_number: currentPharmacy?.street_number || '',
      postal_code: currentPharmacy?.postal_code || '',
      city: currentPharmacy?.city || '',
      state: currentPharmacy?.state || '',
      province: currentPharmacy?.province || '',
      latitude: currentPharmacy?.latitude || '',
      longitude: currentPharmacy?.longitude || '',
      formatted_address: currentPharmacy?.formatted_address || '',
      note: currentPharmacy?.note || '',
      num_of_pharmacist: currentPharmacy?.num_of_pharmacist || 0,
      num_of_assistant: currentPharmacy?.num_of_assistant || 0,
      opening_time: currentPharmacy?.opening_time || 8,
      system_type: currentPharmacy?.system_type || '',
      distributor: currentPharmacy?.distributor || '',
      distribuidor2: currentPharmacy?.distribuidor2 || '',
      additional_distributor: currentPharmacy?.additional_distributor || '',
      // ParaPharmacy
      para_name: currentPharmacy?.para_name || '',
      para_nif: currentPharmacy?.para_nif || '',
      para_email: currentPharmacy?.para_email || '',
      para_website: currentPharmacy?.para_website || '',
      para_telephone: currentPharmacy?.para_telephone || '',
      para_type_of_road: currentPharmacy?.para_type_of_road || '',
      para_address: currentPharmacy?.para_address || '',
      para_street_number: currentPharmacy?.para_street_number || '',
      para_postal_code: currentPharmacy?.para_postal_code || '',
      para_city: currentPharmacy?.para_city || '',
      para_state: currentPharmacy?.para_state || '',
      para_province: currentPharmacy?.para_province || '',
      para_latitude: currentPharmacy?.para_latitude || '',
      para_longitude: currentPharmacy?.para_longitude || '',
      para_formatted_address: currentPharmacy?.para_formatted_address || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPharmacy]
  );

  const methods = useForm({
    resolver: yupResolver(PharmacySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting },
  } = methods;

  let nombreFarmacia = null;
  let addressFarmacia = null;
  let nombreFarmaciaTypeOfRoad = null;
  let timer = null;
  let nombreParaFarmacia = null;
  let nombreParaFarmaciaStreet = null;
  let addressParaFarmacia = null;

  useEffect(() => {
    if (isEdit && currentPharmacy) {
      // console.log('SS Key: ', currentPharmacy.ss_key);
      setDBDetail({
        host: currentPharmacy.db_host,
        username: currentPharmacy.db_username,
        password: currentPharmacy.db_password,
        name: currentPharmacy.db_name,
        port: currentPharmacy.db_port,
      });
      reset(defaultValues);

      // Set the marker position and address for Google Map
      if (currentPharmacy.latitude && currentPharmacy.longitude && currentPharmacy.formatted_address) {
        setmarkerPosition({
          lat: parseFloat(currentPharmacy.latitude),
          lng: parseFloat(currentPharmacy.longitude),
        });
        setmarkerAddress(currentPharmacy.formatted_address);
      }
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPharmacy]);

  const onSubmit = async (data) => {
    data.db_host = dbDetail.host;
    data.db_username = dbDetail.username;
    data.db_password = dbDetail.password;
    data.db_name = dbDetail.name;
    data.db_port = dbDetail.port;

    const paraPharmacyDetail = {
      name: data.para_name,
      nif: data.para_nif,
      email: data.para_email,
      website: data.para_website,
      telephone: data.para_telephone,
      type_of_road: data.para_type_of_road,
      address: data.para_address,
      street_number: data.para_street_number,
      postal_code: data.para_postal_code,
      city: data.para_city,
      state: data.para_state,
      province: data.para_province,
      latitude: data.para_latitude,
      longitude: data.para_longitude,
      formatted_address: data.para_formatted_address,
    };

    try {
      return axios({
        method: isEdit ? 'put' : 'post',
        url: isEdit ? `${PHARMACY_API.REGISTER}${currentPharmacy.id}/` : `${PHARMACY_API.REGISTER}`,
        data,
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            // Save the para pharmacy detail
            if (paraPharmacyDetail.name) {
              paraPharmacyDetail.parent_pharmacy = response.data.id;
              paraPharmacyDetail.para_pharmacy = true;
              // console.log('Saving Para-Detail: ', paraPharmacyDetail);

              axios({
                method: isEdit && currentPharmacy.para_id ? 'put' : 'post',
                url:
                  isEdit && currentPharmacy.para_id
                    ? `${PHARMACY_API.REGISTER}${currentPharmacy.para_id}/`
                    : `${PHARMACY_API.REGISTER}`,
                data: paraPharmacyDetail,
              })
                .then((response) => {
                  // console.log('Para-Response: ', response);
                  reset();
                  enqueueSnackbar(!isEdit ? 'Pharmacy registered successfully.' : 'Update success!');
                  refreshAuthUser(() => {
                    navigate(PATH_DASHBOARD.root);
                  });
                })
                .catch((error) => {
                  // console.log('Para-Error: ', error);
                  if ('email' in error) {
                    const [err] = error.email;
                    // console.log(err);
                    setError('para_email', { type: 'manual', message: err });
                  }
                });
            } else {
              reset();
              enqueueSnackbar(!isEdit ? 'Pharmacy registered successfully.' : 'Update success!');
              refreshAuthUser(() => {
                navigate(PATH_DASHBOARD.root);
              });
            }
          }
        })
        .catch((error) => {
          // console.log(error);
          enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        });
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeSystemType = () => {
    // setOpenDBModal(true);
  };

  const handleCloseDBModal = () => {
    setOpenDBModal(false);
  };

  const setAutocomplete = () => {
    try {
      if (!nombreFarmacia) {
        nombreFarmacia = new window.google.maps.places.Autocomplete(document.getElementById('pharmacy_name'), {});
        nombreFarmacia.addListener('place_changed', nombreFarmaciaHandlePlaceSelect);
      }

      if (!nombreFarmaciaTypeOfRoad) {
        nombreFarmaciaTypeOfRoad = new window.google.maps.places.Autocomplete(
          document.getElementById('type_of_road'),
          {}
        );
        nombreFarmaciaTypeOfRoad.addListener('place_changed', nombreFarmaciaTypeOfRoadHandlePlaceSelect);
      }
      if (!addressFarmacia) {
        addressFarmacia = new window.google.maps.places.Autocomplete(document.getElementById('pharmacy_address'), {});
        addressFarmacia.addListener('place_changed', addressFarmaciaHandlePlaceSelect);
      }
      // ParaPharmacy
      if (!nombreParaFarmacia) {
        nombreParaFarmacia = new window.google.maps.places.Autocomplete(
          document.getElementById('para_pharmacy_name'),
          {}
        );
        nombreParaFarmacia.addListener('place_changed', nombreParaFarmaciaHandlePlaceSelect);
      }
      // ParaPharmacy Street
      if (!nombreParaFarmaciaStreet) {
        nombreParaFarmaciaStreet = new window.google.maps.places.Autocomplete(
          document.getElementById('para_pharmacy_street_number'),
          {}
        );
        nombreParaFarmaciaStreet.addListener('place_changed', nombreParaFarmaciaHandlePlaceStreetSelect);
      }
      if (!addressParaFarmacia) {
        addressParaFarmacia = new window.google.maps.places.Autocomplete(
          document.getElementById('para_pharmacy_address'),
          {}
        );
        addressParaFarmacia.addListener('place_changed', addressParaFarmaciaHandlePlaceSelect);
      }
      const timerRes = timer && clearInterval(timer);
    } catch (error) {
      console.error(error);
    }
  };

  function addressFarmaciaHandlePlaceSelect() {
    if (addressFarmacia) {
      setplace(addressFarmacia.getPlace());
    }
  }
  function nombreFarmaciaHandlePlaceSelect() {
    if (nombreFarmacia) {
      setplace(nombreFarmacia.getPlace());
    }
  }

  function nombreFarmaciaTypeOfRoadHandlePlaceSelect() {
    if (nombreFarmaciaTypeOfRoad) {
      setplace(nombreFarmaciaTypeOfRoad.getPlace());
    }
  }

  function addressParaFarmaciaHandlePlaceSelect() {
    if (addressParaFarmacia) {
      setParaPlace(addressParaFarmacia.getPlace());
    }
  }
  function nombreParaFarmaciaHandlePlaceSelect() {
    if (nombreParaFarmacia) {
      setParaPlace(nombreParaFarmacia.getPlace());
    }
  }
  function nombreParaFarmaciaHandlePlaceStreetSelect() {
    if (nombreParaFarmaciaStreet) {
      setParaPlace(nombreParaFarmaciaStreet.getPlace());
    }
  }

  const setFullAddress = (address) => {



    if(address.businessName ){

      setValue('name', address.businessName, { shouldValidate: true });

    }else{

      setValue('name', methods.getValues("name"), { shouldValidate: true });

    }

    setValue('type_of_road',address.route, { shouldValidate: true });
    // Callback function for Google Place selection for Pharmacy address detail
    setValue('address', address.address, { shouldValidate: true });
    setValue('street_number', address.streetNumber, { shouldValidate: true });
    setValue('city', address.city, { shouldValidate: true });
    setValue('state', address.state, { shouldValidate: true });
    setValue('postal_code', address.postalCode, { shouldValidate: true });
    setValue('latitude', address.lat, { shouldValidate: false });
    setValue('longitude', address.lng, { shouldValidate: false });
    setValue('formatted_address', address.address, { shouldValidate: false });
    setValue('province', address.area, { shouldValidate: true });
    setValue('website', address.website, { shouldValidate: true });
    setValue('telephone', address.formattedPhoneNumber, { shouldValidate: true });
    setValue('opening_time', address.openHours || 8, { shouldValidate: true });

    setmarkerPosition({
      lat: address.lat,
      lng: address.lng,
    });
    setmarkerAddress(address.address);
  };

  const setParaFullAddress = (address) => {
    // Callback function for Google Place selection for ParaPharmacy address detail

    if(address.businessName ){

      setValue('para_name', address.businessName, { shouldValidate: true });

    }else{


      setValue('para_name', methods.getValues("para_name"), { shouldValidate: true });

    }

    setValue('para_name', address.businessName, { shouldValidate: true });
    setValue('para_type_of_road', address.route, { shouldValidate: true });
    setValue('para_address', address.address, { shouldValidate: true });
    setValue('para_street_number', address.streetNumber, { shouldValidate: true });
    setValue('para_city', address.city, { shouldValidate: true });
    setValue('para_state', address.state, { shouldValidate: true });
    setValue('para_postal_code', address.postalCode, { shouldValidate: true });
    setValue('para_latitude', address.lat, { shouldValidate: false });
    setValue('para_longitude', address.lng, { shouldValidate: false });
    setValue('para_formatted_address', address.address, { shouldValidate: false });
    setValue('para_province', address.area, { shouldValidate: true });
    setValue('para_website', address.website, { shouldValidate: true });
    setValue('para_telephone', address.formattedPhoneNumber, { shouldValidate: true });

    setParaMarkerPosition({
      lat: address.lat,
      lng: address.lng,
    });
    setParaMarkerAddress(address.address);
  };

  const updateDbDetail = (data) => {
    setDBDetail(data);
    setOpenDBModal(false);

    if (data.host) enqueueSnackbar('The connection was successfully established with server.');
  };

  useEffect(() => {
    // Load the system types from the api to fill the autocomplete box
    axios
      .get(PHARMACY_API.SYSTEM_TYPE)
      .then((response) => {
        setSystemTypes(response.data);
      })
      .catch((error) => {
        // console.log(error);
      });
    try {
      timer = setInterval(setAutocomplete, 3000);
    } catch (error) {
      // console.log(error);
    }
  }, []);

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title={translate('pharmacy_register.basic_information')} />
              {/* Basic Information Section [START HERE] */}
              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  // rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `"name name name name"
                "nif ccn ccn_state soe"
                "email telephone opening_year website"`,
                }}
              >
                <RHFTextField
                  name="name"
                  label={translate('pharmacy_register.pharmacy_name')}
                  sx={{ gridArea: 'name' }}
                  id="pharmacy_name"

                />
              </Box>

              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `"address_area address_area map_area map_area"`,
                }}
              >
                <Box sx={{ gridArea: 'address_area' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      columnGap: 1,
                      rowGap: 3,
                      gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                      gridTemplateAreas: `
                "type_of_road street_number"
                "city state"
                "province postal_code"`,
                    }}
                  >
                    <RHFTextField
                      id="type_of_road"
                      name="type_of_road"
                      label={translate('pharmacy_register.type_of_street')}
                      sx={{ gridArea: 'type_of_road' }}
                    />
                    <RHFTextField
                      name="street_number"
                      label={translate('pharmacy_register.street_no')}
                      sx={{ gridArea: 'street_number' }}
                    />
                    <RHFTextField name="city" label={translate('pharmacy_register.city')} sx={{ gridArea: 'city' }} />
                    <RHFTextField
                      name="state"
                      label={translate('pharmacy_register.state')}
                      sx={{ gridArea: 'state' }}
                    />
                    <RHFTextField
                      name="province"
                      label={translate('pharmacy_register.province')}
                      sx={{ gridArea: 'province' }}
                    />
                    <RHFTextField
                      name="postal_code"
                      label={translate('pharmacy_register.postal_code')}
                      sx={{ gridArea: 'postal_code' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ gridArea: 'map_area' }}>
                  <Map
                   height="215px"
                   width="100%"
                   place={place}
                   setfullAddress={setFullAddress}
                   markerPosition={markerPosition}
                   address={markerAddress}

                  />
                </Box>
              </Box>
              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `"name name name name"
                "nif ccn ccn_state soe"
                "email telephone opening_year website"`,
                }}
              >
                {/* <RHFTextField
                  name="name"
                  label={translate('pharmacy_register.pharmacy_name')}
                  sx={{ gridArea: 'name' }}
                  id="pharmacy_name"
                /> */}

                <RHFTextField name="nif" label="NIF" sx={{ gridArea: 'nif' }} />
                {/* <RHFTextField name="ccn" label={translate('pharmacy_register.ccn')} sx={{ gridArea: 'ccn' }} /> */}
                <RHFTextField
                  name="ccn_state"
                  label={translate('pharmacy_register.ccn_state')}
                  sx={{ gridArea: 'ccn_state', right: '100%' }}
                />
                <RHFTextField
                  name="soe"
                  label={translate('pharmacy_register.soe')}
                  sx={{ gridArea: 'soe', right: '100%' }}
                />
                <RHFTextField
                  name="email"
                  label={translate('pharmacy_register.email_address')}
                  sx={{ gridArea: 'email' }}
                />
                <RHFTextField
                  name="telephone"
                  label={translate('pharmacy_register.telephone')}
                  sx={{ gridArea: 'telephone' }}
                />
                <RHFTextField
                  name="opening_year"
                  label={translate('pharmacy_register.opening_year')}
                  sx={{ gridArea: 'opening_year' }}
                />
                <RHFTextField
                  name="website"
                  label={translate('pharmacy_register.website')}
                  sx={{ gridArea: 'website' }}
                />
              </Box>
              {/* Basic Information Section [END HERE] */}

              {/* Additional Information Section [START HERE] */}
              <CardHeader title={translate('pharmacy_register.additional_information')} />
              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `
                "num_of_pharmacist num_of_assistant opening_time system_type"
                "distributor distribuidor2 additional_distributor additional_distributor"
                "note note note note"`,
                }}
              >
                <RHFTextField
                  name="num_of_pharmacist"
                  label={translate('pharmacy_register.num_of_pharmacist')}
                  sx={{ gridArea: 'num_of_pharmacist' }}
                />
                <RHFTextField
                  name="num_of_assistant"
                  label={translate('pharmacy_register.num_of_assistant')}
                  sx={{ gridArea: 'num_of_assistant' }}
                />
                <RHFSelect
                  name="opening_time"
                  label={translate('pharmacy_register.opening_time')}
                  placeholder={translate('pharmacy_register.opening_time')}
                  sx={{ gridArea: 'opening_time' }}
                >
                  {OPENING_TIME_SLOT.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </RHFSelect>
                {currentPharmacy && currentPharmacy.ss_key ? (
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => {
                      setOpenDBModal(true);
                    }}
                  >
                    {translate('pharmacy_register.system_configuration')}
                  </Button>
                ) : (
                  <RHFSelect
                    name="system_type"
                    label={translate('pharmacy_register.system_type')}
                    placeholder={translate('pharmacy_register.system_type')}
                    sx={{ gridArea: 'system_type' }}
                    // onChange={onChangeSystemType}
                  >
                    <option value="" />
                    {systemTypes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </RHFSelect>
                )}

                <RHFTextField
                  name="distributor"
                  label={translate('pharmacy_register.distributor')}
                  sx={{ gridArea: 'distributor' }}
                />
                <RHFTextField
                  name="distribuidor2"
                  label={translate('pharmacy_register.distributor2')}
                  sx={{ gridArea: 'distribuidor2' }}
                />
                <RHFTextField
                  name="additional_distributor"
                  label={translate('pharmacy_register.additional_distributor')}
                  sx={{ gridArea: 'additional_distributor' }}
                />
                <RHFTextField
                  name="note"
                  multiline
                  rows={4}
                  label={translate('pharmacy_register.note')}
                  sx={{ gridArea: 'note' }}
                />
              </Box>
              {/* Additional Information Section [END HERE] */}

              {/* Para Pharmacy Section [START HERE] */}
              <CardHeader title={translate('pharmacy_register.parapharmacy_information')} />
              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `"name name name name"
                "nif email website telephone"`,
                }}
              >
                <RHFTextField
                  name="para_name"
                  label={translate('pharmacy_register.pharmacy_name')}
                  sx={{ gridArea: 'name' }}
                  id="para_pharmacy_name"
                />
                <RHFTextField name="para_nif" label="NIF" sx={{ gridArea: 'nif' }} />

                <RHFTextField
                  name="para_website"
                  label={translate('pharmacy_register.website')}
                  sx={{ gridArea: 'website' }}
                />
                <RHFTextField
                  name="para_telephone"
                  label={translate('pharmacy_register.telephone')}
                  sx={{ gridArea: 'telephone' }}
                />
                <RHFTextField
                  name="para_email"
                  label={translate('pharmacy_register.email_address')}
                  sx={{ gridArea: 'email' }}
                />
              </Box>
              <Box
                sx={{
                  p: 3,
                  pb: 0,
                  display: 'grid',
                  columnGap: 1,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(4, 1fr)' },
                  gridTemplateAreas: `"address_area address_area map_area map_area"`,
                }}
              >
                <Box sx={{ gridArea: 'address_area' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      columnGap: 1,
                      rowGap: 3,
                      gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                      gridTemplateAreas: `
                "type_of_road street_number"
                "city state"
                "province postal_code"`,
                    }}
                  >

                    <RHFTextField
                      name="para_type_of_road"
                      label={translate('pharmacy_register.type_of_road')}
                      sx={{ gridArea: 'type_of_road' }}
                    />
                    <RHFTextField
                      name="para_street_number"
                      label={translate('pharmacy_register.street_no')}
                      sx={{ gridArea: 'street_number' }}
                      id="para_pharmacy_street_number"
                    />
                    <RHFTextField
                      name="para_city"
                      label={translate('pharmacy_register.city')}
                      sx={{ gridArea: 'city' }}
                    />
                    <RHFTextField
                      name="para_state"
                      label={translate('pharmacy_register.state')}
                      sx={{ gridArea: 'state' }}
                    />
                    <RHFTextField
                      name="para_province"
                      label={translate('pharmacy_register.province')}
                      sx={{ gridArea: 'province' }}
                    />
                    <RHFTextField
                      name="para_postal_code"
                      label={translate('pharmacy_register.postal_code')}
                      sx={{ gridArea: 'postal_code' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ gridArea: 'map_area' }}>
                  <Map
                    height="250px"
                    width="100%"
                    place={paraPlace}
                    setfullAddress={setParaFullAddress}
                    markerPosition={paraMarkerPosition}
                    address={paraMarkerAddress}
                  />
                </Box>
              </Box>
              {/* Para Pharmacy Section [END HERE] */}

              <Stack alignItems="flex-end" sx={{ mt: 3, p: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!isEdit ? translate('pharmacy_register.register') : translate('save_changes')}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      {/* Database Detail modal */}
      <DatabaseDetailDialog
        isOpen={openDBModal}
        handleCloseDBModal={handleCloseDBModal}
        updateDbDetail={updateDbDetail}
        currentDB={dbDetail}
        currentPharmacy={currentPharmacy}
      />
    </>
  );
}
