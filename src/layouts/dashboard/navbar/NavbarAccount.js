import PropTypes from 'prop-types';
import { capitalCase } from 'change-case';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Typography, Avatar } from '@mui/material';
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

NavbarAccount.propTypes = {
  isCollapse: PropTypes.bool,
};

export default function NavbarAccount({ isCollapse }) {
  const { user, currentPharmacy } = useAuth();

  return (
    <Link underline="none" color="inherit">
      <RootStyle
        sx={{
          mb: -3.5,
          ...(isCollapse && {
            bgcolor: 'transparent',
            display:"none",
            mb: 0,
          }),
        }}
      >
        <Avatar
          src={user?.photo || `https://ui-avatars.com/api/?name=${user.get_full_name}`}
          alt={user.get_full_name}
        />

        <Box
          sx={{
            ml: 2,
            mb: -1,
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
            ...(isCollapse && {
              ml: 0,
              display:"none",
              mb: -1,
            }),
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {capitalCase(`${user.first_name} ${user.last_name}`)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', ml: 0, width: 150, ...(isCollapse && { ml: 4, width: 150 }) }}
          >
            {capitalCase(currentPharmacy?.name || '')}
          </Typography>
        </Box>
      </RootStyle>
    </Link>
  );
}
