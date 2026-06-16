import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onLogin: (email: string, pass: string) => void;
  defaultEmail?: string;
  defaultPassword?: string;
  isDarkMode?: boolean;
}

export default function LoginForm({ onLogin, defaultEmail = "contacto@ilungi.ao", defaultPassword = "ilungi123", isDarkMode = false }: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleQuickFill = () => {
    setEmail("contacto@ilungi.ao");
    setPassword("ilungi123");
  };

  return (
    <div className={cn(
      "flex w-full min-h-[550px] md:min-h-[640px] items-stretch rounded-2xl overflow-hidden shadow-2xl border transition-colors",
      isDarkMode ? "bg-slate-950 border-emerald-950/40" : "bg-white border-slate-100"
    )}>
      {/* LEFT SIDE IMAGE PANEL (With high-end design overlay, customized with academic branding) */}
      <div className="w-1/2 hidden md:flex flex-col justify-between p-10 relative bg-[#022c22] overflow-hidden group select-none">
        {/* Background Graphic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#022c22] via-[#022d23] to-[#12352c] opacity-90 z-0"></div>
        
        {/* Abstract design elements matching screenshot style */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <path d="M0 0H100V100H60V40H0V0Z" fill="#7811f7" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-25">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
            <path d="M0 0H40V60H100V100H0V0Z" fill="#a78bfa" />
          </svg>
        </div>

        {/* Dynamic Unsplash backdrop */}
        <img 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700" 
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000" 
          alt="Academia ILUNGI" 
        />
        
        {/* Top bar description */}
        <div className="relative z-10 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#7811f7] flex items-center justify-center text-white font-extrabold font-sans shadow-md">
            I
          </div>
          <span className="text-sm font-semibold text-emerald-105 tracking-wide text-white">ACADEMIA ILUNGI</span>
        </div>

        {/* Content hook */}
        <div className="relative z-10 text-white space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-55/20 text-[10px] uppercase font-bold tracking-widest text-[#a7f3d0]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistema Homologado de Diplomas</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight uppercase font-sans">
            Solução Oficial<br />de Emissão de<br />Certificados
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed max-w-sm font-light">
            Desenvolvido para gerir, personalizar, registar e auditar diplomas académicos e formações de segurança. Certificado com homologação regulamentada sob as normas do INEFOP.
          </p>
        </div>

        {/* Bottom copyright/NIF */}
        <div className="relative z-10 text-[9px] text-emerald-300/65 font-mono">
          NIF 5000074578 • ACADEMIA REGISTADA • LUANDA, ANGOLA
        </div>
      </div>
  
      {/* RIGHT SIDE FORM PANEL */}
      <div className={cn(
        "w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 relative z-10",
        isDarkMode ? "bg-slate-950" : "bg-white"
      )}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col justify-center">
          
          {/* Logo compact for mobile */}
          <div className="flex md:hidden items-center space-x-2 mb-6 self-center bg-emerald-950/5 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-950/10">
            <span className="w-6 h-6 rounded-md bg-[#7811f7] flex items-center justify-center text-white text-[11px] font-bold">I</span>
            <span className="text-xs font-bold text-[#022c22] dark:text-emerald-300 tracking-tight">Academia ILUNGI</span>
          </div>

          <h2 className={cn(
            "text-3xl font-bold tracking-tight text-center md:text-left",
            isDarkMode ? "text-emerald-50" : "text-gray-900"
          )}>Sign in</h2>
          <p className="text-xs text-slate-400 mt-2 text-center md:text-left font-light">
            Seja bem-vindo de volta! Introduza as credenciais da instituição.
          </p>

          <div className="flex items-center gap-4 w-full my-6">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">ILUNGI Credenciais</p>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div className="space-y-4">
            {/* Email input field */}
            <div className="space-y-1.5">
              <label className={cn("text-[10px] uppercase font-bold tracking-wider", isDarkMode ? "text-slate-400" : "text-slate-500")}>Endereço de E-mail</label>
              <div className={cn(
                "flex items-center w-full border h-11 px-4 rounded-xl gap-2.5 transition-all focus-within:border-[#7811f7]",
                isDarkMode ? "bg-slate-900/50 border-slate-850" : "bg-slate-50/50 border-slate-200"
              )}>
                <svg width="15" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-60">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor"/>
                </svg>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@ilungi.ao" 
                  className={cn(
                    "bg-transparent text-xs w-full h-full outline-none transition-colors",
                    isDarkMode ? "text-slate-200 placeholder-slate-600" : "text-slate-800 placeholder-slate-400"
                  )}
                  required 
                />                 
              </div>
            </div>

            {/* Password input field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className={cn("text-[10px] uppercase font-bold tracking-wider", isDarkMode ? "text-slate-400" : "text-slate-500")}>Palavra-passe</label>
                <a className="text-[10px] text-[#7811f7] dark:text-[#a78bfa] hover:underline" href="#" onClick={(e) => { e.preventDefault(); }}>Esqueceu?</a>
              </div>
              <div className={cn(
                "flex items-center w-full border h-11 px-4 rounded-xl gap-2.5 transition-all focus-within:border-[#7811f7]",
                isDarkMode ? "bg-slate-900/50 border-slate-850" : "bg-slate-50/50 border-slate-200"
              )}>
                <svg width="12" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-60">
                  <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor"/>
                </svg>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduza a sua senha" 
                  className={cn(
                    "bg-transparent text-xs w-full h-full outline-none transition-colors",
                    isDarkMode ? "text-slate-200 placeholder-slate-600" : "text-slate-800 placeholder-slate-400"
                  )}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between mt-5 text-slate-500">
            <div className="flex items-center gap-2 select-none">
              <input 
                className="h-4 w-4 rounded accent-[#7811f7] cursor-pointer" 
                type="checkbox" 
                id="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className={cn("text-xs cursor-pointer", isDarkMode ? "text-slate-400" : "text-slate-500")} htmlFor="checkbox">Lembrar sessão</label>
            </div>
          </div>

          {/* Login button */}
          <button 
            type="submit" 
            className="mt-6 w-full h-11 rounded-xl text-white bg-[#7811f7] hover:opacity-90 font-medium transition-all shadow-lg shadow-purple-600/10 cursor-pointer text-xs"
          >
            Iniciar Sessão
          </button>

          {/* Quick Demo Credentials Assistant */}
          <div className={cn(
            "mt-6 p-3.5 rounded-xl border flex flex-col space-y-2",
            isDarkMode ? "bg-emerald-950/10 border-emerald-950/20" : "bg-emerald-50/20 border-emerald-150"
          )}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                🔑 Acesso Demonstrativo Ativo
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-250 text-emerald-850 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold cursor-pointer border border-emerald-900/10 transition-colors"
              >
                Preencher Dados
              </button>
            </div>
            <div className="text-[9.5px] text-slate-500 dark:text-emerald-500 font-mono space-y-0.5">
              <div>Email: <strong className={isDarkMode ? "text-emerald-100" : "text-slate-800"}>contacto@ilungi.ao</strong></div>
              <div>Senha: <strong className={isDarkMode ? "text-emerald-100" : "text-slate-800"}>ilungi123</strong></div>
            </div>
          </div>

          <p className={cn(
            "text-center text-xs mt-6",
            isDarkMode ? "text-slate-500" : "text-slate-400"
          )}>
            Dúvidas no acesso? <a className="text-[#7811f7] dark:text-[#a78bfa] font-medium hover:underline" href="#" onClick={(e) => e.preventDefault()}>Suporte ILUNGI</a>
          </p>
        </form>
      </div>
    </div>
  );
}
