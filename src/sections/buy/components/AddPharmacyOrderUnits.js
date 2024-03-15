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

AddPharmacyOrderUnits.propTypes = {
    currentBuy: PropTypes.object,
    editProductdata: PropTypes.object,
};

export default function AddPharmacyOrderUnits({ currentBuy, editProductdata, orderItems, pharmacyList, needs }) {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const { catalog } = useSelector((state) => state.buy);

    const { pathname ,state} = useLocation();



    // States
    const [editProduct, setEditProduct] = useState(editProductdata);

    // console.log("DEBUG", catalog?.loadingCatalog);
    const [rootCategories, setRootCategories] = useState([]);

    const ProductSchema = Yup.object().shape({
        pharmacy: Yup.string().required('Category is required'),
        units: Yup.number()
            .nullable(true)
            // checking self-equality works for NaN, transforming it to null
            .transform((_, val) => (val ? Number(val) : null))
            .required('Boxes is required'),
    });

    const defaultValues = useMemo(
        () => ({
            pharmacy: editProduct?.pharmacy || '',
            units: editProduct?.units || ''
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

        // console.log("DEBUG", catalog?.loadingCatalog);

        data.buy = catalog?.categories[0]?.buy || catalog?.conditions[0]?.buy;
        data.order_item = needs[0].order_item

        // console.log("DEBUG", { data, needs });
        return axios({
            method: editProduct ? 'put' : 'post',
            url: editProduct ? `${BUY_API.BUY_ORDER_ITEM_NEEDS}` : `${BUY_API.BUY_ORDER_ITEM_NEEDS}`,
            data,
        })
            .then((response) => {
                // let updatedProducts = [];
                if (response.status === 201 || response.status === 200) {
                    // If Created New Product
                    // if (response.status === 201) {
                    //     updatedProducts = [{ ...response.data }, ...catalog.categories];
                    // } else {
                    //     // If Update Existing Product
                    //     updatedProducts = catalog.products.map((product) => {
                    //         if (product.id === editProduct.id) {
                    //             return { ...response.data };
                    //         }
                    //         return { ...product };
                    //     });
                    // }

                    // console.log({updatedProducts})
                    // dispatch(getBuyProductsSuccess(updatedProducts));
                    setEditProduct(null);
                    handleResetForm();
                    window.location.reload();
                    // if (productLoaderFunction) productLoaderFunction()
                    // enqueueSnackbar(
                    //     !editProduct ? 'Product has been added successfully.' : 'Product has been Updated successfully.'
                    // );
                }
            })
            .catch((error) => {
                // console.log(error);
                enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
            });
    };

    const handleResetForm = () => {
        reset({
            pharmacy: '',
            units: ''
        });
        setEditProduct(null);
    };


    const getSubCategories = (rootCategoryID) => catalog.categories.filter((cat) => cat.parent === rootCategoryID);

    //   Effect Hooks
    useEffect(() => {
        if (editProduct)
            // console.log('Edit Product -> ', editProduct);
        reset({
            pharmacy: editProduct?.category?.id || '',
            units: editProduct?.units || ''
        });
    }, [editProduct]);
    // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
       
    }, [catalog.categories]);

    // console.log({ pharmacyList })
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
                                <RHFSelect
                                    name="pharmacy"
                                    label="pharmacy"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <option value="" disabled>
                                        {"Choose_Pharmacy"}
                                    </option>
                                    {(
                                        pharmacyList.length > 0 ? 
                                        <optgroup>
                                            {pharmacyList.map((subCat) => (
                                                <option key={subCat.id} value={subCat.id}>
                                                    {subCat.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        : null

                                    )}
                                </RHFSelect>
                            </Grid>

                            <Grid item md={2}>
                                <RHFTextField type="number" name="units" size="small" placeholder={"units"} />
                            </Grid>
                            <Grid container direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
                                <LoadingButton type="submit" variant="contained" size="small" loading={isSubmitting}>
                                    {!editProduct ? "Add Need" : translate('update_order_product')}
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
