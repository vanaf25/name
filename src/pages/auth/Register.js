import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Link, Container, Typography, Button } from '@mui/material';
// hooks
import useAuth from '../../hooks/useAuth';
import useResponsive from '../../hooks/useResponsive';
// routes
import { PATH_AUTH } from '../../routes/paths';
// assets
import { SentIcon } from '../../assets';
// components
import Page from '../../components/Page';
import Logo from '../../components/Logo';
import { ReactComponent as LogoLarge } from '../../layouts/dashboard/navbar/solosoelogolargo.svg';
import Image from '../../components/Image';
// sections
import { RegisterForm, ReferralForm } from '../../sections/auth/register';
import RegisterIllustration from '../../assets/illustrations/illustration_register.png';

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

export default function Register() {
  const { isSentSignupEmail, signupEmail, changeIsSentSignupEmailStatus, referralCode } = useAuth();

  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');

  React.useEffect(() => 
    // componenetWillUnmount change the status for isSentSignupEmail flag
     () => changeIsSentSignupEmailStatus(false)
  , []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page title="Register">
      <RootStyle>
        <HeaderStyle>
          <LogoLarge style={{ width: 350, height: 60, marginBottom: 40 }} />
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
              {/* Already have an account?{' '} */}
              ¿Ya tienes una cuenta?{' '}
              <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.login}>
                {/* Login */}
                Acceso
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && (
          <SectionStyle>
            <Typography variant="h3" sx={{ px: 5, mt: 15, mb: 5 }}>
              La web de las farmacias comprometidas
            </Typography>
            <Image alt="register" src={RegisterIllustration} />
          </SectionStyle>
        )}

        <Container>
          <ContentStyle>
            {!isSentSignupEmail ? (
              <>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      Entra a formar parte de un grupo exclusivo de Farmacias.
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {/* Free forever. No credit card needed. */}
                      Siempre libre. No se necesita tarjeta de crédito.
                    </Typography>
                  </Box>
                </Box>

                {!referralCode ? <ReferralForm /> : <RegisterForm />}
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
                  {/* By registering, I agree to SoloSOE&nbsp; */}
                  Al registrarme, acepto SoloSOE&nbsp;
                  <Link underline="always" color="text.primary" href="#">
                    {/* Terms of Service */}
                    Términos de servicio
                  </Link>
                  &nbsp;and&nbsp;
                  <Link underline="always" color="text.primary" href="#">
                    {/* Privacy Policy */}
                    política de privacidad
                  </Link>
                  .
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

                <Typography variant="h4" gutterBottom>
                  {/* Verification email sent successfully */}
                  Correo electrónico de verificación enviado correctamente
                </Typography>
                <Typography>
                  {/* We have sent a confirmation email to &nbsp; */}
                  Hemos enviado un correo electrónico de confirmación a &nbsp;
                  <strong>{signupEmail}</strong>
                  <br />
                  {/* Please check your email. */}
                  Por favor revise su correo electrónico.
                </Typography>

                <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 5 }}>
                  {/* Login */}
                  Acceso
                </Button>
              </Box>
            )}

            {!smUp && (
              <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                {/* Already have an account?{' '} */}
                ¿Ya tienes una cuenta?{' '}
                <Link variant="subtitle2" to={PATH_AUTH.login} component={RouterLink}>
                  {/* Login */}
                  Acceso
                </Link>
              </Typography>
            )}
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
