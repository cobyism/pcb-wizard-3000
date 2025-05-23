import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import BoardsPage from "./pages/BoardsPage";
import BoardDetail from "./pages/BoardDetail";
import UploadPage from "./pages/UploadPage";
import AppHeader from "./components/AppHeader";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authed = !!localStorage.getItem("token");
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const Layout = () => (
  <>
    <div className="p-8 mx-auto">
      <AppHeader />
      <main className="flex flex-col gap-8 p-8 mx-auto max-w-4xl">
        <Outlet />
      </main>
    </div>
  </>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<BoardDetail />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthed() ? "/boards" : "/auth"} />}
      />
    </Routes>
  );
}
