import merge from 'lodash/merge';
import { useMemo } from 'react';
// @mui
import { alpha, ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
//
import { useSettingsContext } from './SettingsContext';
import { navyPreset } from './presets';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ThemeColorPresets({ children }: Props) {
  const outerTheme = useTheme();

  const { presetsColor } = useSettingsContext();

  const safePreset = presetsColor || navyPreset;

  const themeOptions = useMemo(
    () => ({
      palette: {
        primary: safePreset,
      },
      customShadows: {
        primary: `0 8px 16px 0 ${alpha(safePreset.main, 0.24)}`,
      },
    }),
    [safePreset]
  );

  const theme = createTheme(merge(outerTheme, themeOptions));

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
