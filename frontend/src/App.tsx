import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import UserAttendanceEdit from "./pages/UserAttendanceEdit";
import ProtectedEmployeeRoutes from "./components/ProtectedEmployeeRoutes";
import AdminShow from "./pages/AdminShowPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import TimeShow from "./pages/TimeShowPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* "/" にアクセスしたら "/route" に自動で移動する */}
        <Route path="/" element={<HomePage />} />


        {/* URLが "/login" の場合にLoginPageを表示 */}
        <Route path="/login" element={<LoginPage />} />

        {/* URLが "/dashboard" の場合にDashboardPageを表示 */}

        {/* URLが "/admin" の場合にAdminPageを表示 */}
       <Route 
          path="/AdminShow" 
          element={
            <ProtectedAdminRoute>
              <AdminShow/>
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/attendance/:user_id" 
          element={
            <ProtectedAdminRoute>
              <TimeShow/>
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedEmployeeRoutes>
              <DashboardPage />
            </ProtectedEmployeeRoutes>
          } 
        />

        {/* 出勤編集ページもログイン必須 */}
        <Route 
          path="/attendance/edit/:id" 
          element={
            <ProtectedEmployeeRoutes>
              <UserAttendanceEdit />
            </ProtectedEmployeeRoutes>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;