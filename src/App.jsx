import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "../frontend/loginpage";
import ProtectedRoute from "../frontend/ProtectedRouts";
import Adminpage from "../frontend/admin";
import ShopAdministration from "../frontend/ShopAdmin";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Adminpage />
              </ProtectedRoute>
            }
          />
          <Route
  path="/ShopAdmin"
  element={
    <ProtectedRoute>
      <ShopAdministration />
    </ProtectedRoute>
  }
/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
