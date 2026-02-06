import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import ProductPage from '../pages/ProductPage';
import HomePage from '../pages/HomePage';
import CartPage from '../pages/CartPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ShippingPage from '../pages/ShippingPage';
import PrivateRoute from '../components/PrivateRoute';
import PaymentPage from '../pages/PaymentPage';
import PlaceOrderPage from '../pages/PlaceOrderPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import AdminRoute from '../components/AdminRoute';
import OrderListPage from '../pages/admin/OrderListPage';
import ProductListPage from '../pages/admin/ProductListPage';
import UserListPage from '../pages/admin/UserListPage';
import MyProfilePage from '../pages/MyProfilePage';
import CategoryPage from '../pages/CategoryPage';
import ManageListingsPage from '../pages/ManageListingsPage';
import UserProductEditPage from '../pages/UserProductEditPage';
import AddProductPage from '../pages/AddProductPage';
import ProductFormPage from '../pages/admin/ProductFormPage';
import UpdateUserFormPage from '../pages/admin/UpdateUserFormPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminDashboard from '../AdminDashboard';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import Dashboard from '../pages/admin/Dashboard';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminListPage from '../pages/admin/AdminListPage';
import ResetPasswordRequestPage from '../pages/ResetPasswordRequestPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import RequestGiftPage from '../pages/RequestGiftPage';
import GiftRequestsReceivedPage from '../pages/GiftRequestsReceivedPage';
import MailboxPage from '../pages/MailboxPage';
import SearchPage from '../pages/SearchPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        path: '/',
        element: <HomePage />
      },
      {
        path: '/category/:categoryName',
        element: <CategoryPage />
      },
      {
        path: '/product/:id',
        element: <ProductPage />
      },
      {
        path: '/cart',
        element: <CartPage />
      },
      {
        path: '/reset-password',
        element: <ResetPasswordRequestPage />
      },
      {
        path: '/reset-password/:id/:token',
        element: <ResetPasswordPage />
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      },
      {
        path: '/users/:name', 
        element: <MyProfilePage />
      },
      {
        path: '/search',
        element: <SearchPage />
      },
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          {
            path: '/shipping',
            element: <ShippingPage />
          },
          {
            path: '/payment',
            element: <PaymentPage />
          },
          {
            path: '/place-order',
            element: <PlaceOrderPage />
          },
          {
            path: '/order/:id',
            element: <OrderDetailsPage />
          },
          {
            path: '/profile',
            element: <ProfilePage />
          },
          {
            path: '/add-product',
            element: <AddProductPage />
          },
          {
            path: '/manage-listings',
            element: <ManageListingsPage />
          },
          {
            path: "/product/update/:id",
            element: <UserProductEditPage />

          },
          {
             path: "/request-gift/:sellerName",
             element: <RequestGiftPage />
          }, 
          {
             path: "/gift-requests",
             element: <GiftRequestsReceivedPage />
          }, 
          {
             path: "/mailbox",
             element: <MailboxPage />
          }, 

        ]
      }
    ]
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />
  },
  {
    path: '',
    element: <AdminDashboard />,
    children: [
      {
        path: '',
        element: <AdminRoute />,
        children: [
          {
            path: '/admin/dashboard',
            element: <Dashboard />
          },
          {
            path: '/admin/order-list',
            element: <OrderListPage />
          },
          {
            path: '/admin/product-list',
            element: <ProductListPage />
          },
          {
            path: '/admin/user-list',
            element: <UserListPage />
          },
          {
            path: '/admin/product/create',
            element: <ProductFormPage />
          },
          {
            path: '/admin/profile',
            element: <AdminProfilePage />
          },
          {
            path: '/admin/admin-list',
            element: <AdminListPage />
          },
          {
            path: '/admin/order/:id',
            element: <OrderDetailsPage />
          },
          {
            path: '/admin/user/update/:id',
            element: <UpdateUserFormPage />
          },
          {
            path: '/admin/product/update/:id',
            element: <ProductFormPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
