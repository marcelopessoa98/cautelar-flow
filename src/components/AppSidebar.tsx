import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, HardHat, FileText, 
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/obras", label: "Obras", icon: Building2 },
  { path: "/equipe", label: "Equipe Técnica", icon: HardHat },
  { path: "/laudos", label: "Laudos", icon: FileText },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-base font-bold text-sidebar-primary tracking-tight">
              ConcreFuji
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-muted">
              Laudos Cautelares
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-muted text-center animate-fade-in">
            v1.0 — Sistema de Laudos
          </p>
        )}
      </div>
    </aside>
  );
}
