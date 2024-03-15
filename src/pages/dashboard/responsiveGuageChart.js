import React from 'react';
import GaugeChart from 'react-gauge-chart';
import Grid from '@mui/material/Grid';
import styled from '@emotion/styled';

const StyledGaugeContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ResponsiveGaugeChart = (props) => {
  return (
    <Grid container flexGrow={1}>
      <Grid item xs={12}>
        <StyledGaugeContainer>
          <GaugeChart
            id="gauge-chart1"
            {...props}
          />
        </StyledGaugeContainer>
      </Grid>
    </Grid>
  );
};

export default ResponsiveGaugeChart;
