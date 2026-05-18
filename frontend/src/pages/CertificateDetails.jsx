import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ESTADO = {
  ACTIVA:               { label: "VIGENTE",       color: "bg-[#EAB308]", border: "border-l-[#EAB308]" },
  INACTIVA_IMPAGO:      { label: "BAJA — IMPAGO",  color: "bg-red-500",   border: "border-l-red-500"   },
  INACTIVA_VENCIMIENTO: { label: "VENCIDA",        color: "bg-orange-500",border: "border-l-orange-500"},
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

export default function CertificateDetails() {
  const { tarjeta } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tarjeta) return;
    setLoading(true);
    fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}`)
      .then((r) => r.ok ? r.json() : r.json().then((e) => Promise.reject(e.error || "No encontrada")))
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [tarjeta]);

  if (loading) {
    return (
      <div className="grid place-items-center py-32 gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Cargando tarjeta de circulación...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-red-600 font-bold text-lg mb-4">{error ?? "No se encontró la tarjeta"}</p>
        <Link to="/certificates">
          <Button variant="outline" className="rounded-none">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
          </Button>
        </Link>
      </div>
    );
  }

  const est = ESTADO[data.estado] ?? ESTADO.ACTIVA;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Breadcrumb */}
      <Link
        to="/certificates"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-navy uppercase tracking-widest mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al listado
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest mb-2">
            Documentación Oficial · {data.tarjeta}
          </p>
          <h1 className="font-display text-5xl font-extrabold text-navy tracking-tight mb-3">
            Tarjeta de Circulación
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Detalles completos del registro vehicular.
          </p>
        </div>
        <Link to={`/maintenance/${encodeURIComponent(data.tarjeta)}`}>
          <Button className="h-14 px-8 bg-[#B45309] text-white hover:bg-[#92400E] rounded-none font-bold uppercase tracking-widest text-xs">
            <Wrench className="h-4 w-4 mr-3" /> Mantenimiento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta principal */}
        <div className="lg:col-span-2 bg-white border border-navy/10 shadow-sm overflow-hidden">
          {/* Franja de estado */}
          <div className={cn("h-2", est.color)} />

          <div className="p-10">
            {/* Propietario y Placa */}
            <div className="flex justify-between items-start border-b-2 border-navy/10 pb-6 mb-8">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Propietario</p>
                <h2 className="font-sans text-2xl font-bold text-navy uppercase">{data.propietario}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-mono">NIT: {data.nit}</p>
                {data.cui && <p className="text-xs text-muted-foreground font-mono">CUI: {data.cui}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Placa</p>
                <h2 className="font-sans text-2xl font-bold text-navy uppercase">{data.placa}</h2>
              </div>
            </div>

            {/* Datos del Vehículo */}
            <p className="text-[10px] uppercase font-bold tracking-widest text-navy/50 mb-4">Datos del Vehículo</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <Pair label="Marca"    value={data.marca} />
              <Pair label="VIN"      value={data.vin} mono />
              <Pair label="Línea"    value={data.linea} />
              <Pair label="Motor"    value={data.motor || "No registrado"} mono />
              <Pair label="Año"      value={data.anio || "—"} />
              <Pair label="Tipo"     value={data.tipo} />
              <Pair label="Color"    value={data.color} />
              <Pair label="Uso"      value={data.uso} />
              {data.serie     && <Pair label="Serie"     value={data.serie} mono />}
              {data.asientos  && <Pair label="Asientos"  value={String(data.asientos)} />}
              {data.cilindros && <Pair label="Cilindros" value={String(data.cilindros)} />}
              {data.cc        && <Pair label="CC"        value={String(data.cc)} />}
              {data.ejes      && <Pair label="Ejes"      value={String(data.ejes)} />}
              {data.toneladas && <Pair label="Toneladas" value={String(data.toneladas)} />}
            </div>

            {/* Datos del Propietario */}
            {(data.telefono || data.correo || data.direccion || data.nombre_representante) && (
              <>
                <p className="text-[10px] uppercase font-bold tracking-widest text-navy/50 mb-4">
                  Contacto del Propietario
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
                  {data.tipo_contribuyente    && <Pair label="Tipo"          value={data.tipo_contribuyente} />}
                  {data.nombre_representante  && <Pair label="Representante" value={data.nombre_representante} />}
                  {data.telefono              && <Pair label="Teléfono"      value={data.telefono} />}
                  {data.correo                && <Pair label="Correo"        value={data.correo} />}
                  {data.direccion             && <Pair label="Dirección"     value={data.direccion} />}
                </div>
              </>
            )}

            {/* Fechas */}
            <div className="flex items-center justify-between border-t-2 border-navy pt-6">
              <div className="flex gap-10">
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Expedición</p>
                  <p className="font-bold text-navy text-sm">{fmtDate(data.fecha_de_impresion)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Vencimiento</p>
                  <p className="font-bold text-navy text-sm">{fmtDate(data.fecha_de_vencimiento)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#B45309] mb-1">Prefijo</p>
                  <p className="font-bold text-navy text-sm font-mono">{data.prefijo_formulario}</p>
                </div>
              </div>
              <div className="bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2">
                CUV: {data.cuv}
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Estado */}
          <div className="bg-navy text-white p-8">
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-4">
              Estado del Registro
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-4 h-4 shrink-0", est.color)} />
              <span className="font-display text-2xl font-bold tracking-tight">{est.label}</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {data.estado === "ACTIVA"
                ? "Registro activo y vigente según las regulaciones nacionales."
                : data.estado === "INACTIVA_IMPAGO"
                ? "Desactivada por falta de pago. Requiere regularización."
                : "Tarjeta vencida. Realice la renovación correspondiente."}
            </p>
          </div>

          {/* Código de tarjeta */}
          <div className="bg-white border border-navy/10 p-6 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#B45309] mb-3">
              Código de Tarjeta
            </p>
            <p className="font-mono text-lg font-bold text-navy break-all">{data.tarjeta}</p>
            <div className="mt-4 pt-4 border-t border-navy/10 text-xs text-muted-foreground">
              Prefijo: <span className="font-mono font-bold">{data.prefijo_formulario}</span>
            </div>
          </div>

          {/* Mantenimiento */}
          <Link to={`/maintenance/${encodeURIComponent(data.tarjeta)}`}>
            <div className="bg-[#B45309] text-white p-6 hover:bg-[#92400E] transition-colors cursor-pointer">
              <h4 className="font-bold uppercase tracking-widest text-sm mb-1">Mantenimiento</h4>
              <p className="text-white/80 text-xs">Cambio de dueño, motor o color · Desactivación</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Pair({ label, value, mono }) {
  return (
    <div className="flex justify-between items-end border-b border-navy/10 pb-2">
      <dt className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</dt>
      <dd className={cn("font-bold text-navy text-sm uppercase truncate max-w-[55%]", mono && "font-mono text-xs normal-case")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
