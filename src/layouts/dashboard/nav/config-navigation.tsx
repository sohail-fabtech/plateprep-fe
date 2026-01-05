import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  editor: icon('ic_editor'),
  settings: icon('ic_settings'),
  docs: icon('ic_docs'),
  map: icon('ic_map'),
  chef: icon('ic_chef'),
  wine: icon('ic_wine'),
  location: icon('ic_location'),
  editorTemplate: icon('ic_editor_template'),
  settingsCustom: icon('ic_settings_custom'),
  howto: icon('ic_howto'),
  videoGen: icon('ic_video_gen'),
  recipes: icon('ic_recipes'),
  roles: icon('ic_lock'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Main Modules',
    items: [
      {
        title: 'Dashboard',
        path: PATH_DASHBOARD.general.app,
        icon: ICONS.dashboard,
        permission: 'view_dashboard',
      },
      {
        title: 'Recipes',
        path: PATH_DASHBOARD.recipes.root,
        icon: ICONS.recipes,
        permission: 'view_recipe',
      },
      {
        title: 'Wine Inventory',
        path: PATH_DASHBOARD.wineInventory.root,
        icon: ICONS.wine,
        permission: 'view_wine_inventory',
      },
      {
        title: 'Tasks',
        path: PATH_DASHBOARD.tasks.root,
        icon: ICONS.kanban,
        permission: 'view_tasks',
      },
      {
        title: 'Scheduling',
        path: PATH_DASHBOARD.scheduling.root,
        icon: ICONS.calendar,
        permission: 'view_scheduling_release',
      },
      {
        title: 'Restaurant Location',
        path: PATH_DASHBOARD.restaurantLocation.root,
        icon: ICONS.location,
        permission: 'view_branches',
      },
      {
        title: 'Users',
        path: PATH_DASHBOARD.users.root,
        icon: ICONS.user,
        permission: 'view_users',
      },
      {
        title: 'Roles',
        path: PATH_DASHBOARD.roles.root,
        icon: ICONS.roles,
        permission: 'view_roles',
      },
      {
        title: 'Templates',
        path: PATH_DASHBOARD.templates.root,
        icon: ICONS.chef,
        permission: 'view_templates',
      },
      // {
      //   title: 'Editor Template',
      //   path: PATH_DASHBOARD.editorTemplate.root,
      //   icon: ICONS.editorTemplate,
      //   permission: 'view_editor_template',
      // },
      {
        title: 'Tracking',
        path: PATH_DASHBOARD.tracking,
        icon: ICONS.analytics,
        permission: 'view_tracking',
      },
      {
        title: 'Video Generation',
        path: PATH_DASHBOARD.videoGeneration.root,
        icon: ICONS.videoGen,
        permission: 'view_video_generation',
      },
      {
        title: 'Settings',
        path: PATH_DASHBOARD.settings.root,
        icon: ICONS.settingsCustom,
        permission: 'view_settings',
      },
      {
        title: 'How to',
        path: PATH_DASHBOARD.howTo.root,
        icon: ICONS.howto,
        permission: 'view_how_to',
      },
      {
        title: 'Dictionary',
        path: PATH_DASHBOARD.dictionary.root,
        icon: ICONS.mail,
        permission: 'view_dictionary',
      },
    ],
  },
];

export default navConfig;
