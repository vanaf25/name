// https://github.com/adazzle/react-data-grid
import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
// import { DataGrid } from '@mui/x-data-grid';
import DataGrid from 'react-data-grid';
import Loader from './Loader';

const DataGridStyle = styled('div')(({ theme }) => ({
  "& div[role='columnheader']": {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.neutral,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    border: 0,
    padding: theme.spacing(2),
  },
  "& div[role='columnheader']:first-of-type": {
    paddingLeft: theme.spacing(3),
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    boxShadow: 'rgb(255, 255, 255) 8px 0px 0px inset',
  },
  "& div[role='columnheader']:last-of-type": {
    paddingRight: theme.spacing(3),
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    boxShadow: 'rgb(255, 255, 255) -8px 0px 0px inset',
  },
  "& div[role='grid']": {
    borderRadius: theme.shape.borderRadius,
    border: 0,
  },

  "& div[role='row']": { lineHeight: '25px' },
  "& div[role='gridcell']": {
    border: 0,
    padding: theme.spacing(2),
  },

  "& div[role='gridcell']:first-of-type": {
    paddingLeft: theme.spacing(3),
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    boxShadow: 'rgb(255, 255, 255) 8px 0px 0px inset',
  },
  "& div[role='gridcell']:last-of-type": {
    paddingRight: theme.spacing(3),
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    boxShadow: 'rgb(255, 255, 255) -8px 0px 0px inset',
  },

  "& div[role='gridcell'][aria-selected=true]:not([aria-readonly=true])": {
    // border: '2px solid #00AB55',
    // outline: 'none',
    // borderRadius: theme.shape.borderRadius,
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    // borderTopLeftRadius: theme.shape.borderRadius,
    // borderBottomLeftRadius: theme.shape.borderRadius,
    // padding: '10px 14px',
  },
  "& div[role='gridcell'][aria-selected=true]:not([aria-readonly=true]) input": {
    border: '2px solid #00AB55',
    borderRadius: theme.shape.borderRadius,
    padding: '12px 10px',
    width: '55px',
  },
  "& .subrow div[role='gridcell'][aria-selected=true]:not([aria-readonly=true]) input": {
    marginTop: '-10px',
  },
  "& div[role='gridcell'][aria-selected=true][aria-readonly=true]": {
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
  },
  "& div[role='columnheader'][aria-selected=true]": {
    outline: 'none',
  },
  '& .subrow': {
    padding: '0 !important',
    backgroundColor: '#f5f5f5',
  },
  "& .subrow div[role='row']": {
    lineHeight: '4px',
  },
}));

export default function CustomDataGrid({ loading, sx, ...others }) {
  return (
    <DataGridStyle sx={{ ...sx }}>
      {!loading && <DataGrid className="rdg-light" {...others} />}
      {loading && (
        <>
          <Loader />
        </>
      )}
    </DataGridStyle>
  );
}
