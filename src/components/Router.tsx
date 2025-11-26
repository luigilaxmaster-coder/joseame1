import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

// Pages
import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import RoleSelectionPage from '@/components/pages/RoleSelectionPage';
import ClientOnboardingPage from '@/components/pages/ClientOnboardingPage';
import JoseadorOnboardingPage from '@/components/pages/JoseadorOnboardingPage';
import ClientDashboardPage from '@/components/pages/ClientDashboardPage';
import JoseadorDashboardPage from '@/components/pages/JoseadorDashboardPage';
import PublishJobPage from '@/components/pages/PublishJobPage';
import JobDetailsPage from '@/components/pages/JobDetailsPage';
import WalletPage from '@/components/pages/WalletPage';
import BuyPiquetesPage from '@/components/pages/BuyPiquetesPage';
import ProfilePage from '@/components/pages/ProfilePage';
import ClientMyJobsPage from '@/components/pages/ClientMyJobsPage';
import JoseadorMyJobsPage from '@/components/pages/JoseadorMyJobsPage';
import InboxPage from '@/components/pages/InboxPage';
import DisputesPage from '@/components/pages/DisputesPage';
import DisputeDetailsPage from '@/components/pages/DisputeDetailsPage';
import AboutPage from '@/components/pages/AboutPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import AdminDashboardPage from '@/components/pages/AdminDashboardPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "role-selection",
        element: (
          <MemberProtectedRoute>
            <RoleSelectionPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute>
            <ProfilePage />
          </MemberProtectedRoute>
        ),
      },
      // Client Routes
      {
        path: "client/onboarding",
        element: (
          <MemberProtectedRoute>
            <ClientOnboardingPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/dashboard",
        element: (
          <MemberProtectedRoute>
            <ClientDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/publish-job",
        element: (
          <MemberProtectedRoute>
            <PublishJobPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/my-jobs",
        element: (
          <MemberProtectedRoute>
            <ClientMyJobsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/inbox",
        element: (
          <MemberProtectedRoute>
            <InboxPage />
          </MemberProtectedRoute>
        ),
      },
      // Joseador Routes
      {
        path: "joseador/onboarding",
        element: (
          <MemberProtectedRoute>
            <JoseadorOnboardingPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/dashboard",
        element: (
          <MemberProtectedRoute>
            <JoseadorDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/wallet",
        element: (
          <MemberProtectedRoute>
            <WalletPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/buy-piquetes",
        element: (
          <MemberProtectedRoute>
            <BuyPiquetesPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/my-applications",
        element: (
          <MemberProtectedRoute>
            <JoseadorMyJobsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/inbox",
        element: (
          <MemberProtectedRoute>
            <InboxPage />
          </MemberProtectedRoute>
        ),
      },
      // Shared Routes
      {
        path: "job/:jobId",
        element: <JobDetailsPage />,
      },
      {
        path: "checkout",
        element: (
          <MemberProtectedRoute>
            <CheckoutPage />
          </MemberProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: "admin/dashboard",
        element: (
          <MemberProtectedRoute>
            <AdminDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/disputes",
        element: (
          <MemberProtectedRoute>
            <DisputesPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/dispute/:disputeId",
        element: (
          <MemberProtectedRoute>
            <DisputeDetailsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
