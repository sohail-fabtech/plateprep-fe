// @mui
import { Box, Link, Stack, Typography, Breadcrumbs } from '@mui/material';
//
import { CustomBreadcrumbsProps } from './types';
import LinkItem from './LinkItem';

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;

  return (
    <Box sx={{ mb: { xs: 3, sm: 4, md: 5 }, ...sx }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
      >
        {/* Action Button - Shows first on mobile, last on desktop */}
        {action && (
          <Box 
            sx={{ 
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 0, sm: 2 },
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                height: { xs: 40, sm: 42, md: 44 },
                fontWeight: 600,
              },
            }}
          > 
            {action} 
          </Box>
        )}

        {/* Heading & Breadcrumbs - Shows below button on mobile, first on desktop */}
        <Box 
          sx={{ 
            flexGrow: 1,
            order: { xs: 1, sm: 1 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {/* HEADING */}
          {heading && (
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 700,
                mb: { xs: 1, md: 1.5 },
              }}
            >
              {heading}
            </Typography>
          )}

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs 
              separator={<Separator />} 
              sx={{
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'wrap',
                },
                '& .MuiTypography-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                },
                '& .MuiLink-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                },
              }}
              {...other}
            >
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              noWrap
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
    />
  );
}
