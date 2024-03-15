import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
  isViewBox: PropTypes.bool,
};

export default function Logo({ disabledLink = false, sx, isViewBox = true }) {
  const theme = useTheme();
  const PRIMARY_LIGHT = theme.palette.primary.light;
  const PRIMARY_MAIN = theme.palette.primary.main;
  const PRIMARY_DARK = theme.palette.primary.dark;

  const logo = (
    <Box sx={{ width: 100, height: 100, ...sx }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox={isViewBox ? '0 0 512 512' : null}>
        <defs>
          <linearGradient id="BG1" x1="100%" x2="50%" y1="9.946%" y2="50%">
            <stop offset="0%" stopColor={PRIMARY_DARK} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient id="BG2" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient id="BG3" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
        <g fill={PRIMARY_MAIN} fillRule="evenodd" stroke="none" strokeWidth="1">
          <path
            fill="url(#BG1)"
            d="M226.253,162.71c-0.248,-20.095 -5.394,-26.736 -5.394,-26.736c0,-0 -2.84,64.923 -61.073,41.453c-4.829,-1.946 -10.61,-3.51 -16.211,-10.531c-1.658,-2.079 -5.009,-5.524 -5.009,-5.524c0,-0 -0.975,11.51 -10.077,19.187c-4.185,3.53 -7.931,5.44 -11.929,6.835c-6.704,2.341 -14.043,3.01 -14.043,3.01c-0,0 3.58,5.405 5.35,7.277c6.777,7.161 11.608,11.144 22.336,14.772c9.309,3.156 18.539,4.734 27.69,4.734c45.439,-0 68.814,-17.585 68.36,-54.477Z"
          />
          <path
            fill="url(#BG2)"
            d="M97.821,64.84c0,0 4.112,0.148 6.168,0.377c2.089,0.233 6.369,1.022 6.369,1.022c-0,0 28.235,-22.133 55.482,1.283c6.769,5.817 10.322,11.529 15.154,15.832c3.745,3.336 5.656,5.125 14.491,5.125c5.365,-0 10.538,-1.073 15.429,-3.282c6.153,-2.682 9.026,-6.738 9.026,-11.471c-0,-1.894 -1.184,-5.444 -3.55,-10.65c-7.889,-17.355 -24.836,-24.019 -49.856,-25.843c-52.011,-3.791 -68.713,27.607 -68.713,27.607Z"
          />
          <path
            fill="url(#BG3)"
            d="M98.076,87.033c-1.305,-1.018 -4.094,-1.689 -4.094,-1.689c0,-0 0.959,9.208 2.784,14.012c3.169,8.338 9.076,14.651 9.076,14.651c0,-0 8.571,2.217 15.629,6.41c6.846,4.066 11.899,10.485 11.899,10.485c0,-0 11.916,3.673 18.861,5.175c18.144,3.786 27.216,11.912 27.216,24.376c-0,4.418 -2.13,8.244 -6.39,11.478c-4.26,3.234 -14.018,5.272 -14.018,5.272c-0,-0 28.257,13.9 46.326,-3.184c3.39,-3.205 7.516,-8.241 10.457,-15.91c5.09,-13.274 5.069,-22.205 5.069,-22.205c0,0 -3.977,-8.525 -14.581,-16.177c-8.424,-6.08 -22.73,-11.391 -30.413,-12.997c-10.886,-2.366 -17.355,-4.023 -19.406,-4.97c-6.311,-3.155 -9.467,-8.677 -9.467,-16.566l-0,-0.71c-0,-5.995 1.026,-10.334 3.077,-13.016c2.051,-2.682 4.042,-3.603 7.893,-4.647c5.323,-1.444 9.78,2.226 9.78,2.226c-0,0 -8.09,-7.831 -16.559,-10.211c-4.325,-1.215 -12.245,-3.656 -24.465,-0.542c-8.319,2.119 -16.457,7.983 -16.457,7.983c-0,0 13.033,5.014 15.397,7.667c3.693,4.145 8.622,10.168 8.843,17.304c0.137,4.421 -5.134,7.209 -10.265,8.533c-3.697,0.954 -8.698,0.997 -11.309,0.497c-2.531,-0.485 -5.224,-2.638 -6.061,-3.627c-3.939,-4.658 -8.391,-9.282 -8.822,-9.618Z"
          />
          <path
            fill="url(#BG1)"
            d="M139.148,152.79c-0.174,-14.087 -3.782,-18.742 -3.782,-18.742c0,-0 -1.99,45.51 -42.811,29.058c-3.385,-1.364 -7.438,-2.46 -11.364,-7.382c-3.926,-4.922 -7.874,-6.773 -11.696,-7.383c-9.124,-1.454 -17.079,-0.196 -20.372,8.681c-2.115,5.704 2.669,15.667 7.037,20.282c4.75,5.02 8.137,7.812 15.657,10.355c6.526,2.212 12.996,3.319 19.411,3.319c31.852,-0 48.238,-12.327 47.92,-38.188Z"
          />
          <path
            fill="url(#BG2)"
            d="M46.491,96.087c0,0 22.743,-31.529 50.307,-10.023c4.933,3.848 7.236,8.081 10.623,11.098c2.625,2.338 3.965,3.592 10.158,3.592c3.761,0 7.387,-0.752 10.816,-2.3c4.313,-1.88 6.327,-4.724 6.327,-8.041c-0,-1.328 -0.83,-3.817 -2.489,-7.466c-5.53,-12.166 -17.364,-17.904 -34.949,-18.116c-54.157,-0.651 -50.793,31.256 -50.793,31.256Z"
          />
          <path
            fill="url(#BG3)"
            d="M46.451,96.659c-0.491,8.449 4.254,20.207 12.77,26.511c6.415,4.645 15.761,8.295 28.037,10.95c12.719,2.654 19.078,8.35 19.078,17.087c0,3.097 -1.493,5.779 -4.479,8.046c-2.986,2.267 -6.083,3.402 -9.29,3.402c-3.65,-0 16.637,11.487 32.392,-1.684c8.245,-6.892 11,-25.843 10.326,-27.007c-6.219,-10.74 -19.271,-17.872 -31.437,-20.416c-7.631,-1.659 -12.166,-2.82 -13.604,-3.484c-4.424,-2.212 -6.636,-6.083 -6.636,-11.613l-0,-0.497c-0,-4.203 0.719,-7.244 2.157,-9.125c1.438,-1.88 2.834,-2.525 5.533,-3.257c3.731,-1.012 6.856,1.561 6.856,1.561c-0,-0 -5.671,-5.49 -11.608,-7.158c-3.032,-0.852 -8.624,-2.718 -17.15,-0.38c-11.554,3.167 -22.799,14.537 -22.945,17.064Z"
          />
        </g>
      </svg>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}