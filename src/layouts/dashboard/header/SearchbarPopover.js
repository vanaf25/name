import React, { useState, useEffect, useMemo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Slide, Button, ClickAwayListener, Autocomplete, TextField, Typography, Box } from '@mui/material';

import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import throttle from 'lodash/throttle';
import jsonp from 'jsonp';
import { useNavigate } from 'react-router-dom';

// utils
import cssStyles from '../../../utils/cssStyles';
import useLocales from '../../../hooks/useLocales';

// Path
import { PATH_SEARCH } from '../../../routes/paths';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 263;

const SearchbarStyle = styled('div')(({ theme }) => ({
  ...cssStyles(theme).bgBlur(),
  top: 11,
  left: 0,
  right: 5,
  zIndex: 99,
  width: '100%',
  // display: 'flex',
  position: 'absolute',
  // alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function SearchbarPopover(props) {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const navigate = useNavigate();
  const { translate } = useLocales();

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(!isOpen);
    props.onClose();
  };

  const Internethandle = () => {
    try {
      navigate(`${PATH_SEARCH.productDetail}/${value.prd_id}`);
      props.onClose();
    } catch (error) {
      props.onClose();
      // console.log(error);
    }
  };

  const Pharmacyhandle = () => {
    try {
      navigate(`${PATH_SEARCH.PharmacyDetails}/${value.prd_id}`, { state: { product: value } });
      setValue(null);
      props.onClose();
    } catch (error) {
      props.onClose();
      // console.log(error);
    }
  };

  const fetch = useMemo(
    () =>
      throttle((request, callback) => {
        const params = {
          mm: '70%',
          q: request.input,
          defType: 'dismax',
          ps: '1',
          qf: 'name code',
          fl: '*,score',
          pf: 'name',
        };

        // Call JSONP for SOLR
        jsonp(
          `${process.env.REACT_APP_SOLR_URL}?${new URLSearchParams(params).toString()}`,
          { param: 'json.wrf' },
          (err, data) => {
            if (err) {
              console.error(err.message);
            } else {
              callback(data.response.docs);
            }
          }
        );
      }, 200),
    []
  );

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }
    if (inputValue.length > 3) {
      fetch({ input: inputValue }, (results) => {
        if (active) {
          setOptions(results);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div style={{ height: 200 }}>
        <Slide direction="down" in={!isOpen} mountOnEnter unmountOnExit>
          <SearchbarStyle>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              {translate('Product_search')}
            </Typography>
            <Autocomplete
              id="solr-search"
              fullWidth
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.mainName)}
              isOptionEqualToValue={(option, value) => option.prd_id === value.prd_id}
              filterOptions={(x) => x}
              options={options}
              autoComplete
              includeInputInList
              renderOption={(props, option, { inputValue }) => {
                const matches = match(option.mainName, inputValue);
                const parts = parse(option.mainName, matches);
                return (
                  <li {...props} style={{ padding: 2, margin: 0 }}>
                    <div>
                      {parts.map((part, index) => (
                        <span
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                            fontSize: 11,
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              }}
              value={value}
              onChange={(event, newValue) => {
                try {
                  setValue(newValue);
                } catch (error) {
                  // console.log(error);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (value.prd_id) {
                        Pharmacyhandle();
                      } else {
                        // console.log('value not found');
                      }
                    }
                  }}
                  onChange={(event, newValue) => {
                    try {
                      setValue(event.target.value);
                    } catch (error) {
                      // console.log(error);
                    }
                  }}
                  fullWidth
                  placeholder={translate('search_bar_cd_name')}
                  sx={{ mr: 1, fontWeight: 'fontWeightBold', border: 1, pl: 1 }}
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                  }}
                />
              )}
            />
            <Box style={{ textAlign: 'center' }}>
              <Button
                sx={{ mt: 15, mr: '22%', width: 130 }}
                variant="contained"
                onClick={() => {
                  if (value.prd_id) {
                    Pharmacyhandle();
                  } else {
                    // console.log('value not found');
                  }
                }}
              >
                {translate('Pharmacy')}
              </Button>
              <Button
                sx={{ mt: 15, ml: '22%', width: 130 }}
                variant="contained"
                onClick={() => {
                  if (value.prd_id) {
                    Internethandle();
                  } else {
                    // console.log('value not found');
                  }
                }}
              >
                {translate('Internet')}
              </Button>
            </Box>
          </SearchbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
