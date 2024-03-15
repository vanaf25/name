import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getBuyCategoriesSuccess } from '../../../redux/slices/buy';

// Hooks
import useLocales from '../../../hooks/useLocales';

// Components
import { FormProvider, RHFTextField, RHFSelect } from '../../../components/hook-form';
import Loader from '../../../components/Loader';

// Utils
import axios from '../../../utils/axios';

// Paths
import { BUY_API } from '../../../constants/ApiPaths';
import ActionMenu from './ActionMenu';

CatalogCategories.propTypes = {
  currentBuy: PropTypes.object,
};

function CatalogCategories({ currentBuy }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const { catalog } = useSelector((state) => state.buy);

  //   States
  const [editCategory, setEditCategory] = useState(null);

  const CategorySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    parent: Yup.number()
      .nullable(true)
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val ? Number(val) : null)),
  });

  const defaultValues = useMemo(
    () => ({
      name: editCategory?.name || '',
      parent: editCategory?.parent || '',
    }),
    [editCategory]
  );

  const methods = useForm({
    resolver: yupResolver(CategorySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    // console.log('Hey: ', data);
    return axios({
      method: editCategory ? 'put' : 'post',
      url: editCategory ? `${BUY_API.BUY_CATEGORY}${editCategory.id}/` : `${BUY_API.BUY_CATEGORY}`,
      data: {
        name: data.name,
        parent: data.parent,
        buy: currentBuy.id,
      },
    })
      .then((response) => {
        let updatedCategories = [];
        if (response.status === 201 || response.status === 200) {
          // If Created New Category
          if (response.status === 201) {
            updatedCategories = [{ ...response.data }, ...catalog.categories];
          } else {
            // If Update Existing Category
            updatedCategories = catalog.categories.map((category) => {
              if (category.id === editCategory.id) {
                return { ...response.data };
              }
              return { ...category };
            });
          }
          dispatch(getBuyCategoriesSuccess(updatedCategories));
          setEditCategory(null);
          handleResetForm();
          enqueueSnackbar(
            !editCategory ? 'Category has been created successfully.' : 'Category has been Updated successfully.'
          );
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleDelete = (category) => {
    axios
      .delete(`${BUY_API.BUY_CATEGORY}${category.id}`)
      .then(() => {
        enqueueSnackbar('Category has been deleted successfully.');
        const updatedCategories = catalog.categories.filter((row) => row.id !== category.id);
        dispatch(getBuyCategoriesSuccess(updatedCategories));
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  const handleEdit = (category) => {
    setEditCategory(category);
  };

  const handleResetForm = () => {
    reset({ name: '', parent: '' });
  };

  //   Effect Hooks
  useEffect(() => {
    if (editCategory)
      reset({ parent: editCategory.parent === null ? '' : editCategory.parent, name: editCategory.name });
  }, [editCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={3}>
      <Grid item md={12}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={1} sx={{ mt: 2 }}>
            <Grid item md={6}>
              <RHFSelect
                name="parent"
                size="small"
                label={translate('buy.parent_category')}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Root</option>
                {catalog.categories.map((category) =>
                  category.parent === null && category.name !== '' ? (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ) : (
                    ''
                  )
                )}
              </RHFSelect>
            </Grid>
            <Grid item md={6}>
              <RHFTextField name="name" label={translate('name')} size="small" />
            </Grid>
            <Grid item md={12} display="flex" alignItems="center" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="small">
                {editCategory ? translate('Update_Category') : translate('Add_Category')}
              </LoadingButton>
              <Button onClick={() => handleResetForm()}>{translate('reset')}</Button>
            </Grid>
          </Grid>
        </FormProvider>
      </Grid>
      <Grid item md={12}>
        <TableContainer sx={{ maxHeight: 200 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>{translate("parent_category")}</TableCell>
                <TableCell>{translate('name')}</TableCell>
                <TableCell>{null}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalog.categories.length ? (
                catalog.categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.parent ? category.parent_name : 'Root'}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <ActionMenu onDelete={() => handleDelete(category)} onEdit={() => handleEdit(category)} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    {catalog.loadingCatalog ? (
                      <>
                        <Loader />
                      </>
                    ) : (
                      translate("No_Category")
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

export default CatalogCategories;
