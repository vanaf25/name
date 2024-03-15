// @mui
import { Stack, Button, Typography } from '@mui/material';
import useLocales from '../../../hooks/useLocales';
// assets
import { DocIllustration } from '../../../assets';

// ----------------------------------------------------------------------

export default function NavbarDocs() {
  const { translate } = useLocales();
  return (
    <Stack spacing={3} sx={{ px: 5, pb: 5, mt: 10, width: 1, textAlign: 'center', display: 'block' }}>
      <DocIllustration sx={{ width: 1 }} />

      <div>
        <Typography gutterBottom variant="subtitle1">
          {translate("Hi_Rayan_Moran")}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate("Need_help")}
          <br /> {translate("Please_check_our_docs")}
        </Typography>
      </div>

      <Button variant="contained">{translate("Documentation")}</Button>
    </Stack>
  );
}
