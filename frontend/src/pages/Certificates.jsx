import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ChevronRight, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

const estadoStyle = {
  ACTIVA:               "bg-green-100 text-green-800 border-green-200",
  INACTIVA_IMPAGO:      "bg-red-100 text-red-800 border-red-200",
  INACTIVA_VENCIMIENTO: "bg-orange-100 text-orange-800 border-orange-200",
};

const estadoLabel = {
  ACTIVA:               "Activa",
  INACTIVA_IMPAGO:      "Baja por Impago",
  INACTIVA_VENCIMIENTO: "Vencida",
};

export default function Certificates() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tarjetas");
        if (!res.ok) throw new Error("Error al obtener tarjetas");
        setTarjetas(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const filtradas = tarjetas.filter((t) =>
    t.propietario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.tarjeta?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest mb-2">
          Sistema de Registro
        </p>
        <h1 className="font-display text-5xl font-extrabold text-navy tracking-tight mb-3">
          Tarjetas de Circulación
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Listado ordenado por nombre del propietario. Haz clic en una fila para ver todos los detalles.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-8">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, placa o código de tarjeta..."
          className="w-full h-12 pl-5 pr-5 border-2 border-navy/20 bg-white text-sm rounded-none focus:outline-none focus:border-navy transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Cargando desde la base de datos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 text-center rounded-sm">
          <p className="font-bold">{error}</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No se encontraron tarjetas</p>
          {busqueda && <p className="text-sm mt-1">Prueba con otro término de búsqueda.</p>}
        </div>
      ) : (
        <div className="bg-white border border-navy/10 shadow-sm overflow-hidden">
          {/* Encabezado de tabla */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-navy text-white text-[10px] font-bold tracking-widest uppercase">
            <span>Propietario / NIT</span>
            <span>Placa</span>
            <span>Vehículo</span>
            <span>Vence</span>
            <span>Estado</span>
          </div>

          {filtradas.map((t, i) => (
            <Link
              key={t.tarjeta}
              to={`/certificates/${encodeURIComponent(t.tarjeta)}`}
              className={cn(
                "grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-navy/10 hover:bg-[#F7F7F5] transition-colors group",
                i % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
              )}
            >
              {/* Propietario */}
              <div>
                <p className="font-bold text-navy text-sm uppercase">{t.propietario}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">NIT: {t.nit}</p>
              </div>

              {/* Placa */}
              <p className="font-mono text-sm font-bold text-navy uppercase">{t.placa}</p>

              {/* Vehículo */}
              <p className="text-sm text-navy font-medium">
                {t.nombre_marca} {t.nombre_linea}
                {t.modelo ? <span className="text-muted-foreground"> ({t.modelo})</span> : null}
              </p>

              {/* Fecha vencimiento */}
              <p className="text-sm text-navy">{formatDate(t.fecha_de_vencimiento)}</p>

              {/* Estado */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-sm whitespace-nowrap",
                    estadoStyle[t.estado] ?? estadoStyle.ACTIVA
                  )}
                >
                  {estadoLabel[t.estado] ?? t.estado}
                </span>
                <ChevronRight className="h-4 w-4 text-navy/30 group-hover:text-navy transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Conteo */}
      {!loading && !error && (
        <p className="text-xs text-muted-foreground mt-4">
          Mostrando {filtradas.length} de {tarjetas.length} tarjeta{tarjetas.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
