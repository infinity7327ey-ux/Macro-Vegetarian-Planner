import { Link, useLocation } from "wouter";
import { Calculator, LayoutDashboard, List, Search, Settings, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ingredients", label: "Ingredients", icon: Apple },
    { href: "/macro-calculator", label: "Calculator", icon: Calculator },
    { href: "/", label: "Profile Setup", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-sidebar text-sidebar-foreground hidden md:flex flex-col min-h-[100dvh]">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-primary">No-Egg Macro</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
