import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Stack, Drawer, List } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import { usePermissions } from '../../../hooks/usePermissions';
// config
import { NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
import { SkeletonNavItem } from '../../../components/skeleton';
//
import navConfig from './config-navigation';
import NavToggleButton from './NavToggleButton';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { pathname } = useLocation();
  const { hasPermission, profile } = usePermissions();

  const isDesktop = useResponsive('up', 'lg');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Simulate loading state (can be replaced with actual API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loading delay

    return () => clearTimeout(timer);
  }, []);

  // Filter navigation items based on permissions
  const filteredNavConfig = useMemo(() => {
    if (!profile) return navConfig;

    return navConfig.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If no permission specified, show item
        if (!item.permission) return true;

        // Check if user has the required permission
        return hasPermission(item.permission);
      }),
    }));
  }, [profile, hasPermission]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
        }}
      >
        <Logo />
      </Stack>

      {loading ? (
        <List disablePadding sx={{ px: 2 }}>
          {[...Array(14)].map((_, index) => (
            <SkeletonNavItem key={index} />
          ))}
        </List>
      ) : (
        <NavSectionVertical data={filteredNavConfig} />
      )}

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD },
      }}
    >
      <NavToggleButton />

      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              zIndex: 0,
              width: NAV.W_DASHBOARD,
              bgcolor: 'transparent',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV.W_DASHBOARD,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
