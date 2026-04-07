import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Link, useLocation } from "wouter";
import { Calculator, LayoutDashboard, Settings, Apple, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ingredients", label: "Ingredients", icon: Apple },
    { href: "/macro-calculator", label: "Calculator", icon: Calculator },
    { href: "/", label: "Profile Setup", icon: Settings },
  ];

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col max-w-full">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <h1 className="text-xl font-bold text-primary">No-Egg Macro</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
              <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tighter text-primary">No-Egg Macro</h1>
              </div>
              <nav className="px-4 space-y-2">
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
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
