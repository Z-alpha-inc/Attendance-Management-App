import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import UserAttendanceEdit from "./pages/UserAttendanceEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* "/" にアクセスしたら "/route" に自動で移動する */}
        <Route path="/" element={<HomePage />} />


        {/* URLが "/login" の場合にLoginPageを表示 */}
        <Route path="/login" element={<LoginPage />} />

        {/* URLが "/dashboard" の場合にDashboardPageを表示 */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* URLが "/admin" の場合にAdminPageを表示 */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/attendance/edit/:id" element={<UserAttendanceEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;