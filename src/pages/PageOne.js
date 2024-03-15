import React from 'react';
// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import useLocales from '../hooks/useLocales';
import Logo from '../components/Logo';
// ----------------------------------------------------------------------

export default function PageOne() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();

  return (
    <Container
      maxWidth="sm"
      sx={{
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        display: 'flex',
        height: '80vh',
        width: '100%',
      }}
    >
      <Logo
        isViewBox={false}
        sx={{
          height: 250,
          width: 250,
          alignItems: 'center',
        }}
      />
    </Container>
  );
}
