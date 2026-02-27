import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import ClientesPage from "./pages/ClientesPage";
import ObrasPage from "./pages/ObrasPage";
import EquipePage from "./pages/EquipePage";
import LaudosPage from "./pages/LaudosPage";
import NovoLaudoPage from "./pages/NovoLaudoPage";
import LaudoDetailPage from "./pages/LaudoDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/obras" element={<ObrasPage />} />
            <Route path="/equipe" element={<EquipePage />} />
            <Route path="/laudos" element={<LaudosPage />} />
            <Route path="/laudos/novo" element={<NovoLaudoPage />} />
            <Route path="/laudos/:id" element={<LaudoDetailPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
