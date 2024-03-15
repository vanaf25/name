import PropTypes from 'prop-types';
import { Container, Alert, AlertTitle } from '@mui/material';
import useLocales from '../hooks/useLocales';
import useAuth from '../hooks/useAuth';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  accessibleRoles: PropTypes.array, // Example ['admin', 'leader']
  children: PropTypes.node,
};

const useCurrentRole = () => {
  const { user } = useAuth();
  return user?.role;
};

export default function RoleBasedGuard({ accessibleRoles, children }) {
  const currentRole = useCurrentRole();
  const { translate } = useLocales();

  if (!accessibleRoles.includes(currentRole)) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>{translate('Permission_Denied')}</AlertTitle>
          {translate('You_do_not_have_permission_to_access_this_page')}
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
}
