// ----------------------------------------------------------------------

export type IRoleFilterStatus = 'all' | 'active' | 'archived';

export type IRole = {
  id: string;
  name: string;
  description: string | null;
  permissionsCount: number;
  usersCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

