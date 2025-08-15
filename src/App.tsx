import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHomePage from "./pages/AdminHomePage";
import PassengerDashboard from "./pages/PassengerDashboard";
import UserPortal from "./pages/UserPortal";
import TrainStatus from "./pages/TrainStatus";
import StationInfo from "./pages/StationInfo";
import BookTicket from "./pages/BookTicket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import HelpCenter from "./pages/HelpCenter";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import TripPlannerPage from "./pages/TripPlannerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route 
              index 
              element={
                <ProtectedRoute requireRole="user">
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="passenger"
              element={
                <ProtectedRoute requireRole="user">
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="user"
              element={
                <ProtectedRoute requireRole="user">
                  <UserPortal />
                </ProtectedRoute>
              }
            />
            <Route path="train-status" element={<TrainStatus />} />
            <Route path="stations" element={<StationInfo />} />
            <Route
              path="book-ticket"
              element={
                <ProtectedRoute>
                  <BookTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="trip-planner"
              element={
                <ProtectedRoute>
                  <TripPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route path="help" element={<HelpCenter />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;