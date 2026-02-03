import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { useRoleStore } from '@/store/roleStore';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load pages
const HomePage = lazy(() => import('@/components/pages/HomePage'));
const LoginPage = lazy(() => import('@/components/pages/LoginPage'));
const RoleSelectionPage = lazy(() => import('@/components/pages/RoleSelectionPage'));
const ClientOnboardingPage = lazy(() => import('@/components/pages/ClientOnboardingPage'));
const JoseadorOnboardingPage = lazy(() => import('@/components/pages/JoseadorOnboardingPage'));
const ClientDashboardPage = lazy(() => import('@/components/pages/ClientDashboardPage'));
const JoseadorDashboardPage = lazy(() => import('@/components/pages/JoseadorDashboardPage'));
const PublishJobPage = lazy(() => import('@/components/pages/PublishJobPage'));
const JobDetailsPage = lazy(() => import('@/components/pages/JobDetailsPage'));
const WalletPage = lazy(() => import('@/components/pages/WalletPage'));
const BuyPiquetesPage = lazy(() => import('@/components/pages/BuyPiquetesPage'));
const ProfilePage = lazy(() => import('@/components/pages/ProfilePage'));
const ClientMyJobsPage = lazy(() => import('@/components/pages/ClientMyJobsPage'));
const JoseadorMyJobsPage = lazy(() => import('@/components/pages/JoseadorMyJobsPage'));
const InboxPage = lazy(() => import('@/components/pages/InboxPage'));
const DisputesPage = lazy(() => import('@/components/pages/DisputesPage'));
const DisputeDetailsPage = lazy(() => import('@/components/pages/DisputeDetailsPage'));
const AboutPage = lazy(() => import('@/components/pages/AboutPage'));
const CheckoutPage = lazy(() => import('@/components/pages/CheckoutPage'));
const AdminDashboardPage = lazy(() => import('@/components/pages/AdminDashboardPage'));
const AdminUsersVerificationPage = lazy(() => import('@/components/pages/AdminUsersVerificationPage'));
const JoseadorVerificationPage = lazy(() => import('@/components/pages/JoseadorVerificationPage'));

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </>
  );
}

// Redirect component for client onboarding
function ClientOnboardingRedirect() {
  const { clientOnboardingCompleted } = useRoleStore();
  if (clientOnboardingCompleted) {
    return <Navigate to="/client/dashboard" replace />;
  }
  return <ClientOnboardingPage />;
}

// Redirect component for joseador onboarding
function JoseadorOnboardingRedirect() {
  const { joseadorOnboardingCompleted } = useRoleStore();
  if (joseadorOnboardingCompleted) {
    return <Navigate to="/joseador/dashboard" replace />;
  }
  return <JoseadorOnboardingPage />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<LoadingSpinner />}><HomePage /></Suspense>,
      },
      {
        path: "login",
        element: <Suspense fallback={<LoadingSpinner />}><LoginPage /></Suspense>,
      },
      {
        path: "about",
        element: <Suspense fallback={<LoadingSpinner />}><AboutPage /></Suspense>,
      },
      {
        path: "role-selection",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><RoleSelectionPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      // Client Routes
      {
        path: "client/onboarding",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><ClientOnboardingRedirect /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/dashboard",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><ClientDashboardPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/publish-job",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><PublishJobPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/my-jobs",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><ClientMyJobsPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/inbox",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><InboxPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "client/wallet",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><WalletPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      // Joseador Routes
      {
        path: "joseador/onboarding",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><JoseadorOnboardingRedirect /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/dashboard",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><JoseadorDashboardPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/wallet",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><WalletPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/buy-piquetes",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><BuyPiquetesPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/my-applications",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><JoseadorMyJobsPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/inbox",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><InboxPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "joseador/verification",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><JoseadorVerificationPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      // Shared Routes
      {
        path: "job/:jobId",
        element: <Suspense fallback={<LoadingSpinner />}><JobDetailsPage /></Suspense>,
      },
      {
        path: "checkout",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><CheckoutPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: "admin/dashboard",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><AdminDashboardPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/users-verification",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><AdminUsersVerificationPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/disputes",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><DisputesPage /></Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/dispute/:disputeId",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}><DisputeDetailsPage /></Suspense>
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
