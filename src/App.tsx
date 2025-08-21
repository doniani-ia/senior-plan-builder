import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminStudio from "./pages/AdminStudio";
import ColaboradorProfile from "./pages/ColaboradorProfile";
import AvaliarColaborador from "./pages/AvaliarColaborador";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStudio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['gestor']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/avaliar" 
              element={
                <ProtectedRoute allowedRoles={['gestor']}>
                  <AvaliarColaborador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/colaborador" 
              element={
                <ProtectedRoute allowedRoles={['colaborador']}>
                  <ColaboradorProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root based on user role */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
