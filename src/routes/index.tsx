import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
// layouts
import MainLayout from '../layouts/main';
import SimpleLayout from '../layouts/simple';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
//
import {
  // Auth
  LoginPage,
  RegisterPage,
  VerifyCodePage,
  NewPasswordPage,
  ResetPasswordPage,
  ForgotPasswordConfirmPage,
  // Dashboard: General
  GeneralAppPage,
  GeneralFilePage,
  GeneralBankingPage,
  GeneralBookingPage,
  GeneralEcommercePage,
  GeneralAnalyticsPage,
  // Dashboard: User (old - deprecated)
  UserListPage,
  UserEditPage,
  UserCardsPage,
  UserCreatePage,
  UserProfilePage,
  UserAccountPage,
  // Dashboard: Users (new - separate module)
  UsersListPage,
  UsersCreatePage,
  UsersEditPage,
  UserDetailsPage,
  // Dashboard: Ecommerce
  EcommerceShopPage,
  EcommerceCheckoutPage,
  EcommerceProductListPage,
  EcommerceProductEditPage,
  EcommerceProductCreatePage,
  EcommerceProductDetailsPage,
  // Dashboard: Invoice
  InvoiceListPage,
  InvoiceDetailsPage,
  InvoiceCreatePage,
  InvoiceEditPage,
  // Dashboard: Blog
  BlogPostsPage,
  BlogPostPage,
  BlogNewPostPage,
  // Custom Pages
  DashboardOverviewPage,
  RecipesListPage,
  RecipeCreatePage,
  RecipeEditPage,
  RecipeDetailsPage,
  WineInventoryListPage,
  WineInventoryCreatePage,
  WineInventoryEditPage,
  WineInventoryDetailsPage,
  TasksListPage,
  TasksCreatePage,
  TasksEditPage,
  TasksDetailsPage,
  SchedulingListPage,
  SchedulingCreatePage,
  SchedulingEditPage,
  SchedulingCalendarPage,
  SchedulingReleasesPage,
  RestaurantLocationListPage,
  RestaurantLocationCreatePage,
  RestaurantLocationEditPage,
  RestaurantLocationDetailsPage,
  RestaurantLocationMapPage,
  TemplatesListPage,
  TemplatesCreatePage,
  EditorTemplatePage,
  TrackingAnalyticsPage,
  VideoGenerationCreatePage,
  VideoGenerationListPage,
  SettingsGeneralPage,
  SettingsAccountPage,
  HowToGuidesListPage,
  HowToGuideDetailPage,
  DictionaryListPage,
  DictionaryTermsPage,
  // Dashboard: FileManager
  FileManagerPage,
  // Dashboard: App
  ChatPage,
  MailPage,
  CalendarPage,
  KanbanPage,
  //
  BlankPage,
  PermissionDeniedPage,
  SubscriptionPage,
  //
  Page500,
  Page403,
  Page404,
  HomePage,
  FaqsPage,
  AboutPage,
  Contact,
  PricingPage,
  PaymentPage,
  ComingSoonPage,
  MaintenancePage,
  //
  ComponentsOverviewPage,
  FoundationColorsPage,
  FoundationTypographyPage,
  FoundationShadowsPage,
  FoundationGridPage,
  FoundationIconsPage,
  //
  MUIAccordionPage,
  MUIAlertPage,
  MUIAutocompletePage,
  MUIAvatarPage,
  MUIBadgePage,
  MUIBreadcrumbsPage,
  MUIButtonsPage,
  MUICheckboxPage,
  MUIChipPage,
  MUIDataGridPage,
  MUIDialogPage,
  MUIListPage,
  MUIMenuPage,
  MUIPaginationPage,
  MUIPickersPage,
  MUIPopoverPage,
  MUIProgressPage,
  MUIRadioButtonsPage,
  MUIRatingPage,
  MUISliderPage,
  MUIStepperPage,
  MUISwitchPage,
  MUITablePage,
  MUITabsPage,
  MUITextFieldPage,
  MUITimelinePage,
  MUITooltipPage,
  MUITransferListPage,
  MUITreesViewPage,
  //
  DemoAnimatePage,
  DemoCarouselsPage,
  DemoChartsPage,
  DemoCopyToClipboardPage,
  DemoEditorPage,
  DemoFormValidationPage,
  DemoImagePage,
  DemoLabelPage,
  DemoLightboxPage,
  DemoMapPage,
  DemoMegaMenuPage,
  DemoMultiLanguagePage,
  DemoNavigationBarPage,
  DemoOrganizationalChartPage,
  DemoScrollbarPage,
  DemoSnackbarPage,
  DemoTextMaxLinePage,
  DemoUploadPage,
  DemoMarkdownPage,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // Forgot Password Confirm (outside auth, matches API URL format)
    {
      element: <CompactLayout />,
      children: [{ path: 'forgot-password/:id/:token', element: <ForgotPasswordConfirmPage /> }],
    },
    // Auth
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <LoginPage /> },
        { path: 'register-unprotected', element: <RegisterPage /> },
        {
          element: <CompactLayout />,
          children: [
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'new-password', element: <NewPasswordPage /> },
            { path: 'verify', element: <VerifyCodePage /> },
          ],
        },
      ],
    },

    // Dashboard
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        
        // Custom Routes
        { path: 'dashboard-overview', element: <DashboardOverviewPage /> },
        {
          path: 'recipes',
          children: [
            { element: <Navigate to="/dashboard/recipes/list" replace />, index: true },
            { path: 'list', element: <RecipesListPage /> },
            { path: 'new', element: <RecipeCreatePage /> },
            { path: ':id', element: <RecipeDetailsPage /> },
            { path: ':id/edit', element: <RecipeEditPage /> },
          ],
        },
        {
          path: 'wine-inventory',
          children: [
            { element: <Navigate to="/dashboard/wine-inventory/list" replace />, index: true },
            { path: 'list', element: <WineInventoryListPage /> },
            { path: 'create', element: <WineInventoryCreatePage /> },
            { path: ':id/edit', element: <WineInventoryEditPage /> },
            { path: ':id', element: <WineInventoryDetailsPage /> },
          ],
        },
        {
          path: 'tasks',
          children: [
            { element: <Navigate to="/dashboard/tasks/list" replace />, index: true },
            { path: 'list', element: <TasksListPage /> },
            { path: 'create', element: <TasksCreatePage /> },
            { path: ':id', element: <TasksDetailsPage /> },
            { path: ':id/edit', element: <TasksEditPage /> },
          ],
        },
        {
          path: 'scheduling',
          children: [
            { element: <Navigate to="/dashboard/scheduling/list" replace />, index: true },
            { path: 'list', element: <SchedulingListPage /> },
            { path: 'create', element: <SchedulingCreatePage /> },
            { path: ':id/edit', element: <SchedulingEditPage /> },
            { path: 'calendar', element: <SchedulingCalendarPage /> },
            { path: 'releases', element: <SchedulingReleasesPage /> },
          ],
        },
        {
          path: 'restaurant-location',
          children: [
            { element: <Navigate to="/dashboard/restaurant-location/list" replace />, index: true },
            { path: 'list', element: <RestaurantLocationListPage /> },
            { path: 'new', element: <RestaurantLocationCreatePage /> },
            { path: ':id', element: <RestaurantLocationDetailsPage /> },
            { path: ':id/edit', element: <RestaurantLocationEditPage /> },
            { path: 'map', element: <RestaurantLocationMapPage /> },
          ],
        },
        {
          path: 'users',
          children: [
            { element: <Navigate to="/dashboard/users/list" replace />, index: true },
            { path: 'list', element: <UsersListPage /> },
            { path: 'create', element: <UsersCreatePage /> },
            { path: ':id', element: <UserDetailsPage /> },
            { path: ':id/edit', element: <UsersEditPage /> },
          ],
        },
        {
          path: 'templates',
          children: [
            { element: <Navigate to="/dashboard/templates/list" replace />, index: true },
            { path: 'list', element: <TemplatesListPage /> },
            { path: 'create', element: <TemplatesCreatePage /> },
          ],
        },
        {
          path: 'editor-template',
          children: [
            { element: <Navigate to="/dashboard/editor-template/edit" replace />, index: true },
            { path: 'edit', element: <EditorTemplatePage /> },
          ],
        },
        {
          path: 'tracking',
          children: [
            { element: <Navigate to="/dashboard/tracking/analytics" replace />, index: true },
            { path: 'analytics', element: <TrackingAnalyticsPage /> },
          ],
        },
        {
          path: 'video-generation',
          children: [
            { element: <Navigate to="/dashboard/video-generation/library" replace />, index: true },
            { path: 'create', element: <VideoGenerationCreatePage /> },
            { path: 'library', element: <VideoGenerationListPage /> },
          ],
        },
        {
          path: 'settings',
          children: [
            { element: <Navigate to="/dashboard/settings/general" replace />, index: true },
            { path: 'general', element: <SettingsGeneralPage /> },
            { path: 'account', element: <SettingsAccountPage /> },
          ],
        },
        {
          path: 'how-to',
          children: [
            { element: <Navigate to="/dashboard/how-to/guides" replace />, index: true },
            { path: 'guides', element: <HowToGuidesListPage /> },
            { path: ':title', element: <HowToGuideDetailPage /> },
          ],
        },
        {
          path: 'dictionary',
          children: [
            { element: <Navigate to="/dashboard/dictionary/list" replace />, index: true },
            { path: 'list', element: <DictionaryListPage /> },
            { path: ':categoryId', element: <DictionaryTermsPage /> },
          ],
        },
        
        // Original Routes
        { path: 'app', element: <GeneralAppPage /> },
        { path: 'ecommerce', element: <GeneralEcommercePage /> },
        { path: 'analytics', element: <GeneralAnalyticsPage /> },
        { path: 'banking', element: <GeneralBankingPage /> },
        { path: 'booking', element: <GeneralBookingPage /> },
        { path: 'file', element: <GeneralFilePage /> },
        {
          path: 'e-commerce',
          children: [
            { element: <Navigate to="/dashboard/e-commerce/shop" replace />, index: true },
            { path: 'shop', element: <EcommerceShopPage /> },
            { path: 'product/:name', element: <EcommerceProductDetailsPage /> },
            { path: 'list', element: <EcommerceProductListPage /> },
            { path: 'product/new', element: <EcommerceProductCreatePage /> },
            { path: 'product/:name/edit', element: <EcommerceProductEditPage /> },
            { path: 'checkout', element: <EcommerceCheckoutPage /> },
          ],
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/list" replace />, index: true },
            { path: 'profile', element: <UserProfilePage /> },
            { path: 'cards', element: <UserCardsPage /> },
            { path: 'list', element: <UsersListPage /> },
            { path: 'new', element: <UserCreatePage /> },
            { path: ':name/edit', element: <UserEditPage /> },
            { path: 'account', element: <UserAccountPage /> },
          ],
        },
        {
          path: 'invoice',
          children: [
            { element: <Navigate to="/dashboard/invoice/list" replace />, index: true },
            { path: 'list', element: <InvoiceListPage /> },
            { path: ':id', element: <InvoiceDetailsPage /> },
            { path: ':id/edit', element: <InvoiceEditPage /> },
            { path: 'new', element: <InvoiceCreatePage /> },
          ],
        },
        {
          path: 'blog',
          children: [
            { element: <Navigate to="/dashboard/blog/posts" replace />, index: true },
            { path: 'posts', element: <BlogPostsPage /> },
            { path: 'post/:title', element: <BlogPostPage /> },
            { path: 'new', element: <BlogNewPostPage /> },
          ],
        },
        { path: 'files-manager', element: <FileManagerPage /> },
        {
          path: 'mail',
          children: [
            { element: <Navigate to="/dashboard/mail/all" replace />, index: true },
            { path: 'label/:customLabel', element: <MailPage /> },
            { path: 'label/:customLabel/:mailId', element: <MailPage /> },
            { path: ':systemLabel', element: <MailPage /> },
            { path: ':systemLabel/:mailId', element: <MailPage /> },
          ],
        },
        {
          path: 'chat',
          children: [
            { element: <ChatPage />, index: true },
            { path: 'new', element: <ChatPage /> },
            { path: ':conversationKey', element: <ChatPage /> },
          ],
        },
        { path: 'calendar', element: <CalendarPage /> },
        { path: 'kanban', element: <KanbanPage /> },
        { path: 'permission-denied', element: <PermissionDeniedPage /> },
        { path: 'subscription', element: <SubscriptionPage /> },
        { path: 'blank', element: <BlankPage /> },
      ],
    },

    // Main Routes
    {
      element: <MainLayout />,
      children: [
        { element: <HomePage />, index: true },
        { path: 'about-us', element: <AboutPage /> },
        { path: 'contact-us', element: <Contact /> },
        { path: 'faqs', element: <FaqsPage /> },
        // Demo Components
        {
          path: 'components',
          children: [
            { element: <ComponentsOverviewPage />, index: true },
            {
              path: 'foundation',
              children: [
                { element: <Navigate to="/components/foundation/colors" replace />, index: true },
                { path: 'colors', element: <FoundationColorsPage /> },
                { path: 'typography', element: <FoundationTypographyPage /> },
                { path: 'shadows', element: <FoundationShadowsPage /> },
                { path: 'grid', element: <FoundationGridPage /> },
                { path: 'icons', element: <FoundationIconsPage /> },
              ],
            },
            {
              path: 'mui',
              children: [
                { element: <Navigate to="/components/mui/accordion" replace />, index: true },
                { path: 'accordion', element: <MUIAccordionPage /> },
                { path: 'alert', element: <MUIAlertPage /> },
                { path: 'autocomplete', element: <MUIAutocompletePage /> },
                { path: 'avatar', element: <MUIAvatarPage /> },
                { path: 'badge', element: <MUIBadgePage /> },
                { path: 'breadcrumbs', element: <MUIBreadcrumbsPage /> },
                { path: 'buttons', element: <MUIButtonsPage /> },
                { path: 'checkbox', element: <MUICheckboxPage /> },
                { path: 'chip', element: <MUIChipPage /> },
                { path: 'data-grid', element: <MUIDataGridPage /> },
                { path: 'dialog', element: <MUIDialogPage /> },
                { path: 'list', element: <MUIListPage /> },
                { path: 'menu', element: <MUIMenuPage /> },
                { path: 'pagination', element: <MUIPaginationPage /> },
                { path: 'pickers', element: <MUIPickersPage /> },
                { path: 'popover', element: <MUIPopoverPage /> },
                { path: 'progress', element: <MUIProgressPage /> },
                { path: 'radio-button', element: <MUIRadioButtonsPage /> },
                { path: 'rating', element: <MUIRatingPage /> },
                { path: 'slider', element: <MUISliderPage /> },
                { path: 'stepper', element: <MUIStepperPage /> },
                { path: 'switch', element: <MUISwitchPage /> },
                { path: 'table', element: <MUITablePage /> },
                { path: 'tabs', element: <MUITabsPage /> },
                { path: 'textfield', element: <MUITextFieldPage /> },
                { path: 'timeline', element: <MUITimelinePage /> },
                { path: 'tooltip', element: <MUITooltipPage /> },
                { path: 'transfer-list', element: <MUITransferListPage /> },
                { path: 'tree-view', element: <MUITreesViewPage /> },
              ],
            },
            {
              path: 'extra',
              children: [
                { element: <Navigate to="/components/extra/animate" replace />, index: true },
                { path: 'animate', element: <DemoAnimatePage /> },
                { path: 'carousel', element: <DemoCarouselsPage /> },
                { path: 'chart', element: <DemoChartsPage /> },
                { path: 'copy-to-clipboard', element: <DemoCopyToClipboardPage /> },
                { path: 'editor', element: <DemoEditorPage /> },
                { path: 'form-validation', element: <DemoFormValidationPage /> },
                { path: 'image', element: <DemoImagePage /> },
                { path: 'label', element: <DemoLabelPage /> },
                { path: 'lightbox', element: <DemoLightboxPage /> },
                { path: 'map', element: <DemoMapPage /> },
                { path: 'mega-menu', element: <DemoMegaMenuPage /> },
                { path: 'multi-language', element: <DemoMultiLanguagePage /> },
                { path: 'navigation-bar', element: <DemoNavigationBarPage /> },
                { path: 'organization-chart', element: <DemoOrganizationalChartPage /> },
                { path: 'scroll', element: <DemoScrollbarPage /> },
                { path: 'snackbar', element: <DemoSnackbarPage /> },
                { path: 'text-max-line', element: <DemoTextMaxLinePage /> },
                { path: 'upload', element: <DemoUploadPage /> },
                { path: 'markdown', element: <DemoMarkdownPage /> },
              ],
            },
          ],
        },
      ],
    },
    {
      element: <SimpleLayout />,
      children: [
        { path: 'pricing', element: <PricingPage /> },
        { path: 'payment', element: <PaymentPage /> },
      ],
    },
    {
      element: <CompactLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoonPage /> },
        { path: 'maintenance', element: <MaintenancePage /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <Page404 /> },
        { path: '403', element: <Page403 /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
