import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Info. del Vehículo" },
  { id: 2, label: "Detalles del Propietario" },
  { id: 3, label: "Documentación" },
  { id: 4, label: "Confirmación" },
];

const initialData = {
  // Vehículo
  plate: "", vin: "", serie: "", motor: "",
  modelYear: "", asientos: "", cilindros: "", cc: "", ejes: "", toneladas: "",
  marcaId: "", lineaId: "", colorId: "", usoId: "", tipoId: "",
  // Propietario
  ownerNit: "", ownerName: "", tipoContribuyente: "Individual",
  cui: "", nombreRepresentante: "", direccion: "",
  ownerPhone: "", ownerEmail: "",
  // Tarjeta
  cardCode: "", prefijo: "TC-2025", fechaImpresion: "", fechaVencimiento: "",
};

export function RegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalInput, setModalInput] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [marcas, setMarcas] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [colors, setColors] = useState([]);
  const [usos, setUsos] = useState([]);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/metadata');
        if (!response.ok) throw new Error('Error al cargar catálogos');
        const resData = await response.json();

        setMarcas(resData.marcas.map(r => ({ id: r.id_marca, name: r.nombre_marca })));
        setLineas(resData.lineas.map(r => ({ id: r.id_linea, name: r.nombre_linea, marcaId: r.id_marca })));
        setColors(resData.colores.map(r => ({ id: r.id_color, name: r.nombre_color })));
        setUsos(resData.usos.map(r => ({ id: r.id_uso, name: r.descripcion_de_uso })));
        setTipos(resData.tipos.map(r => ({ id: r.id_tipo, name: r.descripcion_de_tipo })));
      } catch (error) {
        toast.error("Error de conexión con el servidor");
        console.error(error);
      }
    })();
  }, []);

  const lineasFiltradas = data.marcaId
    ? lineas.filter((l) => l.marcaId === Number(data.marcaId))
    : lineas;

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const next = () => setStep((s) => Math.min(s + 1, steps.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      const plateRegex = /^[PCMAUCDO]\d{3}[A-Z]{3}$/i;
      if (!data.plate) newErrors.plate = "La placa es requerida";
      else if (!plateRegex.test(data.plate)) newErrors.plate = "Formato inválido (Ej. P123ABC)";

      if (!data.vin || data.vin.length !== 17) newErrors.vin = "El VIN debe tener 17 caracteres";
      if (!data.modelYear) newErrors.modelYear = "El modelo es requerido";
      if (!data.colorId) newErrors.colorId = "El color es requerido";
      if (!data.marcaId) newErrors.marcaId = "La marca es requerida";
      if (!data.lineaId) newErrors.lineaId = "La línea es requerida";
      if (!data.tipoId) newErrors.tipoId = "El tipo es requerido";
      if (!data.usoId) newErrors.usoId = "El uso es requerido";
    }

    if (step === 2) {
      if (!data.ownerName) newErrors.ownerName = "El nombre es requerido";
      if (!data.ownerNit) newErrors.ownerNit = "El NIT es requerido";
    }

    if (step === 3) {
      if (!data.cardCode) newErrors.cardCode = "El código es requerido";
      if (!data.fechaVencimiento) newErrors.fechaVencimiento = "La fecha de vencimiento es requerida";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Por favor, corrige los errores en el formulario.");
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => { if (validateStep()) next(); };

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el registro');
      }

      toast.success("Vehículo registrado correctamente.");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.message ?? "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalInput('');
    setModalOpen(true);
  };

  const handleAddCatalog = async () => {
    if (!modalInput.trim()) return;
    setModalSubmitting(true);
    try {
      const body = { name: modalInput.trim() };
      if (modalType === 'linea') {
        if (!data.marcaId) {
          toast.error("Selecciona una marca primero para agregar la línea.");
          setModalSubmitting(false);
          return;
        }
        body.id_marca = data.marcaId;
      }

      const res = await fetch(`/api/metadata/${modalType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al agregar");
      const newItem = await res.json();

      if (modalType === 'marca') { setMarcas([...marcas, newItem]); update("marcaId", newItem.id); }
      if (modalType === 'linea') { setLineas([...lineas, newItem]); update("lineaId", newItem.id); }
      if (modalType === 'color') { setColors([...colors, newItem]); update("colorId", newItem.id); }
      if (modalType === 'uso') { setUsos([...usos, newItem]); update("usoId", newItem.id); }
      if (modalType === 'tipo') { setTipos([...tipos, newItem]); update("tipoId", newItem.id); }

      toast.success("Elemento agregado correctamente");
      setModalOpen(false);
    } catch (e) {
      toast.error("Error al guardar el nuevo elemento");
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Hero Header */}
      <div className="relative bg-navy text-white px-10 py-12 overflow-hidden shadow-sm">
        {/* Abstract Geometry */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 right-32 w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[170px] border-b-white/5 opacity-50" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-5xl font-extrabold tracking-tight mb-4">Registro Vehicular</h1>
          <p className="text-white/80 font-medium text-lg leading-relaxed">
            Complete el formulario a continuación para registrar su vehículo en el sistema nacional.
          </p>
        </div>
      </div>

      {/* Chevron Steps */}
      <div className="flex h-14 bg-muted">
        {steps.map((s, i) => {
          const active = step === s.id;
          const completed = step > s.id;

          let bgColor = "bg-muted text-muted-foreground";
          if (active && s.id === 1) bgColor = "bg-navy text-white";
          if (active && s.id === 2) bgColor = "bg-[#F97316] text-white";
          if (active && s.id === 3) bgColor = "bg-navy text-white";
          if (active && s.id === 4) bgColor = "bg-navy text-white";
          if (completed) bgColor = "bg-navy text-white";

          return (
            <div key={s.id} className={cn("relative flex-1 flex items-center justify-center font-semibold text-[13px] tracking-wide", bgColor)}>
              <span className="z-10">{s.id}. {s.label}</span>
              {i < steps.length - 1 && (
                <div className="absolute right-[-14px] top-0 z-20 w-0 h-0 border-y-[28px] border-y-transparent border-l-[14px] border-l-current" style={{ borderLeftColor: active || completed ? 'inherit' : '#F1F5F9' }} />
              )}
              {i > 0 && (
                <div className="absolute left-0 top-0 z-10 w-0 h-0 border-y-[28px] border-y-transparent border-l-[14px] border-l-white" />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Form Area */}
      <div className="bg-white p-10 shadow-sm relative">
        {/* Right decoration square - REMOVED */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-navy overflow-hidden z-0 opacity-10">
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-[#B45309]" />
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-8 bg-[#B45309]" />
          <h2 className="font-display text-2xl font-bold text-navy uppercase tracking-widest">
            {step === 1 ? "Identificación del Vehículo" : step === 2 ? "Detalles del Propietario" : step === 3 ? "Documentación" : "Confirmación"}
          </h2>
        </div>

        <div className="max-w-3xl">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
              <Field label="Placa" error={errors.plate}>
                <Input placeholder="P123ABC" value={data.plate} onChange={(e) => update("plate", e.target.value.toUpperCase())} className={cn("h-12 bg-white rounded-none border-navy/20", errors.plate && "border-red-500")} />
              </Field>
              <Field label="VIN (17 caracteres)" hint={`${data.vin.length}/17`} error={errors.vin}>
                <Input maxLength={17} placeholder="17 caracteres alfanuméricos" value={data.vin} onChange={(e) => update("vin", e.target.value.toUpperCase())} className={cn("h-12 bg-white rounded-none border-navy/20 font-mono", errors.vin && "border-red-500")} />
              </Field>
              <Field label="Año / Modelo" error={errors.modelYear}>
                <Input type="number" placeholder="Ej. 2024" value={data.modelYear} onChange={(e) => update("modelYear", e.target.value)} className={cn("h-12 bg-white rounded-none border-navy/20", errors.modelYear && "border-red-500")} />
              </Field>
              <Field label="Número de Serie">
                <Input placeholder="Número de serie del chasis" value={data.serie} onChange={(e) => update("serie", e.target.value.toUpperCase())} className="h-12 bg-white rounded-none border-navy/20 font-mono" />
              </Field>
              <Field label="Número de Motor">
                <Input placeholder="Código del motor" value={data.motor} onChange={(e) => update("motor", e.target.value.toUpperCase())} className="h-12 bg-white rounded-none border-navy/20 font-mono" />
              </Field>
              <Field label="Asientos">
                <Input type="number" min="1" max="60" placeholder="Número de asientos" value={data.asientos} onChange={(e) => update("asientos", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Cilindros">
                <Input type="number" min="1" placeholder="Número de cilindros" value={data.cilindros} onChange={(e) => update("cilindros", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Cilindraje (CC)">
                <Input type="number" min="1" placeholder="Cilindraje en cc" value={data.cc} onChange={(e) => update("cc", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Ejes">
                <Input type="number" min="1" placeholder="Número de ejes" value={data.ejes} onChange={(e) => update("ejes", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Toneladas (carga)">
                <Input type="number" step="0.01" min="0" placeholder="Capacidad en toneladas" value={data.toneladas} onChange={(e) => update("toneladas", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Color del Vehículo" error={errors.colorId}>
                <SelectWithAdd value={data.colorId} onChange={(e) => update("colorId", e.target.value)} options={colors} error={errors.colorId} onAdd={() => openModal('color')} />
              </Field>
              <Field label="Marca" error={errors.marcaId}>
                <SelectWithAdd value={data.marcaId} onChange={(e) => { update("marcaId", e.target.value); update("lineaId", ""); }} options={marcas} error={errors.marcaId} onAdd={() => openModal('marca')} />
              </Field>
              <Field label="Línea / Modelo" error={errors.lineaId}>
                <SelectWithAdd value={data.lineaId} onChange={(e) => update("lineaId", e.target.value)} options={lineasFiltradas} error={errors.lineaId} onAdd={() => openModal('linea')} disabledAdd={!data.marcaId} />
              </Field>
              <Field label="Tipo de Vehículo" error={errors.tipoId}>
                <SelectWithAdd value={data.tipoId} onChange={(e) => update("tipoId", e.target.value)} options={tipos} error={errors.tipoId} onAdd={() => openModal('tipo')} />
              </Field>
              <Field label="Uso" error={errors.usoId}>
                <SelectWithAdd value={data.usoId} onChange={(e) => update("usoId", e.target.value)} options={usos} error={errors.usoId} onAdd={() => openModal('uso')} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-2">
                <Field label="Nombre Completo o Razón Social" error={errors.ownerName}>
                  <Input value={data.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="Nombre completo o empresa" className={cn("h-12 bg-white rounded-none border-navy/20", errors.ownerName && "border-red-500")} />
                </Field>
              </div>
              <Field label="NIT" error={errors.ownerNit}>
                <Input value={data.ownerNit} onChange={(e) => update("ownerNit", e.target.value)} placeholder="Ej. 12345678-9" className={cn("h-12 bg-white rounded-none border-navy/20", errors.ownerNit && "border-red-500")} />
              </Field>
              <Field label="Tipo de Contribuyente">
                <Select value={data.tipoContribuyente} onChange={(e) => update("tipoContribuyente", e.target.value)} className="h-12 bg-white rounded-none border-navy/20">
                  <option value="Individual">Individual</option>
                  <option value="Empresa">Empresa</option>
                </Select>
              </Field>
              <Field label="CUI (Código Único de Identificación)">
                <Input value={data.cui} onChange={(e) => update("cui", e.target.value)} placeholder="13 dígitos" maxLength={13} className="h-12 bg-white rounded-none border-navy/20 font-mono" />
              </Field>
              <Field label="Nombre del Representante Legal">
                <Input value={data.nombreRepresentante} onChange={(e) => update("nombreRepresentante", e.target.value)} placeholder="Solo si aplica (empresas)" className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Dirección">
                <Input value={data.direccion} onChange={(e) => update("direccion", e.target.value)} placeholder="Dirección del propietario" className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Correo Electrónico">
                <Input type="email" value={data.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} placeholder="correo@dominio.com" className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Teléfono">
                <Input value={data.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} placeholder="Número de teléfono" className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Código de Tarjeta de Circulación" error={errors.cardCode}>
                <Input value={data.cardCode} onChange={(e) => update("cardCode", e.target.value)} placeholder="TC-2025-0001" className={cn("h-12 bg-white rounded-none border-navy/20", errors.cardCode && "border-red-500")} />
              </Field>
              <Field label="Prefijo del Formulario">
                <Input value={data.prefijo} onChange={(e) => update("prefijo", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Fecha de Emisión">
                <Input type="date" value={data.fechaImpresion} onChange={(e) => update("fechaImpresion", e.target.value)} className="h-12 bg-white rounded-none border-navy/20" />
              </Field>
              <Field label="Fecha de Vencimiento" error={errors.fechaVencimiento}>
                <Input type="date" value={data.fechaVencimiento} onChange={(e) => update("fechaVencimiento", e.target.value)} className={cn("h-12 bg-white rounded-none border-navy/20", errors.fechaVencimiento && "border-red-500")} />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <ConfirmGroup title="Vehículo">
                <Row k="Placa" v={data.plate} />
                <Row k="VIN" v={data.vin} mono />
                <Row k="Serie" v={data.serie} mono />
                <Row k="Motor" v={data.motor} mono />
                <Row k="Año / Modelo" v={data.modelYear} />
                <Row k="Asientos" v={data.asientos} />
                <Row k="Cilindros" v={data.cilindros} />
                <Row k="Cilindraje (CC)" v={data.cc} />
                <Row k="Ejes" v={data.ejes} />
                <Row k="Toneladas" v={data.toneladas} />
                <Row k="Color ID" v={data.colorId} />
                <Row k="Marca ID" v={data.marcaId} />
                <Row k="Línea ID" v={data.lineaId} />
                <Row k="Tipo ID" v={data.tipoId} />
                <Row k="Uso ID" v={data.usoId} />
              </ConfirmGroup>
              <ConfirmGroup title="Propietario">
                <Row k="NIT" v={data.ownerNit} />
                <Row k="Nombre / Razón Social" v={data.ownerName} />
                <Row k="Tipo Contribuyente" v={data.tipoContribuyente} />
                <Row k="CUI" v={data.cui} />
                <Row k="Representante" v={data.nombreRepresentante} />
                <Row k="Dirección" v={data.direccion} />
                <Row k="Teléfono" v={data.ownerPhone} />
                <Row k="Correo" v={data.ownerEmail} />
              </ConfirmGroup>
              <ConfirmGroup title="Tarjeta de Circulación">
                <Row k="Código Tarjeta" v={data.cardCode} mono />
                <Row k="Prefijo Formulario" v={data.prefijo} />
                <Row k="Fecha Emisión" v={data.fechaImpresion || "—"} />
                <Row k="Fecha Vencimiento" v={data.fechaVencimiento} />
              </ConfirmGroup>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-16 pt-8 border-t border-navy/10 flex items-center justify-between">
            <Button variant="ghost" onClick={() => toast.success("Borrador guardado")} className="text-navy font-bold uppercase tracking-widest text-xs h-12 hover:bg-transparent hover:text-navy/70">
              <ChevronLeft className="h-4 w-4 mr-2" /> Guardar Borrador
            </Button>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => { setData(initialData); setStep(1); }} className="rounded-none h-12 px-8 font-bold text-xs uppercase tracking-widest bg-muted border-none text-muted-foreground hover:bg-muted/80">
                Cancelar
              </Button>
              {step < steps.length ? (
                <Button onClick={handleNext} className="rounded-none h-12 px-8 font-bold text-xs uppercase tracking-widest bg-navy text-white hover:bg-navy-hover">
                  Siguiente
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="rounded-none h-12 px-8 font-bold text-xs uppercase tracking-widest bg-amber text-white hover:bg-amber/90">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enviando</> : "Enviar"}
                </Button>
              )}
            </div>
          </div>

          {/* Progress lines under buttons */}
          <div className="flex justify-center gap-2 mt-8">
            <div className={cn("h-1.5 w-8", step >= 1 ? "bg-navy" : "bg-navy/20")} />
            <div className={cn("h-1.5 w-8", step >= 2 ? "bg-[#D97706]" : "bg-[#D97706]/20")} />
            <div className={cn("h-1.5 w-8", step >= 3 ? "bg-[#8B4513]" : "bg-[#8B4513]/20")} />
            <div className={cn("h-1.5 w-8", step >= 4 ? "bg-navy/50" : "bg-navy/10")} />
          </div>
        </div>
      </div>


      {/* Modal para Agregar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-md shadow-xl w-96 relative border border-navy/20">
            <h3 className="font-display font-bold text-lg mb-4 text-navy">
              Agregar {modalType === 'marca' ? 'Marca' : modalType === 'linea' ? 'Línea' : modalType === 'color' ? 'Color' : modalType === 'uso' ? 'Uso' : 'Tipo'}
            </h3>
            <Input
              autoFocus
              value={modalInput}
              onChange={e => setModalInput(e.target.value)}
              placeholder="Nombre..."
              className="mb-4 h-12"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddCatalog} disabled={modalSubmitting || !modalInput.trim()} className="bg-navy text-white hover:bg-navy-hover">
                {modalSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <Label className={cn("text-[10px] uppercase tracking-widest font-bold", error ? "text-red-500" : "text-navy/70")}>{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[10px] text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

function SelectWithAdd({ value, onChange, options, onAdd, disabledAdd, error }) {
  return (
    <div className="flex gap-2">
      <Select value={value} onChange={onChange} className={cn("h-12 bg-white rounded-none border-navy/20 flex-1", error && "border-red-500")}>
        <option value="">Selecciona opción</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </Select>
      <Button type="button" onClick={onAdd} disabled={disabledAdd} variant="outline"
        className="h-12 w-12 shrink-0 border-navy/20 bg-muted hover:bg-navy hover:text-white transition-colors">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ConfirmGroup({ title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-6 bg-[#B45309]" />
        <h3 className="font-bold text-sm text-navy uppercase tracking-widest">{title}</h3>
      </div>
      <dl className="border border-navy/10 divide-y divide-navy/10 bg-white">
        {children}
      </dl>
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className={cn("text-sm font-bold text-navy", mono ? "font-mono text-xs" : "uppercase")}>{v || "—"}</dd>
    </div>
  );
}
