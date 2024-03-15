// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import PharmacyForm from '../../sections/pharmacy/PharmacyForm';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function Edit() {
  const { themeStretch } = useSettings();
  const { user } = useAuth();
  const { translate } = useLocales();
  let currentPharmacy = user.pharmacy_detail;
  const isEdit = !!user.pharmacy_detail.id;
  if (currentPharmacy && user.parapharmacy_detail) {
    currentPharmacy = {
      ...currentPharmacy,
      para_id: user.parapharmacy_detail.id,
      parent_pharmacy: user.pharmacy_detail.id,
      para_name: user.parapharmacy_detail.name,
      para_nif: user.parapharmacy_detail.nif,
      para_email: user.parapharmacy_detail.email,
      para_website: user.parapharmacy_detail.website,
      para_telephone: user.parapharmacy_detail.telephone,
      para_type_of_road: user.parapharmacy_detail.type_of_road,
      para_address: user.parapharmacy_detail.address,
      para_street_number: user.parapharmacy_detail.street_number,
      para_postal_code: user.parapharmacy_detail.postal_code,
      para_city: user.parapharmacy_detail.city,
      para_state: user.parapharmacy_detail.state,
      para_province: user.parapharmacy_detail.province,
      para_latitude: user.parapharmacy_detail.latitude,
      para_longitude: user.parapharmacy_detail.longitude,
      para_formatted_address: user.parapharmacy_detail.formatted_address,
    };
  }

  return (
    <Page title="Edit Pharmacy">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={translate('pharmacy_register.heading')}
          links={[{ name: translate('pharmacy_register.edit_pharmacy') }]}
        />
        <PharmacyForm isEdit={isEdit} currentPharmacy={currentPharmacy} />
      </Container>
    </Page>
  );
}
