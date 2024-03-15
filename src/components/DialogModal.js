import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Iconify from './Iconify';
import useLocales from '../hooks/useLocales';

const DialogModal = (props) => {
  const { open, onClose, DialogContentItems, title, maxWidth, fullWidth } = props;
  const { translate } = useLocales();

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>
        {translate(title)}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
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

DialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  DialogContentItems: PropTypes.any,
  title: PropTypes.string,
  maxWidth: PropTypes.string,
  fullWidth: PropTypes.bool,
};

DialogModal.defaultProps = {
  maxWidth: 'lg',
  fullWidth: true,
};

export default DialogModal;
