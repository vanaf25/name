import { useEffect, useState } from 'react';

// mui
import Container from '@mui/material/Container';
import axios from 'axios';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Utils

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { AnalyticTable } from '../../sections/reports';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getGroups } from '../../redux/slices/buy';
import { REPORT_API } from '../../constants/ApiPaths';

import { HOST_API } from '../../config';

axios.defaults.baseURL = HOST_API;
axios.defaults.headers.common.Authorization = `Token ${localStorage.getItem('solosoeAccessToken')}`;

export default function PurchasingReprt() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { user, currentPharmacy } = useAuth();
  const dispatch = useDispatch();
  const { groups, isGroupsLoading } = useSelector((state) => state.buy);
  const [receivedShipment, setReceivedShipment] = useState({});
  const [sentShipment, setSentShipment] = useState({});
  const [shipmentAnalytics, setShipmentAnalytics] = useState({});
  const [groupPharmacies, setGroupPharmacies] = useState([]);
  const [pharmaciesAnalysis, setPharmaciesAnalysis] = useState({});
  const [isReportDataLoading, setIsReportDataLoading] = useState(true);


  useEffect(async () => {
    if (groups.length) {
      // Load the sent shipments
      axios
      .get(REPORT_API.REPORT_ITEM, { params: { group: groups[0].id } })
      .then((response) => {
        setShipmentAnalytics(response.data.data);
        setIsReportDataLoading(false)
      })
      .catch((error) => {
        // console.log(error);
      });
    }
  }, [groups]);

  useEffect(() => {
    // console.log('pharmaciesAnalysis: ', pharmaciesAnalysis);
  }, [pharmaciesAnalysis]);
  useEffect(() => {
    dispatch(getGroups());
  }, []);

  return (
    <Page title="Purchasing Report">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={translate('reports.purchasing_report_heading')}
          links={[{ name: translate('reports.purchasing_report_subheading') }]}
        />
      </Container>
      <AnalyticTable isGroupsLoading={isReportDataLoading} rows={shipmentAnalytics} pharmacies={groupPharmacies} />
    </Page>
  );
}
