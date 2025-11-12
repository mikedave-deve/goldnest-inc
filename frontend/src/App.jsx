import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import ForgetPassword from "./Pages/ForgetPassword.jsx";
import About from "./Pages/About.jsx";
import Investment from "./Pages/Investment.jsx";
import Partners from "./Pages/Partners.jsx";
import ContactUs from "./Pages/ContactUs.jsx";
import PostDashboard from "./Pages/PostDashboard.jsx";
import AddDeposit from "./Pages/AddDeposit.jsx";
import AskForWithdrawal from "./Pages/AskForWithdrawal.jsx";
import ActiveDeposit from "./Pages/ActiveDeposit.jsx";
import TransactionHistory from "./Pages/TransactionHistory.jsx";
import Referral from "./Pages/Referral.jsx";
import ProfileSettings from "./Pages/ProfileSettings.jsx";
import DepositConfirmation from "./Pages/DepositConfirmation.jsx.jsx";
import ResetPassword from '../Pages/ResetPassword.jsx';


//Admin Dashboard Pages
import AdminDashboard from "./Pages/admin/AdminDashboard.jsx";
import UsersManagement from "./Pages/admin/UsersManagement.jsx";
import DepositsManagement from "./Pages/admin/DepositsManagement.jsx";
import WithdrawalsManagement from "./Pages/admin/WithdrawalsManagement.jsx";
import TransactionsManagement from "./Pages/admin/TransactionsManagement.jsx";
import ReferralsManagement from "./Pages/admin/ReferralsManagement.jsx";
import AdminSettings from "./Pages/admin/AdminSettings.jsx";

// Route Protection Components
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
  return ( 
  <div className="w-full min-h-screen m-0 p-0">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/ForgetPassword" element={<ForgetPassword />} />
        <Route path="/About" element={<About />} />
        <Route path="/Investment" element={<Investment />} />
        <Route path="/Partners" element={<Partners />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================================================
            USER DASHBOARD ROUTES - Requires authentication
            ================================================ */}
        <Route
          path="/PostDashboard"
          element={
            <ProtectedRoute>
              <PostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddDeposit"
          element={
            <ProtectedRoute>
              <AddDeposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AskForWithdrawal"
          element={
            <ProtectedRoute>
              <AskForWithdrawal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ActiveDeposit"
          element={
            <ProtectedRoute>
              <ActiveDeposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TransactionHistory"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Referral"
          element={
            <ProtectedRoute>
              <Referral />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ProfileSettings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DepositConfirmation"
          element={
            <ProtectedRoute>
              <DepositConfirmation />
            </ProtectedRoute>
          }
        />
        

        {/* ================================================
            ADMIN DASHBOARD ROUTES - Requires admin role
            ================================================ */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <AdminRoute>
              <DepositsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <AdminRoute>
              <WithdrawalsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminRoute>
              <TransactionsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/referrals"
          element={
            <AdminRoute>
              <ReferralsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        {/* ================================================
            404 ROUTE - Catch all unmatched routes
            ================================================ */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                <p className="text-xl mb-6">Page Not Found</p>
                <a
                  href="/"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded font-semibold"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
