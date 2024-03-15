import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Typography, Card, Accordion, AccordionDetails } from '@mui/material';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

// utils
import { fShortenNumber, fCurrency } from '../../../utils/formatNumber';
// components
import useLocales from '../../../hooks/useLocales';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from '../../../routes/paths';
import Markdown from '../../../components/Markdown';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up(1368)]: {
    padding: theme.spacing(3, 5),
  },
}));

// ----------------------------------------------------------------------

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: `${theme.spacing(1)} !important`,
  },
}));

ProductDetailsSummary.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    product_name: PropTypes.string,
    no_of_shops: PropTypes.number,
    min_sale_price: PropTypes.string,
    max_sale_price: PropTypes.string,
  }),
  marketplacesProduct: PropTypes.array,
  competitvePrice: PropTypes.number,
};

export default function ProductDetailsSummary({ product, competitvePrice, marketplacesProduct, ...other }) {
  const { translate } = useLocales();

  return (
    <RootStyle {...other}>
      <Stack padding={'10px 20px 0px'} borderRadius={'10px'} direction="row" alignItems="center" justifyContent="space-between" backgroundColor={'#75c5ff'} sx={{ my: 3 }}>
        <Box>
          <Typography textAlign={'center'} variant="h5" gutterBottom sx={{ color: 'common.white' }}>
            {product.cn_dot_7}
          </Typography>
          <Typography textAlign={'center'} variant="subtitle1" gutterBottom>
            {translate('CN')}
          </Typography>
        </Box>
        <Box>
          <Typography textAlign={'center'} variant="h5" gutterBottom sx={{ color: 'common.white' }}>
            {product.ean}
          </Typography>
          <Typography textAlign={'center'} variant="subtitle1" gutterBottom>
            {translate('EAN')}
          </Typography>
        </Box>
        <Box>
          <Typography textAlign={'center'} variant="h5" gutterBottom sx={{ color: 'common.white' }}>
            {product.product_name}
          </Typography>
          <Typography textAlign={'center'} variant="subtitle1" gutterBottom>
            {translate('Product_name')}
          </Typography>
        </Box>
      </Stack>
      <HeaderBreadcrumbs
        links={[{ name: 'Search', href: PATH_DASHBOARD.root }, { name: `Product-${product.mst_prd_id}` }]}
      />
      <Card sx={{ mt: 3 }}>
        <Accordion>
          <AccordionSummary
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography textTransform={'capitalize'} >{translate('product_detail.description')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 3 }}>
              <Markdown children={product.product_description} />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Card>
      <Box mt={2} p={2}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
          {translate('product_detail.no_of_shops')} : {fShortenNumber(product.no_of_shops)}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
          {translate('product_detail.price_range')} : {fCurrency(product.min_sale_price)} - {fCurrency(product.max_sale_price)}
        </Typography>
        <Stack direction="row" alignItems="center" flexWrap={'wrap'} gap={3} sx={{ my: 3 }}>
          {product.master_details?.map((item, index) => {
            return (
              <Box backgroundColor={index % 2 !== 0 ? '#929cac' : '#75c5ff'} borderRadius={2} px={2} py={1}>
                <Typography textAlign={'center'} variant="h6" gutterBottom sx={{ color: 'common.white' }}>
                  {`${item?.no_of_shops} ${item?.marketplace}`}
                </Typography>
                <Typography textAlign={'center'} variant="subtitle1" gutterBottom sx={{ color: 'common.white' }}>
                  {fCurrency(item.min_price)} - {fCurrency(item.max_price)}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </RootStyle>
  );
}
