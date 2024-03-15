import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../utils/axios';

// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
import { PATH_AUTH } from '../../routes/paths';

// components
import Page from '../../components/Page';
import useAuth from '../../hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';
import { AUTH_API } from '../../constants/ApiPaths';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function RegisterConfirmEmail() {
  const { confirmationKey } = useParams();
  const navigate = useNavigate();
  // console.log('confirmationKey ', confirmationKey);
  const { getDetailByEmailConfirmationKey, confirmEmailExpired, signupEmail } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyEmailSubmit = () => {
    setIsVerifying(true);
    axios
      .post(AUTH_API.VERIFY_REGISTER_EMAIL, { key: confirmationKey })
      .then((response) => {
        const { detail } = response.data;
        if (detail === 'ok') navigate(PATH_AUTH.login);
      })
      .catch((error) => {
        // console.log(error);
        setIsVerifying(false);
      });
  };

  useEffect(() => {
    if (!confirmEmailExpired) handleVerifyEmailSubmit();
  }, [confirmEmailExpired]);

  useEffect(() => {
    getDetailByEmailConfirmationKey(confirmationKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!confirmEmailExpired ? (
        <LoadingScreen />
      ) : (
        <Page title="Verify" sx={{ height: 1 }}>
          <RootStyle>
            <LogoOnlyLayout />

            <Container>
              <Box sx={{ maxWidth: 480, mx: 'auto' }}>
                <Typography variant="h3" paragraph>
                  Confirm E-mail Address
                </Typography>
                {!confirmEmailExpired ? (
                  <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                    Please confirm that {signupEmail} is an e-mail address for user {signupEmail}.
                  </Typography>
                ) : (
                  <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                    This e-mail confirmation link expired or is invalid. Please issue a new e-mail confirmation request.
                  </Typography>
                )}

                {!confirmEmailExpired ? (
                  <Stack spacing={3}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isVerifying}
                      onClick={handleVerifyEmailSubmit}
                    >
                      Confirm
                    </LoadingButton>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isVerifying}
                      onClick={handleVerifyEmailSubmit}
                    >
                      Send Confirmation Email
                    </LoadingButton>
                  </Stack>
                )}
              </Box>
            </Container>
          </RootStyle>
        </Page>
      )}
    </>
  );
}
