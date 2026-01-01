import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Card, CardContent, Stack, Typography, Link } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IDictionaryCategory } from '../../../@types/dictionary';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';

// ----------------------------------------------------------------------

type Props = {
  category: IDictionaryCategory;
};

export default function DictionaryCategoryCard({ category }: Props) {
  const linkTo = PATH_DASHBOARD.dictionary.terms(category.id);

  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
      component={RouterLink}
      to={linkTo}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Stack
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'common.white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:book-outline" width={24} />
          </Stack>
          <Stack sx={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              to={linkTo}
              underline="none"
              color="inherit"
              sx={{
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <TextMaxLine variant="h6" line={2} persistent>
                {category.name}
              </TextMaxLine>
            </Link>
          </Stack>
        </Stack>

        <TextMaxLine variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }} line={3}>
          {category.description}
        </TextMaxLine>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Iconify icon="eva:arrow-forward-fill" width={16} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            View Terms
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

