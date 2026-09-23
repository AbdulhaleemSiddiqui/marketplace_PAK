import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Find from "./pages/Find";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";

import {
  clearAdminSession,
  hasValidAdminSession,
} from "./services/adminSession";

import { adminApiRequest } from "./services/adminApiClient";

function useValidatedAdminSession() {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (!hasValidAdminSession()) {
        if (!cancelled) {
          setValid(false);
          setChecking(false);
        }
        return;
      }

      try {
        const admin = await adminApiRequest<{ role: string }>("/api/auth/me");
        const isAdmin = admin?.role?.toLowerCase() === "admin";

        if (!isAdmin) clearAdminSession();
        if (!cancelled) setValid(isAdmin);
      } catch {
        clearAdminSession();
        if (!cancelled) setValid(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    void validate();
    return () => { cancelled = true; };
  }, []);

  return { checking, valid };
}

function AdminSessionChecking() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
        Checking admin session...
      </div>
    </div>
  );
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { checking, valid } = useValidatedAdminSession();

  if (checking) return <AdminSessionChecking />;

  if (!valid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminLoginRoute() {
  const { checking, valid } = useValidatedAdminSession();

  if (checking) return <AdminSessionChecking />;

  if (valid) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminLogin />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Find />}
        />

        <Route
          path="/find"
          element={<Find />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/admin/login"
          element={
            <AdminLoginRoute />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
