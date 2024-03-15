import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
// mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import useAuth from '../../hooks/useAuth';

// Componenets
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';

// Redux
import { useSelector } from '../../redux/store';

// Paths
import { PATH_BUY } from '../../routes/paths';
import { GroupList } from '../../sections/buy/group';

CreateGroupButton.propTypes = {
  canJoin: PropTypes.string,
  groupsLength: PropTypes.number,
};

function CreateGroupButton({ canJoin, groupsLength }) {
  const { translate } = useLocales();

  // If the flag not set in the admin or user not a part of any group then can create group or join
  if (!canJoin && !groupsLength) {
    return (
      <Button
        variant="contained"
        component={RouterLink}
        to={PATH_BUY.newGroup}
        startIcon={<Iconify icon={'eva:plus-fill'} />}
      >
        {translate('buy.new_group')}
      </Button>
    );
  }

  // If the flag set to join multiple group for an user in
  // the admin then show button to create or join multiple groups
  if (canJoin && canJoin.toUpperCase() === 'YES') {
    return (
      <Button
        variant="contained"
        component={RouterLink}
        to={PATH_BUY.newGroup}
        startIcon={<Iconify icon={'eva:plus-fill'} />}
      >
        {translate('buy.new_group')}
      </Button>
    );
  }
  return '';
}

export default function Group() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { settings, getPharmacySetting } = useAuth();
  const { groups } = useSelector((state) => state.buy);
  const canJoin = getPharmacySetting('CAN_JOIN_MULTIPLE_GROUP', settings);

  return (
    <Page title="Buy Group">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={translate('buy.buy_group_heading')}
          links={[{ name: translate('buy.buy_group_subheading') }]}
          action={<CreateGroupButton canJoin={canJoin} groupsLength={groups.length} />}
        />
        <GroupList />
      </Container>
    </Page>
  );
}
