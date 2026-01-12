"use client";



import React, { useState, useEffect, useRef } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {

  Home,

  Calendar,

  Dumbbell,

  CreditCard,

  Menu,

  X,

  Trophy,

  Gamepad2,

  ShoppingBag,

  Settings,

  HelpCircle,

  LogOut,

  ChevronRight,

  Handshake,

  Crown,

  Medal,

  Star,

  Clock,

  CalendarRange,

  ShieldCheck, // Ícone do Admin

} from "lucide-react";

import { useAuth } from "@/context/AuthContext";



export default function BottomNav() {

  const pathname = usePathname();

  const router = useRouter();

  const { user, logout, checkPermission } = useAuth(); // Importar checkPermission

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);



  // Verifica se é algum tipo de admin

  const isAdmin = checkPermission([

    "admin_geral",

    "admin_gestor",

    "admin_treino",

    "master",

  ]);



  const handleLogout = () => {

    if (logout) logout();

    setIsSidebarOpen(false);

    router.push("/login");

  };



  useEffect(() => {

    const resetTimer = () => {

      setIsVisible(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {

        if (!isSidebarOpen) {

          setIsVisible(false);

        }

      }, 2000);

    };



    window.addEventListener("mousemove", resetTimer);

    window.addEventListener("scroll", resetTimer);

    window.addEventListener("click", resetTimer);

    window.addEventListener("touchstart", resetTimer);

    resetTimer();



    return () => {

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      window.removeEventListener("mousemove", resetTimer);

      window.removeEventListener("scroll", resetTimer);

      window.removeEventListener("click", resetTimer);

      window.removeEventListener("touchstart", resetTimer);

    };

  }, [isSidebarOpen]);



  if (pathname === "/login" || pathname === "/cadastro") {

    return null;

  }



  const navItems = [

    { name: "Início", path: "/", icon: <Home size={20} /> },

    { name: "Eventos", path: "/eventos", icon: <Calendar size={20} /> },

    { name: "Gym", path: "/gym", icon: <Dumbbell size={24} />, isMain: true },

    {

      name: "Carteirinha",

      path: "/carteirinha",

      icon: <CreditCard size={20} />,

    },

    {

      name: "Menu",

      action: () => setIsSidebarOpen(true),

      icon: <Menu size={20} />,

    },

  ];



  const sidebarItems = [

    // LINK DO ADMIN (Só aparece se for admin)

    ...(isAdmin

      ? [

          {

            name: "Painel Admin",

            path: "/admin",

            icon: <ShieldCheck size={18} />,

            highlight: true,

          },

        ]

      : []),



    {

      name: "Seja Sócio (Planos)",

      path: "/planos",

      icon: <Crown size={18} />,

      highlight: !isAdmin,

    },

    { name: "Lojinha", path: "/loja", icon: <ShoppingBag size={18} /> },

    { name: "Parceiros", path: "/parceiros", icon: <Handshake size={18} /> },

    { name: "Arena Games", path: "/games", icon: <Gamepad2 size={18} /> },

    { name: "Treinos", path: "/treinos", icon: <CalendarRange size={18} /> },

    { name: "Gym", path: "/gym", icon: <Dumbbell size={18} /> },

    { name: "Ranking", path: "/ranking", icon: <Trophy size={18} /> },

    { name: "Nossa História", path: "/historico", icon: <Clock size={18} /> },

    { name: "Conquistas", path: "/conquistas", icon: <Medal size={18} /> },

    { name: "Fidelidade", path: "/fidelidade", icon: <Star size={18} /> },

    { name: "Guia", path: "/guia", icon: <HelpCircle size={18} /> },

    {

      name: "Configurações",

      path: "/configuracoes",

      icon: <Settings size={18} />,

    },

  ];



  return (

    <>

      <div

        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-300 ${

          isSidebarOpen

            ? "opacity-100 pointer-events-auto"

            : "opacity-0 pointer-events-none"

        }`}

        onClick={() => setIsSidebarOpen(false)}

      ></div>



      <div

        className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-[#111] border-r border-zinc-800 z-[70] transform transition-transform duration-300 ease-out flex flex-col shadow-2xl ${

          isSidebarOpen ? "translate-x-0" : "-translate-x-full"

        }`}

      >

        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50">

          <div>

            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white flex items-center gap-2">

              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>

              Menu AAAKN

            </h2>

            <p className="text-[10px] text-zinc-500 pl-4">Navegação Completa</p>

          </div>

          <button

            onClick={() => setIsSidebarOpen(false)}

            className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition hover:bg-zinc-800"

          >

            <X size={20} />

          </button>

        </div>



        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {user && (

            <Link

              href="/perfil"

              onClick={() => setIsSidebarOpen(false)}

              className="flex items-center gap-3 p-4 bg-gradient-to-r from-zinc-900 to-black rounded-2xl border border-zinc-800 mb-6 group hover:border-emerald-500/30 transition"

            >

              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 group-hover:border-emerald-500 transition">

                <img

                  src={user.foto}

                  alt="User"

                  className="w-full h-full object-cover"

                />

              </div>

              <div className="flex-1">

                <p className="text-sm font-bold text-white">

                  {user.nome.split(" ")[0]}

                </p>

                <div className="flex items-center gap-2">

                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">

                    Ver Perfil

                  </p>

                  {isAdmin && (

                    <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-black border border-red-500/30">

                      ADMIN

                    </span>

                  )}

                </div>

              </div>

              <ChevronRight

                size={16}

                className="text-zinc-500 group-hover:text-emerald-500 transition"

              />

            </Link>

          )}



          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2 mt-4">

            Aplicativos

          </h3>

          {sidebarItems.map((item) => (

            <Link

              key={item.path}

              href={item.path}

              onClick={() => setIsSidebarOpen(false)}

              className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${

                item.highlight

                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 mb-2"

                  : pathname === item.path

                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"

                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent"

              }`}

            >

              <div

                className={`p-2 rounded-lg transition-colors ${

                  item.highlight

                    ? "bg-yellow-500/20 text-yellow-500"

                    : pathname === item.path

                    ? "bg-emerald-500/20 text-emerald-400"

                    : "bg-black text-zinc-500 group-hover:text-white group-hover:bg-zinc-800"

                }`}

              >

                {item.icon}

              </div>

              <span

                className={`text-sm font-bold ${

                  item.highlight ? "tracking-wide" : "font-medium"

                }`}

              >

                {item.name}

              </span>

              {item.highlight && isAdmin && item.path === "/admin" && (

                <div className="ml-auto">

                  <span className="text-[9px] bg-red-500 text-white font-black px-2 py-0.5 rounded uppercase">

                    Restrito

                  </span>

                </div>

              )}

              {item.highlight && !isAdmin && (

                <div className="ml-auto">

                  <span className="text-[9px] bg-yellow-500 text-black font-black px-2 py-0.5 rounded uppercase">

                    VIP

                  </span>

                </div>

              )}

            </Link>

          ))}

        </div>



        <div className="p-6 border-t border-zinc-800 bg-black/50">

          <button

            onClick={handleLogout}

            className="flex items-center gap-3 text-red-500 text-xs font-bold hover:text-red-400 transition w-full p-2 hover:bg-red-500/10 rounded-lg"

          >

            <LogOut size={16} /> Sair do App

          </button>

          <p className="text-[9px] text-zinc-700 mt-4 text-center font-mono">

            AAAKN App v1.2 • 2026

          </p>

        </div>

      </div>



      <div

        className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out ${

          isVisible || isSidebarOpen ? "translate-y-0" : "translate-y-[200%]"

        }`}

      >

        <nav className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center gap-1 sm:gap-4 max-w-[95%] sm:max-w-md w-full justify-between relative">

          {navItems.map((item, index) => {

            const isActive = pathname === item.path;

            if (item.isMain) {

              return (

                <div key={index} className="relative -top-8 px-2 group">

                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>

                  <Link

                    href={item.path!}

                    className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[#050505] transition-transform hover:scale-110 active:scale-95 ${

                      isActive

                        ? "bg-emerald-500 text-black"

                        : "bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-black"

                    }`}

                  >

                    {item.icon}

                  </Link>

                </div>

              );

            }

            return (

              <div key={index} className="flex-1 flex justify-center h-full">

                {item.action ? (

                  <button

                    onClick={item.action}

                    className="w-full h-full group flex items-center justify-center flex-col gap-1 text-zinc-500 hover:text-zinc-300"

                  >

                    <div className="relative">{item.icon}</div>

                    <span className="text-[9px] font-bold uppercase tracking-wide group-hover:text-zinc-400">

                      {item.name}

                    </span>

                  </button>

                ) : (

                  <Link

                    href={item.path!}

                    className={`w-full h-full group flex items-center justify-center flex-col gap-1 transition-all duration-300 ${

                      isActive

                        ? "text-emerald-400 translate-y-[-2px]"

                        : "text-zinc-500 hover:text-zinc-300"

                    }`}

                  >

                    <div

                      className={`relative ${

                        isActive

                          ? "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"

                          : ""

                      }`}

                    >

                      {item.icon}

                    </div>

                    <span

                      className={`text-[9px] font-bold uppercase tracking-wide ${

                        isActive

                          ? "text-emerald-400"

                          : "text-zinc-600 group-hover:text-zinc-400"

                      }`}

                    >

                      {item.name}

                    </span>

                    {isActive && (

                      <span className="absolute -bottom-2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_#4ade80]"></span>

                    )}

                  </Link>

                )}

              </div>

            );

          })}

        </nav>

      </div>

    </>

  );

}