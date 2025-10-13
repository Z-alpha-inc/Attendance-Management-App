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
import ProtectedRoute from "./components/ProtectedEmployeeRoutes";
import SignUpPage from "./pages/SignUpPage";
function App() {
  return (
    <div style={styles.appContainer}>
      <main style={styles.mainContent}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />      
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/AdminShow" element={
                <ProtectedAdminRoute>
                  <AdminShow />
                </ProtectedAdminRoute>
              } />
          
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

        
              <Route 
                path="/attendance/edit/:id" 
                element={
                  <ProtectedEmployeeRoutes>
                    <UserAttendanceEdit />
                  </ProtectedEmployeeRoutes>
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </main>
    </div>
  );
}

const styles = {
  // アプリケーション全体の大枠
  appContainer: {
    backgroundColor: '#f0f2f5', // 背景色
    minHeight: '100vh',         // 画面の高さいっぱいに表示
    padding: '2rem 0',          // 上下に少し余白を持たせる
  },

  // 各ページが表示されるメインコンテンツ領域
  mainContent: {
    maxWidth: '1200px', // コンテンツの最大幅
    margin: '0 auto',   // ★この設定でコンテンツ全体が中央に配置されます
    padding: '2rem',    // 内側の余白
    backgroundColor: '#ffffff', // コンテンツエリアの背景を白に
    borderRadius: '8px',        // 角を少し丸める
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // 影をつけて立体感を出す
  },
};

export default App;