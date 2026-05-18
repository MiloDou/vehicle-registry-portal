import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Car, LayoutGrid, FileSignature, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { to: "/", label: "Resumen", icon: LayoutGrid, end: true },
  { to: "/dashboard", label: "Vehículos", icon: Car },
  { to: "/certificates", label: "Certificados", icon: FileSignature },
];

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-pattern flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-card border-b border-navy/20 h-16 shrink-0 shadow-sm">
        <div className="flex items-center justify-between h-full px-6 max-w-[1600px] mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-sans text-xl font-extrabold tracking-tight text-navy">
              AutoRegistro
            </span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center h-full gap-8 text-sm font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) => cn(
                "flex items-center h-full border-b-2 transition-colors px-1",
                isActive
                  ? "border-amber text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Panel Principal
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => cn(
                "flex items-center h-full border-b-2 transition-colors px-1",
                isActive || pathname.startsWith("/certificates") || pathname.startsWith("/register") || pathname.startsWith("/maintenance")
                  ? "border-amber text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Vehículos
            </NavLink>
            <NavLink
              to="/certificates"
              className={({ isActive }) => cn(
                "flex items-center h-full border-b-2 transition-colors px-1",
                isActive
                  ? "border-amber text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Certificados
            </NavLink>
          </nav>

          {/* Right — solo acción */}
          <Link to="/register" className="hidden sm:block">
            <Button className="bg-navy text-navy-foreground hover:bg-navy-hover rounded-sm font-semibold h-9 px-5">
              <Plus className="h-4 w-4 mr-2" /> Registrar Nuevo
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 bg-surface-soft border-r border-navy/10 flex flex-col py-6">
          {/* Brand */}
          <div className="px-6 mb-8">
            <div className="h-10 w-10 bg-navy rounded-sm grid place-items-center mb-4">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-navy tracking-tight leading-none">
              Mérida Portal
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 font-semibold">
              Gestión Vehicular
            </p>
          </div>

          {/* Nav items */}
          <ul className="space-y-1 px-4 flex-1">
            {sidebarItems.map(({ to, label, icon: Icon, end }) => {
              const active = end ? pathname === to : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-semibold transition-colors",
                      active
                        ? "bg-navy text-white shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer del sidebar */}
          <div className="px-6 pt-6 border-t border-navy/10 mt-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              SAT — Registro Vehicular
            </p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <main className="flex-1 p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
