import React, { useState, useEffect, useMemo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Slide, Button, InputAdornment, ClickAwayListener, Autocomplete, TextField } from '@mui/material';
import throttle from 'lodash/throttle';
import jsonp from 'jsonp';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

// utils
import cssStyles from '../../../utils/cssStyles';
import useLocales from '../../../hooks/useLocales';
// components
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
// Path
import { PATH_SEARCH } from '../../../routes/paths';
import Router from '../../../routes';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const SearchbarStyle = styled('div')(({ theme }) => ({
  ...cssStyles(theme).bgBlur(),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar(props) {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = React.useState([]);
  const navigate = useNavigate();
  const { translate } = useLocales();
  const { id = '' } = useParams();
  const location = useLocation();
  const isshow = useMemo(
    () => [`/search/product/${id}`, `/search/product/PharmacyDetails/${id}`].includes(location.pathname),
    [id]
  );

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetch = useMemo(
    // Regex ^(\d{6}|\d{13})$
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
      <div>
        {isshow && (
          <IconButtonAnimate onClick={handleOpen}>
            <Iconify icon={'eva:search-fill'} width={20} height={20} />
          </IconButtonAnimate>
        )}
        <Slide direction="down" in={isOpen} mountOnEnter unmountOnExit>
          <SearchbarStyle>
            <Autocomplete
              id="solr-search"
              fullWidth
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.mainName)}
              isOptionEqualToValue={(option, value) => option.prd_id === value.prd_id}
              filterOptions={(x) => x}
              options={options}
              autoComplete
              includeInputInList
              filterSelectedOptions
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
                  navigate(
                    `${
                      location.pathname.includes(PATH_SEARCH.PharmacyDetails)
                        ? PATH_SEARCH.PharmacyDetails
                        : PATH_SEARCH.productDetail
                    }/${newValue.prd_id}`,
                    { state: { product: newValue } }
                  );
                  setValue(null);
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
                  fullWidth
                  placeholder={translate('search_bar_cd_name')}
                  sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button variant="contained" onClick={handleClose}>
              {translate('Search')}
            </Button>
          </SearchbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
