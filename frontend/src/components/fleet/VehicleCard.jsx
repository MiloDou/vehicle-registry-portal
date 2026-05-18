import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusStyles = {
  ACTIVA:                "bg-[#EAB308] text-navy font-extrabold",
  INACTIVA_IMPAGO:       "bg-red-500 text-white font-extrabold",
  INACTIVA_VENCIMIENTO:  "bg-[#F97316] text-navy font-extrabold",
};

const statusLabel = {
  ACTIVA:                "ACTIVA",
  INACTIVA_IMPAGO:       "IMPAGO",
  INACTIVA_VENCIMIENTO:  "VENCIDA",
};

export function VehicleCard({ tarjeta: t }) {
  const estado = t.estado || "ACTIVA";
  const isInactiva = estado !== "ACTIVA";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <article className="group relative bg-white border-2 border-navy/20 shadow-sm hover:border-navy transition-all flex flex-col p-6">
      {/* Esquina decorativa */}
      <div
        className={cn(
          "absolute top-0 right-0 w-0 h-0 border-t-[48px] border-l-[48px] border-l-transparent",
          isInactiva ? "border-t-red-400" : "border-t-[#8B4513]"
        )}
      />

      <div className="flex-1 flex flex-col">
        {/* Badge de estado */}
        <div className="flex items-center mb-4 z-10 relative gap-1">
          <div className="bg-navy text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
            Tarjeta de Circulación
          </div>
          <div className={cn("px-3 py-1 text-[10px] tracking-widest uppercase", statusStyles[estado] ?? statusStyles.ACTIVA)}>
            {statusLabel[estado] ?? estado}
          </div>
        </div>

        {/* Nombre del propietario — desplegado como título principal */}
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Propietario</p>
        <h3 className="font-display text-xl font-semibold text-navy tracking-tight mb-1 pr-8 uppercase">
          {t.propietario}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4 font-mono">NIT: {t.nit}</p>

        {/* Datos del vehículo */}
        <dl className="space-y-3 flex-1 mb-6">
          <Row label="Placa"   value={t.placa} />
          <Row label="Vehículo" value={`${t.nombre_marca} ${t.nombre_linea}${t.modelo ? " " + t.modelo : ""}`} />
          <Row label="Color"   value={t.nombre_color} />
          <Row label="Código"  value={t.tarjeta} mono />
          <Row label="Vence"   value={formatDate(t.fecha_de_vencimiento)} />
        </dl>

        {/* Botones */}
        <div className="flex items-center gap-2 mt-auto">
          <Link to={`/certificates/${encodeURIComponent(t.tarjeta)}`} className="flex-1">
            <Button className="w-full font-bold rounded-none h-11 border-2 bg-navy text-white hover:bg-navy-hover border-navy">
              Ver Detalles
            </Button>
          </Link>
          <Link to={`/maintenance/${encodeURIComponent(t.tarjeta)}`}>
            <Button
              variant="outline"
              className="rounded-none h-11 w-12 p-0 border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors shrink-0"
              aria-label="Mantenimiento"
            >
              <Wrench className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between border-b border-navy/10 pb-1">
      <dt className="text-xs font-semibold text-navy/70">{label}</dt>
      <dd className={cn("text-xs font-bold text-navy uppercase", mono && "font-mono")}>{value ?? "—"}</dd>
    </div>
  );
}
