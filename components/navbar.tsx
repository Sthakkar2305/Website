"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Phone,
  Sun,
  Moon,
  Home,
  Info,
  Gem,
  Ruler,
  PiggyBank,
  Sparkles,
  BookOpen,
  Mail,
} from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Info },
    { name: "Catalog", href: "/catalog", icon: Gem },
    { name: "Ring Measurement", href: "/ring-measurement", icon: Ruler },
    { name: "Gold Scheme", href: "/gold-scheme", icon: PiggyBank },
    { name: "Digital Gold", href: "/digital-gold", icon: Sparkles },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section - Elegant and Clean */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#dc2626", // CHANGED: Red background (red-600 hex)
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "5%",
                  border: "2.5px solid #ffffff", // CHANGED: White border
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  color: "#ffffff", // CHANGED: White text
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontWeight: 500,
                  fontSize: "23px",
                  letterSpacing: "0.02em",
                  zIndex: 1,
                  textTransform: "lowercase",
                }}
              >
                bkj
              </span>
            </div>
            {/* ...rest of your BALKRUSHNA JEWELLERS code... */}
            <div className="hidden md:block">
              {" "}
              <div className="flex flex-col">
                {" "}
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
                  BALKRUSHNA 
                </span>
                {" "}
                <div className="text-xs text-amber-600 dark:text-amber-500 font-semibold tracking-widest">
                  JEWELLERS 
                </div>
                {" "}
              </div>
              {" "}
            </div>
          </Link>

          {/* Desktop Navigation - Subtle & Professional */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 group ${
                    isActive
                      ? "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] bg-amber-600 dark:bg-amber-500 transform transition-transform duration-300 origin-left ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Right-aligned Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-500 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Call Now Button - High Contrast */}
            <Link href="tel:+917600093017" className="hidden md:block">
              <Button className="bg-yellow-400 hover:bg-yellow-500 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-900 text-slate-900 font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </Link>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden w-10 h-10 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-500 transition-all duration-300"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-xs sm:max-w-sm p-6 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 flex flex-col"
              >
                {/* Mobile Sheet Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 group"
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "#dc2626", // CHANGED: Red background
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "5%",
                          border: "2.5px solid #ffffff", // CHANGED: White border
                          borderRadius: "50%",
                        }}
                      />
                      <span
                        style={{
                          color: "#ffffff", // CHANGED: White text
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontWeight: 500,
                          fontSize: "23px",
                          letterSpacing: "0.02em",
                          zIndex: 1,
                          textTransform: "lowercase",
                        }}
                      >
                        bkj
                      </span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-white">BALKRUSHNA</span>
                      <div className="text-xs text-amber-500 font-semibold tracking-widest">
                        JEWELLERS
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Mobile Navigation Items */}
                <div className="flex flex-col gap-2 flex-grow">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium group ${
                          isActive
                            ? "bg-amber-500/20 text-amber-400 border-l-4 border-amber-500"
                            : "hover:bg-slate-800/60 text-slate-200"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 transition-colors duration-200 ${
                            isActive
                              ? "text-amber-500"
                              : "text-amber-500/80 group-hover:text-amber-500"
                          }`}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Call Now Button */}
                <div className="mt-8">
                  <Link
                    href="tel:+917600093017"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 text-base py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                      <Phone className="h-5 w-5 mr-3" />
                      <span className="font-semibold">Call Now</span>
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}