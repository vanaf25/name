import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { Button, Grid, TextField } from '@mui/material';

import { LoadingButton } from '@mui/lab';

import { useBuyCreateCatalogContext } from '../../../pages/buy/BuyCreateCatalog';
// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getBuyProductsSuccess } from '../../../redux/slices/buy';

// Hooks
import useLocales from '../../../hooks/useLocales';

// Components
import { FormProvider, RHFTextField, RHFSelect } from '../../../components/hook-form';

// Utils
import axios from '../../../utils/axios';
import { calculateTax } from '../../../utils/calculateTax';

// Paths
import { BUY_API } from '../../../constants/ApiPaths';
import { IVA } from '../../../constants/AppEnums';

import Loader from '../../../components/Loader'

CatalogProductFormAdd.propTypes = {
    currentBuy: PropTypes.object,
    editProductdata: PropTypes.object,
};

export default function CatalogProductFormAdd({ currentBuy, editProductdata }) {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const { productLoaderFunction } = useBuyCreateCatalogContext();

    const { catalog } = useSelector((state) => state.buy);

    // States
    const [editProduct, setEditProduct] = useState(editProductdata);

    // console.log("DEBUG", catalog?.loadingCatalog);
    const [rootCategories, setRootCategories] = useState([]);

    const ProductSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        category: Yup.string().required('Category is required'),
        catalog_condition: Yup.string().required('Condition is required'),
        ean: Yup.string().required('EAN is required'),
        cn: Yup.string(),
        min_units: Yup.number()
            .nullable(true)
            // checking self-equality works for NaN, transforming it to null
            .transform((_, val) => (val ? Number(val) : null)),
        units_inbox: Yup.number()
            .nullable(true)
            // checking self-equality works for NaN, transforming it to null
            .transform((_, val) => (val ? Number(val) : null)),
        pvl: Yup.number()
            .nullable(true)
            // checking self-equality works for NaN, transforming it to null
            .transform((_, val) => (val ? Number(val) : null))
            .required('PVL is required'),
    });

    const defaultValues = useMemo(
        () => ({
            name: editProduct?.name || '',
            category: editProduct?.category || '',
            catalog_condition: editProduct?.catalog_condition || '',
            ean: editProduct?.ean || '',
            cn: editProduct?.cn || '',
            min_units: editProduct?.min_units || 1,
            units_inbox: editProduct?.units_inbox || '',
            pvl: editProduct?.pvl || '',
            tax: editProduct?.tax || '',
        }),
        [editProduct]
    );

    const methods = useForm({
        resolver: yupResolver(ProductSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        getValues,
        formState: { isSubmitting },
    } = methods;


    const onSubmit = async (data) => {
        // console.log('Hey Prod: ', data);
        // console.log('Hey currentBuy: ', catalog);
        // console.log('Hey buy id: ', catalog?.categories[0]?.buy);
        // console.log('Hey BUY ID: ', catalog?.conditions[0]?.buy);

        data.buy = catalog?.categories[0]?.buy || catalog?.conditions[0]?.buy;
        data.tax = data.tax || 0.21
        return axios({
            method: editProduct ? 'put' : 'post',
            url: editProduct ? `${BUY_API.Add_BUY_PRODUCT}${editProduct.id}/` : `${BUY_API.Add_BUY_PRODUCT}`,
            data,
        })
            .then((response) => {
                let updatedProducts = [];
                if (response.status === 201 || response.status === 200) {
                    // If Created New Product
                    if (response.status === 201) {
                        updatedProducts = [{ ...response.data }, ...catalog.categories];
                    } else {
                        // If Update Existing Product
                        updatedProducts = catalog.products.map((product) => {
                            if (product.id === editProduct.id) {
                                return { ...response.data };
                            }
                            return { ...product };
                        });
                    }
                    dispatch(getBuyProductsSuccess(updatedProducts));
                    setEditProduct(null);
                    handleResetForm();
                    if (productLoaderFunction) productLoaderFunction()
                    enqueueSnackbar(
                        !editProduct ? 'Product has been added successfully.' : 'Product has been Updated successfully.'
                    );
                }
            })
            .catch((error) => {
                // console.log(error);
                enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
            });
    };

    const handleResetForm = () => {
        reset({
            name: '',
            category: '',
            catalog_condition: '',
            ean: '',
            cn: '',
            min_units: '',
            units_inbox: '',
            pvl: '',
            tax: '',
        });
        setEditProduct(null);
    };


    const getSubCategories = (rootCategoryID) => catalog.categories.filter((cat) => cat.parent === rootCategoryID);

    //   Effect Hooks
    useEffect(() => {
        if (editProduct)
            // console.log('Edit Product -> ', editProduct);
        reset({
            name: editProduct?.name || '',
            category: editProduct?.category?.id || '',
            catalog_condition: editProduct?.catalog_condition?.id || '',
            ean: editProduct?.ean || '',
            cn: editProduct?.cn || '',
            min_units: editProduct?.min_units || '',
            units_inbox: editProduct?.units_inbox || '',
            pvl: editProduct?.pvl || '',
            tax: parseFloat(editProduct?.tax) || '',
        });
    }, [editProduct]);
    // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const rootCategories = catalog.categories.filter((cat) => !cat.parent && cat.name);
        setRootCategories(rootCategories);
    }, [catalog.categories]);

    return (
        <Grid container spacing={3}>
            <Grid item md={12}>
                {catalog.loadingCatalog ? (
                    <>
                        <Loader />
                    </>
                ) : (<>
                    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3} sx={{ marginTop: 1 }}>
                            <Grid item md={4}>
                                <RHFTextField name="name" placeholder={translate('product_name')} size="small" />
                            </Grid>
                            <Grid item md={4}>
                                <RHFSelect
                                    name="category"
                                    label={translate('buy.category')}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <option value="" disabled>
                                        {translate("Choose_Category")}
                                    </option>
                                    {rootCategories.map((category) => {
                                        const subCatgories = getSubCategories(category.id);
                                        if (subCatgories.length) {
                                            return (
                                                <optgroup label={category.name} key={category.id}>
                                                    {subCatgories.map((subCat) => (
                                                        <option key={subCat.id} value={subCat.id}>
                                                            {subCat.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        }
                                        return (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        );
                                    })}
                                </RHFSelect>
                            </Grid>
                            <Grid item md={4}>
                                <RHFSelect
                                    name="catalog_condition"
                                    label={translate('buy.condition')}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <option value="" disabled>
                                        {translate('Choose Condition')}
                                    </option>
                                    {catalog.conditions.map((condition) => (
                                        <option key={condition.id} value={condition.id}>
                                            {translate(condition.name)}
                                        </option>
                                    ))}
                                </RHFSelect>
                            </Grid>

                            <Grid item md={2}>
                                <RHFTextField name="ean" size="small" placeholder="EAN" />
                            </Grid>
                            <Grid item md={2}>
                                <RHFTextField name="cn" size="small" placeholder="CN" />
                            </Grid>
                            <Grid item md={2}>
                                <RHFTextField type="number" name="min_units" size="small" placeholder={translate('buy.min_units')} />
                            </Grid>
                            <Grid item md={2}>
                                <RHFTextField type="number" name="units_inbox" size="small" placeholder={translate('buy.box')} />
                            </Grid>
                            <Grid item md={1}>
                                <RHFSelect size="small" name="tax" label="IVA" InputLabelProps={{ shrink: true }} >
                                    {Object.entries(IVA).map(([key, value]) => (
                                        <option value={value} key={key}>
                                            {key}
                                        </option>
                                    ))}
                                </RHFSelect>
                            </Grid>
                            <Grid item md={1} >
                                <RHFTextField type="number" name="pvl" size="small" label="PVL" />
                            </Grid>
                            <Grid item md={2}>
                                <TextField
                                    size="small"
                                    label={translate('price')}
                                    value={calculateTax(getValues('pvl'), getValues('tax')).amount_with_tax}
                                    fullWidth
                                    readOnly
                                />
                            </Grid>
                            <Grid container direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
                                <LoadingButton type="submit" variant="contained" size="small" loading={isSubmitting}>
                                    {!editProduct ? translate('add_product') : translate('update_product')}
                                </LoadingButton>
                                <Button onClick={handleResetForm}>{translate('reset')}</Button>

                            </Grid>
                        </Grid>
                    </FormProvider>
                </>)}
            </Grid>
        </Grid>
    );
}
