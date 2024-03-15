import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { FormHelperText, TextField } from '@mui/material';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
//
import Editor from '../editor';

// ----------------------------------------------------------------------

RHFDesktopDatePicker.propTypes = {
  name: PropTypes.string,
};

export default function RHFDesktopDatePicker({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DesktopDatePicker
          id={name}
          value={field.value}
          onChange={field.onChange}
          // error={!!error}
          // helperText={
          //   <FormHelperText error sx={{ px: 2, textTransform: 'capitalize' }}>
          //     {error?.message}
          //   </FormHelperText>
          // }
          renderInput={(params) => <TextField fullWidth error={!!error} helperText={error?.message} {...params} />}
          {...other}
        />
      )}
    />
  );
}
