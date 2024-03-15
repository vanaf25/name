import styled from 'styled-components';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// @mui

import { Card, CardContent, Grid, Box, Typography, MenuItem, CardHeader, TextField, Dialog, DialogContent, DialogTitle, Stack, Avatar, Select } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { LoadingButton } from '@mui/lab';
import { TextEditor } from 'react-data-grid';
import fileDownload from 'js-file-download';
import Iconify from '../../../components/Iconify';

import Loader from '../../../components/Loader';

// utils
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';
import Table from '../../../components/table/Table';

// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updateShipmentItem, getShipmentItems } from '../../../redux/slices/shipment';
import OrderPharmacyInfo from '../order/components/OrderPharmacyInfo';
import ShipmentSummary from "../order/components/ShipmentSummary";
import { CURRENT_BUY_STATUS_IMAGES } from '../../../constants/AppEnums';


ShipmentItemsTable.propTypes = {
  shipment: PropTypes.object,
  userList: PropTypes.object,
};



const StyledCardHeader = styled(CardHeader)`
    & > *:first-child {
      display: none;
    }
    
    & > *:last-child {
      display: flex;
      flex-grow: 1;
      justify-content: space-between;
    }
`;

const DropDownCloseButton = styled.button`
position: absolute;
top: 0px;
right: 0px;
padding: 8px;
width: 40px;
height: 40px;
background: transparent;
border: none;
font-size: 30px;
`

const InputStyled = styled.input`
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
color: brown;
background-color: lightyellow;
transition: border-color 240ms ease;
`


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

  &>*:last-child {
    border-right: 0;
  }
}
tr td:nth-child(11) {
  padding: 0px !important;
}
}
`

const PharmacyStyles = styled.div`
margin-top: 1rem;
margin-bottom: 4rem;

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
tr:nth-child(${(props) => { return props.shipmentObjectIndex + 1 }}){
  background: yellow !important;
}
}
`

const StyledInput1 = styled.input`
    border-radius: 12px;
    line-height: 1.4375em;
    font-size: 12px;
    font-family: Public Sans,sans-serif;
    font-weight: 400;
    color: #212B36;
    box-sizing: border-box;
    // position: relative;
    cursor: text;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 0 2px 0 rgb(145 158 171 / 20%), 0 12px 24px -4px rgb(145 158 171 / 12%);
    padding: 6px;
    border: 1px solid transparent !important;
    text-align: center;
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    border-radius: 0;
    background-color: lightyellow;
    &:focus-visible{ outline-color: #4dab4d !important;}
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
    background-color: lightyellow;
    &:focus-visible{ outline-color: #4dab4d !important;}
    `

const StyledInput2 = styled.input`
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
    height: 100%;
    width: 100%;
    border-radius: 0;
    background-color: lightyellow;
    &:focus-visible{ outline-color: #4dab4d !important;}
    `

const StyledOKButton = styled.button`
  &:hover {
    background-color: #d6b907 !important;
    color: white!important;
}
`
const handleWheel=(e)=>{
  e.preventDefault();
}
const disableWheelOnInput=(inputRef) => {
  const inputElement = inputRef.current;
  if (inputElement) {
    inputElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      inputElement.removeEventListener('wheel', handleWheel);
    };
  }
}

const EditableCellSentUnits = ({
  row,
  column,
  onSave
}) => {

  const handleFocus = (event) => event.target.select()
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key==="Tab") {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key==="Tab") {
      e.preventDefault();
    }
  };
  const receiveUnits = +row.original.sent_units !== 0 ? +row.original.sent_units : +row.original._send_units;
  const [value, setValue] = useState(receiveUnits);
  const isChanged = value !== receiveUnits;

  const handleSave = useCallback((event) => {
    if (onSave) {
      onSave(event, row.original, value, column)
    }
  }, [onSave, row.original, value, column])
  useEffect(() => {
    setValue(receiveUnits);
  }, [receiveUnits,])
  const inputRef=useRef(null);
  useEffect(()=>{
  disableWheelOnInput(inputRef)
},[]);
  const bgColor = {
    color: 'brown',
    bgColor: 'lightyellow',
    borderColor: 'brown', right: "0px",
    fontSize: "17px",
  }

  const bgColor1 = {
    color: 'green',
    backgroundColor: '#aae9aa',
    borderColor: '#aae9aa',
    right: "0px",
    fontSize: "17px",
  }

  return <div style={{
    display: "flex",
    gap: "2px",
    fontSize: "17px",
    fontWeight: "600",
    margin: "-6px",
    height: "36px",
    width: "68px"
  }}>
    <StyledOKButton onClick={handleSave} style={{
      backgroundColor: "#fcd800",
      color: "#fff",
      border: "none",
      padding: "0px 3px",
      fontSize: "17px",
      fontWeight: "600",
      position: "absolute",
      top: "0px",
      bottom: "0px",
      right: "56px",
      left: "0px",
      width: "50%",
      cursor: "pointer",
    }
    }>OK</StyledOKButton>
    <StyledInput1 ref={inputRef} type='number' value={value}
      onBlur={handleSave}
      onChange={(e) => {
        setValue(+e.target.value);
      }}
      style={+row.original.sent_units !== 0 ? bgColor1 : bgColor}
      onFocus={(e) => handleFocus(e)} onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)}
    />

  </div>
}

export default function ShipmentItemsTable({ shipment, user, buyId }) {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { shipmentItems, loadingItems } = useSelector((state) => state.shipment);

  // States
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [openPharmacyDialog, setOpenPharmacyDialog] = useState(false);
  const [openItemEntryModeDialog, setOpenItemEntryModeDialog] = useState(false);
  const [itemPharmacies, setItemPharmacies] = useState([]);
  const [newItemPharmacies, setNewItemPharmacies] = useState([]);
  const [loadingItemPharmacies, setLoadingItemPharmacies] = useState(false);
  const [loadingItemNewPharmacies, setLoadingItemNewPharmacies] = useState(false);
  const [selectedPharmacyDistribution, setSelectedPharmacyDistribution] = useState(null);
  const [receiveUnit, setReceiveUnit] = useState(null);
  const [remainingUnits, setRemainingUnits] = useState(null);
  const totalSentUnits = itemPharmacies.reduce((total, item) => total + item.sent_units, 0)
  const remainingSentUnits = Math.max(0, +selectedPharmacyDistribution?.received_units - totalSentUnits)
  const [showContent, setShowContent] = useState(false);
  const [entryMode, setEntryMode] = useState("Shipment Entry");
  const [isOkay, setIsOkay] = useState(true);
  const [allPharmacyItem, setAllPharmacyItem] = useState([]);
  const [shipmentObjectId, setShipmentObjectId] = useState(null)
  const [currentSentItemValue, setCurrentSentItemValue] = useState(null)
  const [pharmacyItems, setPharmacyItems] = useState([])
  const [closeDialogBox, setCloseDialogBox] = useState(false)
  const sentInputRef = useRef(null);
  const [newCurrentItem, setNewCurrentItem] = useState(null)
  const [phReport, serPhReport] = useState(false);



  const [itemEntryPharmacyValues, setItemEntryPharmacyValues] = useState([])

  const handleFocus = (event,rowIndex,columnId) =>{
    setSelectedCell({rowIndex,columnId});
    event.target.select();
  }
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key==="Tab" || e.key==="ArrowRight" || e.key==="ArrowLeft") {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key==="Tab" || e.key==="ArrowRight" || e.key==="ArrowLeft") {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const remainingSentUnits = Math.max(0, +selectedPharmacyDistribution?.received_units - totalSentUnits)
    setRemainingUnits(remainingSentUnits)
  }, []);

  const onUpdateShipmentRow = (id) => {

    axios
      .get(`${BUY_API.SHIPMENT_ITEM}${id}/`)
      .then((response) => {
        dispatch(updateShipmentItem(response.data));
        setReceiveUnit(response.data);
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }


  const onUpdatePharmacyRow = (event, row, value, column) => {
    let formData = {};
    const totalSentUnitsExceptCurrent = itemPharmacies.filter((item) => item.id !== row.id).reduce((total, item) => total + item.sent_units, 0)
    const maxAllowedSentUnits = +selectedPharmacyDistribution?.received_units - totalSentUnitsExceptCurrent
    const sentUnits = value === undefined ? +event.target.value : value

    if (sentUnits > maxAllowedSentUnits) {
      enqueueSnackbar(remainingSentUnits ? `${remainingSentUnits} units left!` : 'No remaining units!', {
        variant: 'error',
      });
      return
    }


    if (column.id === "sent_units") {
      formData = {
        received_units: +row.received_units,
        sent_units: sentUnits,
      };
    }

    axios
      .patch(`${BUY_API.SHIPMENT_ITEM_PHARMACIES}${row.id}/`, formData)
      .then((response) => {
        const items = itemPharmacies.map((item) => {
          if (item.id === row.id) {
            return response.data;
          }
          return item;
        });
        prepareItemPharmacies(items);
        onUpdateShipmentRow(+row?.shipment_item)
        enqueueSnackbar('Item has been updated successfully.');
      })
      .catch((error) => {
        if (error.sent_units) {
          enqueueSnackbar(error.sent_units[0], {
            variant: 'error',
          });
        }
        else {
          enqueueSnackbar('Oops something went wrong.', {
            variant: 'error',
          });
        }
      });
  };

  const onUpdateRow = (event, row, value, column, nextValue) => {
    console.log('blur:',event.target);
    clearSelectedCell(event);
    let formData = {};
    let isReceiveUnitsSame = true;
    let openSpecificDialogBox = false;

    if (column.id === "received_units") {
      if (+event.target.value > 0) {
        openSpecificDialogBox = true;
      }
      formData = {
        received_units: nextValue > 0 ? nextValue : +event.target.value,
        pvl: +row.pvl,
        discount_percentage: +row.discount_percentage,
        tax: +row.tax,
        recargo: +row.recargo
      };
    }
    if (column.id === "pvl") {
      if (+event.target.value === +row.pvl) {
        isReceiveUnitsSame = false;
      }
      formData = {
        received_units: +row.received_units,
        pvl: +event.target.value,
        discount_percentage: +row.discount_percentage,
        tax: +row.tax,
        recargo: +row.recargo
      };
    }
    if (column.id === "discount_percentage") {
      if (+event.target.value === +row.discount_percentage) {
        isReceiveUnitsSame = false;
      }
      formData = {
        received_units: +row.received_units,
        pvl: +row.pvl,
        discount_percentage: +event.target.value,
        tax: +row.tax,
        recargo: +row.recargo
      };
    }

    if (column.id === "tax") {
      if (+event.target.value === +row.tax) {
        isReceiveUnitsSame = false;
      }
      formData = {
        received_units: +row.received_units,
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
        received_units: +row.received_units,
        pvl: +row.pvl,
        discount_percentage: +row.discount_percentage,
        tax: +row.tax,
        recargo: +event.target.value,
      };
    }

    if (isReceiveUnitsSame) {
      axios
        .patch(`${BUY_API.SHIPMENT_ITEM}${row.id}/`, formData)
        .then((response) => {
          dispatch(updateShipmentItem(response.data));
          enqueueSnackbar('Product has been updated successfully.');
          setReceiveUnit(response.data);
          setRemainingUnits(+response.data.received_units)

          if (openSpecificDialogBox) {
            setSelectedPharmacyDistribution(response.data); openPharmaciesDistribution(response.data, "");
          }

        })
        .catch((error) => {
          enqueueSnackbar('Oops something went wrong.', {
            variant: 'error',
          });
        });
    }
  }
const [selectedCell,setSelectedCell]=useState({rowIndex:-1,columnId:""});
  const IsCellFocused=(rowIndex,cellId)=>selectedCell.rowIndex===rowIndex && selectedCell.columnId===cellId
  const selectInput=(rowIndex,columnId,input)=>{
    // eslint-disable-next-line no-empty

  }
const clearSelectedCell=(event)=>{
  console.log(!event?.relatedTarget?.classList?.contains("select"))
  if (!event?.relatedTarget?.classList?.contains("select")){
    setSelectedCell({rowIndex: -1,columnId: ""})
  }
}
  const EditableCell1 =React.memo(({
                                     value,
                                     row,
                                     column
                                   }) => {
    const receiveUnits = +row.original.received_units !== 0 ? +row.original.received_units : "";
    const sendPhUnits = +row.original.sent_ph_units;
    let nextValue = 0;

    const handleSave = useCallback((event) => {
      if (entryMode === "ITEM ENTRY") {
        setSelectedPharmacyDistribution(row.original);
        openPharmaciesDistribution(row.original, "");
      }
      else {
        nextValue = receiveUnits > 0 ? receiveUnits : +row.original.units;
        onUpdateRow(event, row.original, value, column, nextValue)
        nextValue = 0;
      }
    })
    const inputRef=useRef(null);
    useEffect(()=>{
      disableWheelOnInput(inputRef)
    },[]);
    useEffect(()=>{
      selectInput(row.index,column.id,inputRef);
    });
    return <Stack style={{
      display: "flex",
      gap: "2px",
      fontSize: "17px",
      fontWeight: "600",
      margin: "-6px",
      height: "36px",
      width: "100px"
    }}>
      {isOkay ?
          <>
            <StyledInput2 type='number' className={"select"}  ref={inputRef}
                          autoFocus={selectedCell.rowIndex===row.index && selectedCell.columnId===column.id }
                          defaultValue={receiveUnits > 0 ? receiveUnits : ''}
                          onBlur={(event) =>{
                            onUpdateRow(event, row.original, value, column, nextValue)
                          }}
                          style={{ backgroundColor: receiveUnits ? "#aae9aa" : "lightyellow", fontSize: "17px", color: receiveUnits ? "green" : "brown" }}
                          onFocus={(e) =>{
                            handleFocus(e,row.index,column.id)
                          }} onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)}
            />
          </>
          :
          <>
            <Loader />
          </>
      }
    </Stack>
  });

  const EditableCell2 =React.memo( ({
    value,
    row,
    column
  }) => {
    const inputRef=useRef(null);
    useEffect(()=>{
      disableWheelOnInput(inputRef)
    },[]);
    useEffect(()=>{
      // eslint-disable-next-line no-empty
      if (selectedCell.rowIndex===row.index && selectedCell.columnId===column.id){
        if (inputRef.current){
          console.log('input:',inputRef.current);

          inputRef.current.select();
        }
      }
    },[selectedCell]);
    return <StyledInput     ref={inputRef} className={"select"}
                                          type='number'
                            autoFocus={selectedCell.rowIndex===row.index && selectedCell.columnId===column.id }
                            defaultValue={+row.original.discount_percentage}
                            onBlur={(event) => onUpdateRow(event, row.original, value, column)}
                            style={{ color: "brown" }}
                            onFocus={(e) =>handleFocus(e,row.index,column.id)
                            } onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)} />
  })

  const EditableCell3 =React.memo( ({
    value,
    row,
    column
  }) => {
    const inputRef=useRef(null);
    useEffect(()=>{
      disableWheelOnInput(inputRef)
    },[]);
    useEffect(()=>{
      selectInput(row.index,column.id,inputRef);
    },[selectedCell]);
    return <StyledInput type='number' className={"select"}  ref={inputRef}
                        defaultValue={+row.original.pvl}
                        autoFocus={selectedCell.rowIndex===row.index && selectedCell.columnId===column.id }
                        onBlur={(event) => onUpdateRow(event, row.original, value, column)}
                        style={{ color: "brown" }}
                        onFocus={(e) =>handleFocus(e,row.index,column.id)}
                        onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)} />
  })
  const EditableTaxPercentage =React.memo( ({
    value,
    row,
    column
  }) => {
    const inputRef=useRef(null);
    useEffect(()=>{
      disableWheelOnInput(inputRef)
    },[]);
    useEffect(()=>{
      selectInput(row.index,column.id,inputRef);
    },[selectedCell]);
    return <StyledInput type='number'  className={"select"}   ref={inputRef}
                        defaultValue={+row.original.tax}
                        autoFocus={selectedCell.rowIndex===row.index && selectedCell.columnId===column.id }
                        onBlur={(event) => onUpdateRow(event, row.original, value, column)}
                        style={{ color: "brown" }}
                        onFocus={(e) =>handleFocus(e,row.index,column.id)}
                          onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)} />
  })

  const EditableRecargoPercentage =React.memo( ({
    value,
    row,
    column
  }) => {
    const inputRef=useRef(null);
    useEffect(()=>{
      disableWheelOnInput(inputRef)
    },[]);
    useEffect(()=>{
      selectInput(row.index,column.id,inputRef);
    },[selectedCell]);
    return <StyledInput type='number'  className={"select"}   ref={inputRef}
                        autoFocus={selectedCell.rowIndex===row.index && selectedCell.columnId===column.id }
                        defaultValue={+row.original.recargo}
                        onBlur={(event) => onUpdateRow(event, row.original, value, column)}
                        style={{ color: "brown" }}
                        onFocus={(e) =>handleFocus(e,row.index,column.id)}
                        onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)} />
  })
  const columns = useMemo(
    () => [
      {
        accessor: 'units',
        Header: translate("tabel_content.ordered"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        }
      },
      {
        accessor: 'received_units',
        Header: translate("tabel_content.received_units"),
        width: 40,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell1
      },
      {
        Header: translate("items"),
        maxWidth: 50,
        editor: TextEditor,
        Cell({ row }) {
          if (row.original.received_units > 0) {
            return (
              <>
                <Box>
                  <Avatar src={CURRENT_BUY_STATUS_IMAGES.DISTRIBUTE[row.original.shipment_action]} sx={{ width: 30, height: 30, cursor: row.original.received_units > 0 ? 'pointer' : 'not-allowed', left: "20%" }} variant="square"
                    onClick={() => {
                      if (row.original.received_units > 0) {
                        setSelectedPharmacyDistribution(row.original); openPharmaciesDistribution(row.original, "");
                      }
                    }}
                  />
                </Box>
              </>
            );
          }
          return ''
        },
      },
      {
        accessor: 'pending_units',
        Header: translate("tabel_content.pending_units"),
        width: 20,
        editorOptions: {
          editOnClick: true,
        }
      },
      {
        accessor: 'name',
        Header: translate("tabel_content.name"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return (
            <Box sx={{ marginTop: '-10px' }}>
              <Typography variant="subtitle2"> {row.original.product_name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                EAN: {row.original.ean} CN: {row.original.cn}
              </Typography>
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
        accessor: 'ud_price',
        Header: "UD Price",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell({ row }) {
          return fCurrency(row.original.ud_price);
        }
      },
      {
        accessor: 'ud_cost',
        Header: "UD Cost",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell({ row }) {
          return fCurrency(row.original.ud_cost);
        }
      },
      {
        accessor: 'discount_percentage',
        Header: translate("tabel_content.discount_percentage"),
        width: 50,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell2
      },
      {
        accessor: 'subtotal',
        Header: "IMPORTE",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.subtotal);
        },
      },
      {
        accessor: 'discount_amount',
        Header: "DTO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.discount_amount);
        },
      },
      {
        Header: "IMP NETO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.subtotal - row.original.discount_amount);
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
      {
        accessor: 'tax_amount',
        Header: "IVA",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.tax_amount);
        },
      },
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
      {
        accessor: 'recargo_amount',
        Header: "Recargo",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.recargo_amount);
        },
      },
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
    ], [filteredItems]
  )

  const ItemEntryColumns = useMemo(
    () => [
      {
        accessor: 'units',
        Header: translate("tabel_content.ordered"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        }
      },
      {
        accessor: 'received_units',
        Header: translate("tabel_content.received_units"),
        width: 20,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell1
      },
      {
        accessor: 'pending_units',
        Header: translate("tabel_content.pending_units"),
        width: 20,
        editorOptions: {
          editOnClick: true,
        }
      },
      {
        accessor: 'name',
        Header: translate("tabel_content.name"),
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return (
            <Box sx={{ marginTop: '-10px' }}>
              <Typography variant="subtitle2"> {row.original.product_name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                EAN: {row.original.ean} CN: {row.original.cn}
              </Typography>
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
        accessor: 'ud_cost',
        Header: "UD Cost",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        editor: TextEditor,
        Cell({ row }) {
          return fCurrency(row.original.ud_cost);
        }
      },
      {
        accessor: 'discount_percentage',
        Header: translate("tabel_content.discount_percentage"),
        width: 50,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell2
      },
      {
        accessor: 'discount_amount',
        Header: "DTO",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.discount_amount);
        },
      },
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
      {
        accessor: 'tax_amount',
        Header: "IVA",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.tax_amount);
        },
      },
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
      {
        accessor: 'recargo_amount',
        Header: "Recargo",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return fCurrency(row.original.recargo_amount);
        },
      },
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
    ], [filteredItems]
  )

  const EditableCellReceiveUnits = ({
    value,
    row,
    column
  }) => {

    return <StyledInput type='number' defaultValue={+row.original.received_units}
      onBlur={(event) => onUpdatePharmacyRow(event, row.original, value, column)}
      style={{ backgroundColor: +row.original.received_units !== 0 ? "#aae9aa" : "lightyellow" }}
      onFocus={(e) => handleFocus(e)} onKeyDown={(e) => handleKeyDown(e)} onKeyUp={(e) => handleKeyUp(e)}
    />
  }


  const pharmacyColumns = useMemo(
    () => [
      {
        accessor: 'units',
        Header: translate("tabel_content.ordered"),
      },
      {
        accessor: 'sent_units',
        Header: translate("sent_units"),
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: (props) => <EditableCellSentUnits {...props} onSave={onUpdatePharmacyRow} />
      },
      {
        accessor: 'received_units',
        Header: translate("receive_units"),
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        // Cell: EditableCellReceiveUnits
      },
      {
        Header: translate("pending_units"),
        Cell({ row }) {
          const pendingUnits = +row.original.units - +row.original.sent_units;
          return +pendingUnits;
        },
      },
      {
        accessor: 'pharmacy_name',
        Header: translate("pharmacy_name"),
        width: 250,
      },
      {
        accessor: 'discount_amount',
        Header: 'DTO',
        Cell({ row }) {
          return fCurrency(row.original.discount_amount);
        },
      },
      {
        accessor: 'subtotal',
        Header: 'NETO',
        Cell({ row }) {
          return fCurrency(row.original.subtotal);
        },
      },
      {
        accessor: 'tax_amount',
        Header: 'IVA',
        Cell({ row }) {
          return fCurrency(row.original.tax_amount);
        },
      },
      {
        accessor: 'recargo_amount',
        Header: 'Recargo',
        Cell({ row }) {
          return fCurrency(row.original.recargo_amount);
        },
      },
      {
        accessor: 'grand_total',
        Header: 'BRUTO',
        Cell({ row }) {
          return fCurrency(row.original.grand_total);
        },
      },
    ],
    [itemPharmacies]
  );

  const shipmentObjectIndex = itemEntryPharmacyValues.findIndex(item => item.id === shipmentObjectId)
  const ItemEntryFillColumns = useMemo(
    () => [
      {
        Header: 'Enviar',
        width: 250,
        Cell({ row }) {
          return (
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>{row.original.current_item === 0 ? "" : row.original.current_item}</div>
          )
        },
      },
      {
        accessor: 'pharmacy_name',
        Header: translate("pharmacy_name"),
        width: 250,
      },
      {
        accessor: 'sent_units',
        Header: translate("sent_units"),
      },

      {
        Header: translate("pending_units"),
        Cell({ row }) {
          if (+row.original.sent_units > 0) {
            const pendingUnits = +row.original.units - +row.original.sent_units;
            return +pendingUnits;
          }

          const pendingUnits = +row.original.units - +row.original.current_item;
          return +pendingUnits;
        },
      },
      {
        accessor: 'units',
        Header: translate("tabel_content.ordered"),
      },
    ],
    [pharmacyItems]
    // [itemEntryPharmacyValues, pharmacyItems]
  );

  const onAddNewPharmacyRow = (event, row, value, column) => {
    row.sent_units = value
    // console.log('New Pharmacy', { event, row, value, column })

    if (value !== undefined && value !== '') {
      axios
        .post(`${BUY_API.SHIPMENT_DISTRIBUTION_ITEMS}/`, row)
        .then((response) => {
          dispatch(updateShipmentItem(response.data));
          enqueueSnackbar('Product has been updated successfully.');
          setReceiveUnit(response.data);
          setRemainingUnits(+response.data.received_units)
        })
        .catch((error) => {
          enqueueSnackbar('Oops something went wrong.', {
            variant: 'error',
          });
        });
    }

  }

  const newPharmacyColumns = useMemo(
    () => [
      {
        accessor: 'units',
        Header: translate("tabel_content.ordered"),
      },
      {
        accessor: 'sent_units',
        Header: translate("sent_units"),
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: (props) => <EditableCellSentUnits {...props} onSave={onAddNewPharmacyRow} />
      },
      {
        accessor: 'received_units',
        Header: translate("receive_units"),
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
      },
      {
        Header: translate("pending_units"),
        Cell({ row }) {
          const pendingUnits = +row.original.units - +row.original.sent_units;
          return +pendingUnits;
        },
      },
      {
        accessor: 'pharmacy_name',
        Header: translate("pharmacy_name"),
        width: 250,
      },
      {
        accessor: 'subtotal',
        Header: 'NETO',
        Cell({ row }) {
          // console.log("ROW", row.original)
          return fCurrency(row.original.subtotal);
        },
      },
      {
        accessor: 'discount_amount',
        Header: 'DTO',
        Cell({ row }) {
          return fCurrency(row.original.discount_amount);
        },
      },
      {
        accessor: 'tax_amount',
        Header: 'IVA',
        Cell({ row }) {
          return fCurrency(row.original.tax_amount);
        },
      },
      {
        accessor: 'recargo_amount',
        Header: 'Recargo',
        Cell({ row }) {
          return fCurrency(row.original.recargo_amount);
        },
      },
      {
        accessor: 'grand_total',
        Header: 'BRUTO',
        Cell({ row }) {
          return fCurrency(row.original.grand_total);
        },
      },
    ],
    [newItemPharmacies]
  );

  const handleDeleteProduct = (product) => {


    const formData = {
      sent_units: 0,
    };

    confirm({
      title: translate('confirm_action'),
      content: 'Do you really want to rest the distribution item?',
      dialogProps: { maxWidth: 'xs', fullWidth: false },
      confirmationText: translate('confirm'),
      cancellationText: translate('cancel'),
      confirmationButtonProps: { color: 'error', variant: 'contained', autoFocus: true },
      cancellationButtonProps: { color: 'inherit', variant: 'contained' },
      contentProps: { p: 0, pt: 3 },
    })
      .then(() => {
        axios
          .patch(`${BUY_API.SHIPMENT_ITEM_PHARMACIES}${product.shipment_item}/`, formData)
          .then((response) => {
            // dispatch(updateShipmentItem(response.data));
            const items = itemPharmacies.map((item) => {
              if (item.id === product.shipment_item) {
                return response.data;
              }
              return item;
            });

            prepareItemPharmacies(items);
            enqueueSnackbar('Distribution Item has been updated successfully.');
          })
          .catch((error) => {
            // console.log(error);
            if (error.sent_units) {
              enqueueSnackbar(error.sent_units[0], {
                variant: 'error',
              });
            }
            else {
              enqueueSnackbar('Oops something went wrong.', {
                variant: 'error',
              });
            }
          });
      })
      .catch(() => {
        // console.log('Cancelled the action');
      });

  };

  const openPharmaciesDistribution = (product, type) => {
    setLoadingItemPharmacies(true);
    if (product.received_units === product.units) {
      setCurrentSentItemValue(null)
      setOpenItemEntryModeDialog(true)
    }
    else {
      setOpenPharmacyDialog(true)
    }
    axios
      .get(BUY_API.SHIPMENT_ITEM_PHARMACIES, { params: { shipment_item: product.id } })
      .then((response) => {
        response.data.forEach(item => {
          item.current_item = 0; // Adding the current_item property with an empty string value
          item.pending_units = item.units - item.sent_units
        });
        setPharmacyItems(response.data)
        setItemEntryPharmacyValues(response.data)
        prepareItem(response.data)
        prepareItemPharmacies(response.data);

        const totalSentUnits = response.data.reduce((total, unit) => total + unit.sent_units, 0);

        if ((product.received_units === totalSentUnits)) {
          // console.log("Test");
          setOpenPharmacyDialog(true)
          setOpenItemEntryModeDialog(false)
        }

        setLoadingItemPharmacies(false);
      })
      .catch((error) => {
        setItemPharmacies([]);
        setLoadingItemPharmacies(false);
      });
  };

  const prepareItem = (row) => {
    axios
      .get(BUY_API.BUY_PARTICIPATED_PHARMACIES, { params: { buy: buyId } })
      .then((response) => {
        if (response.data.length > 0) {
          const pharmacyItemListData = []
          response.data.forEach(element => {
            pharmacyItemListData.push({
              pharmacy_name: element.name,
              pharmacy: element.id
            })
          });

          const filteredArray1 = pharmacyItemListData.filter(item1 =>
            !row.some(item2 => item1.pharmacy_name === item2.pharmacy_name)
          );


          const newData = row[0];
          const data = filteredArray1

          const keysToAdd = ['discount_percentage', 'pvl', 'recargo', 'shipment_item', 'tax', 'units',]; // Specify the keys you want to add

          const output = data.map(item => {
            const newItem = { ...item };
            keysToAdd.forEach(key => {
              newItem[key] = newData[key];
              newItem.sent_units = 0
              newItem.received_units = 0
              newItem._send_units = 0
            });

            return newItem;
          });

          setLoadingItemNewPharmacies(true)
          setAllPharmacyItem(output)
          prepareNewItemPharmacies(output)
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  }

  const prepareNewItemPharmacies = (rows) => {
    const items = rows.map((row) => {
      const subtotal = row.pvl * row.sent_units;
      const discountAmount = (row.discount_percentage * subtotal) / 100;
      const taxAmount = ((subtotal - discountAmount) * row.tax) / 100;
      const recargoAmount = ((subtotal - discountAmount) * row.recargo) / 100;
      const grandTotal = subtotal - discountAmount + taxAmount + recargoAmount;
      row.units = 0
      return {
        ...row,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        recargo_amount: recargoAmount,
        grand_total: grandTotal,
      };
    });
    setNewItemPharmacies(items);
  };

  const closePharmacyDialog = () => {

    if (itemPharmacies.reduce((total, item) => total + item.sent_units, 0) !== +selectedPharmacyDistribution?.received_units) {
      enqueueSnackbar('Send units are not completly filled.', {
        variant: 'error',
      });
      return;
    }
    setSelectedPharmacyDistribution(null);
    setOpenPharmacyDialog(false)
  };

  const closeItemEntryModeDialog = () => {

    if (itemPharmacies.reduce((total, item) => total + item.sent_units, 0) !== +selectedPharmacyDistribution?.received_units) {
      enqueueSnackbar('Send units are not completly filled.', {
        variant: 'error',
      });
      return;
    }
    setSelectedPharmacyDistribution(null);
    setOpenItemEntryModeDialog(false)
  };

  const handleCloseButtonClick = () => {
    setSelectedPharmacyDistribution(null);
    setOpenPharmacyDialog(false)
  }

  const updatePharmacyReceivingAndDistribution = () => {
    const totalReceiveUnitsByDistribution = pharmacyItems.reduce((total, item) => total + item.current_item, 0)

    if (totalReceiveUnitsByDistribution > 0) {
      pharmacyItems.forEach(shipmentObject => {

        const formData = {
          received_units: shipmentObject.received_units,
          sent_units: shipmentObject.current_item + shipmentObject.sent_units
        };

        axios
          .patch(`${BUY_API.SHIPMENT_ITEM_PHARMACIES}${shipmentObject.id}/`, formData)
          .then((response) => {
            const items = pharmacyItems.map((item) => {
              if (item.id === shipmentObject.id) {
                return response.data;
              }
              return item;
            });
            setCloseDialogBox(true);
            setItemEntryPharmacyValues(items);
            onUpdateShipmentRow(+shipmentObject?.shipment_item)
            enqueueSnackbar('Item has been updated successfully.');
          })
          .catch((error) => {
            if (error.sent_units) {
              enqueueSnackbar(error.sent_units[0], {
                variant: 'error',
              });
            }
            else {
              enqueueSnackbar('Oops something went wrong.', {
                variant: 'error',
              });
            }
          });
      })
    }
  }

  const handleCloseItemEntryModeButtonClick = () => {
    updatePharmacyReceivingAndDistribution()
    setSelectedPharmacyDistribution(null);
    setOpenItemEntryModeDialog(false)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.includes('@')) {
      setSearch("")
    }
    else {
      setSearch(e.target.value);
    }
  }


/*  const searchItems = () => {
    const items = shipmentItems.filter(
      (row) =>
        row.ean.includes(search) ||
        row.cn.includes(search) ||
        row.product_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(items);
  };
 */

  const searchItems = () => {
    const items = shipmentItems.filter((row) => {
      // Check if 'row.ean' is not null/undefined and includes 'search'
      const eanMatch = row.ean ? row.ean.includes(search) : false;

      // Check if 'row.cn' is not null/undefined and includes 'search'
      const cnMatch = row.cn ? row.cn.includes(search) : false;

      // Check if 'row.product_name' is not null/undefined and includes 'search'
      // Also safely handle the case where 'row.product_name' needs to be case-insensitive
      const productNameMatch = row.product_name
          ? row.product_name.toLowerCase().includes(search.toLowerCase())
          : false;

      return eanMatch || cnMatch || productNameMatch;
    });

    setFilteredItems(items);
  };

  const prepareItemPharmacies = (rows) => {
    const items = rows.map((row) => {
      const total = row.pvl * row.sent_units;
      const discountAmount = (row.discount_percentage * total) / 100;
      const taxAmount = ((total - discountAmount) * row.tax) / 100;
      const recargoAmount = ((total - discountAmount) * row.recargo) / 100;
      const subtotal = (row.pvl * row.sent_units) - discountAmount;
      const grandTotal = subtotal - discountAmount + taxAmount + recargoAmount;
      return {
        ...row,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        recargo_amount: recargoAmount,
        grand_total: grandTotal,
      };
    });

    setItemPharmacies(items);
  };

  useEffect(() => {
    setEntryMode(shipment?.mode_type)
    searchItems();
  }, [shipmentItems, search]);


  function handleFindObject(data, inputValue) {

    const result = [];
    const dataSortedByHighest = [...data].sort((a, b) => b.pending_units - a.pending_units);
    let remainingUnits = inputValue

    const dataObject = dataSortedByHighest.find(item => item.pending_units === remainingUnits)
    if (dataObject) {
      result.push({ item: dataObject, unitsCount: remainingUnits })
    } else {
      dataSortedByHighest.forEach(item => {
        const itemRemainingUnits = item.units - item.sent_units

        if (!remainingUnits) {
          return
        }

        if (item.units) {
          let unitsCount = 0

          if (itemRemainingUnits <= remainingUnits) {
            unitsCount = itemRemainingUnits
          } else {
            unitsCount = remainingUnits
          }

          remainingUnits -= unitsCount

          if (unitsCount) {
            // unitsCount += item.sent_units
            result.push({ item, unitsCount })
          }

        }
      })
    }

    // console.log("result", { result })

    return result

  }


  function handleFindObject2(data, inputValue) {

    const result = [];
    const dataSortedByHighest = [...data].sort((a, b) => b.pending_units - a.pending_units);
    // console.log({ dataSortedByHighest })
    let remainingUnits = inputValue

    const dataObject = dataSortedByHighest.find(item => item.pending_units === remainingUnits)

    if (dataObject) {
      result.push({ item: dataObject, unitsCount: remainingUnits })
    } else {

      dataSortedByHighest.forEach(item => {
        const itemRemainingUnits = item.units - item.current_item

        if (!remainingUnits) {
          return
        }

        if (item.units) {
          let unitsCount = 0

          if (itemRemainingUnits <= remainingUnits) {
            unitsCount = itemRemainingUnits
          } else {
            unitsCount = remainingUnits
          }

          remainingUnits -= unitsCount

          if (unitsCount) {
            unitsCount += item.current_item
            result.push({ item, unitsCount })
          }

        }
      })
    }

    // console.log("result", { result })
    return result

  }

  const handleItemEntryUnits = (e) => {
    if (e.target.value !== '') {
      const calculateSentUnit = pharmacyItems.reduce((total, item) => total + item.sent_units, 0)
      let result = [];

      result = handleFindObject2(pharmacyItems, +e.target.value);
      if (calculateSentUnit > 0) {
        result = handleFindObject(pharmacyItems, +e.target.value);
      }

      const updatedItems = pharmacyItems.map(item => {
        const correspondingResult = result.find(resultItem => resultItem.item.id === item.id);

        if (correspondingResult) {
          return { ...item, current_item: correspondingResult.unitsCount, pending_units: item.pending_units - correspondingResult.unitsCount };
        }

        return item;
      });

      setNewCurrentItem(updatedItems.reduce((total, item) => total + item.current_item, 0))

      setPharmacyItems(updatedItems);

      // Set focus back to the sent input box
      sentInputRef.current.focus();
      e.target.value = '';
    }

  }


  const onGenerateReport = () => {
    serPhReport(true);
    axios({
      method: 'get',
      url: BUY_API.SHIPMENT_REPORT, params: { ship_id: shipment.id},
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        fileDownload(response.data, "Shipment_report.pdf");
        enqueueSnackbar('Shipment Report Downloaded.');
        serPhReport(false);
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }


  const toggleShowContent = useCallback(() => {
    setShowContent(v => !v)
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} sx={{ mt: 3 }}>
        <Card sx={{ pb: 1 }}>
          <StyledCardHeader
            action={
              <>
                <Typography variant="h5" align="right">
                  {translate("shipment.shipment_mode")}
                </Typography>
                <TextField
                  value={search}
                  onChange={handleSearchChange}
                  size="small"
                  autoComplete="off"
                  placeholder="Search EAN, CN, Name"
                />
                <LoadingButton size="large"
                  startIcon={<Iconify icon={'mdi:file-pdf'} />}
                  onClick={onGenerateReport}
                  loading={phReport}
                >
                  {translate('shipment_report')}
                </LoadingButton>
              </>
            }
          />

          {shipment?.mode_type !== "ITEM ENTRY" ? (<CardContent sx={{ p: 1 }}>
            {filteredItems.length ? (<Styles>
              <Table
                loading={loadingItems}
                columns={columns}
                data={filteredItems} />
            </Styles>)
              : (
                <Loader />
              )}
          </CardContent>) :
            (<CardContent sx={{ p: 1 }}>
              {filteredItems.length ? (<Styles>
                <Table
                  loading={loadingItems}
                  columns={ItemEntryColumns}
                  data={filteredItems} />
              </Styles>)
                : (
                  <Loader />
                )}
            </CardContent>)}

          <Dialog open={openPharmacyDialog} onClose={closePharmacyDialog} maxWidth="lg" fullWidth>
            <DropDownCloseButton onClick={handleCloseButtonClick}>X</DropDownCloseButton>
            {!loadingItemPharmacies ? (
              <DialogContent>
                {!!itemPharmacies.length && (<DialogTitle>
                  <Typography variant="h3" align="center">
                    {selectedPharmacyDistribution?.product_name}
                  </Typography>
                  <Typography variant="h5" align="right">
                    {translate("remaining_units")}: {remainingSentUnits}
                  </Typography>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Iconify icon={showContent ? 'formkit:eyeclosed' : 'ph:eye'} />}
                    onClick={toggleShowContent}
                  >
                    {showContent ? translate('hide') : translate('show')}
                  </LoadingButton>
                </DialogTitle>
                )}

                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item md={12}>
                    {!!itemPharmacies.length && (
                      <>
                        <PharmacyStyles shipmentObjectIndex={shipmentObjectIndex}>
                          <Table
                            loading={loadingItemPharmacies}
                            columns={pharmacyColumns}
                            data={itemPharmacies} />
                        </PharmacyStyles>
                      </>
                    )}

                    {showContent && (

                      <PharmacyStyles shipmentObjectIndex={shipmentObjectIndex}>
                        {loadingItemNewPharmacies ? (
                          <Table
                            loading={loadingItemNewPharmacies}
                            columns={newPharmacyColumns}
                            data={newItemPharmacies}
                          />
                        ) : (
                          <Loader />
                        )}
                      </PharmacyStyles>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
            ) : (
              <Loader />
            )}
          </Dialog>


          {/* Sent units */}
          <Dialog open={openItemEntryModeDialog} onClose={handleCloseItemEntryModeButtonClick} maxWidth="lg" fullWidth>
            <DropDownCloseButton onClick={handleCloseItemEntryModeButtonClick}>X</DropDownCloseButton>
            {!loadingItemPharmacies ? (
              <DialogContent>
                {!!itemPharmacies.length && (<DialogTitle>
                  <Typography variant="h3" align="center">
                    {selectedPharmacyDistribution?.product_name}
                  </Typography>
                  <Typography variant="h5" align="right">
                    {translate("total_receiving")}: {remainingSentUnits}
                  </Typography>
                  <Typography variant="h5" sx={{
                    left: "3%",
                    position: "absolute",
                    height: "50%"
                  }}>
                    Distribuir : <input type='text' style={{
                      height: "20%",
                      width: "30%",
                      lineHeight: "1.4375em",
                      fontSize: "20px",
                      fontFamily: "Public Sans,sans-serif",
                      fontWeight: "400",
                      color: "#000",
                      boxSizing: "border-box",
                      position: "relative",
                      cursor: "text",
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "8px",
                      boxShadow: "0 0 2px 0 rgb(127 229 44 / 20%), 0 12px 24px -4px rgb(27 205 31 / 12%)",
                      padding: "6px",
                      border: "1px solid #29ef1f !important",
                      textAlign: "center",
                      backgroundColor: "lightyellow"
                    }}
                      ref={sentInputRef}
                      onBlur={handleItemEntryUnits}
                    />
                  </Typography>
                </DialogTitle>
                )}

                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item md={12}>
                    {!!itemEntryPharmacyValues.length && (
                      <>
                        <PharmacyStyles>
                          <Table
                            loading={loadingItemPharmacies}
                            columns={ItemEntryFillColumns}
                            data={pharmacyItems} />
                        </PharmacyStyles>
                      </>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
            ) : (
              <Loader />
            )}
          </Dialog>
        </Card>
      </Grid>
      <Grid item xs={12} style={{
        "display": "flex",
        "justifyContent": "space-between",
        "alignItems": "stretch"
      }}>
        <OrderPharmacyInfo editOrder={user} />
        <ShipmentSummary editShipment={shipmentItems} title={translate("shipment_summary")} />
      </Grid>
    </Grid>
  );
}
