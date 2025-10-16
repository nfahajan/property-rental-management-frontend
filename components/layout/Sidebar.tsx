"use client";
import logo from "../../public/assets/mainlogo.png";
import Link from "next/link";
import {
  User,
  Settings,
  Home,
  Users,
  Calendar,
  Clock,
  LayoutDashboard,
  UserPlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = {
  tenant: [
    { name: "Dashboard", href: "/tenant/dashboard", icon: Home },
    {
      name: "Book Apartment",
      href: "/tenant/book-apartment",
      icon: Calendar,
    },
    { name: "My Booking", href: "/tenant/my-booking", icon: Calendar },
    { name: "Profile", href: "/tenant/profile", icon: User },
  ],
  owner: [
    { name: "Dashboard", href: "/owner/dashboard", icon: Home },
    { name: "Aparments", href: "/owner/apartments", icon: Calendar },
    { name: "Bookings", href: "/owner/bookings", icon: Calendar },
    { name: "Profile", href: "/owner/profile", icon: User },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Apartments", href: "/admin/apartments", icon: Calendar },
    { name: "Applicaitons", href: "/admin/applicaitons", icon: Calendar },
    { name: "Profile", href: "/admin/profile", icon: User },
  ],
};

export default function Sidebar({
  role,
  expanded,
  forceShow = false,
}: {
  role: "tenant" | "owner" | "admin" | string;
  expanded: boolean;
  onExpandToggle: () => void;
  forceShow?: boolean;
}) {
  const pathname = usePathname();
  // Track which menu item is hovered for tooltip when !expanded
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Validate role and provide fallback
  const validRole =
    role === "tenant" || role === "owner" || role === "admin" ? role : "tenant";
  const currentNavItems = navItems[validRole];

  // If no valid nav items, return a fallback
  if (!currentNavItems || currentNavItems.length === 0) {
    return (
      <TooltipProvider>
        <aside
          className={`h-full bg-white shadow fixed z-40 top-0 left-0 transition-all duration-300
            ${expanded ? "w-64" : "w-20"} ${
            forceShow ? "flex" : "hidden lg:flex"
          } flex-col`}
        >
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <span className="font-bold text-xl transition-all">
              {expanded ? "Workify" : "T"}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center">
              {expanded ? "No navigation available" : "?"}
            </p>
          </div>
        </aside>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <aside
        className={`h-full bg-white shadow fixed z-40 top-0 left-0 transition-all duration-300
          ${expanded ? "w-64" : "w-20"} ${
          forceShow ? "flex" : "hidden lg:flex"
        } flex-col`}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <Link href={"/"}>
            <div className="h-14">
              <Image
                src={logo}
                alt="logo"
                width={100}
                height={100}
                className="h-full w-full"
              />
            </div>
          </Link>
        </div>
        <nav className="mt-3 p-2 flex-1">
          {currentNavItems.map((item, idx) => {
            const isActive =
              item.href === "/tenant/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            // Only show tooltip on hover and when !expanded
            const showTooltip = !expanded && hoveredIndex === idx;

            return (
              <Tooltip key={item.name} open={showTooltip}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 mb-1 rounded-md transition-colors
                      ${expanded ? "justify-start" : "justify-center"}
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    onMouseEnter={() => {
                      if (!expanded) setHoveredIndex(idx);
                    }}
                    onMouseLeave={() => {
                      if (!expanded) setHoveredIndex(null);
                    }}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-blue-700" : ""}`}
                    />
                    {expanded && <span className="ml-3">{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {!expanded && (
                  <TooltipContent
                    side="right"
                    className="bg-white text-gray-900 border shadow px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
