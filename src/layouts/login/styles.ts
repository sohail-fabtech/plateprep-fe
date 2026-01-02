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
  alignItems: 'flex-start', // Start from top to allow proper scrolling
  justifyContent: 'center',
  padding: theme.spacing(3, 2),
  overflowY: 'auto', // Allow scrolling on mobile
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  [theme.breakpoints.up('md')]: {
    width: '50%',
    flexShrink: 0,
    padding: theme.spacing(4, 6),
    overflowY: 'auto', // Allow scrolling if content exceeds viewport
    maxHeight: '100vh', // Prevent page-level overflow
    alignItems: 'center', // Center vertically on large screens when content is short
    paddingTop: theme.spacing(4), // Top padding
    paddingBottom: theme.spacing(4), // Bottom padding
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6, 8),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}));
