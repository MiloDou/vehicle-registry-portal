import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, UserCog, Wrench, Palette, PowerOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
  const { tarjeta } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colores, setColores] = useState([]);

  // Formulario: cambio propietario
  const [propForm, setPropForm] = useState({ nit: "", nombre_razon_social: "", tipo_contribuyente: "Individual", telefono: "", correo: "" });
  const [propSubmitting, setPropSubmitting] = useState(false);

  // Formulario: cambio motor
  const [motorForm, setMotorForm] = useState({ motor: "" });
  const [motorSubmitting, setMotorSubmitting] = useState(false);

  // Formulario: cambio color
  const [colorForm, setColorForm] = useState({ id_color: "" });
  const [colorSubmitting, setColorSubmitting] = useState(false);

  // Desactivación
  const [estadoSubmitting, setEstadoSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [resT, resMeta] = await Promise.all([
          fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}`),
          fetch("/api/metadata"),
        ]);
        if (!resT.ok) throw new Error("Tarjeta no encontrada");
        const tData = await resT.json();
        const meta = await resMeta.json();

        setData(tData);
        setColores(meta.colores.map((c) => ({ id: c.id_color, name: c.nombre_color })));
        // Pre-llenar formularios con datos actuales
        setPropForm({
          nit: tData.nit ?? "",
          nombre_razon_social: tData.propietario ?? "",
          tipo_contribuyente: tData.tipo_contribuyente ?? "Individual",
          telefono: tData.telefono ?? "",
          correo: tData.correo ?? "",
        });
        setMotorForm({ motor: tData.motor ?? "" });
        setColorForm({ id_color: tData.id_color ?? "" });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tarjeta]);

  const reload = async () => {
    const res = await fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}`);
    if (res.ok) setData(await res.json());
  };

  // Cambio de propietario
  const handlePropietario = async () => {
    if (!propForm.nit || !propForm.nombre_razon_social) {
      toast.error("NIT y nombre son obligatorios");
      return;
    }
    setPropSubmitting(true);
    try {
      const res = await fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}/propietario`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Propietario actualizado correctamente");
      await reload();
    } catch (e) {
      toast.error(e.message ?? "Error al actualizar propietario");
    } finally {
      setPropSubmitting(false);
    }
  };

  // Cambio de motor
  const handleMotor = async () => {
    if (!motorForm.motor) { toast.error("Ingresa el número de motor"); return; }
    setMotorSubmitting(true);
    try {
      const res = await fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}/motor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(motorForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Motor actualizado correctamente");
      await reload();
    } catch (e) {
      toast.error(e.message ?? "Error al actualizar motor");
    } finally {
      setMotorSubmitting(false);
    }
  };

  // Cambio de color
  const handleColor = async () => {
    if (!colorForm.id_color) { toast.error("Selecciona un color"); return; }
    setColorSubmitting(true);
    try {
      const res = await fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}/color`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_color: Number(colorForm.id_color) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Color actualizado correctamente");
      await reload();
    } catch (e) {
      toast.error(e.message ?? "Error al actualizar color");
    } finally {
      setColorSubmitting(false);
    }
  };

  // Cambio de estado (desactivación / reactivación)
  const handleEstado = async (nuevoEstado) => {
    setEstadoSubmitting(true);
    try {
      const res = await fetch(`/api/tarjetas/${encodeURIComponent(tarjeta)}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(result.message);
      await reload();
    } catch (e) {
      toast.error(e.message ?? "Error al cambiar el estado");
    } finally {
      setEstadoSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32 text-muted-foreground gap-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Cargando datos de la tarjeta...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-red-600 font-bold text-lg mb-4">Tarjeta no encontrada</p>
        <Link to="/certificates">
          <Button variant="outline" className="rounded-none"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>
        </Link>
      </div>
    );
  }

  const estadoBadge = {
    ACTIVA:               <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded-sm border border-green-200">Activa</span>,
    INACTIVA_IMPAGO:      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase rounded-sm border border-red-200">Baja por Impago</span>,
    INACTIVA_VENCIMIENTO: <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold uppercase rounded-sm border border-orange-200">Vencida</span>,
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Breadcrumb */}
      <Link
        to={`/certificates/${encodeURIComponent(tarjeta)}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-navy transition-colors uppercase tracking-widest mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al certificado
      </Link>

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest mb-2">
          Trámites y Mantenimiento
        </p>
        <h1 className="font-display text-5xl font-extrabold text-navy tracking-tight mb-2">
          Mantenimiento
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="font-mono text-sm font-bold text-navy bg-navy/10 px-3 py-1">{data.tarjeta}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-bold text-navy uppercase">{data.propietario}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono font-bold text-navy">{data.placa}</span>
          {estadoBadge[data.estado]}
        </div>
      </div>

      <div className="space-y-6">

        {/* ─── CAMBIO DE PROPIETARIO ─── */}
        <Section icon={UserCog} title="Cambio de Propietario" color="border-[#B45309]">
          <p className="text-sm text-muted-foreground mb-6">
            Ingresa los datos del nuevo propietario. Si el NIT ya existe en el sistema, se actualizarán sus datos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="NIT del nuevo propietario">
              <Input
                value={propForm.nit}
                onChange={(e) => setPropForm((p) => ({ ...p, nit: e.target.value }))}
                placeholder="Ej. 12345678-9"
                className="h-11 rounded-none border-navy/20"
              />
            </Field>
            <Field label="Nombre o Razón Social">
              <Input
                value={propForm.nombre_razon_social}
                onChange={(e) => setPropForm((p) => ({ ...p, nombre_razon_social: e.target.value }))}
                placeholder="Nombre completo o empresa"
                className="h-11 rounded-none border-navy/20"
              />
            </Field>
            <Field label="Tipo de Contribuyente">
              <Select
                value={propForm.tipo_contribuyente}
                onChange={(e) => setPropForm((p) => ({ ...p, tipo_contribuyente: e.target.value }))}
                className="h-11 rounded-none border-navy/20"
              >
                <option value="Individual">Individual</option>
                <option value="Empresa">Empresa</option>
              </Select>
            </Field>
            <Field label="Teléfono (opcional)">
              <Input
                value={propForm.telefono}
                onChange={(e) => setPropForm((p) => ({ ...p, telefono: e.target.value }))}
                placeholder="Número de teléfono"
                className="h-11 rounded-none border-navy/20"
              />
            </Field>
            <Field label="Correo (opcional)" className="md:col-span-2">
              <Input
                type="email"
                value={propForm.correo}
                onChange={(e) => setPropForm((p) => ({ ...p, correo: e.target.value }))}
                placeholder="correo@dominio.com"
                className="h-11 rounded-none border-navy/20"
              />
            </Field>
          </div>
          <div className="mt-6">
            <Button
              onClick={handlePropietario}
              disabled={propSubmitting}
              className="h-11 px-8 bg-[#B45309] text-white hover:bg-[#92400E] rounded-none font-bold uppercase tracking-widest text-xs"
            >
              {propSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCog className="h-4 w-4 mr-2" />}
              Actualizar Propietario
            </Button>
          </div>
        </Section>

        {/* ─── CAMBIO DE MOTOR ─── */}
        <Section icon={Wrench} title="Cambio de Motor" color="border-navy">
          <p className="text-sm text-muted-foreground mb-6">
            Motor actual: <span className="font-mono font-bold text-navy">{data.motor || "No registrado"}</span>
          </p>
          <div className="flex gap-4 items-end">
            <Field label="Nuevo número de motor" className="flex-1">
              <Input
                value={motorForm.motor}
                onChange={(e) => setMotorForm({ motor: e.target.value })}
                placeholder="Número de motor del vehículo"
                className="h-11 rounded-none border-navy/20 font-mono"
              />
            </Field>
            <Button
              onClick={handleMotor}
              disabled={motorSubmitting}
              className="h-11 px-8 bg-navy text-white hover:bg-navy-hover rounded-none font-bold uppercase tracking-widest text-xs shrink-0"
            >
              {motorSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
              Actualizar Motor
            </Button>
          </div>
        </Section>

        {/* ─── CAMBIO DE COLOR ─── */}
        <Section icon={Palette} title="Trámite de Cambio de Color" color="border-amber-500">
          <p className="text-sm text-muted-foreground mb-6">
            Color actual: <span className="font-bold text-navy uppercase">{data.color}</span>
          </p>
          <div className="flex gap-4 items-end">
            <Field label="Nuevo color" className="flex-1">
              <Select
                value={colorForm.id_color}
                onChange={(e) => setColorForm({ id_color: e.target.value })}
                className="h-11 rounded-none border-navy/20"
              >
                <option value="">Selecciona un color</option>
                {colores.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Button
              onClick={handleColor}
              disabled={colorSubmitting}
              className="h-11 px-8 bg-amber-600 text-white hover:bg-amber-700 rounded-none font-bold uppercase tracking-widest text-xs shrink-0"
            >
              {colorSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Palette className="h-4 w-4 mr-2" />}
              Cambiar Color
            </Button>
          </div>
        </Section>

        {/* ─── DESACTIVACIÓN ─── */}
        <Section icon={PowerOff} title="Desactivación de Tarjeta" color="border-red-400">
          <p className="text-sm text-muted-foreground mb-6">
            Estado actual: <strong className="text-navy">{data.estado}</strong>.
            La desactivación impide el uso de la tarjeta. Puede reactivarse en cualquier momento.
          </p>
          <div className="flex flex-wrap gap-3">
            {data.estado !== "ACTIVA" && (
              <Button
                onClick={() => handleEstado("ACTIVA")}
                disabled={estadoSubmitting}
                className="h-11 px-6 bg-green-600 text-white hover:bg-green-700 rounded-none font-bold uppercase tracking-widest text-xs"
              >
                {estadoSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Reactivar Tarjeta
              </Button>
            )}
            {data.estado !== "INACTIVA_IMPAGO" && (
              <Button
                onClick={() => handleEstado("INACTIVA_IMPAGO")}
                disabled={estadoSubmitting}
                className="h-11 px-6 bg-red-600 text-white hover:bg-red-700 rounded-none font-bold uppercase tracking-widest text-xs"
              >
                {estadoSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PowerOff className="h-4 w-4 mr-2" />}
                Desactivar por Impago
              </Button>
            )}
            {data.estado !== "INACTIVA_VENCIMIENTO" && (
              <Button
                onClick={() => handleEstado("INACTIVA_VENCIMIENTO")}
                disabled={estadoSubmitting}
                className="h-11 px-6 bg-orange-600 text-white hover:bg-orange-700 rounded-none font-bold uppercase tracking-widest text-xs"
              >
                {estadoSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PowerOff className="h-4 w-4 mr-2" />}
                Desactivar por Vencimiento
              </Button>
            )}
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className={cn("bg-white border-l-4 shadow-sm p-8", color)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 bg-navy/5 rounded-sm grid place-items-center">
          <Icon className="h-5 w-5 text-navy" />
        </div>
        <h2 className="font-display text-xl font-bold text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[10px] uppercase tracking-widest font-bold text-navy/70">{label}</Label>
      {children}
    </div>
  );
}
