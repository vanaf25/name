import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import IconButton from '@mui/material/IconButton';
import { Button } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import MenuPopover from '../../components/MenuPopover';
import DialogModal from '../../components/DialogModal';

// Hooks
import useLocales from '../../hooks/useLocales';
import axios from '../../utils/axios';
import { useDispatch } from '../../redux/store';
import { getBuyCategories, getBuyConditions, getBuyProducts } from '../../redux/slices/buy';

// Componenets
import { BUY_API } from '../../constants/ApiPaths';
import Iconify from '../../components/Iconify';
import CatalogProductFormAdd from '../../sections/buy/components/CatalogProductFormAdd';
import CatalogConditions from '../../sections/buy/dialogs/CatalogConditions';
import CatalogCategories from '../../sections/buy/dialogs/CatalogCategories';

const ManageMenuPopover = (props) => {
  const { currentBuy } = props;
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const [AddProduct, setOpenAddProduct] = useState(false);
  const [openConditions, setOpenConditions] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);

  const handleCloseAddProduct = () => setOpenAddProduct(false);
  const handleCloseConditions = () => setOpenConditions(false);
  const handleCloseCategories = () => setOpenCategories(false);

  const handleOpenAddProduct = () => {
    setOpenAddProduct(true);
  };
  const handleOpenCategories = () => {
    setOpenCategories(true);
  };
  const handleOpenConditions = () => {
    setOpenConditions(true);
  };

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImportDialogOpen = () => {
    setOpenImportDialog(true);
  };
  const handleImportDialogClose = () => {
    setOpenImportDialog(false);
  };

  const Input = styled('input')({
    visibility: 'visible',
  });

  const importCatalog = (event) => {
    const selectedFile = event.currentTarget.files[0];

    // Prepare form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('buy', currentBuy.id);

    // Set the flag to start importing
    setIsImporting(true);

    axios({
      method: 'post',
      url: BUY_API.BUY_IMPORT_CATALOG,
      data: formData,
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
      .then((response) => {
        // console.log(response);

        setIsImporting(false);
        event.target.value = null;
        // Load Catalog Categories for current buy
        dispatch(getBuyCategories(currentBuy.id));
        // Load Catalog Conditions for current buy
        dispatch(getBuyConditions(currentBuy.id));
        // Load Catalog Products for current buy
        dispatch(getBuyProducts(currentBuy.id));
        enqueueSnackbar('Catalog has been imported successfully');
      })
      .catch((error) => {
        // console.log(error);

        const { detail } = error;
        setIsImporting(false);
        event.target.value = null;
        enqueueSnackbar(detail, { variant: 'error' });
      });
  };

  return (
    <>
      <Button
        aria-label="more"
        variant="contained"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleOpen}
      >
        {translate('catalogue_settings')}
      </Button>
      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          width: 190,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <>
          <MenuItem onClick={handleOpenAddProduct} sx={{ color: 'error.black' }}>
            {translate('add_product')}
          </MenuItem>
          <MenuItem onClick={handleOpenCategories} sx={{ color: 'error.black' }}>
            {translate('buy.manage_categories')}
          </MenuItem>
          <MenuItem onClick={handleOpenConditions} sx={{ color: 'error.black' }}>
            {translate('buy.manage_conditions')}
          </MenuItem>
          <MenuItem sx={{ color: 'error.black' }} onClick={handleImportDialogOpen}>
            {/* <label htmlFor="importCatalogInput">
              <Input accept=".xlsx, .xls, .xlsm" id="importCatalogInput" type="file" onChange={importCatalog} />
              {translate('buy.import_products')}
            </label> */}
            {translate('buy.import_products')}
          </MenuItem>
          <MenuItem
            variant="contained"
            color="error"
            // component={RouterLink}
            // to={PATH_BUY.newGroup}
            // startIcon={<Iconify icon={'eva:trash-2-outline'} />}
            sx={{ color: 'error.main' }}
          >
            {translate('delete')}
          </MenuItem>
        </>
      </MenuPopover>
      <DialogModal
        title={'add_product'}
        open={Boolean(AddProduct)}
        onClose={handleCloseAddProduct}
        DialogContentItems={<CatalogProductFormAdd currentBuy={currentBuy} />}
      />
      <DialogModal
        open={Boolean(openConditions)}
        title={'buy.manage_conditions'}
        onClose={handleCloseConditions}
        DialogContentItems={<CatalogConditions currentBuy={currentBuy} />}
      />
      <DialogModal
        open={Boolean(openCategories)}
        title={'buy.manage_categories'}
        onClose={handleCloseCategories}
        DialogContentItems={<CatalogCategories currentBuy={currentBuy} />}
      />
      <DialogModal
        open={openImportDialog}
        title={translate('buy.import_products')}
        fullWidth={false}
        maxWidth="sm"
        onClose={handleImportDialogClose}
        DialogContentItems={
          <Input
            accept=".xlsx, .xls, .xlsm"
            id="importCatalogInput"
            type="file"
            onChange={importCatalog}
            sx={{ mt: 3 }}
          />
        }
      />
    </>
  );
};

ManageMenuPopover.prototype = {
  currentBuy: PropTypes.object,
};

export default ManageMenuPopover;
