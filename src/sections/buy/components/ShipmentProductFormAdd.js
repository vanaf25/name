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
import { addShipmentItem, updateShipmentItem } from '../../../redux/slices/shipment';

// Hooks
import useLocales from '../../../hooks/useLocales';

// Components
import { FormProvider, RHFTextField, RHFSelect, RHFAutoCompleteText } from '../../../components/hook-form';

// Utils
import axios from '../../../utils/axios';
import { calculateTax } from '../../../utils/calculateTax';

// Paths
import { BUY_API } from '../../../constants/ApiPaths';
import { IVA } from '../../../constants/AppEnums';

import Loader from '../../../components/Loader'

ShipmentProductFormAdd.propTypes = {
    currentBuy: PropTypes.object,
    editProductdata: PropTypes.object,
};

export default function ShipmentProductFormAdd({ currentBuy, editProductdata, shipmentItems, products, onClose }) {
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
        product_name: Yup.string().required('Name is required'),
        category: Yup.string().required('Category is required'),
        catalog_condition: Yup.string().required('Condition is required'),
        ean: Yup.string().required('EAN is required'),
        cn: Yup.string().required('CN is required'),
        pvl: Yup.number()
            .nullable(true)
            .transform((_, val) => (val ? Number(val) : null))
            .required('PVL is required'),
    });

    const defaultValues = useMemo(
        () => ({
            product_name: editProduct?.product_name || '',
            category: editProduct?.category || '',
            catalog_condition: editProduct?.catalog_condition || '',
            ean: editProduct?.ean || '',
            min_units: editProduct?.min_units || '',
            cn: editProduct?.cn || '',
            units: editProduct?.units || '',
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
        setValue
    } = methods;


    const onSubmit = async (data) => {
        // console.log('Hey Prod: ', data);
        // console.log('Hey currentBuy: ', catalog);
        // console.log('Hey buy id: ', catalog?.categories[0]?.buy);
        // console.log('Hey BUY ID: ', catalog?.conditions[0]?.buy);

        // console.log("DEBUG", catalog?.loadingCatalog);

        data.buy = catalog?.categories[0]?.buy || catalog?.conditions[0]?.buy;
        data.tax = +data.tax/100 || 0.21
        data.shipment = shipmentItems.id
        data.units = 0

        return axios({
            method: 'post',
            url: `${BUY_API.CREATE_SHIPMENT_ITEM}`,
            data,
        })
            .then((response) => {
                dispatch(addShipmentItem(response.data))
                handleResetForm();
                onClose()
                enqueueSnackbar('Product has been added successfully.')
                window.location.reload();
            })
            .catch((error) => {
                // console.log(error);
                enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
            });
    };

    const handleResetForm = () => {
        reset({
            product_name: '',
            category: '',
            catalog_condition: '',
            ean: '',
            min_units: '',
            cn: '',
            units: '',
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
            product_name: editProduct?.product_name || '',
            category: editProduct?.category?.id || '',
            catalog_condition: editProduct?.catalog_condition?.id || '',
            ean: editProduct?.ean || '',
            min_units: editProduct?.min_units || '',
            cn: editProduct?.cn || '',
            units: editProduct?.units || '',
            pvl: editProduct?.pvl || '',
            tax: parseFloat(editProduct?.tax) || '',
        });
    }, [editProduct]);

    useEffect(() => {
        const rootCategories = catalog.categories.filter((cat) => !cat.parent && cat.name);
        setRootCategories(rootCategories);
    }, [catalog.categories]);


    const populateFieldFromProductData = (value, product) => {
        if (!value){
            handleResetForm();
            return
        }

        if(!product)
            return

        setValue("ean", product?.ean)
        setValue("cn", product?.cn)
        setValue("product_name", product?.name)
        setValue("category", product?.category?.name)
        setValue("catalog_condition", product?.catalog_condition?.name)
        setValue("min_units", product?.min_units)
        setValue("units", product?.units)
        setValue("pvl", product?.pvl)
        setValue("tax", product?.tax)
    }

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
                            <Grid item md={2}>
                                <RHFAutoCompleteText
                                    id="ean"
                                    name="ean"
                                    options={products}
                                    placeholder= "EAN"
                                    labelKey="ean"
                                    onChange={populateFieldFromProductData}
                                />
                            </Grid>
                            <Grid item md={2}>
                                <RHFAutoCompleteText
                                    id="cn"
                                    name="cn"
                                    options={products}
                                    placeholder= "CN"
                                    labelKey="cn"
                                    onChange={populateFieldFromProductData}
                                />
                            </Grid>
                            <Grid item md={4}>
                                <RHFAutoCompleteText
                                    id="product_name"
                                    name="product_name"
                                    options={products}
                                    placeholder= {translate('product_name')}
                                    labelKey="name"
                                    onChange={populateFieldFromProductData}
                                />
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
                                                        <option key={subCat.id} value={subCat.name}>
                                                            {subCat.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        }
                                        return (
                                            <option key={category.id} value={category.name}>
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
                                        <option key={condition.id} value={condition.name}>
                                            {translate(condition.name)}
                                        </option>
                                    ))}
                                </RHFSelect>
                            </Grid>
                            <Grid item md={2}>
                                <RHFTextField type="number" name="min_units" size="small" placeholder={translate('buy.min_units')} />
                            </Grid>
                            <Grid item md={2}>
                                <RHFTextField type="number" name="units" size="small" placeholder={translate('buy.box')} />
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
                                    {!editProduct ? translate('add_order_product') : translate('update_order_product')}
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
