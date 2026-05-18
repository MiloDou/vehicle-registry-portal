import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AppLayout } from "./components/layout/AppLayout";
import Overview from "./pages/Overview";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Certificates from "./pages/Certificates";
import CertificateDetails from "./pages/CertificateDetails";
import MaintenancePage from "./pages/MaintenancePage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="register" element={<Register />} />
          {/* Lista de certificados */}
          <Route path="certificates" element={<Certificates />} />
          {/* Detalle de un certificado específico */}
          <Route path="certificates/:tarjeta" element={<CertificateDetails />} />
          {/* Mantenimiento de tarjeta */}
          <Route path="maintenance/:tarjeta" element={<MaintenancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}