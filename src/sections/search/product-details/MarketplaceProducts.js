import PropTypes from 'prop-types';
// @mui
import { Box, Link, Typography, Stack } from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { fDate } from '../../../utils/formatTime';

//
import Image from '../../../components/Image';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------
MarketplaceProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      product_name: PropTypes.string,
      small_image: PropTypes.string,
      seller: PropTypes.shape({
        name: PropTypes.string,
        marketplace: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    })
  ),
};
export default function MarketplaceProducts({ products }) {
  const { translate } = useLocales();
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ m: 2 }}>
        {translate('Marketplaces_Products')}
      </Typography>
      {products && (
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

ProductItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    product_name: PropTypes.string,
    small_image: PropTypes.string,
    sale_price: PropTypes.string,
    process_modification_date: PropTypes.string,
    seller: PropTypes.shape({
      name: PropTypes.string,
      marketplace: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
};

function ProductItem({ product }) {
  return (
    <Stack direction="row" spacing={2}>
      <Image alt={product.product_name} src={product.small_image} sx={{ width: 48, height: 48, borderRadius: 1.5 }} />

      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <Link target="_blank" href={product.product_url} sx={{ color: 'text.primary', typography: 'subtitle2' }}>
          {product.product_name}
        </Link>
        <Stack direction="row">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {product.seller.name} ({product.seller.marketplace.name})
          </Typography>
          &nbsp;
          <Typography variant="body2" sx={{ color: product.sale_price ? 'error.main' : 'text.secondary' }}>
            {fCurrency(product.sale_price)}
          </Typography>
        </Stack>
      </Box>
      <Typography variant="body2" pr={8} sx={{ color: 'text.secondary' }}>
        {fCurrency(product.pvr_price)}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {fDate(product.process_modification_date)}
      </Typography>
    </Stack>
  );
}
