"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Waves, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula autenticação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redireciona para cadastro (primeiro acesso) ou home
    router.push("/cadastro");
  };

  return (
    <div className="min-h-screen bg-[#030a08] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background animado com ondas e bolhas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradiente oceânico */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#041f15] via-[#030a08] to-[#020504]" />

        {/* Ondas animadas no fundo */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64 opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#10b981"
            fillOpacity="0.3"
            className="animate-wave"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        <svg
          className="absolute bottom-0 left-0 w-full h-48 opacity-30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#059669"
            fillOpacity="0.4"
            className="animate-wave-slow"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Bolhas flutuantes */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/10 animate-float"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 100}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}

        {/* Partículas brilhantes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Tubarões silhueta nadando */}
        <div className="absolute top-20 left-0 w-full">
          <svg
            className="w-16 h-8 text-emerald-900/30 animate-swim"
            viewBox="0 0 100 40"
            fill="currentColor"
          >
            <path d="M0,20 Q10,10 30,15 L60,10 Q80,8 90,15 L100,20 L90,25 Q80,32 60,30 L30,25 Q10,30 0,20 Z M85,18 L95,15 L95,25 L85,22 Z" />
          </svg>
        </div>

        <div className="absolute top-40 right-0 w-full flex justify-end">
          <svg
            className="w-12 h-6 text-emerald-900/20 animate-swim-reverse"
            viewBox="0 0 100 40"
            fill="currentColor"
          >
            <path d="M0,20 Q10,10 30,15 L60,10 Q80,8 90,15 L100,20 L90,25 Q80,32 60,30 L30,25 Q10,30 0,20 Z M85,18 L95,15 L95,25 L85,22 Z" />
          </svg>
        </div>
      </div>

      {/* Logo flutuante */}
      <div className="relative z-10 mb-8 animate-float-slow">
        <div className="relative">
          <img
            src="/images/logo-20completa-20aaakn.png"
            alt="AAAKN - Atlética Medicina Caraguá"
            className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          />
          {/* Brilho atrás do logo */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full -z-10 scale-75" />
        </div>
      </div>

      {/* Título e subtítulo */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
          BEM-VINDO,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            TUBARÃO!
          </span>
        </h1>
        <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
          <Waves className="w-4 h-4 text-emerald-500" />
          Entre para o cardume mais feroz da medicina
          <Waves className="w-4 h-4 text-emerald-500" />
        </p>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-emerald-900/30 p-6 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@faculdade.edu.br"
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Esqueci senha */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Entrar no Cardume
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 font-medium">ou</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Botão Criar Conta */}
          <button
            onClick={() => router.push("/cadastro")}
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition border border-zinc-700 hover:border-emerald-800"
          >
            Criar minha conta
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Ao entrar, você concorda com nossos{" "}
          <button className="text-emerald-500 hover:underline">Termos</button> e{" "}
          <button className="text-emerald-500 hover:underline">
            Privacidade
          </button>
        </p>
      </div>

      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(100vh) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25px);
          }
        }

        @keyframes wave-slow {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(25px);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes swim {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(calc(100vw + 100px));
          }
        }

        @keyframes swim-reverse {
          0% {
            transform: translateX(100px) scaleX(-1);
          }
          100% {
            transform: translateX(calc(-100vw - 100px)) scaleX(-1);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }

        .animate-wave-slow {
          animation: wave-slow 10s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-swim {
          animation: swim 20s linear infinite;
        }

        .animate-swim-reverse {
          animation: swim-reverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
