import React, { useEffect, useState } from 'react';
// @mui
import { Container, TableContainer, Table, TableHead, TableRow, TableCell } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import Loader from '../../components/Loader';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

import { HOST_API } from '../../config';
import StockTable from '../../sections/stocksold/StockTable';

// ----------------------------------------------------------------------

export default function StockNotSold() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { user } = useAuth();
  const pharmacyId = user.pharmacy_detail.id;
  const [items, setitems] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [totalStockdata, settotalStockdata] = useState([]);
  const [updatedGroupData, setupdatedGroupData] = useState();
  const [Pharmacystoks, setPharmacystoks] = useState([]);
  const [TaxType, setTaxType] = useState(0);
  const [isLoading, setisLoading] = useState(true);

  useEffect(async () => {
    setisLoading(true);
    const [preoductsRes, grpPhRes] = await Promise.all([
      axios.get(`${HOST_API}/api/sd/ph_onstock_nosales_v1/${pharmacyId}/${TaxType}`).catch((error) => {
        // console.log(error);
        setisLoading(false);
      }),
      axios.get(`${HOST_API}/api/ps/ph-grp/${pharmacyId}/`).catch((error) => {
        // console.log(error);
        setisLoading(false);
      }),
    ]);
    if (preoductsRes.data) {
      setisLoading(false);
    }

    if (preoductsRes.data.success === true) {
      const data = preoductsRes.data.data.slice(0, 30);
      settotalStockdata(preoductsRes.data.data);
      setitems(data);

      const groupData = grpPhRes.data['group-pharmacies'];

      const updatedGroupData = groupPharmacieshandler(groupData);

      setupdatedGroupData(updatedGroupData);
      apiCall(data, updatedGroupData);
    }
  }, [TaxType]);

  const apiCall = async (newdata, groupData) => {
    const totalCns = [];
    const totalEans = [];
    newdata.forEach((v) => {
      if (v.cns && !Number.isNaN(Number(v.cns))) {
        totalCns.push(v.cns);
      }
      if (v.eans && !Number.isNaN(Number(v.eans))) {
        totalEans.push(v.eans);
      }
    });

    const Cns = totalCns.join(',');
    const Eans = totalEans.join(',');

    await Promise.all([
      (groupData || updatedGroupData)?.map(async (i) => {
        return axios
          .get(`${HOST_API}/api/sd/ph_check_product_sales_v1/${i.ph}/${Cns}/${Eans}`)
          .then((response) => {
            if (response.data.success === true) {
              response.data.data.forEach((item) => {
                if (item.ud) {
                  setitems((prevState) => {
                    const findRow = prevState.find((element) => element.cns === item.cns);
                    if (findRow) {
                      if (!findRow.available_stock) {
                        findRow.available_stock = {
                          id: i.ph,
                          name: i.ph_name,
                          ud: item.ud,
                        };
                      } else if (findRow.available_stock.ud) {
                        findRow.available_stock = {
                          id: i.ph,
                          name: `${findRow.available_stock.name}, ${i.ph_name}`,
                          ud: item.ud,
                        };
                      }
                    }
                    return prevState;
                  });
                }
                setPharmacystoks((value) => {
                  return {
                    ...value,
                    [`${item.cns}`]: {
                      ...value[`${item.cns}`],
                      [`ph_${i.ph}`]: item.ud,
                    },
                  };
                });
              });
            }
          })
          .catch((error) => {
            // console.log(error);
          });
      }),
    ]);
    return newdata;
  };

  const groupPharmacieshandler = (data) => {
    const tempdata = [];
    data.forEach((i) => {
      if (pharmacyId === i.ph1) {
        i.ph = i.ph2;
        i.ph_name = i.ph2_name;
      } else {
        i.ph = i.ph1;
        i.ph_name = i.ph1_name;
      }
      tempdata.push(i);
    });
    return tempdata;
  };

  const StockHendlerfetchMoreData = () => {
    setTimeout(() => {
      const newdata = totalStockdata.slice(items.length, items.length + 10);
      const data = items.concat(newdata);
      setitems(data);
      setTotalStock(totalStockdata.length);

      apiCall(newdata, updatedGroupData);
    }, 500);
  };

  const handleChange = (event) => {
    setTaxType(event.target.value);
  };

  return (
    <Page title="stock sole">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ p: 3, mb: 5 }}>
          <FormControl sx={{ width: 100 }}>
            <InputLabel id="demo-simple-select-label"> {translate('TaxType')}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={TaxType}
              label={translate('TaxType')}
              onChange={handleChange}
            >
              <MenuItem value={0}>0%</MenuItem>
              <MenuItem value={1}>4%</MenuItem>
              <MenuItem value={2}>10%</MenuItem>
              <MenuItem value={3}>21%</MenuItem>
            </Select>
          </FormControl>
          <Scrollbar>
            {isLoading && <Loader />}
            {!isLoading && (
              <TableContainer sx={{ mt: 5 }}>
                <InfiniteScroll
                  dataLength={items.length}
                  next={StockHendlerfetchMoreData}
                  hasMore={items.length !== totalStock}
                  loader={<h4>Loading...</h4>}
                  height={'70vh'}
                >
                  <Table
                    stickyHeader
                    sx={{
                      '& .MuiTableCell-root:last-child': {
                        p: 1,
                      },
                      '& .MuiTableCell-root:first-child': {
                        p: 1,
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ p: 0, boxShadow: 'none !important' }}>{translate('idarticulo')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('cn_ean')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('PRODUCT_NAME')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('UD')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('Avg_price')}</TableCell>
                        <TableCell sx={{ p: 1 }}>{translate('Ast_price')}</TableCell>
                        {updatedGroupData?.map((i, index) => {
                          return (
                            <Tooltip key={i.ph_name} title={String(i?.ph_name)} arrow>
                              <TableCell sx={{ p: 1, boxShadow: 'none !important' }}>{i.ph}</TableCell>
                            </Tooltip>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <StockTable stock={Pharmacystoks} updatedGroupData1={updatedGroupData} items={items} />
                  </Table>
                </InfiniteScroll>
              </TableContainer>
            )}
          </Scrollbar>
        </Card>
      </Container>
    </Page>
  );
}
