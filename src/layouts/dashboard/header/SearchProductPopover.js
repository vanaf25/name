import React, { useState, useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import jsonp from 'jsonp';
import { useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Slide, Button, ClickAwayListener, Autocomplete, TextField, Typography, Box } from '@mui/material';

import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

// Redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getPreferredSellers, getMarketplacesProductsSearch } from '../../../redux/slices/pharmacy_product';

// utils
import cssStyles from '../../../utils/cssStyles';
import useLocales from '../../../hooks/useLocales';

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
  position: 'absolute',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function SearchProductPopover(props) {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { preferredSellers } = useSelector((state) => state.pharmacy_product);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(!isOpen);
    props.onClose();
  };

  const Pharmacyhandle = () => {
    try {
      let sellersID = '';
      if (preferredSellers?.value || false) {
        const sellersValue = JSON.parse(preferredSellers.value);
        const ids = sellersValue.map((row) => row.id);
        sellersID = ids.join(',');
      }
      dispatch(getMarketplacesProductsSearch({ cn_ean: value.code[1] }, sellersID));
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

  useEffect(() => {
    dispatch(getPreferredSellers());
  }, []);

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
              value={props.search.name}
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
                      if (value?.prd_id) {
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
                sx={{ mt: 15, width: 130 }}
                variant="contained"
                onClick={() => {
                  if (value?.prd_id) {
                    Pharmacyhandle();
                  } else {
                    // console.log('value not found');
                  }
                }}
              >
                {translate('submit')}
              </Button>
            </Box>
          </SearchbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
