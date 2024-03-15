import styled from 'styled-components';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes, { string } from 'prop-types';
import { useSnackbar } from 'notistack';
import lodashSet from 'lodash/set'
import { debounce } from 'lodash';

import {
  Card,
  CardContent,
  // Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Typography,
  Grid,
  TableHead,
  Tooltip,
  Dialog,
  Stack,
  Slide,
  Skeleton,
  Autocomplete,
  TextField,
  CardHeader,
  Collapse
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { TextEditor } from 'react-data-grid';
import Scrollbar from '../../components/Scrollbar';
import Iconify from '../../components/Iconify';

import ConditionTooltip from './components/ConditionTooltip';
import Loader from '../../components/Loader';

// utils
import { fCurrency, fPercent } from '../../utils/formatNumber';
import { calculateDiscount } from '../../utils/calculateTax';
import axios from '../../utils/axios';
import useLocales from '../../hooks/useLocales';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { setConditionWiseProducts } from '../../redux/slices/buy';

import Table from '../../components/table/Table';
import NeedSummaryMoreMenu from './components/NeedSummaryMoreMenu';
import { AdjustNeedsDetail } from './dialogs';
import { BUY_API } from '../../constants/ApiPaths';
import AdjustNeeds from './dialogs/AdjustNeeds';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);


const StyledInput = styled.input`
    width: 41px;
    border-radius: 12px;
    line-height: 1.4375em;
    font-size: 12px;
    font-family: Public Sans,sans-serif;
    font-weight: 400;
    import { Collapse } from '@mui/material';
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
    background-color: #6adcb23d;
    &:focus-visible{ outline-color: #4dab4d !important;}
    `

const Styles = styled.div`
    // height: calc(100vh - 562px);       
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

      &>*:last-child {
        border-right: 0;
      }
    }
    tr td:nth-child(11) {
      padding: 0px !important;
    }
  }
`

const StyledAutocomplete = styled(Autocomplete)`
    // position: absolute;
    // left: 0px;
    // top: 0px;
    // min-height: 100%;
    // width: 100%;

    // &>div, &>div>div{
    //   min-height: 100%;
    //   width: 100%;
    //   border-radius:0px;

    // }
`

NeedSummaryTable.propTypes = {
  currentBuy: PropTypes.object,
  onCreateOrder: PropTypes.func,
  creatingOrder: PropTypes.bool,
  pharmacyList: PropTypes.array,
};

export default function NeedSummaryTable({ currentBuy, onCreateOrder, creatingOrder, pharmacyList }) {
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { catalog } = useSelector((state) => state.buy);

  // States
  const [conditionsSummary, setConditionsSummary] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState({});
  const [catalogCondition, setCatalogCondition] = useState([]);
  const [AdjustValue, setAdjustValue] = useState([]);
  const [isAdjustment, setIsAdjustment] = useState(true);
  const [isAdjustmentLoading, setIsAdjustmentLoading] = useState(false);
  const [isCreateOrder, setIsCreateOrder] = useState(true);
  const [isNeedData, setIsNeedData] = useState(false);
  const { orders, orderLoading } = useSelector((state) => state.buy);

  const [showContent, setShowContent] = useState(false);

  const toggleShowContent = useCallback(() => {
    setShowContent(v => !v)
  }, [])

  const getDiscount = (row) => {
    const discountObj = calculateDiscount(
      row.catalog_condition,
      row.amount,
      row.total_needs + row.total_adjusted_needs
    );
    return discountObj;
  };

  const handleCloseDialog = () => {
    setSelectedCondition({});
    setOpenDialog(false);
  };

  const openConditionSummary = (row) => {
    setOpenDialog(true);
    setSelectedCondition(row);
  };

  const clearPharmacyInputs = useCallback(() => {
    conditionsSummary.forEach(row => {
      const conditionWiseProducts = { ...catalog.conditionWiseProducts };

      conditionsSummary.forEach((condition) => {
        conditionWiseProducts[condition.catalog_condition.id] = {
          ...condition,
          order_pharmacy: [],
        };
      });
      dispatch(setConditionWiseProducts(conditionWiseProducts));
    })
  }, [conditionsSummary])

  const handleCreateOrder = useCallback(() => {
    onCreateOrder().then(() => {
      clearPharmacyInputs();
    })
  }, [onCreateOrder, clearPharmacyInputs])

  useEffect(() => {
    // Calculate the own percentage of total units to each pharmacy
    const calculatedConditions = Object.values(catalog.conditionWiseProducts);
    const pharmacyToCatalogMap = calculatedConditions.reduce((map, item) => {
      (item.order_pharmacy || []).forEach(pharmacy => {
        const pharmacyId = pharmacy.id
        if (!map[pharmacyId]) {
          map[pharmacyId] = []
        }

        const conditionId = item.catalog_condition
          .id
        map[pharmacyId].push(conditionId)
      })

      return map;
    }, {})
    const result = Object.entries(pharmacyToCatalogMap).map(([pharmacyId, conditionIdList]) => ([pharmacyId, conditionIdList]));

    setConditionsSummary(calculatedConditions);
    if (calculatedConditions.length > 0)
      setIsNeedData(true);
  }, [catalog.conditionWiseProducts]);

  const onUpdateAdjustmentData = useCallback((event, row) => {
    const formData = {
      condition: row.catalog_condition.id,
      buyID: row.catalog_condition.buy,
      amount: +event?.target?.value,
    };

    // console.log("DATA", { formData });
    setAdjustValue(adjustValue => {
      adjustValue = [...adjustValue]
      const existingIndex = adjustValue.findIndex(item => item.condition === formData.condition);

      if (existingIndex === -1) {
        adjustValue.push(formData);
      } else {
        adjustValue[existingIndex] = formData;
      }

      setIsAdjustment(false);
      return adjustValue;
    })
  }, [])

  const onUpdateAdjustmentDataDebounced = useMemo(() => debounce(onUpdateAdjustmentData, 1500), [onUpdateAdjustmentData])

  const onUpdateAdjustmentValue = (row) => {
    setIsAdjustmentLoading(true);
    const formData = AdjustValue;

    axios
      .post(`${BUY_API.ADJUST_NEED}`, formData)
      .then((response) => {
        // console.log("EVENT",{response});
        window.location.reload();
        enqueueSnackbar('Item has been updated successfully.');
        setIsAdjustmentLoading(false);
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }

  const EditableCell = ({
    value: initialValue,
    row,
    column
  }) => {
    return <StyledInput type='number' defaultValue={row.original.total_units} onChange={(event) => onUpdateAdjustmentDataDebounced(event, row.original)} />
  }


  const columns = useMemo(
    () => [
      {
        accessor: 'catalog_condition',
        Header: translate("condition"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return (<Tooltip title={<ConditionTooltip condition={row.original.catalog_condition} />} arrow>
            <Box component="span">
              <Typography variant="subtitle2"> {row.original.catalog_condition.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {row.original.catalog_condition.condition_1 || ''}
              </Typography>
            </Box>
          </Tooltip>
          );
        },
      },
      {
        accessor: 'units',
        Header: translate("tabel_content.units"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        }
      },
      {
        accessor: 'adjusted_units',
        Header: translate("tabel_content.total_units"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
      },
      {
        accessor: 'total_units',
        Header: translate("tabel_content.total_units"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell
      },
      {
        Header: translate("select_pharmacy"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return (
            <StyledAutocomplete
              size="medium"
              multiple
              fullWidth
              freeSolo
              options={pharmacyList}
              renderOption={(props, option) => { return <div {...props} style={option.is_needs ? { backgroundColor: "#03a3683d" } : {}}>{option.name}</div> }}
              getOptionLabel={(option) => option.name}
              value={row.original?.order_pharmacy || []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => <TextField {...params} placeholder="Add Pharmacy" />}
              onChange={(event, values) => {
                const choosedPharmacies = values.map((value) => ({ id: value.id, name: value.name }));
                // console.log({ choosedPharmacies })
                const conditionWiseProducts = { ...catalog.conditionWiseProducts };

                conditionsSummary.forEach((condition) => {
                  if (condition.catalog_condition.id === row.original.catalog_condition.id) {
                    conditionWiseProducts[condition.catalog_condition.id] = {
                      ...conditionWiseProducts[condition.catalog_condition.id],
                      order_pharmacy: choosedPharmacies,
                    };
                  }

                  if (conditionsSummary.length > 0) {
                    setIsCreateOrder(false);
                  }
                  if (!condition.order_pharmacy) {
                    conditionWiseProducts[condition.catalog_condition.id] = {
                      ...condition,
                      order_pharmacy: [choosedPharmacies[0]],
                    };
                  }
                });
                dispatch(setConditionWiseProducts(conditionWiseProducts));
              }}
            />
          )
        }
      },
    ],
    [pharmacyList, conditionsSummary]
  );

  useEffect(() => {
    if( orders.length === 0) {
      setShowContent(true);
    }
    else {
      setShowContent(false);
    }
  }, [orders])

  return (

    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Card sx={{ pt: 1 }}>
          <CardHeader
            sx={{ pt: 1, pb: 2 }}
            title= {translate('need_summary')}
            action={
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <LoadingButton
                  disabled={isAdjustment}
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ right: "10px" }}
                  startIcon={<Iconify icon={'eva:plus-fill'} />}
                  onClick={onUpdateAdjustmentValue}
                  loading={isAdjustmentLoading}
                >
                  {translate('buy.adjust_units')}
                </LoadingButton>

                <LoadingButton
                  disabled={isCreateOrder}
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon={'carbon:shopping-cart'} />}
                  onClick={handleCreateOrder}
                  loading={creatingOrder}
                >
                  {translate('buy.create_order')}
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon={showContent ? 'formkit:eyeclosed' : 'ph:eye'} />}
                  onClick={toggleShowContent}
                >
                  {showContent ? translate('hide') : translate('show')}
                </LoadingButton>

              </Stack>
            }
          /><Collapse in={showContent}>
            <CardContent sx={{ p: 1 }}>
              {conditionsSummary && conditionsSummary.length > 0 ? (<Styles>
                <Table
                  loading={!catalog.loadingCatalog}
                  columns={columns}
                  from={'need summary'}
                  data={conditionsSummary} />
              </Styles>)
                : (
                  <>
                  <Loader />
                </>
                  // <TableRow>
                  //     <TableCell colSpan={6} align="center">
                  //         {isNeedData ? (
                  //             <>
                  //                 <Loader />
                  //             </>
                  //         ) : (
                  //             translate('No_record_found')
                  //         )}
                  //     </TableCell>
                  // </TableRow>
              )}
                
                {/* (
                  <Loader />
                )} */}
            </CardContent>
          </Collapse>
        </Card>
        {/* Adjust Needs Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} TransitionComponent={Transition}>
          <AdjustNeeds needsCatalog={selectedCondition} handleClose={handleCloseDialog} />
        </Dialog>
      </Grid>
    </Grid>

  );
}
