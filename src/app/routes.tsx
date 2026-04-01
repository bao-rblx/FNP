import { createBrowserRouter, Outlet } from "react-router";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import GuestOrderDetail from "./pages/GuestOrderDetail";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Redeem from "./pages/Redeem";
import { PageAnimator } from "./components/PageAnimator";
import { BottomNav } from "./components/BottomNav";
import React from "react";

function RootLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <PageAnimator><Home /></PageAnimator> },
      { path: "/auth", element: <PageAnimator><Auth /></PageAnimator> },
      { path: "/services/:category", element: <PageAnimator><Services /></PageAnimator> },
      { path: "/product/:id", element: <PageAnimator><ProductDetail /></PageAnimator> },
      { path: "/cart", element: <PageAnimator><Cart /></PageAnimator> },
      { path: "/checkout", element: <PageAnimator><Checkout /></PageAnimator> },
      { path: "/orders", element: <PageAnimator><Orders /></PageAnimator> },
      { path: "/order/:id", element: <PageAnimator><OrderDetail /></PageAnimator> },
      { path: "/order/guest/:id", element: <PageAnimator><GuestOrderDetail /></PageAnimator> },
      { path: "/profile", element: <PageAnimator><Profile /></PageAnimator> },
      { path: "/admin", element: <PageAnimator><Admin /></PageAnimator> },
      { path: "/redeem", element: <PageAnimator><Redeem /></PageAnimator> },
    ],
  },
]);