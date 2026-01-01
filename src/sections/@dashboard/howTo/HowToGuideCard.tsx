import { paramCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Chip, Typography, CardContent, Stack, Link, Avatar } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// utils
import { fDate } from '../../../utils/formatTime';
import { fShortenNumber } from '../../../utils/formatNumber';
// @types
import { IHowToGuide } from '../../../@types/howTo';
// components
import Image from '../../../components/image';
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
import Label from '../../../components/label';

// ----------------------------------------------------------------------

const StyledOverlay = styled('div')(({ theme }) => ({
  top: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  position: 'absolute',
  backgroundColor: alpha(theme.palette.grey[900], 0.64),
}));

// ----------------------------------------------------------------------

type Props = {
  guide: IHowToGuide;
  index?: number;
};

export default function HowToGuideCard({ guide, index }: Props) {
  const isDesktop = useResponsive('up', 'md');

  const { cover, title, description, category, view, helpful, author, createdAt, featured, popular } = guide;

  const linkTo = PATH_DASHBOARD.howTo.view(paramCase(title));

  const isFeatured = featured && index === 0;

  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...(isFeatured && {
          gridColumn: { md: 'span 2' },
          gridRow: { md: 'span 2' },
        }),
      }}
    >
      {cover && (
        <Box sx={{ position: 'relative', width: 1, pt: '60%' }}>
          <Image
            alt={title}
            src={cover}
            sx={{
              top: 0,
              width: 1,
              height: 1,
              position: 'absolute',
            }}
          />
          {(featured || popular) && (
            <Box
              sx={{
                top: 12,
                right: 12,
                zIndex: 9,
                position: 'absolute',
              }}
            >
              {featured && (
                <Label color="info" sx={{ mr: 1 }}>
                  Featured
                </Label>
              )}
              {popular && (
                <Label color="warning">Popular</Label>
              )}
            </Box>
          )}
          {isFeatured && <StyledOverlay />}
        </Box>
      )}

      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ...(isFeatured && {
            zIndex: 9,
            bottom: 0,
            position: 'absolute',
            color: 'common.white',
          }),
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip
            label={category}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              ...(isFeatured && {
                bgcolor: alpha('#fff', 0.16),
                color: 'common.white',
              }),
            }}
          />
        </Stack>

        <Typography
          variant="caption"
          component="div"
          sx={{
            mb: 1,
            color: 'text.disabled',
            ...(isFeatured && {
              opacity: 0.64,
              color: 'common.white',
            }),
          }}
        >
          {fDate(createdAt)}
        </Typography>

        <Link color="inherit" component={RouterLink} to={linkTo} underline="none">
          <TextMaxLine variant={isFeatured ? 'h5' : 'h6'} line={2} persistent>
            {title}
          </TextMaxLine>
        </Link>

        <TextMaxLine
          variant="body2"
          sx={{
            mt: 1,
            mb: 2,
            color: 'text.secondary',
            ...(isFeatured && {
              opacity: 0.72,
              color: 'common.white',
            }),
          }}
          line={2}
        >
          {description}
        </TextMaxLine>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 'auto', pt: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              alt={author.name}
              src={author.avatarUrl}
              sx={{
                width: 32,
                height: 32,
                ...(isFeatured && {
                  border: `2px solid ${alpha('#fff', 0.16)}`,
                }),
              }}
            />
            <Typography
              variant="caption"
              sx={{
                ...(isFeatured && {
                  opacity: 0.72,
                  color: 'common.white',
                }),
              }}
            >
              {author.name}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              color: 'text.disabled',
              ...(isFeatured && {
                opacity: 0.64,
                color: 'common.white',
              }),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="eva:eye-fill" width={16} />
              <Typography variant="caption">{fShortenNumber(view)}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="eva:heart-fill" width={16} />
              <Typography variant="caption">{fShortenNumber(helpful)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

