import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  FlaskConical,
  Briefcase,
  Globe2,
  Lightbulb,
  ShieldCheck,
  Database,
} from "lucide-react";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = { children: React.ReactNode };

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ingestion", label: "Ingestion", icon: Upload },
  { to: "/explorer", label: "Explorer", icon: FileSearch },
  { to: "/scenario", label: "Scenario", icon: FlaskConical },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/geo", label: "Geo", icon: Globe2 },
  { to: "/recommendations", label: "Recommandations", icon: Lightbulb },
  { to: "/audit", label: "Audit", icon: ShieldCheck },
  { to: "/catalog", label: "Catalog", icon: Database },
];

export default function Shell({ children }: Props) {
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="px-3 py-4">
          <Link to="/dashboard" className="font-semibold tracking-tight">
            Indorex AI
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || pathname.startsWith(to + "/");
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={to}
                        className={cn(
                          "gap-2",
                          active
                            ? "bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="text-xs text-zinc-500">
          <Separator />
          <div className="px-3 py-2">v0.1 • Datathon</div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="max-w-screen bg-white">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
