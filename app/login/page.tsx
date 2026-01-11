"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Waves, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext"; // Use o Toast

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula autenticação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Exemplo de erro (remova ou adapte conforme necessário)
    if (password.length < 6) {
      setIsLoading(false);
      addToast("Senha incorreta ou muito curta", "error");
      return;
    }

    addToast(`Bem-vindo de volta, Tubarão!`, "success");
    router.push("/perfil"); // Vai para o perfil ou home
  };

  const handleGuestLogin = () => {
    // Redireciona para a home. Lá, o AuthContext não terá usuário,
    // e o `activeUser` vai cair no `demoUser` automaticamente.
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#030a08] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* ... (Background animations mantidas) ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradiente oceânico */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#041f15] via-[#030a08] to-[#020504]" />
        {/* ... (Ondas e bolhas) ... */}
      </div>

      {/* Logo e Título */}
      <div className="relative z-10 mb-8 animate-float-slow text-center">
        <div className="relative inline-block">
          <img
            src="/logo.png"
            alt="AAAKN"
            className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          />
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full -z-10 scale-75" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-4">
          BEM-VINDO,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            TUBARÃO!
          </span>
        </h1>
        <p className="text-zinc-400 text-sm mt-2 flex items-center justify-center gap-2">
          <Waves className="w-4 h-4 text-emerald-500" />
          Entre para o cardume mais feroz da medicina
          <Waves className="w-4 h-4 text-emerald-500" />
        </p>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-emerald-900/30 p-6 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition"
              >
                Esqueci minha senha
              </button>
            </div>

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

          <div className="space-y-3">
            <button
              onClick={() => router.push("/cadastro")}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition border border-zinc-700 hover:border-emerald-800"
            >
              Criar minha conta
            </button>

            {/* BOTÃO ENTRAR COMO VISITANTE */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 bg-transparent hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-transparent hover:border-zinc-700"
            >
              Entrar como Visitante
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Ao entrar, você concorda com nossos{" "}
          <button className="text-emerald-500 hover:underline">Termos</button> e{" "}
          <button className="text-emerald-500 hover:underline">
            Privacidade
          </button>
        </p>
      </div>

      {/* Styles (Mantidos do anterior) */}
      <style jsx>{`
        /* ... suas animações ... */
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
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
      `}</style>
    </div>
  );
}
