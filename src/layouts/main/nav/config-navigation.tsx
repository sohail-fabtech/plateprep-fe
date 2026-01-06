// routes
import { PATH_AUTH, PATH_PAGE } from '../../../routes/paths';
// config
import { PATH_AFTER_LOGIN } from '../../../config-global';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'Home',
    icon: <Iconify icon="eva:home-fill" />,
    path: '/',
  },
  {
    title: 'Features',
    path: '/pages',
    icon: <Iconify icon="eva:star-fill" />,
    children: [
      {
        subheader: 'Restaurant Management',
        items: [
          { title: 'Recipe Management', path: PATH_AFTER_LOGIN },
          { title: 'Wine Inventory', path: PATH_AFTER_LOGIN },
          { title: 'Task Management', path: PATH_AFTER_LOGIN },
          { title: 'Scheduling', path: PATH_AFTER_LOGIN },
          { title: 'Multi-Location Support', path: PATH_AFTER_LOGIN },
        ],
      },
      {
        subheader: 'Team Collaboration',
        items: [
          { title: 'User Management', path: PATH_AFTER_LOGIN },
          { title: 'Role-Based Access', path: PATH_AFTER_LOGIN },
          { title: 'Templates & Guides', path: PATH_AFTER_LOGIN },
        ],
      },
    ],
  },
  {
    title: 'Pricing',
    icon: <Iconify icon="eva:pricetags-fill" />,
    path: PATH_PAGE.pricing,
  },
  {
    title: 'Contact',
    icon: <Iconify icon="eva:email-fill" />,
    path: PATH_PAGE.contact,
  },
  {
    title: 'Login',
    icon: <Iconify icon="eva:person-fill" />,
    path: PATH_AUTH.login,
  },
];

export default navConfig;
