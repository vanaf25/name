import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';

import { Autocomplete, TextField } from '@mui/material';


// ----------------------------------------------------------------------

RHFAutoCompleteText.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  options: PropTypes.object,
  placeholder: PropTypes.string,
  labelKey: PropTypes.string,
  onChange: PropTypes.func,
};

export default function RHFAutoCompleteText({id,  name, options, placeholder, labelKey, onChange}) {
  const { control, setValue } = useFormContext();


  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {

        return (
            <div ref={field.ref}>
                <Autocomplete
                    id={id}
                    name={name}
                    freeSolo
                    options={options}
                    getOptionLabel={
                        (option) => option[labelKey]}
                    onChange={(event, option) => {
                        const value =  option ? option[labelKey]: "";
                        setValue(name, value)
                        onChange(value, option)
                    }}
                    renderInput={(params) => {
                        return (
                            <TextField
                            {...params}
                            placeholder={placeholder}
                            helperText={ fieldState.error?.message}
                            error={fieldState.error?.message}
                            inputProps={{...params.inputProps, value: field.value, onChange: (e) => { 
                              field.onChange(e) 
                              params.inputProps.onChange(e)

                              const option = options.find(item => item[labelKey] === e.target.value)
                              onChange(e.target.value, option)
                            } }}

                        />
                      )
                    }}
                />
            </div>
      )}}
    />
  );
}

