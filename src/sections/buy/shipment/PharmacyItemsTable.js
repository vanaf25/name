import styled from 'styled-components';
import React, {useState, useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router';
import { useSnackbar } from 'notistack';

import { Card, Grid, Box, Typography, CardHeader, CardContent, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useConfirm } from 'material-ui-confirm';
import { TextEditor } from 'react-data-grid';
import fileDownload from 'js-file-download';

// Components
import CustomDataGrid from '../../../components/CustomDataGrid';

import Loader from '../../../components/Loader';
import Iconify from '../../../components/Iconify';

// utils
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import { fDate } from '../../../utils/formatTime';
import useLocales from '../../../hooks/useLocales';
import axios from '../../../utils/axios';
import { BUY_API } from '../../../constants/ApiPaths';

// Redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getPharmacyItems, updatePharmacyItem } from '../../../redux/slices/shipment';
import Table from '../../../components/table/Table';
import useAuth from '../../../hooks/useAuth';

PharmacyItemsTable.propTypes = {
  shipment: PropTypes.object,
};


const Styles = styled.div`
height: calc(100vh - 562px);
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
&:last-child{
  height: 100vh;
}
`

const StyledInput1 = styled.input`
width: 41px;
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
width: 100%;
// position: relative;
border-radius: 8px;
box-shadow: 0 0 2px 0 rgb(145 158 171 / 20%), 0 12px 24px -4px rgb(145 158 171 / 12%);
width: 40px;
padding: 6px;
border: 1px solid transparent !important;
text-align: center;
position: absolute;
top: 0;
right: 0;
width: 50%;
height: 100%;
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

export default function PharmacyItemsTable({ shipment }) {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { user, currentPharmacy } = useAuth();
  const { id = '' } = useParams();
  const { pharmacyItems, loadingPharmacyItems } = useSelector((state) => state.shipment);

  const { pathname, state } = useLocation();



  // States
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemPharmacies, setItemPharmacies] = useState([]);
  const [phReport, serPhReport] = useState(false);
  const [selectedRowIndex,setSelectedRowIndex]=useState(-1);
  useEffect(()=>{
      console.log('selectedRowIndex:',selectedRowIndex);
  },[selectedRowIndex]);
  useEffect(() => {
    return () => {
      axios
        .get(`api/buy/buy_action_rebuild/?buy_id=${state?.buyId}&pharmacy_id=${state?.pharmacyId}`)
        .then((response) => {
          // console.log(response.data);
        })
        .catch((error) => {
          // console.log(error);
        });
    };
  }, []);

  const onUpdateRow = (event, row, value, column) => {
    event.stopPropagation();
      console.log('e.target:',event.relatedTarget);
      if ( !event.relatedTarget?.name?.includes("select")){
          setSelectedRowIndex(-1)
      }
    // console.log('onUpdateRow', event);
    const formData = {
      received_units: +value,
    };

    axios
      .patch(`${BUY_API.SHIPMENT_PHARMACY_ITEMS}${row.id}/`, formData)
      .then((response) => {
        // console.log(response);
        // prepareItemPharmacies(items);
        dispatch(updatePharmacyItem(response.data));
        enqueueSnackbar('Item has been updated successfully.');
        if (selectedRowIndex!==null){
            console.log('selectedRowIndex:',selectedRowIndex);
            console.log( 'elms:',document.getElementsByName(`select${selectedRowIndex}`))
        }
      })
      .catch((error) => {
        // console.log(error);
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  };
  const EditableCell = ({
    row,
    column
  }) => {
    const receiveUnits = +row.original.received_units;
    const sentUnits = +row.original.sent_units;
    const [value, setValue] = useState(receiveUnits);
    const [bg, setBg] = useState({});
      const inputRef = useRef(null);
      const handleKeyDown = (e, row, column) => {
          console.log('event key in hanlde keyDown:',e.key);
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key==="Tab") {
              e.preventDefault();
              if (e.key === 'ArrowUp' && row.index>0) {
                  setSelectedRowIndex(row.index-1);
                  document.getElementsByName(`select${row.index - 1}`)[0].focus(); // Decrement row index for ArrowUp
              } else if (e.key === 'ArrowDown' || e.key==="Tab") {
                  console.log('row:',row);
                  console.log('rowIndex:',row.index);
                  setSelectedRowIndex(row.index+1)
                  console.log(document.getElementsByName(`select${row.index + 1}`))
                  document.getElementsByName(`select${row.index + 1}`)[0].focus();  // Increment row index for ArrowDown
              }

          }
      };


    let StartingBgColor = {
      color: 'brown',
      bgColor: 'lightyellow',
      borderColor: 'brown',
      fontSize: "17px",
    }

    const SuccessBgColor = {
      color: 'green',
      backgroundColor: '#aae9aa',
      borderColor: '#aae9aa',
      fontSize: "17px",
    }

  if (sentUnits !== receiveUnits) {
      StartingBgColor = {
          color: 'white',
          backgroundColor: '#d21a09',
          borderColor: 'red',
          fontSize: "17px",
      }
  }
      useEffect(() => {
          const dynamicBg = value < sentUnits ? { ...SuccessBgColor, backgroundColor: '#d21a09' } : SuccessBgColor;
          setBg(receiveUnits !== 0 ? dynamicBg : StartingBgColor)
      }, [value])
      const handleWheel = (e) => {
          e.preventDefault();
      };
      const handleFocus = (event,index) =>{
          event.target.select()
          setSelectedRowIndex(index);
          event.target.focus()
          document.getElementsByName(`select${index}`)[0].focus();
      }

      useEffect(() => {
          const inputElement = inputRef.current;
          if (inputElement) {
              inputElement.addEventListener('wheel', handleWheel, { passive: false });

              return () => {
                  inputElement.removeEventListener('wheel', handleWheel);
              };
          }
      }, []);
      const handleKeyUp = (e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key==="Tab") {
              e.preventDefault();
          }
      };
    return <div style={{
      display: "flex",
      gap: "2px",
      fontSize: "17px",
      fontWeight: "600",
      margin: "-6px",
      height: "36px",
      flexDirection: "row-reverse"
    }}>
      <StyledOKButton onClick={(event) => onUpdateRow(event, row.original, sentUnits, column)} style={{
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
        pointerEvents: row.original.sent_units > 0 ? "all" : "none"
      }
      }>OK</StyledOKButton>
      <StyledInput1
          ref={inputRef}
            type='number'
          name={`select${row.index}`}
        defaultValue={receiveUnits > 0 ? receiveUnits : value}
        onBlur={(event) => onUpdateRow(event, row.original, value, column)}
          onFocus={e=>handleFocus(e,row.index)}
          autoFocus={row.index===selectedRowIndex}
          onKeyUp={e=>handleKeyUp(e)}
          onKeyDown={e=>handleKeyDown(e,row,column)}
            onChange={(e) => {
          setValue(+e.target.value);
        }}
        style={bg}
      />
    </div>
  }

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
        accessor: 'sent_units',
        Header: "Sent",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell: ({ value }) => (
            <div style={{
              fontWeight: 'bold',
              color: value !== 0 ? '#088806' : '#fdfdfd',
            }}>
              {value}
            </div>
        ),
      },
      {
        accessor: 'received_units',
        Header: translate("tabel_content.received_units"),
        width: 20,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell: EditableCell
      },
      {
        Header: translate("tabel_content.pending_units"),
        width: 20,
        editor: TextEditor,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return +row.original.units - +row.original.received_units
        }
      },
      {
        accessor: 'name',
        Header: "Product",
        width: 50,
        editorOptions: {
          editOnClick: true,
        },
        Cell({ row }) {
          return (
            <Box sx={{ marginTop: '0px' }}>
              <Typography variant="subtitle2"> {row.original.shipment_item.product_name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                EAN: {row.original.shipment_item.ean} CN: {row.original.shipment_item.cn}
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
        Cell({ row }) {
          return fCurrency(+row.original.shipment_item.pvl);
        },
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
        Cell({ row }) {
          return fPercent(row.original.shipment_item.discount_percentage);
        },
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
          return (
              <div style={{
                fontWeight: 'bold', // Make the text bold
                backgroundColor: '#f0f0f0', // Set the background to light grey
                width: '100%', // Ensure the styling covers the cell width
                height: '100%', // Ensure the styling covers the cell height
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0', // Remove padding to fill the cell
                margin: '0', // Ensure there's no margin affecting the cell filling
              }}>
                {fCurrency(row.original.subtotal - row.original.discount_amount)}
              </div>
          );
        },
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
          return (
              <div style={{
                fontWeight: 'bold', // Make the text bold
                backgroundColor: '#f0f0f0', // Set the background to light grey
                width: '100%', // Ensure the styling covers the cell width
                height: '100%', // Ensure the styling covers the cell height
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0', // Remove padding to fill the cell
                margin: '0', // Ensure there's no margin affecting the cell filling
              }}>
                {fCurrency(row.original.grand_total)}
              </div>
          );
        },
      }
    ],
    [filteredItems]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.includes('@')) {
      setSearch("")
    }
    else {
      setSearch(e.target.value);
    }
  }


  // const searchItems = () => {
  //   const items = pharmacyItems.filter(
  //     (row) =>
  //       (row.shipment_item.ean.includes(search) ||
  //         row.shipment_item.cn.includes(search) ||
  //         row.shipment_item.product_name.toLowerCase().includes(search.toLowerCase())) ||
  //       row.sent_units > 0
  //   );
  //   if (items.length > 0) {
  //     setFilteredItems(items);
  //   }
  //   else {
  //     setFilteredItems(pharmacyItems);
  //   }
  // };

  const searchItems = () => {
    const items = pharmacyItems.filter(row => {
      const { ean, cn, product_name: productName } = row.shipment_item || {};
      const searchLower = search.toLowerCase();

      return (
          ean?.includes(search) ||
          cn?.includes(search) ||
          productName?.toLowerCase().includes(searchLower) && // Using the renamed variable
          row.sent_units > 0
      );
    });

    if (items.length > 0) {
      setFilteredItems(items);
    } else {
      setFilteredItems(pharmacyItems);
    }
  };

  const onGenerateReport = () => {
    serPhReport(true);
    axios({
      method: 'get',
      url: BUY_API.PHARMACY_REPORT, params: { ship_id: id, phar_id: currentPharmacy.id },
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        fileDownload(response.data, "Pharmacy_report.pdf");
        enqueueSnackbar('Pharmacy Report Downloaded.');
        serPhReport(false);
      })
      .catch((error) => {
        enqueueSnackbar('Oops something went wrong.', {
          variant: 'error',
        });
      });
  }

  useEffect(() => {
    dispatch(getPharmacyItems({ shipment_item__shipment: id, pharmacy: currentPharmacy.id }));
  }, [id, currentPharmacy])

  useEffect(() => {
    searchItems();
  }, [pharmacyItems, search]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} sx={{ mt: 3 }}>
        <Card sx={{ pb: 1 }}>
          <CardHeader
            action={
              <>
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
                {translate('pharmacy_report')}
              </LoadingButton>
              </>
            }
          />
          <CardContent sx={{ p: 1 }}>
            {filteredItems.length ? (<Styles>
              <Table
                loading={loadingPharmacyItems}
                columns={columns}
                data={filteredItems} />
            </Styles>)
              : (
                <Loader />
              )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
