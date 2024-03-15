import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useLocales from '../../../hooks/useLocales';

StatsTooltip.propTypes = {
    need: PropTypes.object,
};

export default function StatsTooltip({ need }) {
  const { translate } = useLocales();
  return (
    <>
      {need ? (
        <Stack>
          {need.stat_1 && (
            <Box>
              <Typography variant="subtitle2">{translate("Stat1")}:</Typography>
              <Typography variant="body2">{need.stat_1}</Typography>
            </Box>
          )}

          {need.stat_2 && (
            <Box>
              <Typography variant="subtitle2">{translate("Stat2")}</Typography>
              <Typography  variant="body2">{need.stat_2}</Typography>
            </Box>
          )}

          {need.stat_12 && (
            <Box>
              <Typography variant="subtitle2">{translate("Stat12")}</Typography>
              <Typography  variant="body2">{need.stat_12}</Typography>
            </Box>
          )}
        </Stack>
      ) : (
        <>N/A</>
      )}
    </>
  );
}
