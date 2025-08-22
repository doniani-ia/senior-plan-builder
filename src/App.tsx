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
import AdminQuestionarios from "./pages/AdminQuestionarios";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminAcoesPDI from "./pages/AdminAcoesPDI";
import ColaboradorProfile from "./pages/ColaboradorProfile";
import ColaboradorAvaliacoes from "./pages/ColaboradorAvaliacoes";
import AvaliarColaborador from "./pages/AvaliarColaborador";
import Colaboradores from "./pages/Colaboradores";
import VisualizarPDI from "./pages/VisualizarPDI";
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
              path="/admin/questionarios" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminQuestionarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/acoes-pdi" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAcoesPDI />
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
              path="/colaboradores" 
              element={
                <ProtectedRoute allowedRoles={['gestor']}>
                  <Colaboradores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pdis" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'gestor', 'colaborador']}>
                  <VisualizarPDI />
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
            <Route 
              path="/colaborador/avaliacoes" 
              element={
                <ProtectedRoute allowedRoles={['colaborador']}>
                  <ColaboradorAvaliacoes />
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
