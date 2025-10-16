"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Calendar,
  Home,
  LogIn,
  UserPlus,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import logo from "../../public/assets/mainlogo.png";
export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Properties", icon: Calendar },
  ];

  const getDashboardUrl = () => {
    if (!user?.roles) return "/";

    if (user.roles.includes("admin")) return "/admin/dashboard";
    if (user.roles.includes("tenant")) return "/tenant/dashboard";
    if (user.roles.includes("owner")) return "/owner/dashboard";

    return "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-16">
              <Image
                src={logo}
                alt="logo"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Button asChild>
                  <Link href={getDashboardUrl()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu - Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-10">
                    <Image
                      src={logo}
                      alt="logo"
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SheetTitle>
                <SheetDescription>
                  Navigate through our platform
                </SheetDescription>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Menu
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Auth Buttons */}
              <div className="border-t pt-6 mt-auto">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Account
                </div>
                <div className="flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <Button
                        asChild
                        className="w-full justify-start h-12"
                        size="lg"
                      >
                        <Link
                          href={getDashboardUrl()}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-12"
                        size="lg"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full justify-start h-12"
                        size="lg"
                      >
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="mr-3 h-5 w-5" />
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-start h-12"
                        size="lg"
                      >
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserPlus className="mr-3 h-5 w-5" />
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
