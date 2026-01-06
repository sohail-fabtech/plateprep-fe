import { Suspense, lazy, ElementType } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

// AUTH
export const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage')));
export const RegisterPage = Loadable(lazy(() => import('../pages/auth/RegisterPage')));
export const VerifyCodePage = Loadable(lazy(() => import('../pages/auth/VerifyCodePage')));
export const NewPasswordPage = Loadable(lazy(() => import('../pages/auth/NewPasswordPage')));
export const ResetPasswordPage = Loadable(lazy(() => import('../pages/auth/ResetPasswordPage')));
export const ForgotPasswordConfirmPage = Loadable(
  lazy(() => import('../pages/auth/ForgotPasswordConfirmPage'))
);

// DASHBOARD: GENERAL
export const GeneralAppPage = Loadable(lazy(() => import('../pages/dashboard/GeneralAppPage')));
// export const GeneralEcommercePage = Loadable(
//   lazy(() => import('../pages/dashboard/GeneralEcommercePage'))
// );
export const GeneralAnalyticsPage = Loadable(
  lazy(() => import('../pages/dashboard/GeneralAnalyticsPage'))
);
// export const GeneralBankingPage = Loadable(
//   lazy(() => import('../pages/dashboard/GeneralBankingPage'))
// );
// export const GeneralBookingPage = Loadable(
//   lazy(() => import('../pages/dashboard/GeneralBookingPage'))
// );
// export const GeneralFilePage = Loadable(lazy(() => import('../pages/dashboard/GeneralFilePage')));

// DASHBOARD: ECOMMERCE (Commented out - Not needed)
// export const EcommerceShopPage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceShopPage'))
// );
// export const EcommerceProductDetailsPage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceProductDetailsPage'))
// );
// export const EcommerceProductListPage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceProductListPage'))
// );
// export const EcommerceProductCreatePage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceProductCreatePage'))
// );
// export const EcommerceProductEditPage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceProductEditPage'))
// );
// export const EcommerceCheckoutPage = Loadable(
//   lazy(() => import('../pages/dashboard/EcommerceCheckoutPage'))
// );

// DASHBOARD: INVOICE
export const InvoiceListPage = Loadable(lazy(() => import('../pages/dashboard/InvoiceListPage')));
export const InvoiceDetailsPage = Loadable(
  lazy(() => import('../pages/dashboard/InvoiceDetailsPage'))
);
export const InvoiceCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/InvoiceCreatePage'))
);
export const InvoiceEditPage = Loadable(lazy(() => import('../pages/dashboard/InvoiceEditPage')));

// DASHBOARD: USER (Old - Commented out, replaced by custom Users module)
// export const UserProfilePage = Loadable(lazy(() => import('../pages/dashboard/UserProfilePage')));
// export const UserCardsPage = Loadable(lazy(() => import('../pages/dashboard/UserCardsPage')));
// export const UserListPage = Loadable(lazy(() => import('../pages/dashboard/UserListPage')));
// export const UserAccountPage = Loadable(lazy(() => import('../pages/dashboard/UserAccountPage')));
// export const UserCreatePage = Loadable(lazy(() => import('../pages/dashboard/UserCreatePage')));
// export const UserEditPage = Loadable(lazy(() => import('../pages/dashboard/UserEditPage')));

// DASHBOARD: BLOG (Commented out - Not needed)
// export const BlogPostsPage = Loadable(lazy(() => import('../pages/dashboard/BlogPostsPage')));
// export const BlogPostPage = Loadable(lazy(() => import('../pages/dashboard/BlogPostPage')));
// export const BlogNewPostPage = Loadable(lazy(() => import('../pages/dashboard/BlogNewPostPage')));

// DASHBOARD: FILE MANAGER (Commented out - Not needed)
// export const FileManagerPage = Loadable(lazy(() => import('../pages/dashboard/FileManagerPage')));

// DASHBOARD: APP (Commented out - Not needed)
// export const ChatPage = Loadable(lazy(() => import('../pages/dashboard/ChatPage')));
// export const MailPage = Loadable(lazy(() => import('../pages/dashboard/MailPage')));
// export const CalendarPage = Loadable(lazy(() => import('../pages/dashboard/CalendarPage')));
// export const KanbanPage = Loadable(lazy(() => import('../pages/dashboard/KanbanPage')));

// CUSTOM PAGES
export const DashboardOverviewPage = Loadable(lazy(() => import('../pages/custom/DashboardOverviewPage')));
export const RecipesListPage = Loadable(lazy(() => import('../pages/custom/RecipesListPage')));
export const RecipeCreatePage = Loadable(lazy(() => import('../pages/custom/RecipeCreatePage')));
export const RecipeCreateAIPage = Loadable(lazy(() => import('../pages/custom/RecipeCreateAIPage')));
export const RecipeAIPreviewPage = Loadable(lazy(() => import('../pages/custom/RecipeAIPreviewPage')));
export const RecipeEditPage = Loadable(lazy(() => import('../pages/custom/RecipeEditPage')));
export const RecipeDetailsPage = Loadable(lazy(() => import('../pages/custom/RecipeDetailsPage')));
export const WineInventoryListPage = Loadable(lazy(() => import('../pages/custom/WineInventoryListPage')));
export const WineInventoryCreatePage = Loadable(lazy(() => import('../pages/custom/WineInventoryCreatePage')));
export const WineInventoryEditPage = Loadable(lazy(() => import('../pages/custom/WineInventoryEditPage')));
export const WineInventoryDetailsPage = Loadable(lazy(() => import('../pages/custom/WineInventoryDetailsPage')));
export const TasksListPage = Loadable(lazy(() => import('../pages/custom/TasksListPage')));
export const TasksCreatePage = Loadable(lazy(() => import('../pages/custom/TasksCreatePage')));
export const TasksEditPage = Loadable(lazy(() => import('../pages/custom/TasksEditPage')));
export const TasksDetailsPage = Loadable(lazy(() => import('../pages/custom/TaskDetailsPage')));
export const SchedulingListPage = Loadable(lazy(() => import('../pages/custom/SchedulingListPage')));
export const SchedulingCreatePage = Loadable(lazy(() => import('../pages/custom/SchedulingCreatePage')));
export const SchedulingEditPage = Loadable(lazy(() => import('../pages/custom/SchedulingEditPage')));
export const SchedulingCalendarPage = Loadable(lazy(() => import('../pages/custom/SchedulingCalendarPage')));
export const SchedulingReleasesPage = Loadable(lazy(() => import('../pages/custom/SchedulingReleasesPage')));
export const UsersListPage = Loadable(lazy(() => import('../pages/custom/UsersListPage')));
export const UsersCreatePage = Loadable(lazy(() => import('../pages/custom/UsersCreatePage')));
export const UsersEditPage = Loadable(lazy(() => import('../pages/custom/UsersEditPage')));
export const UserDetailsPage = Loadable(lazy(() => import('../pages/custom/UserDetailsPage')));
export const UserOneOffPermissionsPage = Loadable(lazy(() => import('../pages/custom/UserOneOffPermissionsPage')));
export const RolesListPage = Loadable(lazy(() => import('../pages/custom/RolesListPage')));
export const RolesCreatePage = Loadable(lazy(() => import('../pages/custom/RolesCreatePage')));
export const RolesEditPage = Loadable(lazy(() => import('../pages/custom/RolesEditPage')));
export const RoleDetailsPage = Loadable(lazy(() => import('../pages/custom/RoleDetailsPage')));
export const RestaurantLocationListPage = Loadable(lazy(() => import('../pages/custom/RestaurantLocationListPage')));
export const RestaurantLocationCreatePage = Loadable(lazy(() => import('../pages/custom/RestaurantLocationCreatePage')));
export const RestaurantLocationEditPage = Loadable(lazy(() => import('../pages/custom/RestaurantLocationEditPage')));
export const RestaurantLocationDetailsPage = Loadable(lazy(() => import('../pages/custom/RestaurantLocationDetailsPage')));
export const RestaurantLocationMapPage = Loadable(lazy(() => import('../pages/custom/RestaurantLocationMapPage')));
export const TemplatesListPage = Loadable(lazy(() => import('../pages/custom/TemplatesListPage')));
export const TemplatesCreatePage = Loadable(lazy(() => import('../pages/custom/TemplatesCreatePage')));
export const EditorTemplatePage = Loadable(lazy(() => import('../pages/custom/EditorTemplatePage')));
export const TrackingAnalyticsPage = Loadable(lazy(() => import('../pages/custom/TrackingAnalyticsPage')));
export const VideoGenerationCreatePage = Loadable(lazy(() => import('../pages/custom/VideoGenerationCreatePage')));
export const VideoGenerationListPage = Loadable(lazy(() => import('../pages/custom/VideoGenerationListPage')));
export const SettingsGeneralPage = Loadable(lazy(() => import('../pages/custom/SettingsGeneralPage')));
export const SettingsAccountPage = Loadable(lazy(() => import('../pages/custom/SettingsAccountPage')));
export const HowToGuidesListPage = Loadable(lazy(() => import('../pages/custom/HowToGuidesListPage')));
export const HowToGuideDetailPage = Loadable(lazy(() => import('../pages/custom/HowToGuideDetailPage')));
export const DictionaryListPage = Loadable(lazy(() => import('../pages/custom/DictionaryListPage')));
export const DictionaryTermsPage = Loadable(lazy(() => import('../pages/custom/DictionaryTermsPage')));

// TEST RENDER PAGE BY ROLE
export const PermissionDeniedPage = Loadable(
  lazy(() => import('../pages/dashboard/PermissionDeniedPage'))
);
export const SubscriptionPage = Loadable(
  lazy(() => import('../pages/dashboard/SubscriptionPage'))
);

// BLANK PAGE
export const BlankPage = Loadable(lazy(() => import('../pages/dashboard/BlankPage')));

// MAIN
export const Page500 = Loadable(lazy(() => import('../pages/Page500')));
export const Page403 = Loadable(lazy(() => import('../pages/Page403')));
export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
export const HomePage = Loadable(lazy(() => import('../pages/HomePage')));
export const FaqsPage = Loadable(lazy(() => import('../pages/FaqsPage')));
export const TemplateEditorPage = Loadable(lazy(() => import('../pages/main/TemplateEditorPage')));
export const AboutPage = Loadable(lazy(() => import('../pages/AboutPage')));
export const Contact = Loadable(lazy(() => import('../pages/ContactPage')));
export const PricingPage = Loadable(lazy(() => import('../pages/PricingPage')));
export const PaymentPage = Loadable(lazy(() => import('../pages/PaymentPage')));
export const ComingSoonPage = Loadable(lazy(() => import('../pages/ComingSoonPage')));
export const MaintenancePage = Loadable(lazy(() => import('../pages/MaintenancePage')));

// DEMO COMPONENTS (Commented out - Not needed)
// ----------------------------------------------------------------------

// export const ComponentsOverviewPage = Loadable(
//   lazy(() => import('../pages/components/ComponentsOverviewPage'))
// );

// FOUNDATION
// export const FoundationColorsPage = Loadable(
//   lazy(() => import('../pages/components/foundation/FoundationColorsPage'))
// );
// export const FoundationTypographyPage = Loadable(
//   lazy(() => import('../pages/components/foundation/FoundationTypographyPage'))
// );
// export const FoundationShadowsPage = Loadable(
//   lazy(() => import('../pages/components/foundation/FoundationShadowsPage'))
// );
// export const FoundationGridPage = Loadable(
//   lazy(() => import('../pages/components/foundation/FoundationGridPage'))
// );
// export const FoundationIconsPage = Loadable(
//   lazy(() => import('../pages/components/foundation/FoundationIconsPage'))
// );

// MUI COMPONENTS (Commented out - Not needed)
// export const MUIAccordionPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIAccordionPage'))
// );
// export const MUIAlertPage = Loadable(lazy(() => import('../pages/components/mui/MUIAlertPage')));
// export const MUIAutocompletePage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIAutocompletePage'))
// );
// export const MUIAvatarPage = Loadable(lazy(() => import('../pages/components/mui/MUIAvatarPage')));
// export const MUIBadgePage = Loadable(lazy(() => import('../pages/components/mui/MUIBadgePage')));
// export const MUIBreadcrumbsPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIBreadcrumbsPage'))
// );
// export const MUIButtonsPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIButtonsPage'))
// );
// export const MUICheckboxPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUICheckboxPage'))
// );
// export const MUIChipPage = Loadable(lazy(() => import('../pages/components/mui/MUIChipPage')));
// export const MUIDataGridPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIDataGridPage'))
// );
// export const MUIDialogPage = Loadable(lazy(() => import('../pages/components/mui/MUIDialogPage')));
// export const MUIListPage = Loadable(lazy(() => import('../pages/components/mui/MUIListPage')));
// export const MUIMenuPage = Loadable(lazy(() => import('../pages/components/mui/MUIMenuPage')));
// export const MUIPaginationPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIPaginationPage'))
// );
// export const MUIPickersPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIPickersPage'))
// );
// export const MUIPopoverPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIPopoverPage'))
// );
// export const MUIProgressPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIProgressPage'))
// );
// export const MUIRadioButtonsPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIRadioButtonsPage'))
// );
// export const MUIRatingPage = Loadable(lazy(() => import('../pages/components/mui/MUIRatingPage')));
// export const MUISliderPage = Loadable(lazy(() => import('../pages/components/mui/MUISliderPage')));
// export const MUIStepperPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUIStepperPage'))
// );
// export const MUISwitchPage = Loadable(lazy(() => import('../pages/components/mui/MUISwitchPage')));
// export const MUITablePage = Loadable(lazy(() => import('../pages/components/mui/MUITablePage')));
// export const MUITabsPage = Loadable(lazy(() => import('../pages/components/mui/MUITabsPage')));
// export const MUITextFieldPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITextFieldPage'))
// );
// export const MUITimelinePage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITimelinePage'))
// );
// export const MUITooltipPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITooltipPage'))
// );
// export const MUITransferListPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITransferListPage'))
// );
// export const MUITreesViewPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITreesViewPage'))
// );

// EXTRA (Commented out - Not needed)
// export const DemoAnimatePage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoAnimatePage'))
// );
// export const DemoCarouselsPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoCarouselsPage'))
// );
// export const DemoChartsPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoChartsPage'))
// );
// export const DemoCopyToClipboardPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoCopyToClipboardPage'))
// );
// export const DemoEditorPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoEditorPage'))
// );
// export const DemoFormValidationPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoFormValidationPage'))
// );
// export const DemoImagePage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoImagePage'))
// );
// export const DemoLabelPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoLabelPage'))
// );
// export const DemoLightboxPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoLightboxPage'))
// );
// export const DemoMapPage = Loadable(lazy(() => import('../pages/components/extra/DemoMapPage')));
// export const DemoMegaMenuPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoMegaMenuPage'))
// );
// export const DemoMultiLanguagePage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoMultiLanguagePage'))
// );
// export const DemoNavigationBarPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoNavigationBarPage'))
// );
// export const DemoOrganizationalChartPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoOrganizationalChartPage'))
// );
// export const DemoScrollbarPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoScrollbarPage'))
// );
// export const DemoSnackbarPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoSnackbarPage'))
// );
// export const DemoTextMaxLinePage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoTextMaxLinePage'))
// );
// export const DemoUploadPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoUploadPage'))
// );
// export const DemoMarkdownPage = Loadable(
//   lazy(() => import('../pages/components/extra/DemoMarkdownPage'))
// );
