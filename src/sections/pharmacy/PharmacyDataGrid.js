
import React, { useEffect, useState } from 'react';

// @mui
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Card, IconButton } from '@mui/material';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import {
  getProducts,
  updateProducts,
  setProduct,
  setProductPrices,
  getClients,
  getMarketplacesProducts,
  isToggleSelectedHendler,
  showiconMarketplaces,
} from '../../redux/slices/pharmacy_product';

// Hooks
import useLocales from '../../hooks/useLocales';
import Loader from '../../components/Loader';
import Iconify from '../../components/Iconify';
import SearchDialogModal from '../../components/SearchDialogModal';
import SearchProductPopover from '../../layouts/dashboard/header/SearchProductPopover';
// ----------------------------------------------------------------------

export default function PharmacyDataGrid() {
  const dispatch = useDispatch();
  const { translate } = useLocales();

  const { isLoading, products, filters, productPrices, product, isToggleSelected, preferredSellers, marketplace } = useSelector(

    (state) => state.pharmacy_product
  );
  const [search, setsearch] = useState();
  const [openSearch, setOpenSearch] = useState(false);
  const [openSearchIcon, setOpenSearchIcon] = useState(false);
  const [selected, setSelected] = useState();

  const handleClose = () => {
    setOpenSearch(false);
  };

  const handleOpen = (i) => {
    setOpenSearch(true);
  };

  const handleRowClick = (row) => {
    dispatch(showiconMarketplaces({ show: false }));
    const updatedData = products.map((item) => {
      if (row.id !== item.id) {
        return {
          ...item,
          toggleSelected: false,
        };
      }

      return {
        ...item,
        toggleSelected: !item.toggleSelected,
      };
    });
    // Update the products in redux store
    dispatch(updateProducts(updatedData));
    // Update the selected product in redux store
    getData(row);
    setsearch(row);
  };

  function getData(row) {
    // dispatch(getProducts(filters))
    dispatch(setProduct(row));
    showPrices(row);
    // Get clients for product
    dispatch(getClients(row, filters));
    // Get Marketplaces products
    let sellersID = '';
    if (preferredSellers?.value || false) {
      const sellersValue = JSON.parse(preferredSellers.value);
      const ids = sellersValue.map((row) => row.id);
      sellersID = ids.join(',');
    }
    dispatch(getMarketplacesProducts(row, sellersID));
  }

  useEffect(() => {
    if(products.length > 0) {
      products?.forEach((item) => {
        if (item?.toggleSelected) {
          getData(item);
        }
      });
      if (isToggleSelected) {
        dispatch(isToggleSelectedHendler());
        // isToggleSelected = false
        products?.forEach((item) => {
          if (item?.toggleSelected) {
            getData(item);
          }
        });
      }
    }
  }, [products]);

  const getSellingPrice = (row) => {
    let bpvp = 0;
    if (row.sell_price_1 !== '' && row.sell_price_1 !== 0) {
      bpvp = row.sell_price_1;
    } else if (row.sell_price_2 !== '' && row.sell_price_2 !== 0) {
      bpvp = row.sell_price_2;
    } else if (row.sell_price_3 !== '' && row.sell_price_3 !== 0) {
      bpvp = row.sell_price_3;
    } else if (row.sell_price_4 !== '' && row.sell_price_4 !== 0) {
      bpvp = row.sell_price_4;
    }
    return bpvp;
  };

  const showPrices = (row) => {
    const bpvp = row?.bpvp1 || getSellingPrice(row);

    // Calculate the margins for Selling and Buying price
    const sellingPrice = bpvp;
    const buyingPrice = row.purchase_price;
    const sellingMargin = ((sellingPrice - buyingPrice) / sellingPrice) * 100;
    const buyingMargin = ((sellingPrice - buyingPrice) / buyingPrice) * 100;

    dispatch(
      setProductPrices({
        ...productPrices,
        buying_price: row.purchase_price,
        average_buying_price: row.avg_purchase_price,
        selling_price: bpvp,
        buying_price_margin: buyingMargin.toFixed(2),
        selling_price_margin: sellingMargin.toFixed(2),
        new_selling_price: sellingPrice,
      })
    );
  };

  const getBgColor = (row) => {
    let colorVal = '';
    if (row.toggleSelected) {
      colorVal = 'success.lighter';
    } else if (row.priceUpdated) {
      colorVal = 'info.light';
    }
    return colorVal;
  };

  useEffect(() => {
    dispatch(getProducts(filters));
  }, [dispatch, filters]);

  const scrollIntoView = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getNextRow = (products, selected, direction) => {
    const index = products.findIndex((row) => row.id === selected);
    if (direction === 'up') return products[index - 1].id;
    if (direction === 'down') return products[index + 1].id;
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
    scrollIntoView(event.target);

    if (event.key === 'ArrowUp') {
      if (selected === products[0].id) return;
      setSelected(getNextRow(products, selected, 'up'));
      const ttt = getNextRow(products, selected, 'up');
      const dd = products.forEach((e) => {
        if (ttt === e.id) {
          handleRowClick(e);
        }
      });
    }

    if (event.key === 'ArrowDown') {
      if (selected === products[products.length - 1].id) return;
      setSelected(getNextRow(products, selected, 'down'));
      const ttt = getNextRow(products, selected, 'down');
      const dd = products.forEach((e) => {
        if (ttt === e.id) {
          handleRowClick(e);
        }
      });
    }
  };

  return (
    <Card sx={{ py: 2, mt: 2, minHeight: '50px', maxHeight: '100%', height: 'calc(100% + 90%)', overflow: 'auto' }}>
      <TableContainer
        sx={{
          height: '100%',
          overflow: 'auto',
        }}
      >
        {isLoading && <Loader />}
        {!isLoading && (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontSize: '12px' }}>CN/EAN</TableCell>
                <TableCell style={{ fontSize: '12px' }}>{translate('price_revision.product_name')}</TableCell>
                <TableCell style={{ fontSize: '12px' }}>{translate('Search')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading &&
                products.map((row, index) => {
                  return (
                    <TableRow
                      key={`${row.id}${row.idarticulo}${row.name}${index}`}
                      onClick={(e) => {
                        handleRowClick(row);
                        setSelected(row.id);
                      }}
                      onKeyDown={handleKeyDown}
                      tabIndex={0}
                      selected={row.toggleSelected}
                      hover
                      sx={{
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell
                        sx={{
                          bgcolor: getBgColor(row),
                          borderTopLeftRadius: '8px',
                          borderBottomLeftRadius: '8px',
                          boxShadow: 'inset 8px 0 0 #fff',
                        }}
                      >
                        {row.cn_ean}
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: getBgColor(row),
                        }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: getBgColor(row),
                          borderTopRightRadius: '8px',
                          borderBottomRightRadius: '8px',
                          boxShadow: 'inset -8px 0 0 #fff',
                        }}
                      >
                        {marketplace.showicon && search?.id === row.id && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpen();
                            }}
                          >
                            <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <SearchDialogModal
        open={Boolean(openSearch)}
        title={translate('Product_search')}
        onClose={handleClose}
        DialogContentItems={<SearchProductPopover search={search} onClose={handleClose} />}
      />
    </Card>
  );
}
