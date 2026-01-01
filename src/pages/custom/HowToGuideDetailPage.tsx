import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { paramCase } from 'change-case';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Button,
  Container,
  Typography,
  Divider,
  Chip,
  Link,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// utils
import { fDate } from '../../utils/formatTime';
import { fShortenNumber } from '../../utils/formatNumber';
// @types
import { IHowToGuide } from '../../@types/howTo';
// components
import Markdown from '../../components/markdown';
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import Label from '../../components/label';
import Image from '../../components/image';
// sections
import { HowToGuideCard } from '../../sections/@dashboard/howTo';
// mock
import { _howToGuides } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function HowToGuideDetailPage() {
  const { themeStretch } = useSettingsContext();

  const { title } = useParams();

  const guide = useMemo(() => {
    if (!title) return null;
    return _howToGuides.find((g) => paramCase(g.title) === title) || null;
  }, [title]);

  const relatedGuides = useMemo(() => {
    if (!guide) return [];
    return _howToGuides
      .filter((g) => g.id !== guide.id && g.category === guide.category)
      .slice(0, 3);
  }, [guide]);

  if (!guide) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            Guide not found
          </Typography>
          <Button component={RouterLink} to={PATH_DASHBOARD.howTo.root} variant="contained">
            Back to Guides
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${guide.title} | How To Guides | PlatePrep`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={guide.title}
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'How To',
              href: PATH_DASHBOARD.howTo.root,
            },
            {
              name: 'Guides',
              href: PATH_DASHBOARD.howTo.root,
            },
            {
              name: guide.title,
            },
          ]}
        />

        <Card sx={{ p: { xs: 3, md: 5 }, mb: 5 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={guide.category} size="small" color="primary" />
                {guide.featured && <Label color="info">Featured</Label>}
                {guide.popular && <Label color="warning">Popular</Label>}
              </Stack>

              <Typography variant="h3" component="h1">
                {guide.title}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {guide.description}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar alt={guide.author.name} src={guide.author.avatarUrl} sx={{ width: 32, height: 32 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {guide.author.name}
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  {fDate(guide.createdAt)}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ color: 'text.disabled' }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="eva:eye-fill" width={16} />
                    <Typography variant="caption">{fShortenNumber(guide.view)} views</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="eva:heart-fill" width={16} />
                    <Typography variant="caption">{fShortenNumber(guide.helpful)} helpful</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            {/* Cover Image */}
            {guide.cover && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Image alt={guide.title} src={guide.cover} ratio="16/9" />
              </Box>
            )}

            <Divider />

            {/* Content */}
            <Box
              sx={{
                typography: 'body1',
                color: 'text.primary',
                '& p': {
                  mb: 2,
                  typography: 'body1',
                  color: 'text.primary',
                },
                '& h2': {
                  mt: 4,
                  mb: 2,
                  typography: 'h4',
                  fontWeight: 600,
                  color: 'text.primary',
                },
                '& h3': {
                  mt: 3,
                  mb: 1.5,
                  typography: 'h5',
                  fontWeight: 600,
                  color: 'text.primary',
                },
                '& ul, & ol': {
                  mb: 2,
                  pl: 3,
                },
                '& li': {
                  mb: 1,
                  typography: 'body1',
                  color: 'text.primary',
                },
                '& strong': {
                  fontWeight: 600,
                  color: 'text.primary',
                },
              }}
              dangerouslySetInnerHTML={{ __html: guide.content.trim() }}
            />

            {/* Tags */}
            {guide.tags && guide.tags.length > 0 && (
              <>
                <Divider />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {guide.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              </>
            )}

            {/* Actions */}
            <Divider />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                component={RouterLink}
                to={PATH_DASHBOARD.howTo.root}
              >
                Back to Guides
              </Button>
              <Button variant="outlined" startIcon={<Iconify icon="eva:share-fill" />}>
                Share
              </Button>
              <Button variant="outlined" startIcon={<Iconify icon="eva:printer-fill" />}>
                Print
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Related Guides
            </Typography>
            <Grid container spacing={3}>
              {relatedGuides.map((relatedGuide) => (
                <Grid key={relatedGuide.id} item xs={12} sm={6} md={4}>
                  <HowToGuideCard guide={relatedGuide} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}

