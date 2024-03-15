import React, { useState } from "react"
import { withTranslation } from 'react-i18next';
import {
  TableCell, Box, Typography, Tooltip, Checkbox,
} from "@mui/material";
import { withSnackbar } from "notistack";

import useLocales from "../../../hooks/useLocales";
import VirtualTable from "../../../components/VirtualTable";
import ConditionTooltip from './ConditionTooltip';
import { BUY_API } from '../../../constants/ApiPaths';
import axios from '../../../utils/axios';
import { fCurrency } from '../../../utils/formatNumber';
import { calculateTax } from '../../../utils/calculateTax';
import ActionMenu from '../dialogs/ActionMenu';
import DialogModal from '../../../components/DialogModal';
import CatalogProductFormAdd from './CatalogProductFormAdd';
import { store } from "../../../redux/store";
import { getBuyProducts } from "../../../redux/slices/buy";


const CatalogProductsTableAction = (props) => {
  const { currentBuy, product, handleDelete } = props;
  const [openEditModal, setOpenEditModal] = useState(false);
  const { translate } = useLocales();

  return (
    <>
      <ActionMenu
        onEdit={() => {
          setOpenEditModal(true)
        }}
        onDelete={() => {
          handleDelete(product);
        }}
      />
      <DialogModal
        title={translate('update_product')}
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        DialogContentItems={<CatalogProductFormAdd currentBuy={currentBuy} editProductdata={product} />}
      />
    </>
  )
}

class CatalogProductsTableComponent extends React.Component {
  handleDelete = (product) => {
    const buyId = product?.catalog_condition?.buy;
    const { enqueueSnackbar } = this.props;
    axios
      .delete(`${BUY_API.Add_BUY_PRODUCT}${product.id}`)
      .then(() => {
        enqueueSnackbar('Product has been deleted successfully. kamlesh');
        this.props.loadProducts(null, true)
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  };

  handleOutOfStock = (product) => {
    const { enqueueSnackbar } = this.props;
    const newValue = !product.out_of_stock

    axios
      .patch(`${BUY_API.Update_BUY_PRODUCT}${product.id}/`, { "out_of_stock": newValue })
      .then(() => {
        enqueueSnackbar('Product has been updated successfully. kamlesh');
        this.props.loadProducts(null, true)
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', { variant: 'error' });
      });
  }

  render() {
    const { t: translate, currentBuy, products, totalProductsCount, loadProducts } = this.props;

    return (
      <div className="container" style={{ height: 'calc(100vh - 532px)', width: '100%' }}>
        <VirtualTable
          data={products}
          totalDataCount={totalProductsCount}
          rowHeight={80}
          onRequestMoreData={loadProducts}
          columns={[
            {
              label: translate('product_name'),
              dataKey: 'id',
              width: 300,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2"> {rowData.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        EAN: {rowData.ean} CN: {rowData.cn}
                      </Typography>
                    </Box>
                  </TableCell>
                )
              }
            },

            {
              label: translate('buy.condition'),
              dataKey: 'catalog_condition',
              width: 100,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>
                    <Tooltip title={<ConditionTooltip condition={rowData.catalog_condition} />} arrow>
                      <Box component="span">{rowData.catalog_condition?.name || 'N/A'}</Box>
                    </Tooltip>
                  </TableCell>
                )
              }
            },

            {
              label: translate('buy.min_units'),
              dataKey: 'catalog_condition',
              width: 180,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell sx={{ textAlign: "center" }}>
                    {rowData.min_units}
                  </TableCell>
                )
              }
            },

            {
              label: translate('buy.box'),
              dataKey: 'units_inbox',
              width: 120,
            },

            {
              label: 'IVA',
              dataKey: 'tax',
              width: 120,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>{parseFloat(rowData.tax)}</TableCell>
                )
              }
            },

            {
              label: 'PVL',
              dataKey: 'pvl',
              width: 120,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>{fCurrency(rowData.pvl)}</TableCell>
                )
              }
            },

            {
              label: translate('price'),
              dataKey: 'pvl',
              width: 120,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>{fCurrency(calculateTax(rowData.pvl, rowData.tax).amount_with_tax)}</TableCell>
                )
              }
            },
            {
              label: "Out of stock",
              dataKey: 'out_of_stock',
              width: 120,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>
                    <Checkbox checked={rowData.out_of_stock} onClick={() => this.handleOutOfStock(rowData)} />
                  </TableCell>
                )
              }
            },
            {
              label: <>&nbsp;</>,
              dataKey: 'pvl',
              width: 120,
              headerCellRenderer: () => <></>,
              cellRenderer: ({ rowData }) => {
                return (
                  <TableCell>
                    <CatalogProductsTableAction currentBuy={currentBuy} product={rowData} handleDelete={this.handleDelete} />
                  </TableCell>
                )
              }
            }
          ]} />
      </div >
    )
  }
}

export default withTranslation()(withSnackbar(CatalogProductsTableComponent))