import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// mui
import Container from '@mui/material/Container';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// Utils
import axios from '../../utils/axios';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { PharmacyAnalyticTable } from '../../sections/reports';

// Redux
import { useSelector, useDispatch } from '../../redux/store';
import { getGroups } from '../../redux/slices/buy';
import { REPORT_API, PHARMACY_API, BUY_API } from '../../constants/ApiPaths';

export default function PurchasingReprt() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { pharmacyId = '' } = useParams();
  const [receivedShipment, setReceivedShipment] = useState([]);
  const [sentShipment, setSentShipment] = useState([]);
  const [shipmentAnalytics, setShipmentAnalytics] = useState({});
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [pharmacyDetail, setPharmacyDetail] = useState({});
  const [purchaseOrder, setPurchaseOrder] = useState({})
  const [purchaseOrderForMyPharmacy, setPurchaseOrderForMyPharmacy] = useState({});
  const [purchaseReportData, setPurchaseReportData] = useState([]);

  useEffect(() => {
    const pharmaciesList = { sent: {}, received: {} };

    sentShipment.forEach((row) => {
      const listKey = `${row.buy_detail.id}-${row.pharmacy_detail.id}`;
      if (pharmaciesList.sent[listKey] === undefined) {
        pharmaciesList.sent[listKey] = { sent_order: 0, shipments: [], pharmacy: {}, buy: {} };
      }
      pharmaciesList.sent[listKey] = {
        ...pharmaciesList.sent[listKey],
        pharmacy: row.pharmacy_detail,
        buy: row.buy_detail,
        sent_order: pharmaciesList.sent[listKey].sent_order + row.grand_total,
      };
      pharmaciesList.sent[listKey].shipments.push(row.shipment_detail.id);
    });

    receivedShipment.forEach((row) => {
      const listKey = `${row.buy_detail.id}-${row.cordinate_pharmacy.id}`;
      if (pharmaciesList.received[listKey] === undefined) {
        pharmaciesList.received[listKey] = { received_order: 0, shipments: [], pharmacy: {}, buy: {} };
      }
      pharmaciesList.received[listKey] = {
        ...pharmaciesList.received[listKey],
        pharmacy: row.cordinate_pharmacy,
        buy: row.buy_detail,
        received_order: pharmaciesList.received[listKey].received_order + row.grand_total,
      };
      pharmaciesList.received[listKey].shipments.push(row.shipment_detail.id);
    });

    // console.log(pharmaciesList);
    setShipmentAnalytics(pharmaciesList);
  }, [receivedShipment, sentShipment]);

  useEffect(() => {
    // Load the pharmacy detail
    setIsReportsLoading(true)
    axios
      .get(`${PHARMACY_API.GET_PHARMACY}${pharmacyId}/`)
      .then((response) => {
        setIsReportsLoading(false)
        // console.log(response);
        setPharmacyDetail(response.data);
      })
      .catch((error) => {
        setIsReportsLoading(false)
        // console.log(error);
      });

    // Load received shipments
    axios
      .get(REPORT_API.SHIPMENTS, { params: { pharmacy: pharmacyId } })
      .then((response) => {
        setIsReportsLoading(false)
        // console.log(response);
        setReceivedShipment(response.data);
      })
      .catch((error) => {
        // console.log(error);
        setIsReportsLoading(false)
      });

    // Load the sent shipments
    axios
      .get(REPORT_API.SHIPMENTS, { params: { shipment_item__shipment__order__pharmacy: pharmacyId } })
      .then((response) => {
        setIsReportsLoading(false)
        // console.log(response);
        setSentShipment(response.data);
      })
      .catch((error) => {
        setIsReportsLoading(false)
        // console.log(error);
      });

      axios
        .get(BUY_API.PURCHASE_FOR_OTHER_PHARMACY)
        .then((response) => {
          setIsReportsLoading(false)
          // console.log('Buy PARA Needs: ', response);
          setPurchaseOrder(response.data)
        })
        .catch((error) => {
          // console.log(error);
        });

        axios
        .get(BUY_API.PURCHASE_FOR_BY_OTHER_PHARMACY_FOR_MY_PHARMACY)
        .then((response) => {
          setIsReportsLoading(false)
          // console.log('Buy PARA Needs: ', response);
          setPurchaseOrderForMyPharmacy(response.data)
        })
        .catch((error) => {
          // console.log(error);
        });

        axios
        .get(BUY_API.PHARMACY_BUY_REPORT, { params: { pharmacy: pharmacyId }} )
        .then((response) => {
          setIsReportsLoading(false)
          setPurchaseReportData(response.data)
        })
        .catch((error) => {
          // console.log(error);
        });
  }, []);

  return (
    <Page title="Pharmacy Report">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={translate('reports.purchasing_report_heading')}
          links={[{ name: `${pharmacyDetail?.name || ''}'s ${translate('reports.pharmacy_report_subheading')}` }]}
        />
      </Container>
      <PharmacyAnalyticTable isReportsLoading={isReportsLoading} rows={shipmentAnalytics} pharmacy={pharmacyDetail} purchaseOrder={purchaseOrder} purchaseOrderForMyPharmacy={purchaseOrderForMyPharmacy} purchaseReportData={purchaseReportData} pharmacyId={pharmacyId}/>
    </Page>
  );
}
