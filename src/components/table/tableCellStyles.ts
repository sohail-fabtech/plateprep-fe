// Shared table cell styling constants
// Use these in table row components to ensure consistent no-wrap behavior

import { SxProps, Theme } from '@mui/material';

// ----------------------------------------------------------------------

/**
 * Default table cell styles with no-wrap
 * Use this as a base for table body cells to prevent text wrapping
 */
export const defaultTableCellStyles: SxProps<Theme> = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

/**
 * Table cell styles with no-wrap for cells that need ellipsis
 * Use this when you want text to be truncated with ellipsis
 */
export const ellipsisTableCellStyles: SxProps<Theme> = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 200,
};

/**
 * Table cell styles for cells that can wrap (e.g., descriptions)
 * Use this sparingly, only when wrapping is actually needed
 */
export const wrapTableCellStyles: SxProps<Theme> = {
  whiteSpace: 'normal',
  wordBreak: 'break-word',
};

