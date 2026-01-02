import { useState, useEffect, useMemo, useCallback } from 'react';
// @mui
import { TextField, MenuItem, Box, InputAdornment, Skeleton } from '@mui/material';
// components
import Iconify from '../iconify';
// services
import { useBranches } from '../../services/branches/branchHooks';

// ----------------------------------------------------------------------

type Props = {
  value: string | number | '';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  formInputSx?: object;
  disabled?: boolean;
};

export default function BranchSelect({
  value,
  onChange,
  label = 'Location',
  formInputSx,
  disabled = false,
}: Props) {
  const [allBranches, setAllBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBranchCache, setSelectedBranchCache] = useState<{ id: number; name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useBranches({
    page,
    page_size: 1000,
    is_archived: false,
    search: debouncedSearch || undefined,
  });

  // Accumulate branches as pages load
  useEffect(() => {
    if (data?.results) {
      const newBranches = data.results.map((branch) => ({
        id: branch.id,
        name: branch.branchName,
      }));

      if (page === 1 || debouncedSearch) {
        // Reset on first page or when search changes
        setAllBranches(newBranches);
      } else {
        setAllBranches((prev) => [...prev, ...newBranches]);
      }

      // Check if there are more pages
      setHasMore(!!data.next);
    }
  }, [data, page, debouncedSearch]);

  // Cache selected branch when value changes or branches load
  useEffect(() => {
    if (value) {
      // Try to find in current branches first
      const found = allBranches.find((b) => b.id === value);
      if (found) {
        setSelectedBranchCache(found);
      } else if (selectedBranchCache?.id === value) {
        // Keep existing cache if it matches the value
        return;
      } else {
        // Clear cache if value doesn't match any branch
        setSelectedBranchCache(null);
      }
    } else {
      setSelectedBranchCache(null);
    }
  }, [value, allBranches, selectedBranchCache]);

  // Load more when scrolling near bottom
  const handleMenuScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom < 100 && hasMore && !isFetching && !isLoading && !debouncedSearch) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching, isLoading, debouncedSearch]);

  // Find selected branch name for display - use cache if available
  const selectedBranchName = useMemo(() => {
    if (!value) return '';
    
    // First try cache (persists even when searching)
    if (selectedBranchCache && selectedBranchCache.id === value) {
      return selectedBranchCache.name;
    }
    
    // Then try current branches
    const branch = allBranches.find((b) => b.id === value);
    if (branch) {
      return branch.name;
    }
    
    // If not found, return empty (will show value as fallback in renderValue)
    return '';
  }, [value, allBranches, selectedBranchCache]);

  // Auto-focus search input when menu opens
  useEffect(() => {
    if (menuOpen) {
      // Small delay to ensure menu is fully rendered
      const timer = setTimeout(() => {
        const input = document.querySelector('[placeholder="Search location..."]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  return (
    <TextField
      fullWidth
      select
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      SelectProps={{
        open: menuOpen,
        onOpen: () => setMenuOpen(true),
        onClose: () => {
          setMenuOpen(false);
          setSearchInput(''); // Clear search when menu closes
        },
        MenuProps: {
          PaperProps: {
            onScroll: handleMenuScroll,
            onMouseDown: (e) => {
              // Prevent menu from closing when clicking inside
              e.stopPropagation();
            },
            sx: {
              maxHeight: 260,
            },
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          // Prevent menu from closing when clicking inside
          disableAutoFocusItem: true,
        },
        renderValue: () => selectedBranchName || (value ? String(value) : ''),
      }}
      sx={{
        maxWidth: { sm: 240 },
        ...formInputSx,
      }}
    >
      {/* Search input inside dropdown */}
      <Box
        component="div"
        sx={{
          px: 1.5,
          pt: 1.5,
          pb: 1,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            // Prevent Enter key from closing menu
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            ),
            onMouseDown: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.stopPropagation();
            },
          }}
          inputProps={{
            onMouseDown: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.stopPropagation();
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              height: 36,
            },
            '& .MuiInputBase-input': {
              py: 1,
            },
          }}
        />
      </Box>

      {/* Divider */}
      <Box
        sx={{
          width: '100%',
          height: 1,
          bgcolor: 'divider',
          mx: 1.5,
          mb: 0.5,
        }}
      />

      {/* Branch options */}
      {isLoading || isFetching ? (
        // Show skeleton loaders when loading
        <>
          {[...Array(3)].map((_, index) => (
            <MenuItem key={`skeleton-${index}`} disabled>
              <Skeleton
                variant="text"
                width="100%"
                height={24}
                sx={{
                  mx: 1,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                }}
              />
            </MenuItem>
          ))}
        </>
      ) : allBranches.length === 0 ? (
        <MenuItem disabled>
          <Box
            sx={{
              width: '100%',
              py: 1,
              textAlign: 'center',
              color: 'text.disabled',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            {debouncedSearch ? 'No branches found' : 'No branches available'}
          </Box>
        </MenuItem>
      ) : (
        allBranches.map((branch) => (
          <MenuItem
            key={branch.id}
            value={branch.id}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            {branch.name}
          </MenuItem>
        ))
      )}
    </TextField>
  );
}
