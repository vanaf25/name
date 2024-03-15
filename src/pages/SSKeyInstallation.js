import { useEffect, useState } from 'react';
// mui
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// Hooks
import useSettings from '../hooks/useSettings';
import useLocales from '../hooks/useLocales';
import useAuth from '../hooks/useAuth';
import { useDispatch, useSelector } from '../redux/store';

// Componenets
import Page from '../components/Page';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import Iconify from '../components/Iconify';
import axios from '../utils/axios';
import Logo from '../components/Logo';
import Image from '../components/Image';
import installLogo from '../assets/icons/installLogo.png';
import installvideo from '../assets/illustrations/tutorial_sskey.jpg';

export default function SSKeyInstallation() {
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const { sskeyDetail } = useAuth();
  const [sskeyParams, setSskeyParams] = useState({ user: null, password: null });

  useEffect(() => {
    // console.log(sskeyDetail);
    setSskeyParams({
      user: sskeyDetail?.ss_key_usr || null,
      password: sskeyDetail?.ss_key_pass || null,
    });
  }, [sskeyDetail]);

  return (
    <Page title="SS Key Installation">
      <Container maxWidth={themeStretch ? false : 'xl'} sx={{ pb: 3 }}>
        <Card sx={{ p: 3, mb: 5 }}>
          <Stack direction="row" sx={{ maxWidth: '70%', maxHeight: 180 }}>
            <Stack>
              <Logo
                sx={{
                  height: 270,
                  width: 270,
                  alignItems: 'center',
                }}
              />
            </Stack>
            <Stack sx={{ pt: 4, position: 'absolute', pl: 20, pr: 7 }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main', fontSize: 25 }}>
                {translate('sskey_installation.pageheading')}
              </Typography>
            </Stack>
          </Stack>
          <Typography
            variant="subtitle1"
            sx={{ color: 'text.primary', alignItems: 'center', fontSize: 20, fontWeight: 400, paddingBottom: 3 }}
          >
            {translate('sskey_installation.subheading')}&nbsp;
            <strong style={{ fontWeight: 700, fontSize: 20 }}>ssKey</strong>
            &nbsp;{translate('sskey_installation.on_your_server')}
          </Typography>
          <Stack direction="row" sx={{ justifyContent: 'center' }}>
            <a target="_blank" rel="noreferrer" href="https://www.youtube.com/embed/vBPJgeVtmpM">
              <Image alt="logo" src={installvideo} sx={{ width: 500, height: 281 }} />
            </a>
          </Stack>
          <Stack direction="row" sx={{ pb: 5, justifyContent: 'space-between' }}>
            <Stack sx={{ pl: 5 }}>
              <Typography variant="subtitle1" sx={{ width: 1, pt: 4, fontSize: 20, fontWeight: 400 }}>
                {translate('sskey_installation.sskey_user_password')}
              </Typography>
              <Stack direction="row">
                <Stack sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ width: 1, pt: 4, fontSize: 20, fontWeight: 400 }}>
                    {translate('sskey_installation.User')} &nbsp;
                    <strong style={{ fontWeight: 700, fontSize: 20, color: '#1e7fc7' }}>{sskeyParams.user}</strong>
                  </Typography>
                </Stack>
                <Stack sx={{ alignItems: 'center', pl: 3 }}>
                  <Typography variant="subtitle1" sx={{ width: 1, pt: 4, fontSize: 20, fontWeight: 400 }}>
                    {translate('sskey_installation.Password')} &nbsp;
                    <strong style={{ fontWeight: 700, fontSize: 20, color: '#1e7fc7' }}>{sskeyParams.password}</strong>
                  </Typography>
                </Stack>
              </Stack>
              <Stack sx={{ pt: 4 }}>
                <Typography variant="subtitle1" sx={{ width: 1, fontSize: 18, fontWeight: 400 }}>
                  <strong style={{ fontWeight: 700, fontSize: 20 }}>{translate('sskey_installation.Note')}</strong>
                  &nbsp;
                  {translate('sskey_installation.sskey_user_password_note')}
                </Typography>
              </Stack>
            </Stack>
            <Stack sx={{ alignItems: 'center', pt: 3, pr: 5 }}>
              <Image
                onClick={() => {
                  window.open(
                    `${window.location.protocol}//${window.location.host}/static/ssKey 2.0.zip`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                alt="logo"
                src={installLogo}
                sx={{ width: 110, height: 100 }}
              />
              <Typography variant="subtitle1" sx={{ color: 'text.primary', pt: 1, fontSize: 14, fontWeight: 400 }}>
                {translate('sskey_installation.Presionar_para_descargar_ssKEY')}
              </Typography>
            </Stack>
          </Stack>

          <Stack sx={{ backgroundColor: '#e2efd9', p: 3, border: 2, borderRadius: 3, borderColor: 'error.main' }}>
            <Typography variant="subtitle1" sx={{ width: 1, fontSize: 16, fontWeight: 700, color: 'error.main' }}>
              {translate('sskey_installation.IMPORTANT')}
            </Typography>
            <Typography variant="subtitle1" sx={{ width: 1, fontSize: 14, fontWeight: 400 }}>
              {translate('sskey_installation.important_note')}
            </Typography>
            <Typography variant="subtitle1" sx={{ width: 1, pt: 2, fontSize: 14, fontWeight: 400 }}>
              {translate('sskey_installation.authorize_note')}
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}
