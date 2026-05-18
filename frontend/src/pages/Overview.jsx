import { Link } from "react-router-dom";
import { Car, FileText, Receipt, Plus } from "lucide-react";

export default function Overview() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Bienvenido</p>
      <h1 className="font-display text-4xl font-bold text-navy mt-1">AutoRegistro GT</h1>
      <p className="text-muted-foreground mt-2">Gestiona tu flota vehicular desde un solo lugar.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card to="/dashboard" icon={Car} title="Mis Vehículos" desc="Ver todos tus vehículos registrados." />
        <Card to="/register" icon={Plus} title="Registrar Nuevo" desc="Registra un nuevo vehículo." />
        <Card to="/certificates" icon={FileText} title="Certificados" desc="Tarjetas de circulación." />
      </div>
    </div>
  );
}

function Card({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="block p-6 bg-card border-2 border-border rounded-lg hover:border-navy transition-colors">
      <Icon className="h-8 w-8 text-navy" />
      <h3 className="font-display text-xl font-bold text-navy mt-3">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </Link>
  );
}
