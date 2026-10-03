import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/useAuth';

// Lazy loading pages for better performance and split architecture
const CustomerLayout = React.lazy(() => import('./layouts/CustomerLayout'));
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const PracticeLayout = React.lazy(() => import('./layouts/PracticeLayout'));

const Home = React.lazy(() => import('./pages/customer/Home'));
const CustomerProducts = React.lazy(() => import('./pages/customer/Products'));
const Categories = React.lazy(() => import('./pages/customer/Categories'));
const Deals = React.lazy(() => import('./pages/customer/Deals'));
const ProductDetails = React.lazy(() => import('./pages/customer/ProductDetails'));
const Cart = React.lazy(() => import('./pages/customer/Cart'));
const Checkout = React.lazy(() => import('./pages/customer/Checkout'));
const Profile = React.lazy(() => import('./pages/customer/Profile'));
const Orders = React.lazy(() => import('./pages/customer/Orders'));
const Settings = React.lazy(() => import('./pages/customer/Settings'));
const Wishlist = React.lazy(() => import('./pages/customer/Wishlist'));
const Login = React.lazy(() => import('./pages/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/Products'));

// Practice Pages
const PracticeDashboard = React.lazy(() => import('./pages/practice/PracticeDashboard'));
const BasicElements = React.lazy(() => import('./pages/practice/BasicElements'));
const AdvancedInputs = React.lazy(() => import('./pages/practice/AdvancedInputs'));
const TablesLists = React.lazy(() => import('./pages/practice/TablesLists'));
const Interactions = React.lazy(() => import('./pages/practice/Interactions'));
const PopupsDialogs = React.lazy(() => import('./pages/practice/PopupsDialogs'));
const FramesDOM = React.lazy(() => import('./pages/practice/FramesDOM'));
const DynamicWaiting = React.lazy(() => import('./pages/practice/DynamicWaiting'));
const PaginationChallenge = React.lazy(() => import('./pages/practice/PaginationChallenge'));
const LazyLoadingChallenge = React.lazy(() => import('./pages/practice/LazyLoadingChallenge'));
const ApiInterception = React.lazy(() => import('./pages/practice/ApiInterception'));
const ProgressBarChallenge = React.lazy(() => import('./pages/practice/ProgressBarChallenge'));
const ClickTraps = React.lazy(() => import('./pages/practice/ClickTraps'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Role based protection
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) => {
  const { role } = useAuth();
  if (role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <HashRouter>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Practice Portal */}
          <Route path="/practice" element={<PracticeLayout />}>
            <Route index element={<PracticeDashboard />} />
            <Route path="basic" element={<BasicElements />} />
            <Route path="advanced" element={<AdvancedInputs />} />
            <Route path="tables" element={<TablesLists />} />
            <Route path="interactions" element={<Interactions />} />
            <Route path="dialogs" element={<PopupsDialogs />} />
            <Route path="frames" element={<FramesDOM />} />
            <Route path="dynamic" element={<DynamicWaiting />} />
            <Route path="pagination-test" element={<PaginationChallenge />} />
            <Route path="lazy-load" element={<LazyLoadingChallenge />} />
            <Route path="api-interception" element={<ApiInterception />} />
            <Route path="progress-bar" element={<ProgressBarChallenge />} />
            <Route path="click-traps" element={<ClickTraps />} />
          </Route>

          {/* Customer Application */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<CustomerProducts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="deals" element={<Deals />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};
