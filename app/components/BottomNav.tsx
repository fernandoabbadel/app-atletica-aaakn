"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Gamepad2, User, ShoppingBag } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Se a rota atual for a página inicial "/", o menu não será renderizado
  if (pathname === "/") {
    return null;
  }

  const navItems = [
    { name: "Início", path: "/", icon: <Home size={20} /> },
    { name: "Carteirinha", path: "/carteirinha", icon: <User size={20} /> },
    { name: "Arena", path: "/games", icon: <Gamepad2 size={20} /> },
    { name: "Ranking", path: "/ranking", icon: <Trophy size={20} /> },
    { name: "Loja", path: "/loja", icon: <ShoppingBag size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t-2 border-[#2d5a42] px-6 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === item.path ? "text-[#4ade80]" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
