import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// mui
import Container from '@mui/material/Container';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// Redux
import { useSelector } from '../../redux/store';

// Paths
import { GroupForm } from '../../sections/buy/group';
import axios from '../../utils/axios';
import { BUY_API } from '../../constants/ApiPaths';

export default function GroupCreate() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { groups } = useSelector((state) => state.buy);
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const isEdit = pathname.includes('edit');
  const [currentGroup, setCurrentGroup] = useState();

  useEffect(() => {
    if (isEdit) {
      if (groups.length) {
        setCurrentGroup(groups.find((group) => group.id === parseInt(id, 10)));
      } else {
        axios
          .get(`${BUY_API.BUY_GROUP}${id}/`)
          .then((response) => {
            setCurrentGroup({ ...response.data });
          })
          .catch((error) => {
            // console.log(error);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Page title="Buy Group">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={translate('buy.buy_group_heading')}
          links={[{ name: translate('buy.buy_group_subheading') }]}
        />
        <GroupForm isEdit={isEdit} currentGroup={currentGroup} />
      </Container>
    </Page>
  );
}
