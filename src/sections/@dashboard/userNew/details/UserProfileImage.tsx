import { Box, Avatar, Typography, Stack } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  name: string;
  role: string;
  avatarUrl?: string | null;
};

export default function UserProfileImage({ name, role, avatarUrl }: Props) {
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Avatar
        src={avatarUrl || undefined}
        alt={name}
        sx={{
          width: { xs: 80, md: 120 },
          height: { xs: 80, md: 120 },
          fontSize: { xs: '2rem', md: '3rem' },
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 700,
        }}
      >
        {name?.charAt(0)?.toUpperCase()}
      </Avatar>

      <Stack spacing={0.5}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.875rem', md: '1rem' },
            color: 'text.secondary',
            textTransform: 'capitalize',
          }}
        >
          {role}
        </Typography>
      </Stack>
    </Stack>
  );
}

