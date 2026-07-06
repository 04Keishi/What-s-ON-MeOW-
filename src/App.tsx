import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import RequireAuth from "@/components/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  );
}
