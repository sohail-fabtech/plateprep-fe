// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
  forgotPasswordConfirm: (id: string, token: string) => `/forgot-password/${id}/${token}`,
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  fileManager: path(ROOTS_DASHBOARD, '/files-manager'),
  permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  blank: path(ROOTS_DASHBOARD, '/blank'),
  subscription: path(ROOTS_DASHBOARD, '/subscription'),
  
  // Custom modules
  dashboard: path(ROOTS_DASHBOARD, '/dashboard-overview'),
  recipes: {
    root: path(ROOTS_DASHBOARD, '/recipes'),
    list: path(ROOTS_DASHBOARD, '/recipes/list'),
    new: path(ROOTS_DASHBOARD, '/recipes/new'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/recipes/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/recipes/${id}/edit`),
  },
  wineInventory: {
    root: path(ROOTS_DASHBOARD, '/wine-inventory'),
    list: path(ROOTS_DASHBOARD, '/wine-inventory/list'),
    create: path(ROOTS_DASHBOARD, '/wine-inventory/create'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/wine-inventory/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/wine-inventory/${id}/edit`),
  },
  tasks: {
    root: path(ROOTS_DASHBOARD, '/tasks'),
    list: path(ROOTS_DASHBOARD, '/tasks/list'),
    create: path(ROOTS_DASHBOARD, '/tasks/create'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/tasks/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/tasks/${id}/edit`),
  },
  scheduling: {
    root: path(ROOTS_DASHBOARD, '/scheduling'),
    list: path(ROOTS_DASHBOARD, '/scheduling/list'),
    create: path(ROOTS_DASHBOARD, '/scheduling/create'),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/scheduling/${id}/edit`),
    calendar: path(ROOTS_DASHBOARD, '/scheduling/calendar'),
    releases: path(ROOTS_DASHBOARD, '/scheduling/releases'),
  },
  restaurantLocation: {
    root: path(ROOTS_DASHBOARD, '/restaurant-location'),
    list: path(ROOTS_DASHBOARD, '/restaurant-location/list'),
    new: path(ROOTS_DASHBOARD, '/restaurant-location/new'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/restaurant-location/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/restaurant-location/${id}/edit`),
    map: path(ROOTS_DASHBOARD, '/restaurant-location/map'),
  },
  users: {
    root: path(ROOTS_DASHBOARD, '/users'),
    list: path(ROOTS_DASHBOARD, '/users/list'),
    create: path(ROOTS_DASHBOARD, '/users/create'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/users/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/users/${id}/edit`),
  },
  templates: {
    root: path(ROOTS_DASHBOARD, '/templates'),
    list: path(ROOTS_DASHBOARD, '/templates/list'),
    create: path(ROOTS_DASHBOARD, '/templates/create'),
  },
  editorTemplate: {
    root: path(ROOTS_DASHBOARD, '/editor-template'),
    edit: path(ROOTS_DASHBOARD, '/editor-template/edit'),
  },
  tracking: path(ROOTS_DASHBOARD, '/tracking'),
  videoGeneration: {
    root: path(ROOTS_DASHBOARD, '/video-generation'),
    create: path(ROOTS_DASHBOARD, '/video-generation/create'),
    library: path(ROOTS_DASHBOARD, '/video-generation/library'),
  },
  settings: {
    root: path(ROOTS_DASHBOARD, '/settings'),
    general: path(ROOTS_DASHBOARD, '/settings/general'),
    account: path(ROOTS_DASHBOARD, '/settings/account'),
  },
  howTo: {
    root: path(ROOTS_DASHBOARD, '/how-to'),
    view: (title: string) => path(ROOTS_DASHBOARD, `/how-to/${title}`),
  },
  dictionary: {
    root: path(ROOTS_DASHBOARD, '/dictionary'),
    terms: (categoryId: number) => path(ROOTS_DASHBOARD, `/dictionary/${categoryId}`),
  },
  
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    file: path(ROOTS_DASHBOARD, '/file'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    view: (name: string) => path(ROOTS_DASHBOARD, `/chat/${name}`),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    new: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    view: (name: string) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}`),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    demoView: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
  },
  invoice: {
    root: path(ROOTS_DASHBOARD, '/invoice'),
    list: path(ROOTS_DASHBOARD, '/invoice/list'),
    new: path(ROOTS_DASHBOARD, '/invoice/new'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1/edit'),
    demoView: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5'),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    new: path(ROOTS_DASHBOARD, '/blog/new'),
    view: (title: string) => path(ROOTS_DASHBOARD, `/blog/post/${title}`),
    demoView: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
  },
};

export const PATH_DOCS = {
  root: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
};

export const PATH_ZONE_ON_STORE = 'https://mui.com/store/items/zone-landing-page/';

export const PATH_MINIMAL_ON_STORE = 'https://mui.com/store/items/minimal-dashboard/';

export const PATH_FREE_VERSION = 'https://mui.com/store/items/minimal-dashboard-free/';

export const PATH_FIGMA_PREVIEW =
  'https://www.figma.com/file/rWMDOkMZYw2VpTdNuBBCvN/%5BPreview%5D-Minimal-Web.26.11.22?node-id=0%3A1&t=ya2mDFiuhTXXLLF1-1';
