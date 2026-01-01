// @mui
import { Card, CardContent, Stack, Typography, Divider } from '@mui/material';
// @types
import { IDictionaryTerm } from '../../../@types/dictionary';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';

// ----------------------------------------------------------------------

type Props = {
  term: IDictionaryTerm;
};

export default function DictionaryTermCard({ term }: Props) {
  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Stack
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'common.white',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="eva:bookmark-outline" width={20} />
            </Stack>
            <Stack sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {term.term}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {term.definition}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {term.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

