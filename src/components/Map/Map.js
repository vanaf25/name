import React from 'react';
import { withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker } from 'react-google-maps';
import Geocode from 'react-geocode';
import moment from 'moment';

Geocode.setApiKey(process.env.REACT_APP_GOOGLE_API_KEY);
Geocode.enableDebug();

const getStreetNo = (addressArray) => {
  if (!addressArray) return '';

  let streetNo = '';
  addressArray.forEach((address) => {
    if (address.types.includes('street_number')) streetNo = address.long_name;
  });
  return streetNo;
};

const getCity = (addressArray) => {
  if (!addressArray) return '';
  let city = '';
  addressArray.forEach((address) => {
    if (address.types.includes('locality')) city = address.long_name;
  });
  return city;
};

const getArea = (addressArray) => {
  if (!addressArray) return '';

  let area = '';
  addressArray.forEach((address) => {
    if (address.types.includes('sublocality_level_1') || address.types.includes('administrative_area_level_2') ||  address.types.includes('administrative_area_level_3')) area = address.long_name;
  });
  return area;
};

const getState = (addressArray) => {
  if (!addressArray) return '';

  let state = '';
  addressArray.forEach((address) => {
    if (address.types.includes('administrative_area_level_1')) state = address.long_name;
  });
  return state;
};

const getPostalCode = (addressArray) => {
  if (!addressArray) return '';

  let postalCode = '';
  addressArray.forEach((address) => {
    if (address.types.includes('postal_code')) postalCode = address.long_name;
  });
  return postalCode;
};

const getRoute = (addressArray) => {
  if (!addressArray) return '';

  let route = '';
  addressArray.forEach((address) => {
    if (address.types.includes('route')) route = address.long_name;
  });
  return route;
};
/* eslint-disable react/prop-types */
export default function Map(props) {
  const [mapPosition, setmapPosition] = React.useState(
    props.mapPosition || {
      lat: 40.4637,
      lng: -3.7492,
    }
  );
  const [markerPosition, setmarkerPosition] = React.useState(props.markerPosition || {});
  const [address, setaddress] = React.useState(props.address || '');

  React.useEffect(() => {
    if (props.place) {
      onPlaceSelected(props.place);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.place]);

  React.useEffect(() => {
    if (props.markerPosition && props.markerPosition.lat && props.markerPosition.lng) {
      setmarkerPosition(props.markerPosition);
    }
  }, [props.markerPosition]);

  React.useEffect(() => {
    if (props.address) {
      setaddress(props.address);
    }
  }, [props.address]);

  const onInfoWindowClose = (event) => {
    // console.log(event);
  };
  const onMarkerDragEnd = (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    Geocode.fromLatLng(newLat, newLng).then(
      (response) => {
        const address = response.results[0].formatted_address;
        const addressArray = response.results[0].address_components;
        // console.log(addressArray);
        const area = getArea(addressArray);
        const city = getCity(addressArray);
        const state = getState(addressArray);
        const streetNumber = getStreetNo(addressArray);
        const postalCode = getPostalCode(addressArray);
        const route = getRoute(addressArray);

        setaddress(address || '');

        setmarkerPosition({
          lat: newLat,
          lng: newLng,
        });

        setmapPosition({
          lat: newLat,
          lng: newLng,
        });
        props.setfullAddress({
          lat: newLat,
          lng: newLng,
          address,
          city,
          area,
          state,
          streetNumber,
          postalCode,
          route,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const onPlaceSelected = (place) => {
    const address = place.formatted_address;
    const addressArray = place.address_components;
    const area = getArea(addressArray);
    const city = getCity(addressArray);
    const state = getState(addressArray);
    const streetNumber = getStreetNo(addressArray);
    const postalCode = getPostalCode(addressArray);
    const route = getRoute(addressArray);
    const formattedPhoneNumber = place.formatted_phone_number;
    const latValue = place.geometry && place.geometry.location.lat();
    const lngValue = place.geometry && place.geometry.location.lng();
    const businessName = place?.types?.includes('establishment') || place?.types?.includes('"pharmacy"') ? place.name : '';
    const website = place.website || '';
    let openHours = place?.opening_hours?.periods?.length > 0 ? Number(moment(place.opening_hours?.periods?.[0]?.close?.time, 'hhmm').diff(moment(place.opening_hours?.periods?.[0]?.open?.time, 'hhmm'),'hours')) : null;
    if(!(openHours === 8 || openHours === 24 || openHours === 12)) {
      openHours = null;
    }
    setaddress(address || '');

    setmarkerPosition({
      lat: latValue,
      lng: lngValue,
    });
    setmapPosition({
      lat: latValue,
      lng: lngValue,
    });
    props.setfullAddress({
      lat: latValue,
      lng: lngValue,
      address,
      city,
      area,
      state,
      streetNumber,
      postalCode,
      businessName,
      route,
      formattedPhoneNumber,
      website,
      openHours
    });
  };

  const AsyncMap = withScriptjs(
    withGoogleMap((props) => (
      <GoogleMap
        google={props.google}
        defaultZoom={address ? props.zoom || 17 : 8}
        defaultCenter={{ lat: mapPosition.lat, lng: mapPosition.lng }}
        onClick={onMarkerDragEnd}
      >
        {/* For Auto complete Search Box */}
        {/* {!props.place && <Autocomplete
          id="autocomplete_search_box"
          style={{
            width: "100%",
            height: "40px",
            paddingLeft: "16px",
            marginTop: "2px",
            marginBottom: "500px",
          }}
          onPlaceSelected={onPlaceSelected}
          types={["establishment"]}
        />} */}
        {markerPosition.lat && markerPosition.lng && (
          <span>
            {/* InfoWindow on top of marker */}
            <InfoWindow
              onClose={onInfoWindowClose}
              position={{
                lat: markerPosition.lat,
                lng: markerPosition.lng,
              }}
            >
              <div>
                <span style={{ padding: 0, margin: 0 }}>{address}</span>
              </div>
            </InfoWindow>
            {/* Marker */}
            <Marker
              google={props.google}
              // draggable={true}
              // onDragEnd={onMarkerDragEnd}
              position={{ lat: markerPosition.lat, lng: markerPosition.lng }}
            />
            <Marker />
          </span>
        )}
      </GoogleMap>
    ))
  );

  return (
    <div>
      <AsyncMap
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={
          <div
            style={{
              height: props.height || '300px',
              width: props.width || '300px',
            }}
          />
        }
        mapElement={<div style={{ height: `100%` }} />}
        zoom={props.zoom}
      />
    </div>
  );
}

export const helper = {
  getArea,
  getStreetNo,
  getState,
  getRoute,
  getCity,
  getPostalCode,
};
