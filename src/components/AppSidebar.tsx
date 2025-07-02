import { BarChart3, Map, GitCompare } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Karten-Ansicht", url: "/map", icon: Map },
  { title: "Vergleiche", url: "/compare", icon: GitCompare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || (path === "/" && currentPath === "/");
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm border-r-2 border-primary" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-border bg-card shadow-medium`}>
      <SidebarContent className="bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">GeoAnalytics</h2>
                <p className="text-xs text-white/80 font-medium">Professional</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full transition-smooth">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-border bg-muted/30">
          {!collapsed && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">© {new Date().getFullYear()} GeoAnalytics</p>
              <p className="text-muted-foreground/80">Professional Edition v2.1</p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}