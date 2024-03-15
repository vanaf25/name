import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Iconify from './Iconify';
import useLocales from '../hooks/useLocales';

const SearchDialogModal = (props) => {
  const { open, onClose, DialogContentItems, title } = props;
  const { translate } = useLocales();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ borderRadius: 50 }}>
      <DialogTitle>
        {translate(title)}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'relative',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify onClose={onClose} icon={'eva:close-circle-outline'} />
        </IconButton>
      </DialogTitle>
      <DialogContent>{DialogContentItems}</DialogContent>
    </Dialog>
  );
};

SearchDialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  DialogContentItems: PropTypes.any,
  title: PropTypes.string,
};

export default SearchDialogModal;
