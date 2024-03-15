import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useLocales from '../../../hooks/useLocales';

ConditionTooltip.propTypes = {
  condition: PropTypes.object,
};

export default function ConditionTooltip({ condition ,totalUnits}) {
  const { translate } = useLocales();
  return (
    <>
      {condition ? (
        <Stack>
          {condition.condition_1 && (
            <Box>
              <Typography variant="subtitle2">{translate('Family_Condition')}:</Typography>
              <Typography variant="body2">{condition.condition_1}</Typography>
            </Box>
          )}

          {totalUnits && (
            <Box>
              <Typography variant="subtitle2">{translate('Total Units')}:</Typography>
              <Typography variant="body2">{totalUnits}</Typography>
            </Box>
          )}

          {condition.condition_2 && (
            <Box>
              <Typography variant="subtitle2">{translate('Individual_Condition')}</Typography>
              <Typography variant="body2">{condition.condition_2}</Typography>
            </Box>
          )}

          {condition?.annual && (
            <Box>
              <Typography variant="subtitle2">{translate('Annual_Condition')}</Typography>
              <Typography variant="body2">{condition?.annual}</Typography>
            </Box>
          )}
        </Stack>
      ) : (
        <>N/A</>
      )}
    </>
  );
}
