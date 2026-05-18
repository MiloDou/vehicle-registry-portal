import { useEffect, useState } from "react";
import { VehicleCard } from "./VehicleCard";
import { Loader2, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function FleetDashboard() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tarjetas");
        if (!res.ok) throw new Error("Error al conectar con el servidor");
        const data = await res.json();
        setTarjetas(data);
      } catch (err) {
        console.error("Error conectando al backend:", err);
        setError("No se pudo conectar con el servidor. Verifica que Docker esté corriendo.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activas = tarjetas.filter((t) => t.estado === "ACTIVA").length;
  const filtradas = busqueda
    ? tarjetas.filter((t) =>
        `${t.propietario} ${t.placa} ${t.tarjeta} ${t.nombre_marca} ${t.nombre_linea}`
          .toLowerCase().includes(busqueda.toLowerCase())
      )
    : tarjetas;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl font-extrabold text-navy tracking-tight mb-4">
            Flota de Vehículos
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Registro oficial de vehículos y gestión de Tarjetas de Circulación.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#EAEAE6] border-t-4 border-navy px-6 py-4 min-w-[120px] text-center shadow-sm">
            <p className="text-[10px] font-bold text-navy/60 tracking-widest uppercase mb-1">
              Total<br />Tarjetas
            </p>
            <p className="font-sans text-3xl font-bold text-navy leading-none">
              {tarjetas.length}
            </p>
          </div>
          <div className="bg-[#EAEAE6] border-t-4 border-[#B45309] px-6 py-4 min-w-[120px] text-center shadow-sm">
            <p className="text-[10px] font-bold text-navy/60 tracking-widest uppercase mb-1">
              Activas
            </p>
            <p className="font-sans text-3xl font-bold text-[#B45309] leading-none">
              {activas}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por propietario, placa, código o vehículo..."
          className="w-full h-12 pl-12 pr-24 border-2 border-navy/20 bg-white text-sm rounded-none focus:outline-none focus:border-navy transition-colors"
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-navy">
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Cargando datos desde la base de datos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-sm text-center">
          <p className="font-bold mb-2">Error de conexión</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtradas.map((t) => (
            <VehicleCard key={t.tarjeta} tarjeta={t} />
          ))}

          {/* Nueva Tarjeta */}
          <Link
            to="/register"
            className="group h-full min-h-[300px] bg-[#0A1128] relative overflow-hidden flex flex-col items-center justify-center p-8 hover:opacity-95 transition-opacity shadow-sm border-2 border-[#0A1128]"
          >
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
              <div className="bg-black/40"></div>
              <div className="bg-transparent"></div>
              <div className="bg-black/60 rounded-full scale-[1.5] translate-y-4"></div>
              <div className="bg-black/60"></div>
              <div className="bg-white/10"></div>
              <div className="bg-black/40"></div>
              <div className="bg-transparent"></div>
              <div className="bg-white/5 rounded-full scale-[2] translate-y-12"></div>
              <div className="bg-black/80"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full border-[3px] border-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-[#0A1128]/50 backdrop-blur-sm">
                <Plus strokeWidth={3} className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-sans text-xl font-bold text-white mb-2">Nueva Tarjeta</h3>
              <p className="text-white/60 text-xs font-medium px-4">
                Registrar un nuevo vehículo en el sistema nacional
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}