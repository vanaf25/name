import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// @mui
import {
  Grid,
  Card,
  CardHeader,
  Typography,
  Stack,
  Box,
  Divider,
  Dialog,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import fileDownload from 'js-file-download';
import { TextEditor } from 'react-data-grid';
import styled from 'styled-components'

// components
import CustomDataGrid from '../../../components/CustomDataGrid';
import OrderSummary from './components/OrderSummary';
import Iconify from '../../../components/Iconify';
import Loader from '../../../components/Loader';
import useAuth from '../../../hooks/useAuth';

// Utils
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';
import OrderPharmacyInfo from './components/OrderPharmacyInfo';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';
import CatalogProductFormAdd from '../components/CatalogProductFormAdd';
import DialogModal from '../../../components/DialogModal';
import { dispatch, useSelector } from '../../../redux/store';
import { getBuyCategories, getBuyConditions, updateBuyOrderItem, setBuyOrderItemSuccess, setBuyPharmacyListSuccess, getBuyOrderItem, setBuyOrderNeedItemsSuccess, updateBuyOrderNeedItems, addBuyOrderNeedItems, getBuyAction } from '../../../redux/slices/buy';
import OrderProductFormAdd from '../components/OrderProductFormAdd';

import Table from '../../../components/table/Table';

// import Table from '../../../components/table/Table';
// ----------------------------------------------------------------------

const Styles = styled.div`
    overflow: auto;
    margin-top: 1rem;

  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid #0000002b;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    thead {
        background: #fafafa;
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 10;
    }
    
    th,
    td {
      position: relative;
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #0000002b;
      border-right: 1px solid #0000002b;
      text-align: center;

      :last-child {
        border-right: 0;
      }
      &:nth-child(5), &:nth-child(8), &:nth-child(10) {
        border-right: none;
      }
    }
  }
`
const StyledInput = styled.input`
    width: 41px;
    border-radius: 12px;
    line-height: 1.4375em;
    font-size: 12px;
    font-family: Public Sans,sans-serif;
    font-weight: 400;
    color: #212B36;
    box-sizing: border-box;
    position: relative;
    cursor: text;
    display: inline-flex;
    align-items: center;
    width: 100%;
    position: relative;
    border-radius: 8px;
    box-shadow: 0 0 2px 0 rgb(145 158 171 / 20%), 0 12px 24px -4px rgb(145 158 171 / 12%);
    width: 40px;
    padding: 6px;
    border: 1px solid transparent !important;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    background-color: #aae9aa;
    font-weight: bold;
    &:focus-visible{ outline-color: #4dab4d !important;}
    `

OrderCart.propTypes = {
  editOrder: PropTypes.object,
};

function OrderCart({ editOrder }) {
  const { buy } = editOrder;
  const { currentPharmacy } = useAuth();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [products, setProducts] = useState([]);
  // const [showNeeds, setShowNeeds] = useState(false);
  // const [needs, setNeeds] = useState([]);
  const [orderReport, setOrderReport] = useState(false);
  const [AddProduct, setOpenAddProduct] = useState(false);
  const [AddUnit, setOpenAddUnit] = useState(false);
  const handleCloseAddProduct = () => setOpenAddProduct(false);
  const handleCloseAddUnit = () => setOpenAddUnit(false);
  const [pharmacyList, setPharmacyList] = useState([]);
  const [isPharmacyList, setIsPharmacyList] = useState(true);
  const { buyOrderItem, buyPharmacyList, OrderNeedItem } = useSelector((state) => state.buy);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState(-1);

  const handleFocus = (event) => event.target.select()
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault(); 
    }
  };
  
  const handleKeyUp = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  const showNeeds = selectedNeedId !== -1

  const toggleShowColumns = useCallback(() => {
    setShowColumns(v => !v)
  }, [])

  const onUpdateOrderCatalogRow = (row, updatedRow) => {

    row = row[0];

    axios
      .patch(`${BUY_API.BUY_ORDER_ITEM}${row.id}/`, { units: row.units })
      .then((response) => {
        axios
          .get(BUY_API.BUY_ORDER_ITEM, { params: { order: editOrder.id } })
          .then((response) => {
            setOrderItems(response.data);

            setLoadingItems(false);
          })
          .catch((error) => {
            // console.log(error);
            setLoadingItems(false);
          });
        setLoadingItems(false);
      })
      .catch((error) => {
        // console.log(error);
        setLoadingItems(false);
      });
  }

  const onUpdateRowData = (event, row, value, column, nextValue) => {
    // console.log({ event, row, value, column, nextValue })
    let formData = {};
    let isReceiveUnitsSame = true;

    if (column.id === "pvl") {
      if (+event.target.value === +row.pvl) {
        isReceiveUnitsSame = false;
      }
      formData = {
        pvl: +event.target.value,
        discount_percentage: +row.discount_percentage,
        tax: +row.tax,
        recargo: +row.recargo,
      };
    }
    if (column.id === "discount_percentage") {
      if (+event.target.value === +row.discount_percentage) {
        isReceiveUnitsSame = false;
      }
      formData = {
        pvl: +row.pvl,
        discount_percentage: +event.target.value,
        tax: +row.tax,
        recargo: +row.recargo,
      };
    }

    if (column.id === "tax") {
      if (+event.target.value === +row.tax) {
        isReceiveUnitsSame = false;
      }
      formData = {
        pvl: +row.pvl,
        discount_percentage: +row.discount_percentage,
        tax: +event.target.value,
        recargo: +row.recargo,
      };
    }
    if (column.id === "recargo") {
      if (+event.target.value === +row.recargo) {
        isReceiveUnitsSame = false;
      }
      formData = {
        pvl: +row.pvl,
        discount_percentage: +row.discount_percentage,
        tax: +row.tax,
        recargo: +event.target.value,
      };
    }

    if (isReceiveUnitsSame) {
      axios
        .patch(`${BUY_API.BUY_ORDER_ITEM}${row.id}/`, formData)
        .then((response) => {
          dispatch(updateBuyOrderItem(response.data))
          enqueueSnackbar('Order has been updated successfully.');
        })
        .catch((error) => {
          // console.log(error);
          enqueueSnackbar('Oops something went wrong.', {
            variant: 'error',
          });
        });
    }
  }

  const EditableCell2 = ({
    value,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={+row.original.discount_percentage} onBlur={(event) => onUpdateRowData(event, row.original, value, column)} style={{ color: "green" }}  onFocus={(e) => handleFocus(e)} onKeyDown={(e)=>handleKeyDown(e)} onKeyUp={(e)=>handleKeyUp(e)}/>
  }

  const EditableCell3 = ({
    value,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={+row.original.pvl} onBlur={(event) => onUpdateRowData(event, row.original, value, column)} style={{ color: "green" }} onFocus={(e) => handleFocus(e)} onKeyDown={(e)=>handleKeyDown(e)} onKeyUp={(e)=>handleKeyUp(e)}/>
  }

  const EditableTaxPercentage = ({
    value,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={+row.original.tax} onBlur={(event) => onUpdateRowData(event, row.original, value, column)} style={{ color: "green" }} onFocus={(e) => handleFocus(e)} onKeyDown={(e)=>handleKeyDown(e)} onKeyUp={(e)=>handleKeyUp(e)}/>
  }

  const EditableRecargoPercentage = ({
    value,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={+row.original.recargo} onBlur={(event) => onUpdateRowData(event, row.original, value, column)} style={{ color: "green" }} onFocus={(e) => handleFocus(e)} onKeyDown={(e)=>handleKeyDown(e)} onKeyUp={(e)=>handleKeyUp(e)} />
  }

  const openNeedsDialog = useCallback((id) => {
    setSelectedNeedId(id)
  }, [pharmacyList])

  const needs = useMemo(() => {
    if (selectedNeedId === -1) {
      return []
    }
    const needItems = []
    const items = OrderNeedItem.filter((need) => need.order_item === selectedNeedId)

    // console.log({ buyPharmacyList, pharmacyList, items })

    pharmacyList.forEach(item2 => {
      const match = items.find(item1 => item1.pharmacy === item2.id);
      if (match) {
        needItems.push(match);
      }
      else {
        needItems.push({
          pharmacy_name: item2.name,
          pharmacy: item2.id,
          order_item: items[0]?.order_item,
          units: 0
        })
      }
    });
    return needItems
  }, [pharmacyList, selectedNeedId, AddProduct])

  const catalogColumns = useMemo(
    () => [
      {
        accessor: 'units',
        Header: 'ΣUD',
        maxWidth: 50,
        editor: TextEditor,
        Cell({ row }) {
          return (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <Typography variant="body2">{row.original.units}</Typography>
            </Stack>
          );
        },
      },
      {
        Header: translate('items'),
        maxWidth: 50,
        editor: TextEditor,
        Cell({ row }) {
          return (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <Iconify
                icon={'icon-park-outline:view-list'}
                sx={{ mr: 2, width: 20, height: 20, cursor: 'pointer' }}
                onClick={() => {
                  openNeedsDialog(row.original.id);
                }}
              />
            </Stack>
          );
        },
      },
      {
        accessor: 'product_name',
        Header: translate("Product_name"),
        maxWidth: 50,
        editor: TextEditor,
        Cell({ row }) {
          return (
            <Box>
              <Typography noWrap variant="subtitle2">
                {row.original.product_name}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2">
                  <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                    CN:&nbsp;
                  </Typography>
                  {row.original.cn}
                </Typography>
                <Divider orientation="vertical" sx={{ mx: 1, height: 16 }} />
                <Typography variant="body2">
                  <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                    EAN:&nbsp;
                  </Typography>
                  {row.original.ean}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        accessor: 'pvl',
        Header: "PVL",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell: EditableCell3
      },
      {
        accessor: 'discount_percentage',
        Header: translate("tabel_content.discount_percentage"),
        width: 50,
        columnspan: 2,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell2
      },
      showColumns ? {
        accessor: 'discount_amount',
        Header: "DTO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.discount_amount);
        },
      } : null,
      {
        accessor: 'subtotal',
        Header: "NETO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.subtotal);
        },
      },
      {
        accessor: 'tax',
        Header: '% Tax',
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell: EditableTaxPercentage
      },
      showColumns ? {
        accessor: 'tax_amount',
        Header: "IVA",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.tax_amount);
        },
      } : null,
      {
        accessor: 'recargo',
        Header: '% Recargo',
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell: EditableRecargoPercentage
      },
      showColumns ? {
        accessor: 'recargo_amount',
        Header: "Recargo",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.recargo_amount);
        },
      } : null,
      {
        accessor: 'grand_total',
        Header: "BRUTO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.grand_total);
        },
      },
    ].filter(Boolean),
    [orderItems, OrderNeedItem, showColumns, openNeedsDialog]
  );


  const onUpdateRow = (event, row, value, column, currentValue) => {

    const data = {
      "order_item": row.order_item,
      "buy": editOrder.buy,
      "pharmacy": row.pharmacy,
      "units": +event.target.value
    }

    if (row?.id === undefined && data.units === 0) {
      // console.log("NOT WORKING ", row?.id === undefined && data.units === 0)
    }
    else{
      axios({
        method: row?.id ? 'put' : 'post',
        url: row?.id ? `${BUY_API.BUY_ORDER_ITEM_NEEDS}${row.id}/` : `${BUY_API.BUY_ORDER_ITEM_NEEDS}`,
        data,
      })
        .then((response) => {
          dispatch(getBuyOrderItem(editOrder.id))
          dispatch(updateBuyOrderNeedItems(response.data))
          if (!row?.id) {
            dispatch(addBuyOrderNeedItems(response.data))
          }
        })
        .catch((error) => {
          // console.log(error);
          enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
        });
    }

  }

  const EditableCell = ({
    value,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={+row.original.units} onBlur={(event) => onUpdateRow(event, row.original, value, column, row.original.units)} style={{ color: value === 0 ? "brown" : "green", backgroundColor: value === 0 ? "lightyellow" : "#aae9aa" }} onFocus={(e) => handleFocus(e)} onKeyDown={(e)=>handleKeyDown(e)} onKeyUp={(e)=>handleKeyUp(e)}/>
  }

  const columns = useMemo(() => [
    {
      Header: translate('pharmacy_name'),
      maxWidth: 50,
      editor: TextEditor,
      Cell({ row }) {
        return row.original.pharmacy_detail?.name || row.original.pharmacy_name;
      },
    },
    {
      accessor: 'units',
      Header: translate('units'),
      maxWidth: 50,
      editor: TextEditor,
      editorOptions: {
        editOnClick: true,
      },
      Cell: EditableCell

    },
  ],
    [needs]
  )



  const handleCloseDialog = () => {
    setSelectedNeedId(-1)
  };

  useEffect(() => {
    setLoadingItems(true);
    // Load the order items to show in the order catalog
    axios
      .get(BUY_API.BUY_ORDER_ITEM, { params: { order: editOrder.id } })
      .then((response) => {

        // Load Catalog Categories for current buy
        dispatch(getBuyCategories(editOrder.buy));
        // Load Catalog Conditions for current buy
        dispatch(getBuyConditions(editOrder.buy));

        dispatch(setBuyOrderItemSuccess(response.data))
        setLoadingItems(false);
      })
      .catch((error) => {
        // console.log(error);
        setLoadingItems(false);
      });

    axios
      .get(BUY_API.BUY_PARTICIPATED_PHARMACIES, { params: { buy: editOrder.buy } })
      .then((response) => {
        const pharmacyListData = []
        response.data.forEach(element => {
          if (element.is_needs) {
            pharmacyListData.push(element)
          };
        });
        // setPharmacyList(pharmacyListData);

        setPharmacyList(response.data);
        dispatch(setBuyPharmacyListSuccess(pharmacyListData))
        setIsPharmacyList(false)
      })
      .catch((error) => {
        // console.log(error);
      });

    // Load the item needs to show in the popup when user want to see the needs for each pharmacy
    axios
      .get(BUY_API.BUY_ORDER_ITEM_NEEDS, { params: { order_item__order: editOrder.id } })
      .then((response) => {
        dispatch(setBuyOrderNeedItemsSuccess(response.data));
      })
      .catch((error) => {
        // console.log(error);
      });

    axios
      .get(BUY_API.BUY_PRODUCT, {
        params: { buy: editOrder.buy },
      })
      .then((response) => {
        // console.log('Buy Products: ', response);
        setProducts(response.data);
      })
      .catch((error) => {
        // console.log(error);
      });
  }, []);

  // console.log({ isPharmacyList, pharmacyList })
/*
  const onGenerateReport = () => {
    axios({
      method: 'get',
      url: BUY_API.ORDER_REPORT, params: { ord: editOrder.id },
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        fileDownload(response.data, "Order_report.pdf");
        dispatch(getBuyAction(null, currentPharmacy.id));
        enqueueSnackbar('Order Report Downloaded.');
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }
  */
  const onGenerateReport = () => {
    // Adjusted URL to include the order ID directly in the path and the format query
    const reportUrl = `${BUY_API.ORDER_DOC}${editOrder.id}/?format=xlsx`;

    axios({
      method: 'get',
      url: reportUrl,
      responseType: 'blob', // Still expecting a binary response, but this time for an Excel file
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // MIME type for .xlsx files
      }
    })
        .then(response => {
          // Handle the blob response to download or display the Excel report
          const url = window.URL.createObjectURL(new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `OrderReport-${editOrder.id}.xlsx`); // Set the download filename with .xlsx extension
          document.body.appendChild(link);
          link.click();

          // Clean up by removing the link element
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url); // Release object URL
        })
        .catch(error => {
          // Handle errors
          console.error("Error generating report:", error);
        });
  };

  const handleOpenAddProduct = () => {
    setOpenAddProduct(true);
  };
  const handleOpenAddUnit = () => {
    setOpenAddUnit(true);
  };

  return (
    <>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <OrderPharmacyInfo editOrder={editOrder} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader style={{ marginTop:-10, marginBottom:0}} title={translate("order_catalog")} sx={{ mb: 3 }}
              action={
                <Stack  direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  <LoadingButton size="large"
                    startIcon={<Iconify icon={'mdi:file-excel'} />}
                    onClick={onGenerateReport}
                    loading={orderReport}
                  >
                    {translate('order_report')}
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleOpenAddProduct}
                    startIcon={<Iconify icon={'eva:plus-fill'} />}
                  >
                    {translate('add_product')}
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Iconify icon={showColumns ? 'formkit:eyeclosed' : 'ph:eye'} />}
                    onClick={toggleShowColumns}
                  >
                    {showColumns ? translate('hide') : translate('show')}
                  </LoadingButton>

                </Stack>
              }
            />
            {buyOrderItem.length ? (<Styles>
              <Table
                loading={isPharmacyList}
                columns={catalogColumns}
                data={buyOrderItem} />
            </Styles>) :
              (
                <Loader />
              )}
            <Dialog open={showNeeds} onClose={handleCloseDialog} PaperProps={{ sx: { width: "50%" } }}>
              <DialogContent>
                {needs.length ? (<Styles>
                  <Table
                    loading={isPharmacyList}
                    columns={columns}
                    data={needs} />
                </Styles>) :
                  (
                    <Loader />
                  )}
              </DialogContent>
            </Dialog>
            <DialogModal
              title={translate('add_product')}
              open={Boolean(AddProduct)}
              onClose={handleCloseAddProduct}
              DialogContentItems={<OrderProductFormAdd currentBuy={buy} orderItems={orderItems} order={editOrder} products={products} onClose={handleCloseAddProduct}/>}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <OrderSummary editOrder={editOrder} title= {translate("order_summary")} />
        </Grid>
      </Grid>

    </>
  );
}

export default OrderCart;
