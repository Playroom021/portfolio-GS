
import { useState } from "react";
import {
  House,
  FolderKanban,
  Trophy,
  UserRound,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "#home", icon: House },
  { name: "Projects", href: "#projects", icon: FolderKanban },
  { name: "Achievements", href: "#achievements", icon: Trophy },
  { name: "About me", href: "#about", icon: UserRound },
  { name: "Reviews", href: "#reviews", icon: MessageSquare },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Home");

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
        className="fixed left-3 top-3 z-[60] rounded-lg p-2
                   text-[#b4b4b4] hover:bg-[#303030]
                   hover:text-white md:hidden"
      >
        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex
          flex-col bg-[#171717] text-[#ececec]
          transition-[width,transform] duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[260px]"}
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Top toolbar */}
        <div
          className={`flex h-[60px] shrink-0 items-center
            ${collapsed ? "justify-center px-2" : "justify-between px-3"}`}
        >
          {!collapsed && (
            <a
              href="#home"
              onClick={() => setActive("Home")}
              className="flex items-center gap-2.5 rounded-lg
                         p-2 hover:bg-[#252525]"
            >
              <span className="flex h-8 w-8 items-center
                justify-center rounded-full bg-[#ececec]
                text-xs font-bold text-[#171717]">
                GS
              </span>

              <span className="whitespace-nowrap text-sm font-semibold">
                Gyan Sharma
              </span>
            </a>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 shrink-0 items-center
                       justify-center rounded-lg text-[#b4b4b4]
                       transition hover:bg-[#303030]
                       hover:text-white md:flex"
          >
            {collapsed
              ? <PanelLeftOpen size={20} />
              : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pt-3">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = active === name;

            return (
              <a
                key={name}
                href={href}
                title={collapsed ? name : undefined}
                onClick={() => {
                  setActive(name);
                  setMobileOpen(false);
                }}
                className={`group flex h-10 items-center gap-3
                  rounded-lg px-3 text-sm transition-colors
                  ${collapsed ? "justify-center px-0" : ""}
                  ${isActive
                    ? "bg-[#303030] text-white"
                    : "text-[#b4b4b4] hover:bg-[#252525] hover:text-white"
                  }`}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span className="truncate">{name}</span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom profile */}
        <div className="shrink-0 border-t border-white/[0.08] p-2">
          <button
            title={collapsed ? "Gyan Sharma" : undefined}
            className={`flex h-12 w-full items-center gap-3
              rounded-lg px-2 transition-colors
              hover:bg-[#252525]
              ${collapsed ? "justify-center px-0" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center
              justify-center rounded-full bg-[#454545]
              text-xs font-semibold text-white">
              GS
            </span>

            {!collapsed && (
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium">
                  Gyan Sharma
                </span>
                <span className="block text-xs text-[#8e8e8e]">
                  Developer Portfolio
                </span>
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Keeps page content aligned with sidebar */}
      <div
        className={`hidden shrink-0 transition-[width] duration-300
          md:block ${collapsed ? "w-[68px]" : "w-[260px]"}`}
      />
    </>
  );
}
