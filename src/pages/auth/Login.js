import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Stack, Link, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
import useResponsive from '../../hooks/useResponsive';
// components
import Page from '../../components/Page';
import Logo from '../../components/Logo';
import { ReactComponent as LogoLarge } from '../../layouts/dashboard/navbar/solosoelogolargo.svg'
import Image from '../../components/Image';
// sections
import { LoginForm } from '../../sections/auth/login';
import LoginIllustration from '../../assets/illustrations/illustration_login.png';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Login() {
  const smUp = useResponsive('up', 'sm');

  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Login">
      <RootStyle>
        <HeaderStyle>
          <LogoLarge style={{ width: 350, height: 60, marginBottom: 40 }} />
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: 2 } }}>
              Don’t have an account? {''}
              <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
                Register
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && (
          <SectionStyle>
            <Typography variant="h3" sx={{ px: 5, mt: 15, mb: 5 }}>
              Hi, Welcome Back
            </Typography>
            <Image alt="login" src={LoginIllustration} />
          </SectionStyle>
        )}

        <Container maxWidth="sm">
          <ContentStyle>
            <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Sign in to SoloSOE
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
              </Box>
            </Stack>

            <LoginForm />

            {!smUp && (
              <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                Don’t have an account?{' '}
                <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
                  Get started
                </Link>
              </Typography>
            )}
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
