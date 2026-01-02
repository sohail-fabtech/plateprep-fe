// @mui
import { Typography, Stack, Box } from '@mui/material';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subtitle?: string;
  benefits?: string[];
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ 
  children, 
  illustration, 
  title = 'Success starts here',
  subtitle,
  benefits = [
    'Over 700 categories',
    'Quality work done faster',
    'Access to talent and businesses across the globe',
  ],
}: Props) {
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 3 },
          ml: { xs: 2, md: 4 },
        }}
      />

      <StyledSection>
        {/* Background Image */}
        <StyledSectionBg imageUrl={illustration || '/assets/images/auth/login.jpg'} />

        {/* Text Content - Positioned at bottom */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pb: { md: 6, lg: 8 },
            pt: { md: 4, lg: 6 },
          }}
        >
          <Box
            sx={{
              width: '100%',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: 'common.white',
                fontSize: { md: '2rem', lg: '2.5rem', xl: '3rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: { md: 3, lg: 4 },
                maxWidth: { md: '90%', lg: '100%' },
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', // Text shadow for better readability
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: 'common.white',
                  fontSize: { md: '1rem', lg: '1.125rem' },
                  opacity: 0.95,
                  mb: { md: 3, lg: 4 },
                  maxWidth: { md: '90%', lg: '100%' },
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Benefits List */}
            <Stack spacing={{ md: 2, lg: 2.5 }}>
              {benefits.map((benefit, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    color: 'common.white',
                  }}
                >
                  <Iconify
                    icon="eva:checkmark-circle-2-fill"
                    width={24}
                    sx={{
                      color: 'common.white',
                      flexShrink: 0,
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'common.white',
                      fontSize: { md: '0.9375rem', lg: '1rem' },
                      fontWeight: 400,
                      lineHeight: 1.6,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </StyledSection>

      <StyledContent>
        <Stack 
          sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', md: 480, lg: 520 },
            py: { xs: 4, md: 0 }, // Padding on mobile, none on desktop (handled by StyledContent)
            my: { xs: 0, md: 'auto' }, // Center vertically on large screens
            minHeight: { xs: 'auto', md: 'fit-content' },
          }}
        >
          {children}
        </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
