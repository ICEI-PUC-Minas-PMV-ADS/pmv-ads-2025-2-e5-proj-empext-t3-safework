"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { getProfileNameById } from "@/constants/userProfiles";

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const menuItems = [
    { href: "/dashboard/home", label: "Dashboard" },
    { href: "/dashboard/empresas", label: "Empresas" },
    { href: "/dashboard/asos", label: "Asos" },
    { href: "/dashboard/contratos", label: "Contratos" },
    { href: "/dashboard/colaboradores", label: "Colaboradores" },
  ];

  const configItems = [
    { href: "/usuarios", label: "Usuarios" },
    { href: "/enderecos", label: "Endereços" },
  ];

  const NavItem = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <li
        className={`
          p-2 rounded cursor-pointer transition-all duration-200
          ${isActive 
            ? "bg-blue-400 text-white" 
            : "hover:bg-blue-400 hover:text-white text-gray-700"
          }
        `}
      >
        <Link href={href}>{label}</Link>
      </li>
    );
  };

  return (
    <nav className="w-64 md:w-[16%] lg:w-[14%] p-4 h-screen bg-white sidebar-right-shadow flex flex-col">
      <div className="mb-6">
        {/* Logo */}
        <div className="mb-14 flex items-center justify-center">
          {/* Substitua por sua logo */}
          <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
            LOGO
          </div>
          {/* Exemplo de como usar:
          <Image 
            src="/logo.png" 
            alt="SafeWork" 
            width={128} 
            height={48}
            className="object-contain"
          />
          */}
        </div>
        
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <ul className="flex flex-col gap-1">
          {configItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}
        </ul>
      </div>

      <div className="mt-auto border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.nomeCompleto?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.nomeCompleto}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getProfileNameById(user?.idPerfil || 0)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded cursor-pointer transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sair
        </button>
      </div>
    </nav>
  );
}