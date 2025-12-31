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
      },
      {
        title: 'Recipes',
        path: PATH_DASHBOARD.recipes.list,
        icon: ICONS.recipes,
      },
      {
        title: 'Wine Inventory',
        path: PATH_DASHBOARD.wineInventory.list,
        icon: ICONS.wine,
      },
      {
        title: 'Tasks',
        path: PATH_DASHBOARD.tasks.list,
        icon: ICONS.kanban,
      },
      {
        title: 'Scheduling',
        path: PATH_DASHBOARD.scheduling.calendar,
        icon: ICONS.calendar,
      },
      {
        title: 'Restaurant Location',
        path: PATH_DASHBOARD.restaurantLocation.list,
        icon: ICONS.location,
      },
      {
        title: 'Users',
        path: PATH_DASHBOARD.user.list,
        icon: ICONS.user,
      },
      {
        title: 'Templates',
        path: PATH_DASHBOARD.templates.list,
        icon: ICONS.chef,
      },
      {
        title: 'Editor Template',
        path: PATH_DASHBOARD.editorTemplate.edit,
        icon: ICONS.editorTemplate,
      },
      {
        title: 'Tracking',
        path: PATH_DASHBOARD.tracking,
        icon: ICONS.analytics,
      },
      {
        title: 'Video Generation',
        path: PATH_DASHBOARD.videoGeneration.create,
        icon: ICONS.videoGen,
      },
      {
        title: 'Settings',
        path: PATH_DASHBOARD.settings.general,
        icon: ICONS.settingsCustom,
      },
      {
        title: 'How to',
        path: PATH_DASHBOARD.howTo,
        icon: ICONS.howto,
      },
      {
        title: 'Dictionary',
        path: PATH_DASHBOARD.dictionary,
        icon: ICONS.mail,
      },
    ],
  },
];

export default navConfig;
