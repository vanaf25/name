// @mui
import { Card, Container, Typography, useTheme, Box, TextField, Tooltip, InputAdornment } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import * as moment from 'moment';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MobileDatePicker } from '@mui/lab';
import styled from '@emotion/styled';
// routes
import { HOST_API } from '../../config';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales'
// components
import Page from '../../components/Page';
import Loader from '../../components/Loader';
import ResponsiveGaugeChart from './responsiveGuageChart';
// utils
import { fCurrency } from '../../utils/formatNumber';

// ----------------------------------------------------------------------

const StyledBox = styled(Box)`
  flex: 0 0 calc(33.33% - 16px);
  justify-content: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 960px) {
    flex: 0 0 calc(50% - 16px);
  }
  @media (max-width: 600px) {
    flex: 0 0 100%;
  }
`;

export default function DashboardSummary() {
  const theme = useTheme();
  const { user } = useAuth();
  const { translate } = useLocales();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const pharmacyId = user.pharmacy_detail.id;

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${HOST_API}/api/bi/bi_sales_sumary/${pharmacyId}/${moment(selectedDate).format('YYYY-MM-DD')}`)
      .then((response) => {
        if (response?.data?.success) {
          setSummaryData(response?.data?.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }, [pharmacyId,selectedDate]);

  const findIndexFromGrowthRate = (growthRate) => {
    let index;
    index = 2 * Number(growthRate / 100) + 0.5;
    if (index < 0) {
      index = 0;
    } else if (index > 1) {
      index = 1;
    }
    return index;
  };

  const TodayData = summaryData?.['0'];
  const PreviousDateData = summaryData?.['1'];
  const todayDifferencePercentage = (
    ((TodayData?.TOTAL - PreviousDateData?.TOTAL) / PreviousDateData?.TOTAL) *
    100
  )?.toFixed(2);
  const todayIndex = findIndexFromGrowthRate(todayDifferencePercentage);

  const MonthData = summaryData?.['2'];
  const PreviousMonthData = summaryData?.['3'];
  const monthDifferencePercentage = (
    ((MonthData?.TOTAL - PreviousMonthData?.TOTAL) / PreviousMonthData?.TOTAL) *
    100
  )?.toFixed(2);
  const monthIndex = findIndexFromGrowthRate(monthDifferencePercentage);

  const YearData = summaryData?.['4'];
  const PreviousYearData = summaryData?.['5'];
  const yearDifferencePercentage = (
    ((YearData?.TOTAL - PreviousYearData?.TOTAL) / PreviousYearData?.TOTAL) *
    100
  )?.toFixed(2);
  const yearIndex = findIndexFromGrowthRate(yearDifferencePercentage);

  if (isLoading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <Page mt={-2} title="Search: Product Details">
      <MobileDatePicker
        label={translate('date')}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <CalendarTodayOutlinedIcon />
            </InputAdornment>
          ),
        }}
        inputFormat="dd/MM/yyyy"
        value={selectedDate}
        onAccept={(value)=>{
            setSelectedDate(value)
        }}
        onChange={(newValue) => {
        //   setSelectedDate(newValue)
        }}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
      <Card sx={{ p: 2, width: '100%', mb: 1, pb: 1, mt: 1 }}>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <StyledBox>
            <Box display={'flex'} alignItems={'center'} paddingLeft={{ md: 4, lg: 5, sm: 2, xs: 0 }}>
              <Typography variant="h4">
                {translate('today')}
              </Typography>
              <Tooltip title={translate('today_description')} placement="right">
              <InfoOutlinedIcon sx={{marginLeft: 2, cursor: 'pointer'}} fontSize={'large'} />
            </Tooltip>
              
            </Box>
          </StyledBox>
          <StyledBox>
            <Typography variant="h5">{moment(TodayData?.FEND,'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss dddd')}</Typography>
            <Box>
              <Typography variant="h3" color={theme.palette.success.dark}>
                {fCurrency(TodayData?.TOTAL)}
              </Typography>
              <Typography variant="subtitle2">{translate('today_summary_description')}</Typography>
              <Box display={'flex'} alignItems={'center'}>
                <Typography
                  variant="h5"
                  display={'flex'}
                  color={todayDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                >
                  {fCurrency(PreviousDateData?.TOTAL)}
                </Typography>
                <Typography
                  color={todayDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                  variant="h5"
                  ml={3}
                >
                  {`${todayDifferencePercentage}%`}
                </Typography>
              </Box>
            </Box>
          </StyledBox>
          <StyledBox>
            <ResponsiveGaugeChart
              nrOfLevels={2}
              colors={['red', 'green']}
              textColor={'#000'}
              arcPadding={0.07}
              arcWidth={0.12}
              marginInPercent={0.09}
              cornerRadius={4}
              fontSize={16}
              hideText
              percent={todayIndex}
            />
            <Typography
              mt={-5}
              color={todayDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
              textAlign={'center'}
              gutterBottom
              variant="h5"
            >
              {todayDifferencePercentage}%
            </Typography>
          </StyledBox>
        </Box>
      </Card>
      <Card sx={{ p: 2, width: '100%', mb: 1, pb: 1 }}>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <StyledBox>
            <Box display={'flex'} alignItems={'center'} paddingLeft={{ md: 4, lg: 5, sm: 2, xs: 0 }}>
              <Typography variant="h4">
              {translate('this_month')}
              </Typography>
              <Tooltip title={translate('month_description')} placement="right">
              <InfoOutlinedIcon sx={{marginLeft: 2, cursor: 'pointer'}} fontSize={'large'} />
            </Tooltip>
            </Box>
          </StyledBox>
          <StyledBox>
            <Typography variant="h5">{moment(MonthData?.INI,'YYYY-MM-DD').format('MMMM')}</Typography>
            <Box>
              <Typography variant="h3" color={theme.palette.success.dark}>
                {fCurrency(MonthData?.TOTAL)}
              </Typography>
              <Typography variant="subtitle2">{translate('month_summary_description')}</Typography>
              <Box display={'flex'} alignItems={'center'}>
                <Typography
                  variant="h5"
                  display={'flex'}
                  color={monthDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                >
                  {fCurrency(PreviousMonthData?.TOTAL)}
                </Typography>
                <Typography
                  color={monthDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                  variant="h5"
                  ml={3}
                >
                  {`${monthDifferencePercentage}%`}
                </Typography>
              </Box>
            </Box>
          </StyledBox>
          <StyledBox>
            <ResponsiveGaugeChart
              nrOfLevels={2}
              colors={['red', 'green']}
              textColor={'#000'}
              arcPadding={0.07}
              arcWidth={0.12}
              marginInPercent={0.09}
              cornerRadius={4}
              fontSize={16}
              hideText
              percent={monthIndex}
            />
            <Typography
              mt={-5}
              color={monthDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
              textAlign={'center'}
              gutterBottom
              variant="h5"
            >
              {monthDifferencePercentage}%
            </Typography>
          </StyledBox>
        </Box>
      </Card>
      <Card sx={{ p: 2, width: '100%', mb: 1, pb: 1 }}>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <StyledBox>
            <Box display={'flex'} alignItems={'center'} paddingLeft={{ md: 4, lg: 5, sm: 2, xs: 0 }}>
              <Typography variant="h4">
                {translate('this_year')}
              </Typography>
              <Tooltip title={translate('year_description')} placement="right">
              <InfoOutlinedIcon sx={{marginLeft: 2, cursor: 'pointer'}} fontSize={'large'} />
            </Tooltip>
            </Box>
          </StyledBox>
          <StyledBox>
            <Typography variant="h5">{moment(YearData?.INI, 'YYYY-MM-DD').format('YYYY')}</Typography>
            <Box>
              <Typography variant="h3" color={theme.palette.success.dark}>
                {fCurrency(YearData?.TOTAL)}
              </Typography>
              <Typography variant="subtitle2">{translate('year_summary_description')}</Typography>
              <Box display={'flex'} alignItems={'center'}>
                <Typography
                  variant="h5"
                  display={'flex'}
                  color={yearDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                >
                  {fCurrency(PreviousYearData?.TOTAL)}
                </Typography>
                <Typography
                  color={yearDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
                  variant="h5"
                  ml={3}
                >
                  {`${yearDifferencePercentage}%`}
                </Typography>
              </Box>
            </Box>
          </StyledBox>
          <StyledBox>
            <ResponsiveGaugeChart
              nrOfLevels={2}
              colors={['red', 'green']}
              textColor={'#000'}
              arcPadding={0.07}
              arcWidth={0.12}
              marginInPercent={0.09}
              cornerRadius={4}
              fontSize={16}
              hideText
              percent={yearIndex}
            />
            <Typography
              mt={-5}
              color={yearDifferencePercentage < 0 ? theme.palette.error.dark : theme.palette.success.dark}
              textAlign={'center'}
              gutterBottom
              variant="h5"
            >
              {yearDifferencePercentage}%
            </Typography>
          </StyledBox>
        </Box>
      </Card>
    </Page>
  );
}
