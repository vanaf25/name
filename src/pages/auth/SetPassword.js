import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// sections
import { SetPasswordForm } from '../../sections/auth/set-password';
// assets
import { SentIcon } from '../../assets';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function SetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <Page title="Reset Password" sx={{ height: 1 }}>
      <RootStyle>
        <LogoOnlyLayout />

        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            {!sent ? (
              <>
                <Typography variant="h3" paragraph>
                  Establece tu nueva contraseña
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 5 }}>Please enter your new password.</Typography>

                <SetPasswordForm onSent={() => setSent(true)} onGetEmail={(value) => setEmail(value)} />

                <Button fullWidth size="large" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                  Regresar
                </Button>
              </>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

                <Typography variant="h3" gutterBottom>
                  Solicitud enviada correctamente
                </Typography>
                <Typography>
                  Le hemos enviado un correo de confirmación a &nbsp;
                  <strong>{email}</strong>
                  <br />
                  Por favor, revisa tu correo electrónico.
                </Typography>

                <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 5 }}>
                  Regresar
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
