import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import "../../css/style.css";
import {
    Card,
    Grid,
    CardHeader,
    CardContent,
    TextField,
    Box,
    Button,
    Tooltip,
    Typography,
    Stack,
    Autocomplete,
    Select,
    MenuItem,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { TextEditor } from 'react-data-grid';

import styled from 'styled-components'
import lodashSet from 'lodash/set'
import lodashClone from 'lodash/cloneDeep'

// Components
import BuyInfo from './components/BuyInfo';
import ConditionTooltip from './components/ConditionTooltip';
import CustomDataGrid from '../../components/CustomDataGrid';

// Redux
import { useDispatch, useSelector } from '../../redux/store';
import { getBuyNeeds, getBuyCategories, getBuyConditions, getParaBuyNeeds } from '../../redux/slices/buy';

// Hooks
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Utils
import { fCurrency } from '../../utils/formatNumber';
import axios from '../../utils/axios';
import { BUY_API } from '../../constants/ApiPaths';

import Table from '../../components/table/Table';
import Iconify from '../../components/Iconify';
import Loader from '../../components/Loader';
import StatsTooltip from './components/StatsTooltip';
import DiscountRow from './components/DiscountRow';


// Create an editable cell renderer

const CELL_VARIANT = Object.freeze({
    DEFAULT: 'DEFAULT',
    HIGHLIGHTED: 'HIGHLIGHTED',
    SUCCESS: 'SUCCESS',
})

const CELL_VARIANT_CONFIG = Object.freeze({
    [CELL_VARIANT.DEFAULT]: {
        color: 'inherit',
        bgColor: 'inherit',
        borderColor: '#00ab55',
    },
    [CELL_VARIANT.HIGHLIGHTED]: {
        color: 'brown',
        bgColor: 'lightyellow',
        borderColor: 'brown',
    }, [CELL_VARIANT.SUCCESS]: {
        color: 'green',
        bgColor: '#aae9aa',
        borderColor: 'green',
    },
})

//---------------------------------------


const StyledStatsCellValue = styled(Typography)`
    display: inline-flex;
    align-items:center;
    justify-content: center;
    flex: 1;
    background:  ${({ $color }) => $color}; 
    color: #fff;
    padding: 8px;
    min-width: 62px;
`;

const StyledStatsCellButton = styled.button`
    display: inline-flex;
    align-items:center;
    justify-content: center;
    background: ${({ $color }) => $color}; 
    color: #fff;
    border: none;
    padding: 4px 8px;
    font-size: 17px;
    font-weight: 600;cursor: pointer;
    &:hover {
        background-color: #d6b907 !important;
        color: white!important;
    }
`;

const StyledStatsCellControlsButton = styled(StyledStatsCellButton)`
    font-size: 22px;
    font-weight: 900;
    height: 20px !important ;
    width: 100%;
    overflow:hidden;
    // height: 28px; cursor: pointer;
    &:hover {
        background-color: #007B55 !important;
        color: white!important;
    }
    @media (max-width: 600px) {
        height: 35px !important ;
    }
`;

const StyledStatsCellButtonContainer = styled.div`
    display: flex; 
    flex-direction: column;
    // height: 44px;
    gap:2px;cursor: pointer;
`;


const StyledStatsCell = styled.div`
    display: flex; 
    gap:2px;
    font-size: 17px;
    font-weight: 600;    
    

    ${StyledStatsCellValue} {
        flex-grow: 4;
    }

    ${StyledStatsCellButton} {
        flex-grow: 2;
    }

    ${StyledStatsCellButtonContainer} {
        flex-grow: 2;
    }
`;


const StyledSelect = styled(Select)`
    svg { 
        display: none;
    }
    fieldset { 
        border: none;
    }
`;

const StatsCell = ({ rowData, onAddClick, onMinusClick, onOkClick }) => {
    const stat1 = rowData.need?.stat_1 || '';
    const stat2 = rowData.need?.stat_2 || '';
    const value = (stat1 - stat2) / (stat2 || 1) * 100

    return <StyledStatsCell>
        {value >= 0 ? (
            <StyledStatsCellValue  variant="subtitle2" $color="#84c78e"> {value.toFixed(0) ? `${+value.toFixed(0)}%` : ''}</StyledStatsCellValue>
        ) : (
            <StyledStatsCellValue  variant="subtitle2" $color="#dd785f"> {value.toFixed(0) ? `${+value.toFixed(0)}%` : ''}</StyledStatsCellValue>
        )}
        <StyledStatsCellButton  $color="#fcd800" onClick={onOkClick}>OK</StyledStatsCellButton>
        <StyledStatsCellButtonContainer >
            <StyledStatsCellControlsButton  $color="#00a93a" onClick={onAddClick}>+</StyledStatsCellControlsButton>
            <StyledStatsCellControlsButton  $color="#d36d5b" onClick={onMinusClick}>-</StyledStatsCellControlsButton>
        </StyledStatsCellButtonContainer>
    </StyledStatsCell>
}

//---------------------------------------

const StyledEditableCell = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;    
    padding: 8px;
    text-align: center;
    border: 1px solid transparent!important;
    cursor: pointer;
    color: ${({ $cellVariant }) => CELL_VARIANT_CONFIG[$cellVariant].color};
    background-color: ${({ $cellVariant }) => CELL_VARIANT_CONFIG[$cellVariant].bgColor};
    transition: border-color 240ms ease;

    &:focus-visible {
        outline-color: ${({ $cellVariant }) => CELL_VARIANT_CONFIG[$cellVariant].borderColor} ;
    }

    &:hover {
        border-color:${({ $cellVariant }) => CELL_VARIANT_CONFIG[$cellVariant].borderColor}  !important;
    }
`


const Styles = styled.div`
    height: calc(100vh - 400px);
    overflow: auto;
    margin-top: 1rem;

  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid #0000002b;
    border-top:0px;
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
      padding: 0.1rem;
      border-top: 1px solid #0000002b;
      border-bottom: 1px solid #0000002b;
      border-right: 1px solid #0000002b;
      text-align: center;
      font-size:100%;
      :last-child {
        border-right: 0;
       
      }
    }
  }
`


NeedTable.propTypes = {
    currentBuy: PropTypes.object,
    products: PropTypes.array,
    paraProduct: PropTypes.array,
};
const DiscountContext = createContext();

export const useDiscountContext = () => useContext(DiscountContext);
export default function NeedTable({ currentBuy, products, paraProduct, pharamcyType, isPharamcy }) {
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { currentPharmacy } = useAuth();
    const { catalog, relatedPharmacy } = useSelector((state) => state.buy);
    const [loadingItemPharmacies, setLoadingItemPharmacies] = useState(false);
    // const [pharamcyType, setPharamcyType] = useState("non-para");
    const [loadStat, setLoadStat] = useState(false);
    const [loadSave, setLoadSave] = useState(false);


    const [catalogProducts, setCatalogProducts] = useState([]);
    const [paraCatalogProducts, setParaCatalogProducts] = useState([]);
    const [currentPharmacies, setCurrentPharmacies] = useState([]);
    const [filters, setFilters] = useState({ category: '', condition: '', keyword: '' });

    const getColor = (discount, maxDiscount) => {
        if (parseInt(discount, 10) === parseInt(maxDiscount, 10)) return 'green';
        if (parseInt(discount, 10) >= parseInt(maxDiscount, 10) * 0.7) return 'red';
        return '';
    };

    const [discountValue, setDiscountValue] = useState({
        id: "",
        conditionId: ""
    });


    const onChangeKeywordFilter = (e) => {
        setFilters({ ...filters, keyword: e.target.value });
    };
    const onChangeCategoryFilter = (e, value) => {
        setFilters({ ...filters, category: value?.id || '' });
    };
    const onChangeConditionFilter = (e, value) => {
        setFilters({ ...filters, condition: value?.id || '' });
    };

    const handleFocus = (event) => event.target.select()

    const handleKeyDown = (e, row, column) => {
        console.log('event key in hanlde keyDown:',e.key);
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key==="Tab") {
            e.preventDefault();
            if (e.key === 'ArrowUp') {
                document.getElementsByName(`select${row.index - 1}`)[0].focus(); // Decrement row index for ArrowUp
            } else if (e.key === 'ArrowDown' || e.key==="Tab") {
                document.getElementsByName(`select${row.index + 1}`)[0].focus();  // Increment row index for ArrowDown
            }

        }
    };

    const handleKeyUp = (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
        }
    };


    const onChangeUnits = async (row, value, id, ph = null) => {
        let adjustedUnits = row.adjusted_units;

        let units = value;
        if (id === "adjusted_units") {
            adjustedUnits = value;
            units = row.need?.units;
        }

        let data = {
            pharmacy: ph,
            units,
            catalog: row.id,
            buy: currentBuy.id,
        };

        if (adjustedUnits !== null) {
            data = {
                pharmacy: ph,
                units,
                catalog: row.id,
                buy: currentBuy.id,
                adjusted_units: adjustedUnits
            };
        }

        if (units >= 0) {
            return axios({
                method: row.need ? 'put' : 'post',
                url: row.need ? `${BUY_API.BUY_NEED}${row.need.id}/` : BUY_API.BUY_NEED,
                data,
            })
                .then((response) => {
                    // console.log(response);
                    enqueueSnackbar('Catalog needs has been updated successfully.');
                    dispatch(getBuyNeeds(currentBuy.id, currentPharmacy.id));
                    dispatch(getParaBuyNeeds(currentBuy.id, currentPharmacy.id));

                })
                .catch((error) => {
                    // console.log(error);
                    enqueueSnackbar('Oops something went wrong.', {
                        variant: 'error',
                    });
                });
        }
    };


    const EditableCell = ({
        value: initialValue,
        row,
        column
    }) => {
        const { id } = column;
        const isUdCell = id === 'needUnitsDraft'
        // We need to keep and update the state of the cell normally
        const state1Value = row.original?.need?.stat_1;
        const [value, setValue] = React.useState(initialValue)
        const lastUpdatedValue = useRef(initialValue);
        const { index } = row;

        // console.log("DEBUG", { value, row, state1Value })

        const totalUntisValue = row.original?.need?.total_units;
        // const [cellVariant, setCellVariant] = useState(isUdCell ? totalUntisValueCELL_VARIANT.HIGHLIGHTED : CELL_VARIANT.DEFAULT);

        let cellVariant = CELL_VARIANT.DEFAULT;
        if (isUdCell) {
            cellVariant = totalUntisValue ? CELL_VARIANT.SUCCESS : CELL_VARIANT.HIGHLIGHTED
        }

        if (row.original?.need?.units === "0") {
            cellVariant = CELL_VARIANT.SUCCESS;
        }
        const { discountValue, setDiscountValue } = useDiscountContext();

        //--------------------------

        const onChange = e => {
            setValue(e.target.value)
        }

        const update = () => {
            if (lastUpdatedValue.current === undefined && value === undefined) {
                return
            }

            if (lastUpdatedValue.current === value) {
                return
            }
            // console.log("row.id", row.original)
            onChangeUnits(row.original, value, id, currentPharmacy.id).then(() => {
                setDiscountValue({ id: row?.original?.id, conditionId: row?.original?.catalog_condition?.id })
            });
            lastUpdatedValue.current = value
        }

        // We'll only update the external data when the input is blurred
        const onBlur = () => {
            update()
        }

        const handleKeyPress = (event) => {
            console.log('event:',event.key);
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementsByName(`select${row.index + 1}`)[0].focus();
                update()
            }
        }

        // If the initialValue is changed external, sync it up with our state
        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])


        //--------------------------
        return (
            <div  style={{ width: "40px" }}>
                <Tooltip  title={<StatsTooltip need={row.original?.need} />} arrow>
                    <StyledEditableCell  name={`select${row.index}`} $cellVariant={cellVariant} value={value} onChange={onChange} onBlur={onBlur} onKeyPress={(e) => handleKeyPress(e, row)} style={{ fontSize: "16px" }} onFocus={(e) => handleFocus(e, row)} onKeyDown={(e) => handleKeyDown(e, row, column)} onKeyUp={(e) => handleKeyUp(e)} />
                </Tooltip>
            </div>
        );
    }


    const handleChangeRowValue = useCallback((rowIndex, key, value) => {
        if (pharamcyType === "non-para") {
            setCatalogProducts((data) => {
                data = [...data];
                const rowData = lodashClone(data[rowIndex]);
                lodashSet(rowData, key, value)
                data[rowIndex] = rowData;
                // console.log({ rowIndex, key, value, rowData });
                return data
            })
        }
        else {
            setParaCatalogProducts((data) => {
                data = [...data];
                const rowData = lodashClone(data[rowIndex]);
                lodashSet(rowData, key, value)
                data[rowIndex] = rowData;
                // console.log({ rowIndex, key, value, rowData });
                return data
            })
        }
    }, [pharamcyType])


    const EditableCellPara = ({
        value: initialValue,
        row,
        column
    }) => {
        const { id } = column;
        let ph = 0

        ph = relatedPharmacy.filter((ph) => (ph.type === "Para"))
        const isUdCell = id === 'needUnitsDraft'

        // We need to keep and update the state of the cell normally
        const state1Value = row.original?.need?.stat_1;
        const [value, setValue] = React.useState(initialValue)
        const lastUpdatedValue = useRef(initialValue);
        const { index } = row;

        const totalUntisValue = row.original?.need?.total_units;
        // const [cellVariant, setCellVariant] = useState(isUdCell ? totalUntisValueCELL_VARIANT.HIGHLIGHTED : CELL_VARIANT.DEFAULT);

        let cellVariant = CELL_VARIANT.DEFAULT;
        if (isUdCell) {
            cellVariant = totalUntisValue ? CELL_VARIANT.SUCCESS : CELL_VARIANT.HIGHLIGHTED
        }

        if (row.original?.need?.units === "0") {
            cellVariant = CELL_VARIANT.SUCCESS;
        }

        //--------------------------

        const onChange = e => {
            setValue(e.target.value)
        }

        const update = () => {
            if (lastUpdatedValue.current === undefined && value === undefined) {
                return
            }

            if (lastUpdatedValue.current === value) {
                return
            }
            onChangeUnits(row.original, value, id, ph[0].id)
            lastUpdatedValue.current = value
        }

        // We'll only update the external data when the input is blurred
        const onBlur = () => {
            update()
        }

        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                update()
            }
        }

        // If the initialValue is changed external, sync it up with our state
        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])


        //--------------------------
        return (
            <div style={{ width: "40px" }}>
                <Tooltip  title={<StatsTooltip need={row.original?.need} />} arrow>
                    <StyledEditableCell  name={`select${row.index}`} $cellVariant={cellVariant} value={value} onChange={onChange} onBlur={onBlur} onKeyPress={handleKeyPress} style={{ fontSize: "16px" }} onFocus={(e) => handleFocus(e, row)} onKeyDown={(e) => handleKeyDown(e, row, column)} onKeyUp={(e) => handleKeyUp(e)} />
                </Tooltip>
            </div>
        );
    }


    const columns = useMemo(
        () => [{
            accessor: 'need.stock',
            Header: translate('need.stx'),
            width: 50,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
        },
        {
            accessor: 'STATS',
            Header: translate('need.stats'),
            maxWidth: 50,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
            Cell({ row }) {
                return <StatsCell
                    rowData={row.original}
                    onAddClick={() => { handleChangeRowValue(row.index, "needUnitsDraft", +row.original?.needUnitsDraft + 1) }}
                    onMinusClick={() => { handleChangeRowValue(row.index, "needUnitsDraft", +row.original?.needUnitsDraft - 1) }}
                    onOkClick={() => { onChangeUnits(row.original, +row.original?.needUnitsDraft, "needUnitsDraft", currentPharmacy.id) }}
                />
            },
        },
        {
            accessor: 'needUnitsDraft',
            Header: translate('need.unit'),
            maxWidth: 80,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
            Cell: EditableCell
        },
        {
            accessor: 'total_units',
            Header: translate('need.total_unit'),
            width: 50,
            Cell({ row }) {
                return row.original.total_units || '';
            },
        },
        {
            accessor: 'name',
            Header: translate('need.name'),
            width: 400,
            Cell({ row }) {
                return (
                    <Box>
                        <Typography variant="subtitle2"> {row.original.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            EAN: {row.original.ean} CN: {row.original.cn}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            accessor: 'pvl',
            Header: translate('need.pvl'),
            width: 40,
            Cell({ row }) {
                return fCurrency(row.original.pvl);
            },
        },
        {
            accessor: 'Precio',
            Header: translate('need.unit_price'),
            width: 40,
            Cell({ row }) {
                const totalCost = row.original.unit_price / row.original.total_units;
                return totalCost > 0 ? fCurrency(totalCost) : '';
                // fCurrency(row.original.unit_price);
            },
        },
        {
            accessor: 'discount',
            Header: translate('need.discount'),
            width: 40,
            Cell({ row }) {
                return (
                    <>
                        <DiscountRow filters={filters} row={row} />
                    </>
                );
            },
        },
        {
            accessor: 'max_discount',
            Header: translate('need.max_discount'),
            Cell({ row }) {
                return (
                    <>
                        <Tooltip title={<ConditionTooltip condition={row.original.catalog_condition} />} arrow>
                            <Box>
                                {row.original.max_discount ? `${row.original.max_discount}%` : '0%'}
                            </Box>
                        </Tooltip>
                    </>
                );
            },
        },
        {
            accessor: 'discount_amount',
            Header: translate('need.discount_amount'),
            Cell({ row }) {
                return row.original.discount_amount ? fCurrency(row.original.discount_amount) : '';
            },
        },
        {
            accessor: 'net_amount',
            Header: translate('need.net_amount'),
            Cell({ row }) {
                return row.original.net_amount ? fCurrency(row.original.net_amount) : '';
            },
        },
        {
            accessor: 'tax_amount',
            Header: translate('need.tax_amount'),
            Cell({ row }) {
                return row.original.tax_amount ? fCurrency(row.original.tax_amount) : '';
            },
        },
        {
            accessor: 'recargo_amount',
            Header: translate('need.recargo_amount'),
            Cell({ row }) {
                return row.original.recargo_amount ? fCurrency(row.original.recargo_amount) : '';
            },
        },
        {
            accessor: 'grand_total',
            Header: translate('need.total_amount'),
            Cell({ row }) {
                return row.original.grand_total ? fCurrency(row.original.grand_total) : '';
            },
        },
        ],
        []
    );

    const paraColumns = useMemo(
        () => [{
            accessor: 'need.stock',
            Header: translate('need.stx'),
            width: 50,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
        },
        {
            accessor: 'STATS',
            Header: translate('need.stats'),
            maxWidth: 50,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
            Cell({ row }) {

                return <StatsCell
                    rowData={row.original}
                    onAddClick={() => { handleChangeRowValue(row.index, "needUnitsDraft", +row.original?.needUnitsDraft + 1) }}
                    onMinusClick={() => { handleChangeRowValue(row.index, "needUnitsDraft", +row.original?.needUnitsDraft - 1) }}
                    onOkClick={() => { onChangeUnits(row.original, +row.original?.needUnitsDraft, "needUnitsDraft", currentPharmacy.id) }}
                />
            },
        },
        {
            accessor: 'needUnitsDraft',
            Header: translate('need.unit'),
            maxWidth: 80,
            editor: TextEditor,
            editorOptions: {
                editOnClick: true,
            },
            Cell: EditableCellPara
        },
        {
            accessor: 'total_units',
            Header: translate('need.total_unit'),
            width: 50,
            Cell({ row }) {
                return row.original.total_units || '';
            },
        },
        {
            accessor: 'name',
            Header: translate('need.name'),
            width: 400,
            Cell({ row }) {
                return (
                    <Box sx={{ marginTop: '-10px' }}>
                        <Typography variant="subtitle2"> {row.original.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            EAN: {row.original.ean} CN: {row.original.cn}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            accessor: 'pvl',
            Header: translate('need.pvl'),
            width: 40,
            Cell({ row }) {
                return fCurrency(row.original.pvl);
            },
        },
        {
            accessor: 'Precio',
            Header: translate('need.unit_price'),
            width: 40,
            Cell({ row }) {
                const totalCost = row.original.unit_price / row.original.total_units;
                return totalCost > 0 ? fCurrency(totalCost) : '';
                // fCurrency(row.original.unit_price);
            },
        },
        {
            accessor: 'discount',
            Header: translate('need.discount'),
            width: 40,
            Cell({ row }) {
                return (
                    <>
                        <Tooltip title={<ConditionTooltip condition={row.original.catalog_condition} />} arrow>
                            <Box sx={{ color: getColor(row.original?.discount?.discount || 0, row.original.max_discount) }}>
                                {row.original?.discount?.discount || ''}
                            </Box>
                        </Tooltip>
                    </>
                );
            },
        },
        {
            accessor: 'max_discount',
            Header: translate('need.max_discount'),
            Cell({ row }) {
                return row.original.max_discount ? `${row.original.max_discount}%` : '';
            },
        },
        {
            accessor: 'discount_amount',
            Header: translate('need.discount_amount'),
            Cell({ row }) {
                return row.original.discount_amount ? fCurrency(row.original.discount_amount) : '';
            },
        },
        {
            accessor: 'net_amount',
            Header: translate('need.net_amount'),
            Cell({ row }) {
                return row.original.net_amount ? fCurrency(row.original.net_amount) : '';
            },
        },
        {
            accessor: 'tax_amount',
            Header: translate('need.tax_amount'),
            Cell({ row }) {
                return row.original.tax_amount ? fCurrency(row.original.tax_amount) : '';
            },
        },
        {
            accessor: 'recargo_amount',
            Header: translate('need.recargo_amount'),
            Cell({ row }) {
                return row.original.recargo_amount ? fCurrency(row.original.recargo_amount) : '';
            },
        },
        {
            accessor: 'grand_total',
            Header: translate('need.total_amount'),
            Cell({ row }) {
                return row.original.grand_total ? fCurrency(row.original.grand_total) : '';
            },
        },
        ],
        []
    );

    const filterCatalog = () => {
        const keyword = filters.keyword.toLowerCase();

        let catalogs = products;
        let paraCatalogs = paraProduct
        if (filters.condition) catalogs = catalogs.filter((row) => (row.catalog_condition?.id || '') === filters.condition);
        if (filters.category) catalogs = catalogs.filter((row) => (row.category?.id || '') === filters.category);
        catalogs = catalogs.filter(
            (row) =>
                (row.name || '').toLowerCase().includes(keyword) || // Ensure row.name is a string
                (row.cn || '').includes(keyword) || // Ensure row.cn is a string
                (row.ean || '').includes(keyword) // Ensure row.ean is a string
        ).map((row) => {
            const stat1 = row.need?.stat_1 - row.need?.stock || '';
            if (row.need?.units) {
                return { ...row, needUnitsDraft: row.need?.units }
            }
            return { ...row, needUnitsDraft: stat1 }
        });

        if (filters.condition) paraCatalogs = paraCatalogs.filter((row) => (row.catalog_condition?.id || '') === filters.condition);
        if (filters.category) paraCatalogs = paraCatalogs.filter((row) => (row.category?.id || '') === filters.category);
        paraCatalogs = paraCatalogs.filter(
            (row) =>
                (row.name || '').toLowerCase().includes(keyword) || // Ensure row.name is a string
                (row.cn || '').includes(keyword) || // Ensure row.cn is a string
                (row.ean || '').includes(keyword) // Ensure row.ean is a string
        ).map((row) => {
            const stat1 = row.need?.stat_1 - row.need?.stock || '';
            if (row.need?.units) {
                return { ...row, needUnitsDraft: row.need?.units }
            }
            return { ...row, needUnitsDraft: stat1 }
        });

        // console.log('ABC', { catalog, products, catalogs, paraCatalogs })

        setCatalogProducts(catalogs);
        setParaCatalogProducts(paraCatalogs);
    };

    useEffect(() => {
        // Filters the catelog products by category, commercial condition, EAN, CN, and Name on change the filters or update products in redux store
        filterCatalog();
        setCurrentPharmacies(relatedPharmacy);
    }, [filters, products]);


    useEffect(() => {
        dispatch(getBuyCategories(currentBuy.id))
        dispatch(getBuyConditions(currentBuy.id))

        // Get the all categories and conditions for a buy to populate the filters autocomplete fields
        // if (!catalog.categories.length) dispatch(getBuyCategories(currentBuy.id));
        // if (!catalog.conditions.length) dispatch(getBuyConditions(currentBuy.id));
    }, []);


    const handleLoadStats = () => {
        setLoadStat(true);
        setLoadingItemPharmacies(true);
        const ids = catalogProducts.map((data) => data.need?.id)
        // console.log({ currentPharmacy });
        const data = {
            pharmacy: currentPharmacy?.id,
            buy: currentBuy.id
        }

        axios({
            method: 'post',
            url: `${BUY_API.LOAD_STATS}`,
            data,
        })
            .then((response) => {
                setLoadingItemPharmacies(false);
                enqueueSnackbar('Catalog needs stats has been updated successfully.');
                dispatch(getBuyNeeds(currentBuy.id, currentPharmacy.id));
                dispatch(getParaBuyNeeds(currentBuy.id, currentPharmacy.id));
                setLoadStat(false);
            })
            .catch((error) => {
                setLoadStat(false);
                setLoadingItemPharmacies(false);
                enqueueSnackbar('Oops something went wrong.', {
                    variant: 'error',
                });
            });
    };

    const handleSaveStats = () => {
        setLoadSave(true);
        setLoadingItemPharmacies(true);
        const ids = catalogProducts.map((data) => data.need?.id)
        const data = {
            // pharmacyID: catalogProducts[0].need?.pharmacy,
            pharmacyID: currentPharmacy.id,
            buyId: currentBuy.id
        }

        axios({
            method: 'post',
            url: `${BUY_API.SAVE_STATS}`,
            data,
        })
            .then((response) => {
                setLoadSave(false);
                setLoadingItemPharmacies(false);
                dispatch(getBuyNeeds(currentBuy.id, currentPharmacy.id));
                dispatch(getParaBuyNeeds(currentBuy.id, currentPharmacy.id));
                enqueueSnackbar('Catalog needs units has been updated successfully.');
            })
            .catch((error) => {
                setLoadSave(false);
                setLoadingItemPharmacies(false);
                enqueueSnackbar('Oops something went wrong.', {
                    variant: 'error',
                });
            });
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            axios
                .get(BUY_API.ACTION, {
                    params: { buy: currentBuy.id, action: "rebuild" }
                })
                .then((response) => {
                    // console.log(response.data)
                })
                .catch((error) => {
                    // console.log(error);
                })
        };

        return () => {
            handleBeforeUnload()
        };
    }, []);

    const handleFileUpload = (event) => {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append('files', files[0])
        formData.append('pharamcy', currentPharmacy.id)
        formData.append('buy', currentBuy.id)

        axios({
            method: 'post',
            url: `${BUY_API.BUY_UPLOAD_PARA_NEED}`,
            data: formData,
        })
            .then((response) => {
                setLoadingItemPharmacies(false);
                dispatch(getBuyNeeds(currentBuy.id, currentPharmacy.id));
                dispatch(getParaBuyNeeds(currentBuy.id, currentPharmacy.id));
                enqueueSnackbar('Catalog needs units has been updated successfully.');
            })
            .catch((error) => {
                setLoadingItemPharmacies(false);
                enqueueSnackbar('Oops something went wrong.', {
                    variant: 'error',
                });
            });
    }

    return (
        <Grid container spacing={3}  >
            <Grid item xs={12} md={12}>
                <BuyInfo currentBuy={currentBuy} />
            </Grid>
            <Grid item xs={12} md={12}>
                <Card>
                    <CardHeader
                        action={
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                <Autocomplete
                                    id="category"
                                    size="small"
                                    freeSolo
                                    fullWidth
                                    sx={{ width: 200 }}
                                    options={catalog.categories}
                                    getOptionLabel={(option) => option?.name || ''}
                                    onChange={onChangeCategoryFilter}
                                    renderInput={(params) => <TextField {...params} label={translate("buy.category")} placeholder="Filter by Category" />}
                                />
                                <Autocomplete
                                    id="conditions"
                                    size="small"
                                    freeSolo
                                    fullWidth
                                    sx={{ width: 200 }}
                                    options={catalog.conditions}
                                    getOptionLabel={(option) => option?.name || ''}
                                    onChange={onChangeConditionFilter}
                                    renderInput={(params) => (
                                        <TextField {...params} label={translate("buy.condition")} placeholder="Filter by Condition" />
                                    )}
                                />
                                <TextField
                                    placeholder="EAN/CN, Name"
                                    label={translate("Search")}
                                    size="small"
                                    sx={{ width: 200 }}
                                    onChange={onChangeKeywordFilter}
                                    value={filters.keyword}
                                />
                                {
                                    !isPharamcy ? (
                                        <>
                                            <LoadingButton
                                                variant="contained"
                                                color="primary"
                                                onClick={handleLoadStats}
                                                startIcon={<Iconify icon={'eva:plus-fill'} />}
                                                loading={loadStat}
                                            >
                                                {translate('buy.load_stat')}
                                            </LoadingButton>

                                            <LoadingButton
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSaveStats}
                                                startIcon={<Iconify icon={'eva:plus-fill'} />}
                                                loading={loadSave}
                                            >
                                                {translate('buy.save_stat')}
                                            </LoadingButton>
                                        </>
                                    )
                                        : (
                                            <>
                                                <Button variant="contained" component="label" startIcon={<Iconify icon={'material-symbols:upload'} />}>
                                                    Upload
                                                    <input hidden accept="file/*" multiple type="file" onChange={handleFileUpload} />
                                                </Button>
                                            </>
                                        )
                                }
                            </Stack>
                        }
                    />
                    {!isPharamcy ? (
                        <CardContent sx={{ p: 1 }}>
                            {catalogProducts.length !== 0 ? (<Styles>
                                <DiscountContext.Provider value={{ discountValue, setDiscountValue }}>
                                    <Table
                                        loading={loadingItemPharmacies}
                                        columns={columns}
                                        data={catalogProducts} />
                                </DiscountContext.Provider>
                            </Styles>)
                                : (
                                    <Loader />
                                )}
                        </CardContent>
                    ) : (
                        <CardContent sx={{ p: 1 }}>
                            {paraCatalogProducts.length !== 0 ? (<Styles>

                                <Table
                                    loading={loadingItemPharmacies}
                                    columns={paraColumns}
                                    data={paraCatalogProducts} />
                            </Styles>)
                                : (
                                    <Loader />
                                )}
                        </CardContent>
                    )}
                </Card>
            </Grid>
        </Grid>
    );
}
