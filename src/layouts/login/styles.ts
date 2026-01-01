// @mui
import { styled, alpha } from '@mui/material/styles';
// utils
import { bgGradient } from '../../utils/cssStyles';

// ----------------------------------------------------------------------

export const StyledRoot = styled('main')(() => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
}));

export const StyledSection = styled('div')(({ theme }) => ({
  display: 'none',
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    width: '50%',
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: theme.spacing(4, 5),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6, 8),
  },
}));

export const StyledSectionBg = styled('div')<{ imageUrl?: string }>(({ imageUrl }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  zIndex: 0,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 1) 100%)',
    zIndex: 1,
  },
}));

export const StyledContent = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3, 2),
  overflowY: 'auto',
  overflowX: 'hidden',
  [theme.breakpoints.up('md')]: {
    width: '50%',
    flexShrink: 0,
    padding: theme.spacing(4, 6),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6, 8),
  },
}));
