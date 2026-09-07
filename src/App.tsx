import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Find from "./pages/Find";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
          Meeting change:
          Home.tsx delete nahi hua.
          Filhal homepage UI hidden hai.

          "/" directly marketplace open karega.
        */}

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
          path="/admin"
          element={
            <AdminDashboard />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}