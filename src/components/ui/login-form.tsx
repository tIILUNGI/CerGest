import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onLogin: (email: string, pass: string) => void;
  onCreateAccount: (data: CreateAccountData) => void;
  onForgotPassword: (data: ForgotPasswordData) => void;
  defaultEmail?: string;
  defaultPassword?: string;
  isDarkMode?: boolean;
}

interface CreateAccountData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  institution: string;
}

interface ForgotPasswordData {
  email: string;
  newPassword?: string;
  confirmPassword?: string;
}

const CertificateIcon = ({ className = "text-lg" }: { className?: string }) => (
  <i className={cn("ti ti-certificate", className)} />
);

const EmailIcon = () => (
  <svg
    width="15"
    height="11"
    viewBox="0 0 16 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 opacity-60"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
      fill="currentColor"
    />
  </svg>
);

const PasswordIcon = () => (
  <svg
    width="12"
    height="15"
    viewBox="0 0 13 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 opacity-60"
  >
    <path
      d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
      fill="currentColor"
    />
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 opacity-70"
  >
    {visible ? (
      <>
        <path
          d="M2.25 12C4.08 8.67 7.75 6.5 12 6.5C16.25 6.5 19.92 8.67 21.75 12C19.92 15.33 16.25 17.5 12 17.5C7.75 17.5 4.08 15.33 2.25 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.58 10.59C10.38 10.94 10.27 11.35 10.27 11.78C10.27 13.21 11.43 14.37 12.86 14.37C13.3 14.37 13.71 14.26 14.06 14.06"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.27 11.78L14.06 14.06"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9.88 5.24C6.03 6.54 3.27 9.37 2.25 12C4.08 15.33 7.75 17.5 12 17.5C13.44 17.5 14.79 17.21 16 16.71"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14.12 5.24C14.72 5.04 15.35 4.93 16 4.93C18.5 4.93 20.58 6.03 21.75 8C21.25 9.29 20.55 10.46 19.72 11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

export default function LoginForm({
  onLogin,
  onCreateAccount,
  onForgotPassword,
  defaultEmail = "contacto@ilungi.ao",
  defaultPassword = "ilungi123",
  isDarkMode = false,
}: LoginFormProps) {
  const [view, setView] = useState<"login" | "create" | "forgot">("login");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Administrador");
  const [institution, setInstitution] = useState("CerGest");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const isCreateView = view === "create";
  const isForgotView = view === "forgot";

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAccount({
      name,
      email,
      password,
      role,
      institution,
      confirmPassword,
    });
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onForgotPassword({ email, newPassword, confirmPassword });
  };

  const handleQuickFill = () => {
    setEmail("contacto@ilungi.ao");
    setPassword("ilungi123");
  };

  const togglePassword = (key: string) => {
    setVisiblePasswords((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const inputClass = cn(
    "bg-transparent text-xs w-full h-full outline-none transition-colors",
    isDarkMode
      ? "text-slate-200 placeholder-slate-600"
      : "text-slate-800 placeholder-slate-400",
  );

  const fieldWrapperClass = cn(
    "flex items-center w-full border h-11 px-4 rounded-xl gap-2.5 transition-all focus-within:border-[#7811f7]",
    isDarkMode
      ? "bg-slate-900/50 border-slate-850"
      : "bg-slate-50/50 border-slate-200",
  );

  const labelClass = cn(
    "text-[10px] uppercase font-bold tracking-wider",
    isDarkMode ? "text-slate-400" : "text-slate-500",
  );
  const mutedClass = cn(isDarkMode ? "text-slate-500" : "text-slate-400");

  const renderTextInput = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    icon: React.ReactNode = <EmailIcon />,
  ) => (
    <div className="space-y-1.5">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className={fieldWrapperClass}>
        {icon}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          required
          autoComplete="off"
        />
      </div>
    </div>
  );

  const renderPasswordInput = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    visibilityKey: string,
    autoComplete = "current-password",
  ) => {
    const visible = Boolean(visiblePasswords[visibilityKey]);

    return (
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
        <div className={fieldWrapperClass}>
          <PasswordIcon />
          <input
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            required
            autoComplete={autoComplete}
          />
          <button
            type="button"
            onClick={() => togglePassword(visibilityKey)}
            className="shrink-0 text-[var(--color-text-muted)] hover:text-[#7811f7] dark:hover:text-[#a78bfa] transition-colors"
            title={visible ? "Ocultar palavra-passe" : "Ver palavra-passe"}
          >
            <EyeIcon visible={visible} />
          </button>
        </div>
      </div>
    );
  };

  const openForgot = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setView("forgot");
  };

  return (
    <div
      className={cn(
        "flex w-full min-h-[550px] md:min-h-[640px] items-stretch rounded-2xl overflow-hidden shadow-2xl border transition-colors",
        isDarkMode
          ? "bg-slate-950 border-emerald-950/40"
          : "bg-white border-slate-100",
      )}
    >
      <div className="w-1/2 hidden md:flex flex-col justify-between p-10 relative bg-[#022c22] overflow-hidden group select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#022c22] via-[#022d23] to-[#12352c] opacity-90 z-0"></div>
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

        <img
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000"
          alt="CerGest"
        />

        {/* Logo no topo */}
        <div className="relative z-10 flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <CertificateIcon className="text-xl" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">
            CerGest
          </span>
        </div>

        {/* Texto central - no meio da imagem */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-white space-y-4 text-center px-10">
            <h2 className="text-3xl font-black tracking-tight leading-tight uppercase font-sans drop-shadow-lg">
              Gestão Oficial
              <br />
              de Certificados
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed max-w-xs font-light drop-shadow-md">
              Desenvolvido para gerir, personalizar, registar e auditar diplomas
              académicos e formações de segurança com um fluxo empresarial,
              simples e seguro.
            </p>
          </div>
        </div>

        {/* Placeholder para manter o justify-between */}
        <div className="relative z-10"></div>
      </div>

      <div
        className={cn(
          "w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 relative z-10",
          isDarkMode ? "bg-slate-950" : "bg-white",
        )}
      >
        {view === "login" && (
          <form
            onSubmit={handleLoginSubmit}
            className="w-full max-w-sm flex flex-col justify-center"
          >
            <div className="flex md:hidden items-center space-x-2 mb-6 self-center bg-emerald-950/5 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-950/10">
              <div className="w-7 h-7 rounded-xl bg-[#7811f7] flex items-center justify-center text-white">
                <CertificateIcon className="text-sm" />
              </div>
              <span className="text-xs font-bold text-[#022c22] dark:text-emerald-300 tracking-tight">
                CerGest
              </span>
            </div>

            <h2
              className={cn(
                "text-3xl font-bold tracking-tight text-left",
                isDarkMode ? "text-emerald-50" : "text-gray-900",
              )}
            >
              CerGest
            </h2>

            <p className="text-xs text-slate-400 mt-2 text-left font-light">
              Seja bem-vindo de volta! Introduza as credenciais da instituição.
            </p>

            <div className="flex items-center gap-4 w-full my-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Acesso seguro
              </p>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>

            <div className="space-y-4">
              {renderTextInput(
                "login-email",
                "Endereço de E-mail",
                email,
                setEmail,
                "exemplo@ilungi.ao",
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={labelClass} htmlFor="login-password">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    className="text-[10px] text-[#7811f7] dark:text-[#a78bfa] hover:underline"
                    onClick={openForgot}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                {renderPasswordInput(
                  "login-password",
                  "",
                  password,
                  setPassword,
                  "Introduza a sua senha",
                  "login",
                )}
              </div>
            </div>

            <div className="w-full flex items-center justify-between mt-5 text-slate-500">
              <div className="flex items-center gap-2 select-none">
                <input
                  className="h-4 w-4 rounded accent-[#7811f7] cursor-pointer"
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className={cn(
                    "text-xs cursor-pointer",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                  htmlFor="login-remember"
                >
                  Lembrar sessão
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-xl text-white bg-[#7811f7] hover:opacity-90 font-medium transition-all shadow-lg shadow-purple-600/10 cursor-pointer text-xs"
            >
              Iniciar Sessão
            </button>

            <div
              className={cn(
                "mt-6 p-3.5 rounded-xl border flex flex-col space-y-2",
                isDarkMode
                  ? "bg-emerald-950/10 border-emerald-950/20"
                  : "bg-emerald-50/20 border-emerald-150",
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                  Acesso Demonstrativo Ativo
                </span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-250 text-emerald-850 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold cursor-pointer border border-emerald-900/10 transition-colors"
                >
                  Preencher Dados
                </button>
              </div>
              <div className="text-[9.5px] text-slate-500 dark:text-emerald-500 font-mono space-y-0.5 text-center">
                <div>
                  Email:{" "}
                  <strong
                    className={
                      isDarkMode ? "text-emerald-100" : "text-slate-800"
                    }
                  >
                    contacto@ilungi.ao
                  </strong>
                </div>
                <div>
                  Senha:{" "}
                  <strong
                    className={
                      isDarkMode ? "text-emerald-100" : "text-slate-800"
                    }
                  >
                    ilungi123
                  </strong>
                </div>
              </div>
            </div>

            <p className={cn("text-center text-xs mt-6", mutedClass)}>
              Ainda não tem conta?{" "}
              <button
                type="button"
                className="text-[#7811f7] dark:text-[#a78bfa] font-medium hover:underline"
                onClick={() => setView("create")}
              >
                Criar conta
              </button>
            </p>
          </form>
        )}

        {isCreateView && (
          <form
            onSubmit={handleCreateAccountSubmit}
            className="w-full max-w-sm flex flex-col justify-center"
          >
            <div className="flex md:hidden items-center space-x-2 mb-6 self-center bg-emerald-950/5 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-950/10">
              <div className="w-7 h-7 rounded-xl bg-[#7811f7] flex items-center justify-center text-white">
                <CertificateIcon className="text-sm" />
              </div>
              <span className="text-xs font-bold text-[#022c22] dark:text-emerald-300 tracking-tight">
                CerGest
              </span>
            </div>

            <h2
              className={cn(
                "text-3xl font-bold tracking-tight text-center md:text-left",
                isDarkMode ? "text-emerald-50" : "text-gray-900",
              )}
            >
              Criar conta
            </h2>
            <p className="text-xs text-slate-400 mt-2 text-center md:text-left font-light">
              Registe uma nova conta para aceder ao painel CerGest.
            </p>

            <div className="flex items-center gap-4 w-full my-6">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Nova conta
              </p>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>

            <div className="space-y-4">
              {renderTextInput(
                "create-name",
                "Nome completo",
                name,
                setName,
                "Ex: Manuel Calado",
              )}
              {renderTextInput(
                "create-email",
                "Endereço de E-mail",
                email,
                setEmail,
                "nome@instituicao.ao",
              )}
              {renderTextInput(
                "create-role",
                "Função/Cargo",
                role,
                setRole,
                "Administrador",
              )}
              {renderTextInput(
                "create-institution",
                "Instituição/Academia",
                institution,
                setInstitution,
                "CerGest",
              )}
              {renderPasswordInput(
                "create-password",
                "Palavra-passe",
                password,
                setPassword,
                "Mínimo 6 caracteres",
                "create",
              )}
              {renderPasswordInput(
                "create-confirm",
                "Confirmar palavra-passe",
                confirmPassword,
                setConfirmPassword,
                "Repita a palavra-passe",
                "confirmCreate",
                "new-password",
              )}
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-xl text-white bg-[#7811f7] hover:opacity-90 font-medium transition-all shadow-lg shadow-purple-600/10 cursor-pointer text-xs"
            >
              Criar conta
            </button>

            <p className={cn("text-center text-xs mt-6", mutedClass)}>
              Já tem conta?{" "}
              <button
                type="button"
                className="text-[#7811f7] dark:text-[#a78bfa] font-medium hover:underline"
                onClick={() => setView("login")}
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        {isForgotView && (
          <form
            onSubmit={handleForgotPasswordSubmit}
            className="w-full max-w-sm flex flex-col justify-center"
          >
            <div className="flex md:hidden items-center space-x-2 mb-6 self-center bg-emerald-950/5 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-950/10">
              <div className="w-7 h-7 rounded-xl bg-[#7811f7] flex items-center justify-center text-white">
                <CertificateIcon className="text-sm" />
              </div>
              <span className="text-xs font-bold text-[#022c22] dark:text-emerald-300 tracking-tight">
                CerGest
              </span>
            </div>

            <h2
              className={cn(
                "text-3xl font-bold tracking-tight text-center md:text-left",
                isDarkMode ? "text-emerald-50" : "text-gray-900",
              )}
            >
              Recuperar senha
            </h2>
            <p className="text-xs text-slate-400 mt-2 text-center md:text-left font-light">
              Informe o e-mail da conta e defina uma nova palavra-passe.
            </p>

            <div className="flex items-center gap-4 w-full my-6">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Recuperação
              </p>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>

            <div className="space-y-4">
              {renderTextInput(
                "forgot-email",
                "Endereço de E-mail",
                email,
                setEmail,
                "nome@instituicao.ao",
              )}
              {renderPasswordInput(
                "forgot-password",
                "Nova palavra-passe",
                newPassword,
                setNewPassword,
                "Mínimo 6 caracteres",
                "forgotNew",
                "new-password",
              )}
              {renderPasswordInput(
                "forgot-confirm",
                "Confirmar nova palavra-passe",
                confirmPassword,
                setConfirmPassword,
                "Repita a nova palavra-passe",
                "forgotConfirm",
                "new-password",
              )}
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-xl text-white bg-[#7811f7] hover:opacity-90 font-medium transition-all shadow-lg shadow-purple-600/10 cursor-pointer text-xs"
            >
              Repor palavra-passe
            </button>

            <p className={cn("text-center text-xs mt-6", mutedClass)}>
              Lembrou-se da senha?{" "}
              <button
                type="button"
                className="text-[#7811f7] dark:text-[#a78bfa] font-medium hover:underline"
                onClick={() => setView("login")}
              >
                Voltar ao login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
