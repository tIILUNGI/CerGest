/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Certificate,
  CertificateTemplate,
  CertificateStatus,
  InstitutionSettings,
  UserProfile,
} from "./types";
import LoginForm from "./components/ui/login-form";

type AuthAccount = {
  name: string;
  email: string;
  password: string;
  role: string;
  institution: string;
  createdAt: string;
};

const AUTH_STORAGE_KEY = "cergest.auth.session.v1";
const ACCOUNTS_STORAGE_KEY = "cergest.auth.accounts.v1";
const ADMIN_ACCOUNT: AuthAccount = {
  name: "Manuel R. J. Calado",
  email: "contacto@ilungi.ao",
  password: "ilungi123",
  role: "Director Geral",
  institution: "Academia ILUNGI",
  createdAt: "2026-06-16T00:00:00.000Z",
};

const readStoredAccounts = (): AuthAccount[] => {
  try {
    const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!rawAccounts) {
      return [ADMIN_ACCOUNT];
    }

    const parsedAccounts = JSON.parse(rawAccounts);
    if (!Array.isArray(parsedAccounts) || parsedAccounts.length === 0) {
      return [ADMIN_ACCOUNT];
    }

    return parsedAccounts.filter(
      (account) => account && account.email && account.password,
    );
  } catch {
    return [ADMIN_ACCOUNT];
  }
};

const persistAuthSession = (isAuthenticated: boolean) => {
  try {
    if (isAuthenticated) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {}
};

// Mock inicial de certificados em Português
const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "ILUNGI-2025-001",
    recipientName: "Sérgio Damião da Silva",
    courseName: "Higiene, Saúde e Segurança do Trabalho",
    issueDate: "2025-05-30",
    hours: 120,
    type: "Curso",
    status: "Activo",
    verificationCode: "OP-ILUNGI#20240109",
    signatoryName: "Manuel R. J. Calado",
    signatoryRole: "DIRECTOR GERAL | ILUNGI",
    grade: "18 (de 20 valores)",
    startDate: "2025-05-05",
    endDate: "2025-05-30",
    curriculum: `• Módulo 1 - Enquadramento Jurídico Da Shst E Conceitos Fundamentais
• Módulo 2A - Risco De Incêndio
• Módulo 2B - Risco Eléctrico
• Módulo 3A - AMBIENTE TÉRMICO / QUALIDADE DO AR
• Módulo 3B - EXPOSIÇÃO A AGENTES QUÍMICOS
• Módulo 4 - ERGONOMIA/ANTROPOMETRIA
• Módulo 5A - ANÁLISE DO RUÍDO / VIBRAÇÕES
• Módulo 5B - ILUMINAÇÃO
• Módulo 6 - Trabalho Com Máquinas/Movimentação De Cargas`,
    courseNo: "MEQR",
    inefopLicense: "917.01/LDA./2014",
  },
  {
    id: "ILUNGI-2025-002",
    recipientName: "Carlos Manuel Silva Santos",
    courseName: "Gestão de Fatores de Risco e Auditoria de Segurança",
    issueDate: "2025-06-12",
    hours: 80,
    type: "Curso",
    status: "Activo",
    verificationCode: "OP-ILUNGI#20250764",
    signatoryName: "Manuel R. J. Calado",
    signatoryRole: "DIRECTOR GERAL | ILUNGI",
    grade: "19 (de 20 valores)",
    startDate: "2025-05-10",
    endDate: "2025-06-10",
    curriculum: `• Módulo 1 - Fatores Psicossociais no Trabalho
• Módulo 2 - Auditoria Interna de SHST
• Módulo 3 - Planos de Emergência e Proteção Civil`,
    courseNo: "SHST-AUD",
    inefopLicense: "917.01/LDA./2014",
  },
  {
    id: "ILUNGI-2025-003",
    recipientName: "Ana Sofia Mendes Rodrigues",
    courseName: "Prevenção e Combate a Incêndios Florestais",
    issueDate: "2025-04-18",
    hours: 40,
    type: "Workshop",
    status: "Activo",
    verificationCode: "OP-ILUNGI#20250419",
    signatoryName: "Manuel R. J. Calado",
    signatoryRole: "DIRECTOR GERAL | ILUNGI",
    grade: "Aprovado",
    startDate: "2025-04-14",
    endDate: "2025-04-18",
    curriculum: `• Módulo 1 - Comportamento do Fogo Florestal
• Módulo 2 - Táticas de Combate Direto e Indireto`,
    courseNo: "PREV-INC",
    inefopLicense: "917.01/LDA./2014",
  },
  {
    id: "ILUNGI-2025-004",
    recipientName: "João Pedro Ferreira Cruz",
    courseName: "Primeiros Socorros e Suporte Básico de Vida",
    issueDate: "2025-03-10",
    hours: 30,
    type: "Workshop",
    status: "Rascunho",
    verificationCode: "OP-ILUNGI#20250310",
    signatoryName: "Manuel R. J. Calado",
    signatoryRole: "DIRECTOR GERAL | ILUNGI",
    grade: "Apto",
    startDate: "2025-03-08",
    endDate: "2025-03-10",
    curriculum: `• Módulo 1 - Cadeia de Sobrevivência
• Módulo 2 - Ressuscitação Cardiopulmonar (RCP)`,
    courseNo: "PRIM-SOC",
    inefopLicense: "917.01/LDA./2014",
  },
];

// Modelos visuais iniciais
const INITIAL_TEMPLATES: CertificateTemplate[] = [
  // NOTE: O modelo oficial ILUNGI é o render "ilungi" que deve ser usado para bater com o Modelo.pdf.

  {
    id: "temp-classic",
    name: "Académico Tradicional (Horizontal)",
    styleName: "clássico",
    borderColor: "#0f172a",
    primaryColor: "#0f172a",
    fontFamily: "serif",
    hasSeal: true,
    borderStyle: "solid",
    orientation: "landscape",
  },
  {
    id: "temp-classic-vertical",
    name: "Imperial Académico (Vertical/Portrait)",
    styleName: "clássico",
    borderColor: "#0f172a",
    primaryColor: "#1e293b",
    fontFamily: "serif",
    hasSeal: true,
    borderStyle: "double",
    orientation: "portrait",
  },
  {
    id: "temp-tech",
    name: "Futurista Tecnológico (Horizontal)",
    styleName: "tecnológico",
    borderColor: "#4f46e5",
    primaryColor: "#312e81",
    fontFamily: "sans",
    hasSeal: false,
    borderStyle: "dashed",
    orientation: "landscape",
  },
  {
    id: "temp-minimal",
    name: "Mínimo Contemporâneo (Horizontal)",
    styleName: "minimalista",
    borderColor: "#94a3b8",
    primaryColor: "#0f172a",
    fontFamily: "mono",
    hasSeal: false,
    borderStyle: "solid",
    orientation: "landscape",
  },
  {
    id: "temp-exec",
    name: "Executivo Corporativo (Horizontal)",
    styleName: "executivo",
    borderColor: "#b89047",
    primaryColor: "#1e293b",
    fontFamily: "sans",
    hasSeal: true,
    borderStyle: "double",
    orientation: "landscape",
  },
  {
    id: "temp-exec-vertical",
    name: "Prestígio Executivo (Vertical/Portrait)",
    styleName: "executivo",
    borderColor: "#b89047",
    primaryColor: "#0f172a",
    fontFamily: "sans",
    hasSeal: true,
    borderStyle: "solid",
    orientation: "portrait",
  },
  {
    id: "temp-ilungi",
    name: "Modelo Ilungi Oficial (Vertical/Portrait)",
    styleName: "ilungi",
    borderColor: "#022c22",
    primaryColor: "#022c22",
    fontFamily: "sans",
    hasSeal: true,
    borderStyle: "solid",
    orientation: "portrait",
  },
];

// Dados da Instituição predefinidos
const INITIAL_SETTINGS: InstitutionSettings = {
  name: "Academia ILUNGI",
  email: "contacto@ilungi.ao",
  phone: "+244 935 793 270",
  defaultSignatory: "Manuel R. J. Calado",
  defaultRole: "DIRECTOR GERAL | ILUNGI",
  prefix: "ILUNGI",
  logoUrl:
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120",
};

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "info" | "danger";
}

export default function App() {
  // --- Estados do Sistema ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [loginEmail, setLoginEmail] = useState<string>("contacto@ilungi.ao");
  const [loginPassword, setLoginPassword] = useState<string>("ilungi123");
  const [accounts, setAccounts] = useState<AuthAccount[]>(() => {
    const storedAccounts = readStoredAccounts();
    return storedAccounts.some(
      (account) => account.email.trim().toLowerCase() === ADMIN_ACCOUNT.email,
    )
      ? storedAccounts
      : [ADMIN_ACCOUNT, ...storedAccounts];
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: "Manuel R. J. Calado",
    email: "contacto@ilungi.ao",
    role: "Director Geral",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    signatureText: "Manuel R. J. Calado",
  });

  const [activePage, setActivePage] = useState<string>("dashboard");
  const [certificates, setCertificates] =
    useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [templates, setTemplates] =
    useState<CertificateTemplate[]>(INITIAL_TEMPLATES);

  // Sincronizar dados da instituição iniciais com o perfil do director
  const [institution, setInstitution] = useState<InstitutionSettings>({
    ...INITIAL_SETTINGS,
    defaultSignatory: "Manuel R. J. Calado",
    defaultRole: "DIRECTOR GERAL | ILUNGI",
  });

  // Modo Escuro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Alertas / Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Formulário - Inputs Ativos
  const [formInputs, setFormInputs] = useState<
    Omit<Certificate, "id" | "verificationCode">
  >({
    recipientName: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    hours: 120,
    type: "Curso",
    status: "Rascunho",
    signatoryName: "Manuel R. J. Calado",
    signatoryRole: "DIRECTOR GERAL | ILUNGI",
    grade: "18 (de 20 valores)",
    startDate: "2025-05-05",
    endDate: "2025-05-30",
    curriculum: `• Módulo 1 - Enquadramento Jurídico Da Shst E Conceitos Fundamentais
• Módulo 2A - Risco De Incêndio
• Módulo 2B - Risco Eléctrico
• Módulo 3A - AMBIENTE TÉRMICO / QUALIDADE DO AR
• Módulo 3B - EXPOSIÇÃO A AGENTES QUÍMICOS`,
    courseNo: "MEQR",
    inefopLicense: "917.01/LDA./2014",
  });

  // Código pré-gerado para o formulário
  const [generatedCode, setGeneratedCode] =
    useState<string>("ILUNGI-AUTO-0000");

  // Estado para Edição de Certificados
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  // Tabelas, Filtros e Pesquisa
  const [tableSearch, setTableSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [typeFilter, setTypeFilter] = useState<string>("Todos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Editor Visual / Configurações Ativas do Canvas
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(
    INITIAL_TEMPLATES[6],
  );
  const [editorStyle, setEditorStyle] = useState({
    titleText: "CERTIFICADO",
    subtitleText: "A ACADEMIA ILUNGI certifica que:",
    borderColor: "#022c22",
    primaryColor: "#022c22",
    accentColor: "#7811f7",
    borderStyle: "solid" as "solid" | "dashed" | "double",
    fontFamily: "sans" as "serif" | "sans" | "mono",
    hasSeal: true,
    showLogo: true,
    logoUrl:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120",
    orientation: "portrait" as "landscape" | "portrait",
  });

  // Modal de Visualização de Certificado
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  // Estados para a Barra de Pesquisa Inteligente e Responsividade
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Inicializações e Sincronização de Dados de Prefixo
  useEffect(() => {
    generateNewCode();
  }, [formInputs.type, institution.prefix]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // Handler para Dark Mode alternar classes
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark-mode");
        document.body.classList.add("bg-slate-950");
      } else {
        document.documentElement.classList.remove("dark-mode");
        document.body.classList.remove("bg-slate-950");
      }
      return next;
    });
    addToast("Modo de exibição alternado", "info");
  };

  // Helper para Toasts temporários
  const addToast = (
    message: string,
    type: "success" | "warning" | "info" | "danger" = "success",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setGlobalSearch("");
    setIsSearchActive(false);
    persistAuthSession(false);
    addToast("Sessão encerrada com sucesso.", "info");
  };

  // Código Único de Certificado
  const generateNewCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const labelType = (formInputs.type || "CUR").slice(0, 3).toUpperCase();
    const code = `${institution.prefix || "CERGEST"}-${labelType}-${random}`;
    setGeneratedCode(code);
    return code;
  };

  // Emissão ou Edição de Certificado
  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInputs.recipientName.trim() || !formInputs.courseName.trim()) {
      addToast(
        "Por favor, preencha o Nome do Aluno e o Nome do Curso.",
        "danger",
      );
      return;
    }

    if (editingCertId) {
      // Editar existente
      setCertificates((prev) =>
        prev.map((cert) => {
          if (cert.id === editingCertId) {
            return {
              ...cert,
              recipientName: formInputs.recipientName,
              courseName: formInputs.courseName,
              issueDate: formInputs.issueDate,
              hours: Number(formInputs.hours),
              type: formInputs.type,
              status: formInputs.status,
              signatoryName: formInputs.signatoryName,
              signatoryRole: formInputs.signatoryRole,
              grade: formInputs.grade,
              startDate: formInputs.startDate,
              endDate: formInputs.endDate,
              curriculum: formInputs.curriculum,
              courseNo: formInputs.courseNo,
              inefopLicense: formInputs.inefopLicense,
            };
          }
          return cert;
        }),
      );
      addToast("Certificado atualizado com sucesso!", "success");
      setEditingCertId(null);
    } else {
      // Criar novo
      const newCert: Certificate = {
        id: `CERT-2026-${Math.floor(100 + Math.random() * 900)}`,
        recipientName: formInputs.recipientName,
        courseName: formInputs.courseName,
        issueDate: formInputs.issueDate,
        hours: Number(formInputs.hours),
        type: formInputs.type,
        status: formInputs.status,
        verificationCode: generatedCode,
        signatoryName: formInputs.signatoryName,
        signatoryRole: formInputs.signatoryRole,
        grade: formInputs.grade,
        startDate: formInputs.startDate,
        endDate: formInputs.endDate,
        curriculum: formInputs.curriculum,
        courseNo: formInputs.courseNo,
        inefopLicense: formInputs.inefopLicense,
      };

      setCertificates((prev) => [newCert, ...prev]);
      addToast("Novo certificado emitido e registado com sucesso!", "success");
    }

    // Reset formulário aos valores padrão e navega
    resetForm();
    showPage("table");
  };

  const startEditCertificate = (cert: Certificate) => {
    setEditingCertId(cert.id);
    setFormInputs({
      recipientName: cert.recipientName,
      courseName: cert.courseName,
      issueDate: cert.issueDate,
      hours: cert.hours,
      type: cert.type,
      status: cert.status,
      signatoryName: cert.signatoryName,
      signatoryRole: cert.signatoryRole,
      grade: cert.grade || "",
      startDate: cert.startDate || "",
      endDate: cert.endDate || "",
      curriculum: cert.curriculum || "",
      courseNo: cert.courseNo || "",
      inefopLicense: cert.inefopLicense || "",
    });
    setGeneratedCode(cert.verificationCode);
    showPage("form");
    addToast("Dados do certificado carregados para edição.", "info");
  };

  const resetForm = () => {
    setEditingCertId(null);
    setFormInputs({
      recipientName: "",
      courseName: "",
      issueDate: new Date().toISOString().split("T")[0],
      hours: 40,
      type: "Curso",
      status: "Rascunho",
      signatoryName: institution.defaultSignatory,
      signatoryRole: institution.defaultRole,
      grade: "Aprovado",
      startDate: "",
      endDate: "",
      curriculum: "",
      courseNo: "",
      inefopLicense: "",
    });
    generateNewCode();
  };

  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    addToast("Certificado apagado do registo permanente.", "warning");
  };

  const downloadCertificatePDF = async (cert: Certificate) => {
    // Definir o certificado em modo de visualização caso já não esteja
    const isAlreadyViewing = viewingCert && viewingCert.id === cert.id;
    if (!isAlreadyViewing) {
      setViewingCert(cert);
    }

    addToast(
      `A processar PDF de alta-fidelidade para o certificado...`,
      "info",
    );
    setIsExportingPDF(true);

    // Tempo para re-renderização suave no DOM e inicialização do Canvas
    setTimeout(async () => {
      try {
        const element = document.getElementById("printable-certificate-area");
        if (!element) {
          addToast(
            "Área gráfica do certificado não foi encontrada no DOM.",
            "danger",
          );
          setIsExportingPDF(false);
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 2.5, // Resolução ultra nítida profissional
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");

        // Orientação do documento idêntica ao design ativo
        const isPortrait = selectedTemplate.orientation === "portrait";
        const pdf = new jsPDF({
          orientation: isPortrait ? "portrait" : "landscape",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        // Centrar o certificado verticalmente na folha A4
        let yPos = (pdfHeight - imgHeight) / 2;
        if (yPos < 0) yPos = 0;

        pdf.addImage(imgData, "PNG", 0, yPos, imgWidth, imgHeight);

        // Sanetizar o nome do aluno para gravação de ficheiro segura e limpa
        const sanitizedName = cert.recipientName
          .trim()
          .replace(/\s+/g, "-")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        pdf.save(`certificado-${sanitizedName}-${cert.verificationCode}.pdf`);

        addToast(
          `Download completo do certificado de ${cert.recipientName} em PDF Premium!`,
          "success",
        );
      } catch (err) {
        console.error("Pdf download rendering error:", err);
        addToast(
          "Erro ao exportar PDF de alta resolução. Verifique o layout visual.",
          "danger",
        );
      } finally {
        setIsExportingPDF(false);
      }
    }, 450);
  };

  const exportAllCertificatesJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(certificates, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cergest-database-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(
      "Base de dados completa exportada em formato JSON backup.",
      "success",
    );
  };

  // Atualizar Definições da Instituição
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Configurações da instituição guardadas com sucesso!", "success");
    addToast(
      "Formatos padrão atualizados para os próximos certificados.",
      "info",
    );
  };

  // SPA navigation
  const showPage = (pageId: string) => {
    setActivePage(pageId);
    // Fechar menu mobile se estiver aberto
    setIsSidebarOpen(false);
  };

  // --- Barra de Pesquisa Inteligente (Smart Query Engine) ---
  const getSearchSuggestions = () => {
    const query = globalSearch.toLowerCase().trim();

    // Lista de todas as Páginas indexadas
    const systemPages = [
      {
        id: "dashboard",
        title: "Dashboard Principal",
        subtitle: "Painel, estatísticas, gráficos de desempenho e KPIs",
        icon: "ti-layout-dashboard",
      },
      {
        id: "form",
        title: "Emitir Certificado",
        subtitle: "Emitir novo documento, inserir curso, aluno e currículo",
        icon: "ti-circle-plus",
      },
      {
        id: "table",
        title: "Histórico de Certificados",
        subtitle: "Lista geral, filtros, pesquisar alunos e emitidos",
        icon: "ti-list",
      },
      {
        id: "gallery",
        title: "Galeria de Modelos",
        subtitle: "Ver modelos predefinidos de certificados (incluindo ILUNGI)",
        icon: "ti-templates",
      },
      {
        id: "editor",
        title: "Editor de Estilos",
        subtitle:
          "Modificar fontes, cores, selos e testar design do certificado",
        icon: "ti-palette",
      },
      {
        id: "settings",
        title: "Configurações Gerais",
        subtitle: "Editar nome da academia, licença INEFOP, logótipo e canais",
        icon: "ti-settings",
      },
      {
        id: "profile",
        title: "O Meu Perfil",
        subtitle:
          "Conta do Administrador, alterar assinatura do diretor e senha",
        icon: "ti-user",
      },
    ];

    // Lista de todas as Ações Rápidas indexadas
    const systemActions = [
      {
        id: "toggle-dark",
        title: isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro",
        subtitle: "Alternar tema do de cor do sistema (Claro / Escuro)",
        icon: isDarkMode ? "ti-sun" : "ti-moon",
        action: () => {
          toggleDarkMode();
          setGlobalSearch("");
          setIsSearchActive(false);
        },
      },
      {
        id: "new-cert",
        title: "Nova Emissão de Certificado",
        subtitle: "Limpar formulário e iniciar rascunho em branco",
        icon: "ti-file-plus",
        action: () => {
          resetForm();
          showPage("form");
          setGlobalSearch("");
          setIsSearchActive(false);
        },
      },
      {
        id: "reset-form",
        title: "Limpar Formulário",
        subtitle: "Apagar todos os campos digitados para iniciar de novo",
        icon: "ti-trash",
        action: () => {
          resetForm();
          addToast("Dados limpos!", "info");
          setGlobalSearch("");
          setIsSearchActive(false);
        },
      },
      {
        id: "logout",
        title: "Terminar Sessão (Sair)",
        subtitle: "Encerrar acesso do utilizador atual e voltar ao login",
        icon: "ti-logout",
        action: logout,
      },
    ];

    if (query === "") {
      // Se a pesquisa estiver vazia, retorna recomendações/atalhos úteis para poupar cliques
      return [
        ...systemPages.slice(0, 3).map((p) => ({
          ...p,
          category: "Sugestões de Páginas",
          action: () => {
            showPage(p.id);
            setGlobalSearch("");
            setIsSearchActive(false);
          },
        })),
        ...systemActions.slice(0, 2).map((a) => ({
          ...a,
          category: "Ações Frequentes",
        })),
      ];
    }

    const suggestions: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      icon: string;
      action: () => void;
    }> = [];

    // 1. Filtrar Páginas
    const matchedPages = systemPages.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query),
    );
    matchedPages.forEach((p) => {
      suggestions.push({
        id: "page-" + p.id,
        title: p.title,
        subtitle: p.subtitle,
        category: "Páginas do Sistema",
        icon: p.icon,
        action: () => {
          showPage(p.id);
          setGlobalSearch("");
          setIsSearchActive(false);
        },
      });
    });

    // 2. Filtrar Ações
    const matchedActions = systemActions.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.subtitle.toLowerCase().includes(query),
    );
    matchedActions.forEach((a) => {
      suggestions.push({
        ...a,
        category: "Ações Rápidas",
      });
    });

    // 3. Filtrar Certificados
    const matchedCerts = certificates.filter(
      (c) =>
        c.recipientName.toLowerCase().includes(query) ||
        c.courseName.toLowerCase().includes(query) ||
        c.verificationCode.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        (c.curriculum || "").toLowerCase().includes(query) ||
        (c.grade || "").toLowerCase().includes(query) ||
        (c.signatoryName || "").toLowerCase().includes(query),
    );
    matchedCerts.forEach((c) => {
      suggestions.push({
        id: "cert-" + c.id,
        title: c.recipientName,
        subtitle: `${c.type} em ${c.courseName} (${c.verificationCode}) - ${c.status}`,
        category: "Certificados Registados",
        icon: "ti-certificate",
        action: () => {
          setViewingCert(c);
          setGlobalSearch("");
          setIsSearchActive(false);
        },
      });
    });

    return suggestions;
  };

  // --- Estatísticas & KPIs ---
  const kpiTotal = certificates.length;
  const kpiActive = certificates.filter((c) => c.status === "Activo").length;
  const kpiDraft = certificates.filter((c) => c.status === "Rascunho").length;
  const kpiExpired = certificates.filter((c) => c.status === "Expirado").length;

  // Filtragem e Pesquisa da Tabela
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.recipientName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      cert.verificationCode.toLowerCase().includes(tableSearch.toLowerCase());

    const matchesStatus =
      statusFilter === "Todos" || cert.status === statusFilter;
    const matchesType = typeFilter === "Todos" || cert.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Paginação Simulada
  const totalFilteredCount = filteredCertificates.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Quando mudam os filtros, reset página para 1
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, statusFilter, typeFilter]);

  // Aplicar cores do editor de volta ao modelo selecionado
  const handleApplyEditorDesign = () => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === selectedTemplate.id) {
          return {
            ...t,
            borderColor: editorStyle.borderColor,
            primaryColor: editorStyle.primaryColor,
            fontFamily: editorStyle.fontFamily,
            hasSeal: editorStyle.hasSeal,
            borderStyle: editorStyle.borderStyle,
            orientation: editorStyle.orientation,
          };
        }
        return t;
      }),
    );
    // Atualizar também o selectedTemplate ativo em cache de renderização imediata
    setSelectedTemplate((prev) => ({
      ...prev,
      borderColor: editorStyle.borderColor,
      primaryColor: editorStyle.primaryColor,
      fontFamily: editorStyle.fontFamily,
      hasSeal: editorStyle.hasSeal,
      borderStyle: editorStyle.borderStyle,
      orientation: editorStyle.orientation,
    }));
    addToast(
      `Template "${selectedTemplate.name}" atualizado e guardado.`,
      "success",
    );
  };

  // Escolha rápida de template na Galeria
  const handleSelectTemplate = (temp: CertificateTemplate) => {
    setSelectedTemplate(temp);
    setEditorStyle((prev) => ({
      ...prev,
      borderColor: temp.borderColor,
      primaryColor: temp.primaryColor,
      fontFamily: temp.fontFamily,
      hasSeal: temp.hasSeal,
      borderStyle: temp.borderStyle,
      orientation: temp.orientation || "landscape",
    }));
    addToast(`Injetado o modelo "${temp.name}" no editor de design.`, "info");
    showPage("editor");
  };

  // --- Tela de Autenticação Enterprise ---
  if (!isAuthenticated) {
    const handleLogin = (email: string, pass: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const matchedAccount = accounts.find(
        (account) => account.email.trim().toLowerCase() === normalizedEmail,
      );

      if (matchedAccount && matchedAccount.password === pass) {
        setIsAuthenticated(true);
        setLoginEmail(matchedAccount.email);
        persistAuthSession(true);
        addToast(
          `Sessão iniciada como ${matchedAccount.role || "Utilizador"} da ${matchedAccount.institution || "CerGest"}.`,
          "success",
        );
        return;
      }

      if (
        normalizedEmail === ADMIN_ACCOUNT.email &&
        pass === ADMIN_ACCOUNT.password
      ) {
        setIsAuthenticated(true);
        setLoginEmail(ADMIN_ACCOUNT.email);
        persistAuthSession(true);
        addToast(
          "Sessão iniciada como Administrador Principal da ILUNGI.",
          "success",
        );
        return;
      }

      addToast(
        "Credenciais incorretas! Verifique o e-mail e a palavra-passe.",
        "danger",
      );
    };

    const handleCreateAccount = (data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
      institution: string;
    }) => {
      const normalizedEmail = data.email.trim().toLowerCase();
      const password = data.password || "";
      const confirmPassword = data.confirmPassword || "";

      if (password.length < 6) {
        addToast("A palavra-passe deve ter pelo menos 6 caracteres.", "danger");
        return;
      }

      if (password !== confirmPassword) {
        addToast("As palavras-passe não coincidem.", "danger");
        return;
      }

      if (
        accounts.some(
          (account) => account.email.trim().toLowerCase() === normalizedEmail,
        )
      ) {
        addToast(
          "Este e-mail já possui uma conta. Use o login ou recupere a senha.",
          "warning",
        );
        return;
      }

      const newAccount: AuthAccount = {
        name: data.name.trim() || "Utilizador CerGest",
        email: normalizedEmail,
        password,
        role: data.role.trim() || "Administrador",
        institution: data.institution.trim() || "CerGest",
        createdAt: new Date().toISOString(),
      };

      setAccounts((prev) => [newAccount, ...prev]);
      setLoginEmail(newAccount.email);
      setIsAuthenticated(true);
      persistAuthSession(true);
      addToast(
        `Conta criada com sucesso. Bem-vindo(a), ${newAccount.name}.`,
        "success",
      );
    };

    const handleForgotPassword = (data: {
      email: string;
      newPassword?: string;
      confirmPassword?: string;
    }) => {
      const normalizedEmail = data.email.trim().toLowerCase();
      const matchedAccount = accounts.find(
        (account) => account.email.trim().toLowerCase() === normalizedEmail,
      );

      if (!matchedAccount) {
        addToast(
          "E-mail não encontrado. Crie uma conta ou verifique o endereço informado.",
          "danger",
        );
        return;
      }

      const newPassword = data.newPassword || "";
      const confirmPassword = data.confirmPassword || "";

      if (newPassword.length < 6 || newPassword !== confirmPassword) {
        addToast(
          "Preencha e confirme uma nova palavra-passe com pelo menos 6 caracteres.",
          "danger",
        );
        return;
      }

      setAccounts((prev) =>
        prev.map((account) => {
          if (account.email.trim().toLowerCase() !== normalizedEmail) {
            return account;
          }

          return {
            ...account,
            password: newPassword,
          };
        }),
      );

      addToast(
        "Palavra-passe reposta com sucesso. Pode entrar com a nova senha.",
        "success",
      );
    };

    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${isDarkMode ? "dark-mode bg-[#020617]" : "bg-slate-100"}`}
      >
        <div className="w-full flex flex-col items-center justify-start text-center">
          {/* Orlas e Gradientes Corporativos no fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#022c22]/10 via-[#070b15]/95 to-[#020408] z-0 pointer-events-none"></div>
          <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-55/5 blur-3xl z-0 pointer-events-none"></div>

          <div className="w-full max-w-4xl relative z-10">
            <LoginForm
              onLogin={handleLogin}
              onCreateAccount={handleCreateAccount}
              onForgotPassword={handleForgotPassword}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* TOASTS ALERTS LOCAL */}
          {toasts.length > 0 && (
            <div className="fixed top-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="p-3.5 rounded-lg text-xs flex items-center space-x-2.5 transition-all duration-300 transform translate-y-0 opacity-100 border border-slate-800 bg-slate-950 text-white shadow-sm pointer-events-auto"
                >
                  <i
                    className={`ti ${toast.type === "success" ? "ti-check text-green-500" : "ti-alert-circle text-red-500"} text-lg`}
                  ></i>
                  <span className="flex-1 font-medium text-slate-200">
                    {toast.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-slate-50 text-slate-950 transition-colors duration-200 relative overflow-x-hidden">
      {/* BACKDROP DO SIDEBAR EM DISPOSITIVOS MÓVEIS */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR RESPONSIVA (DESLIZA EM MOBILE, ESTRUTURAL EM DESKTOP) */}
      <aside
        className={`w-72 border-r border-slate-200 bg-white/90 backdrop-blur-xl shrink-0 flex flex-col justify-between transition-transform duration-300 z-50 shadow-xl shadow-slate-200/60
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl
          ${isSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
          md:translate-x-0 md:relative md:flex`}
        aria-label="Menu Lateral"
      >
        <div>
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#022c22] to-[#7811f7] flex items-center justify-center text-white shadow-lg shadow-purple-900/15">
                <i className="ti ti-certificate text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-950">CerGest</h1>
                <p className="text-[10px] text-slate-400 font-medium">{institution.name}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                subtitle: "Visão geral",
                icon: "ti-layout-dashboard",
              },
              {
                id: "form",
                label: editingCertId
                  ? "Editar Certificado"
                  : "Emitir Certificado",
                subtitle: "Novo documento",
                icon: "ti-circle-plus",
              },
              {
                id: "table",
                label: "Certificados",
                subtitle: "Registos e histórico",
                icon: "ti-list",
              },
              {
                id: "gallery",
                label: "Modelos",
                subtitle: "Templates oficiais",
                icon: "ti-templates",
              },
              {
                id: "editor",
                label: "Editor",
                subtitle: "Identidade visual",
                icon: "ti-palette",
              },
              {
                id: "settings",
                label: "Configurações",
                subtitle: "Instituição e regras",
                icon: "ti-settings",
              },
              {
                id: "profile",
                label: "Perfil",
                subtitle: "Conta e assinatura",
                icon: "ti-user",
              },
            ].map((item) => (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => showPage(item.id)}
                className={`w-full group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${activePage === item.id ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15" : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"}`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activePage === item.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-950 group-hover:text-white"}`}
                >
                  <i className={`ti ${item.icon} text-base`}></i>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">
                    {item.label}
                  </span>
                  <span
                    className={`block text-[10px] truncate ${activePage === item.id ? "text-slate-300" : "text-slate-400 group-hover:text-slate-500"}`}
                  >
                    {item.subtitle}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <i className="ti ti-user-circle text-xl text-white"></i>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-300 truncate">
                  {profile.role}
                </p>
              </div>
            </div>
            <button
              id="btn-logout"
              onClick={logout}
              className="mt-4 w-full h-10 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ti ti-logout"></i>
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-7 shrink-0 z-20 sticky top-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              id="btn-toggle-sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
              title="Abrir Menu Lateral"
            >
              <i className="ti ti-menu-2 text-lg"></i>
            </button>



            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-950">
                {activePage === "dashboard"
                  ? "Dashboard Principal"
                  : activePage === "form"
                    ? editingCertId
                      ? "Editar Certificado"
                      : "Emissão de Certificado"
                    : activePage === "table"
                      ? "Histórico de Certificados"
                      : activePage === "gallery"
                        ? "Galeria de Modelos"
                        : activePage === "editor"
                          ? "Editor de Estilos"
                          : activePage === "settings"
                            ? "Configurações Gerais"
                            : activePage === "profile"
                              ? "Perfil do Administrador"
                              : "Painel"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Visão profissional e corporativa da operação
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-3 md:mx-8 relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <i className="ti ti-search text-base"></i>
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setIsSearchActive(true);
                }}
                onFocus={() => setIsSearchActive(true)}
                placeholder="Pesquisar certificados, ações ou secções..."
                className="w-full pl-10 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-slate-300 rounded-2xl transition-all focus:outline-none focus:ring-4 focus:ring-slate-200"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500 transition-colors"
                  title="Limpar pesquisa"
                >
                  <i className="ti ti-circle-x text-xs"></i>
                </button>
              )}
            </div>

            {isSearchActive && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsSearchActive(false)}
                />
                <div className="absolute left-0 mt-2 w-full max-h-[420px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl z-40 p-2 space-y-3 font-sans">
                  {getSearchSuggestions().length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <i className="ti ti-sparkles text-xl text-slate-300 block animate-pulse"></i>
                      <p className="text-xs font-bold">Nenhum resultado</p>
                      <p className="text-[10px]">
                        Tente procurar por nomes, ações ou secções
                      </p>
                    </div>
                  ) : (
                    Object.entries(
                      getSearchSuggestions().reduce(
                        (acc, curr) => {
                          if (!acc[curr.category]) acc[curr.category] = [];
                          acc[curr.category].push(curr);
                          return acc;
                        },
                        {} as Record<string, Array<any>>,
                      ),
                    ).map(([category, items]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1 text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 rounded-xl">
                          <span>{category}</span>
                          <span className="text-[8px] font-mono opacity-80">
                            {items.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={item.action}
                              className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-950 hover:text-white text-slate-700 transition-all flex items-center space-x-3 group cursor-pointer"
                            >
                              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white/10 group-hover:text-white flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-white/10 transition-colors">
                                <i className={`ti ${item.icon} text-sm`}></i>
                              </span>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold truncate leading-none mb-0.5 group-hover:text-white">
                                  {item.title}
                                </h5>
                                <p className="text-[10px] opacity-75 truncate leading-none group-hover:text-white/75">
                                  {item.subtitle}
                                </p>
                              </div>
                              <i className="ti ti-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-all"></i>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="hidden lg:flex items-center text-xs space-x-1.5 px-3 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistema Online</span>
            </div>

            <button
              id="btn-toggle-dark"
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200"
              title="Alternar Modo Escuro"
            >
              <i
                className={`ti ${isDarkMode ? "ti-sun" : "ti-moon"} text-base`}
              ></i>
            </button>

            {activePage === "dashboard" && (
              <button
                id="header-btn-quick-create"
                onClick={() => {
                  resetForm();
                  showPage("form");
                }}
                className="text-xs px-4 py-2.5 rounded-2xl hover:opacity-95 transition-all font-bold flex items-center space-x-1.5 bg-gradient-to-r from-[#7811f7] to-[#022c22] text-white shadow-lg shadow-purple-900/15"
              >
                <i className="ti ti-plus text-xs"></i>
                <span>Novo Certificado</span>
              </button>
            )}

            {activePage === "table" && (
              <button
                id="header-btn-export-all"
                onClick={() => {
                  exportAllCertificatesJSON();
                }}
                className="text-xs px-3 py-2.5 rounded-2xl hover:bg-slate-50 border border-slate-200 bg-white transition-all font-bold flex items-center space-x-1 text-slate-700"
              >
                <i className="ti ti-file-export text-xs"></i>
                <span>Exportar Dados</span>
              </button>
            )}
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (Troca de display: block/none para simulação exata de SPA requisitada) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* DYNAMIC TOASTS ALERTS WRAPPER */}
          {toasts.length > 0 && (
            <div className="fixed top-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="p-3.5 theme-rounded text-xs flex items-center space-x-2.5 transition-all duration-300 transform translate-y-0 opacity-100 theme-border shadow-sm pointer-events-auto"
                  style={{
                    backgroundColor:
                      toast.type === "success"
                        ? "var(--color-success-bg)"
                        : toast.type === "warning"
                          ? "var(--color-warning-bg)"
                          : toast.type === "danger"
                            ? "var(--color-danger-bg)"
                            : "var(--color-bg-primary)",
                    borderColor:
                      toast.type === "success"
                        ? "var(--color-success)"
                        : toast.type === "warning"
                          ? "var(--color-warning)"
                          : toast.type === "danger"
                            ? "var(--color-danger)"
                            : "var(--color-border)",
                    color:
                      toast.type === "success"
                        ? "var(--color-success)"
                        : toast.type === "warning"
                          ? "var(--color-warning)"
                          : toast.type === "danger"
                            ? "var(--color-danger)"
                            : "var(--color-text-primary)",
                  }}
                >
                  <i
                    className={`ti ${toast.type === "success" ? "ti-check" : toast.type === "warning" ? "ti-alert-triangle" : toast.type === "danger" ? "ti-alert-circle" : "ti-info-circle"} text-lg`}
                  ></i>
                  <span className="flex-1 font-medium">{toast.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* SECÇÃO 1: DASHBOARD */}
          <div
            id="section-dashboard"
            style={{ display: activePage === "dashboard" ? "block" : "none" }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-[#172554] p-5 md:p-6 text-white overflow-hidden relative shadow-xl shadow-slate-900/10">
              <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-[#7811f7]/25 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-16 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Sistema Operacional
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">
                    Bem-vindo, {profile.name.split(" ")[0]}!
                  </h2>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Centro de comando da <strong className="text-white">{institution.name}</strong>. Gerir, emitir e auditar certificados.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      id="dashboard-btn-new-certificate"
                      onClick={() => { resetForm(); showPage("form"); }}
                      className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      <i className="ti ti-plus mr-1 text-xs"></i>Emitir Certificado
                    </button>
                    <button
                      id="dashboard-btn-view-table"
                      onClick={() => showPage("table")}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/15 text-xs font-bold hover:bg-white/15 transition-colors"
                    >
                      Ver Histórico
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center min-w-[80px]">
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">Activos</p>
                    <p className="text-2xl font-black mt-0.5">{kpiActive}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center min-w-[80px]">
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">Rascunhos</p>
                    <p className="text-2xl font-black mt-0.5">{kpiDraft}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center min-w-[80px]">
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">Modelos</p>
                    <p className="text-2xl font-black mt-0.5">{templates.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  id: "kpi-total",
                  label: "Total de Certificados",
                  value: kpiTotal,
                  icon: "ti-certificate",
                  iconClass: "bg-slate-950 text-white",
                  description: "Documentos registados no sistema",
                  accent: "from-slate-950 to-slate-800",
                },
                {
                  id: "kpi-active",
                  label: "Certificados Activos",
                  value: kpiActive,
                  icon: "ti-circle-check",
                  iconClass: "bg-emerald-50 text-emerald-600",
                  description: `${Math.round((kpiActive / (kpiTotal || 1)) * 100)}% verificáveis publicamente`,
                  accent: "from-emerald-500 to-teal-500",
                },
                {
                  id: "kpi-draft",
                  label: "Rascunhos Pendentes",
                  value: kpiDraft,
                  icon: "ti-file-pencil",
                  iconClass: "bg-amber-50 text-amber-600",
                  description: "Aguardam revisão ou assinatura",
                  accent: "from-amber-400 to-orange-500",
                },
                {
                  id: "kpi-expired",
                  label: "Expirados",
                  value: kpiExpired,
                  icon: "ti-history",
                  iconClass: "bg-rose-50 text-rose-600",
                  description: "Fora do prazo de validação",
                  accent: "from-rose-500 to-pink-500",
                },
              ].map((kpi) => (
                <div
                  key={kpi.id}
                  id={kpi.id}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 hover:shadow-xl hover:shadow-slate-200/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-[0.18em] font-bold">
                        {kpi.label}
                      </p>
                      <h3 className="text-3xl font-black text-slate-950 mt-3">
                        {kpi.value}
                      </h3>
                    </div>
                    <span
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.iconClass}`}
                    >
                      <i className={`ti ${kpi.icon} text-xl`}></i>
                    </span>
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${kpi.accent}`}
                      style={{
                        width: `${Math.min(100, (kpi.value / (kpiTotal || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    {kpi.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      Últimos Certificados
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Registos recentes com ações rápidas
                    </p>
                  </div>
                  <button
                    id="btn-goto-table"
                    onClick={() => showPage("table")}
                    className="text-xs px-3 py-2 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    Ver Tudo
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        <th className="p-4">Código</th>
                        <th className="p-4">Titular</th>
                        <th className="p-4">Curso / Carga</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.slice(0, 5).map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-slate-700">
                            {cert.verificationCode}
                          </td>
                          <td className="p-4">
                            <span className="block font-bold text-slate-950">
                              {cert.recipientName}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {cert.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-700">
                              {cert.courseName}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {cert.hours} Horas — {cert.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold"
                              style={{
                                backgroundColor:
                                  cert.status === "Activo"
                                    ? "#ecfdf5"
                                    : cert.status === "Rascunho"
                                      ? "#fffbeb"
                                      : "#fef2f2",
                                color:
                                  cert.status === "Activo"
                                    ? "#059669"
                                    : cert.status === "Rascunho"
                                      ? "#d97706"
                                      : "#dc2626",
                              }}
                            >
                              {cert.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end space-x-1.5">
                              <button
                                id={`show-recent-${cert.id}`}
                                onClick={() => setViewingCert(cert)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-950 transition-colors"
                                title="Visualizar Certificado"
                              >
                                <i className="ti ti-eye"></i>
                              </button>
                              <button
                                id={`edit-recent-${cert.id}`}
                                onClick={() => startEditCertificate(cert)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                                title="Editar"
                              >
                                <i className="ti ti-edit"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/60 p-5">
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    Distribuição por Categoria
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mix de formações emitidas
                  </p>
                </div>

                <div className="space-y-4 mt-5">
                  {[
                    {
                      label: "Cursos Regulares",
                      count: certificates.filter((c) => c.type === "Curso")
                        .length,
                      icon: "ti-backpack",
                      color: "bg-slate-950",
                    },
                    {
                      label: "Workshops e Labs",
                      count: certificates.filter((c) => c.type === "Workshop")
                        .length,
                      icon: "ti-tools",
                      color: "bg-[#7811f7]",
                    },
                    {
                      label: "Seminários",
                      count: certificates.filter((c) => c.type === "Seminário")
                        .length,
                      icon: "ti-file-presentation",
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Palestras",
                      count: certificates.filter((c) => c.type === "Palestra")
                        .length,
                      icon: "ti-speakerphone",
                      color: "bg-amber-500",
                    },
                  ].map((cat) => {
                    const pct = Math.round(
                      (cat.count / (certificates.length || 1)) * 100,
                    );
                    return (
                      <div
                        key={cat.label}
                        className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center space-x-2 text-slate-700 font-bold">
                            <i className={`ti ${cat.icon} text-slate-400`}></i>
                            <span>{cat.label}</span>
                          </span>
                          <span className="font-black text-slate-950">
                            {cat.count} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 mt-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white">
                  <div className="flex items-center space-x-2 font-bold">
                    <i className="ti ti-certificate-2 text-[#a78bfa]"></i>
                    <span>Emissor Oficial CerGest</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Hashes, códigos únicos e assinaturas eletrónicas alinhados
                    ao padrão institucional de validação.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: FORMULÁRIO DE CRIAÇÃO (COM PRÉ-VISUALIZAÇÃO AO VIVO EM GRID REAL-TIME) */}
          <div
            id="section-form"
            style={{ display: activePage === "form" ? "block" : "none" }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* FORMULÁRIO */}
              <div className="p-6 theme-rounded theme-border bg-[var(--color-bg-primary)] space-y-4">
                <div className="flex justify-between items-center border-b pb-4 theme-border">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {editingCertId
                        ? "Modificar Registro do Certificado"
                        : "Dados do Novo Certificado"}
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-regular">
                      {editingCertId
                        ? `Editando ID: ${editingCertId}`
                        : "Preencha os campos para emitir um certificado certificado"}
                    </p>
                  </div>
                  {editingCertId && (
                    <button
                      id="btn-cancel-edit"
                      onClick={resetForm}
                      className="text-xs px-3 py-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] theme-rounded hover:opacity-90 transition-all font-medium theme-border"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleSaveCertificate}
                  className="space-y-4 text-xs font-regular"
                >
                  {/* Nome do Recipiente */}
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Nome Completo do Aluno{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-recipient-name"
                      type="text"
                      value={formInputs.recipientName}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          recipientName: e.target.value,
                        }))
                      }
                      placeholder="Ex: David Henriques de Oliveira"
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      required
                    />
                  </div>

                  {/* Nome do Curso */}
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Nome do Curso / Evento{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-course-name"
                      type="text"
                      value={formInputs.courseName}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          courseName: e.target.value,
                        }))
                      }
                      placeholder="Ex: Formação Superior em Inteligência Artificial"
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      required
                    />
                  </div>

                  {/* Carga Horária e Nota */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Carga Horária (Horas)
                      </label>
                      <input
                        id="input-hours"
                        type="number"
                        value={formInputs.hours}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            hours: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Nota / Menção Pedagógica
                      </label>
                      <input
                        id="input-grade"
                        type="text"
                        value={formInputs.grade}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            grade: e.target.value,
                          }))
                        }
                        placeholder="Ex: 19/20 ou Aprovado"
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      />
                    </div>
                  </div>

                  {/* Tipo de Certificado e Estado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Tipo de Formação
                      </label>
                      <select
                        id="input-type"
                        value={formInputs.type}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      >
                        <option value="Curso">Curso</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminário">Seminário</option>
                        <option value="Palestra">Palestra</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Estado Inicial
                      </label>
                      <select
                        id="input-status"
                        value={formInputs.status}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            status: e.target.value as CertificateStatus,
                          }))
                        }
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      >
                        <option value="Rascunho">Rascunho</option>
                        <option value="Activo">Ativo / Publicado</option>
                        <option value="Expirado">Expirado</option>
                      </select>
                    </div>
                  </div>

                  {/* Data de Emissão e Assinatura */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Data de Emissão
                      </label>
                      <input
                        id="input-date"
                        type="date"
                        value={formInputs.issueDate}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            issueDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors text-[var(--color-text-primary)] text-xs font-regular"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Código de Validação Único
                      </label>
                      <div className="flex space-x-1">
                        <input
                          id="input-code"
                          type="text"
                          value={generatedCode}
                          disabled
                          className="w-full px-3 py-2 theme-rounded theme-border bg-slate-100 dark:bg-slate-800 focus:outline-none text-[var(--color-text-muted)] font-mono text-xs"
                        />
                        <button
                          id="btn-regenerate-code"
                          type="button"
                          onClick={generateNewCode}
                          className="p-2 border theme-border theme-rounded bg-[var(--color-bg-secondary)] hover:text-[var(--color-brand-accent)] transition-colors flex items-center justify-center font-medium"
                          title="Gerar Novo Código"
                          disabled={!!editingCertId}
                        >
                          <i className="ti ti-refresh text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assinatura */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Nome do Signatário
                      </label>
                      <input
                        id="input-signatory-name"
                        type="text"
                        value={formInputs.signatoryName}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            signatoryName: e.target.value,
                          }))
                        }
                        placeholder="Ex: Prof. Dr. Ricardo Almeida"
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                        Cargo / Título
                      </label>
                      <input
                        id="input-signatory-role"
                        type="text"
                        value={formInputs.signatoryRole}
                        onChange={(e) =>
                          setFormInputs((prev) => ({
                            ...prev,
                            signatoryRole: e.target.value,
                          }))
                        }
                        placeholder="Ex: Diretor Académico"
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                      />
                    </div>
                  </div>

                  {/* Seção Desdobrável: Dados Detalhados / Modelo Ilungi Oficial */}
                  <div className="border theme-border theme-rounded overflow-hidden bg-[var(--color-bg-secondary)] mt-2 mb-4">
                    <button
                      type="button"
                      id="btn-toggle-advanced-fields"
                      onClick={() => {
                        const el = document.getElementById(
                          "collapsible-advanced-fields",
                        );
                        if (el) {
                          el.classList.toggle("hidden");
                        }
                      }}
                      className="w-full px-4 py-2 flex justify-between items-center text-left text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400">
                        <i className="ti ti-settings text-sm"></i>
                        <span>
                          Estrutura Curricular & Certificação INEFOP (Opcional)
                        </span>
                      </span>
                      <i className="ti ti-chevron-down text-xs"></i>
                    </button>

                    <div
                      id="collapsible-advanced-fields"
                      className="hidden p-4 border-t theme-border space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[var(--color-text-secondary)] font-medium">
                            Data de Início da Formação
                          </label>
                          <input
                            id="input-start-date"
                            type="text"
                            value={formInputs.startDate || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            placeholder="Ex: 05 de maio de 2025"
                            className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-primary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                            Data de Fim da Formação
                          </label>
                          <input
                            id="input-end-date"
                            type="text"
                            value={formInputs.endDate || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            placeholder="Ex: 30 de maio de 2025"
                            className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-primary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[var(--color-text-secondary)] font-medium">
                            Código do Curso / Turma (Curso No)
                          </label>
                          <input
                            id="input-course-no"
                            type="text"
                            value={formInputs.courseNo || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                courseNo: e.target.value,
                              }))
                            }
                            placeholder="Ex: MEQR"
                            className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-primary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                            Licença de Formação INEFOP
                          </label>
                          <input
                            id="input-inefop-license"
                            type="text"
                            value={formInputs.inefopLicense || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                inefopLicense: e.target.value,
                              }))
                            }
                            placeholder="Ex: 917.01/LDA./2014"
                            className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-primary)] focus:outline-none text-[var(--color-text-primary)] text-xs font-regular"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                            Módulos Curriculares do Programa
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentLines = (formInputs.curriculum || "")
                                .split("\n")
                                .filter((line) => line.trim().length > 0);
                              const nextNum = currentLines.length + 1;
                              currentLines.push(`• Módulo ${nextNum} - `);
                              setFormInputs((prev) => ({
                                ...prev,
                                curriculum: currentLines.join("\n"),
                              }));
                            }}
                            className="text-[10px] px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-900 font-medium cursor-pointer transition-colors"
                          >
                            <i className="ti ti-plus mr-1"></i>Adicionar Módulo
                          </button>
                        </div>

                        {/* Lista interativa de módulos individuais */}
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {(formInputs.curriculum || "")
                            .split("\n")
                            .filter((line) => line.trim().length > 0)
                            .map((line, idx, arr) => {
                              const cleanText = line.replace(/^•\s*/, "");
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-1.5"
                                >
                                  <span className="text-slate-400 font-mono text-[10px] select-none">
                                    •
                                  </span>
                                  <input
                                    type="text"
                                    value={cleanText}
                                    onChange={(e) => {
                                      const nextLines = [...arr];
                                      nextLines[idx] = `• ${e.target.value}`;
                                      setFormInputs((prev) => ({
                                        ...prev,
                                        curriculum: nextLines.join("\n"),
                                      }));
                                    }}
                                    placeholder={`Ex: Módulo ${idx + 1} - Descrição`}
                                    className="flex-1 px-2.5 py-1.5 bg-[var(--color-bg-primary)] border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-[#7811f7] text-[11px] font-regular text-[var(--color-text-primary)]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextLines = [...arr];
                                      nextLines.splice(idx, 1);
                                      setFormInputs((prev) => ({
                                        ...prev,
                                        curriculum: nextLines.join("\n"),
                                      }));
                                    }}
                                    className="p-1 px-2 border border-red-200 dark:border-red-950/25 bg-red-50 dark:bg-red-950/15 text-red-500 hover:bg-red-100 rounded cursor-pointer transition-colors"
                                    title="Remover Módulo"
                                  >
                                    <i className="ti ti-trash text-xs"></i>
                                  </button>
                                </div>
                              );
                            })}
                          {(formInputs.curriculum || "")
                            .split("\n")
                            .filter((line) => line.trim().length > 0).length ===
                            0 && (
                            <p className="text-[10px] text-slate-400 italic text-center py-2 bg-slate-50 dark:bg-slate-900 border border-dashed rounded">
                              Nenhum módulo registado. Clique em "Adicionar
                              Módulo" acima.
                            </p>
                          )}
                        </div>

                        {/* Editor de bloco alternativo detalhado */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <details className="cursor-pointer">
                            <summary className="text-[10px] text-slate-400 select-none hover:text-slate-600">
                              Edição em Bloco (Copiar/Colar Texto Puro)
                            </summary>
                            <textarea
                              id="input-curriculum"
                              value={formInputs.curriculum || ""}
                              onChange={(e) =>
                                setFormInputs((prev) => ({
                                  ...prev,
                                  curriculum: e.target.value,
                                }))
                              }
                              placeholder="Ex:&#10;• Módulo 1&#10;• Módulo 2"
                              rows={4}
                              className="w-full mt-1 px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-primary)] focus:outline-none text-[var(--color-text-primary)] font-mono text-[10px] leading-relaxed font-regular"
                            />
                          </details>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação do Formulário */}
                  <div className="flex pt-4 space-x-3">
                    <button
                      id="form-btn-submit"
                      type="submit"
                      className="flex-1 py-2.5 theme-rounded transition-all text-xs font-medium bg-[var(--color-brand-accent)] text-slate-950 font-medium hover:opacity-95"
                    >
                      <i className="ti ti-check mr-1 text-xs"></i>
                      {editingCertId
                        ? "Salvar Alterações Registadas"
                        : "Confirmar e Publicar Certificado"}
                    </button>
                    <button
                      id="form-btn-reset"
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 border theme-border theme-rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                </form>
              </div>

              {/* LIVE PREVIEW - PRÉ-VISUALIZAÇÃO AO VIVO EM TEMPO REAL */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[var(--color-bg-primary)] p-4 theme-rounded theme-border">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      Pré-visualização em Tempo Real
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-regular">
                      Reflete instantaneamente o estilo de modelo ativo
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs px-2.5 py-1 theme-rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                    <i className="ti ti-eye"></i>
                    <span>Modo Live Ativo</span>
                  </div>
                </div>

                {/* Canvas de Pré-visualização do Certificado */}
                <div
                  id="live-certificate-canvas"
                  className={`border theme-rounded transition-all duration-300 relative overflow-hidden bg-white text-slate-900 shadow-sm flex flex-col justify-between ${
                    selectedTemplate.orientation === "portrait"
                      ? "aspect-[1/1.414] max-w-[390px] mx-auto p-5 md:p-6 text-[11px]"
                      : "aspect-[1.414/1] w-full p-8"
                  }`}
                  style={{
                    borderColor: selectedTemplate.borderColor,
                    borderStyle: selectedTemplate.borderStyle,
                    borderWidth:
                      selectedTemplate.borderStyle === "double" ? "6px" : "3px",
                    fontFamily:
                      selectedTemplate.fontFamily === "serif"
                        ? "Georgia, serif"
                        : selectedTemplate.fontFamily === "mono"
                          ? "Courier, monospace"
                          : "sans-serif",
                  }}
                >
                  {selectedTemplate.styleName === "ilungi" ? (
                    // LAYOUT OFICIAL ILUNGI PREMIUM
                    <div className="w-full h-full flex flex-col justify-between relative p-1 pb-1">
                      {/* Top right purple block */}
                      <div className="absolute top-0 right-0 pointer-events-none">
                        <svg
                          width="65"
                          height="65"
                          viewBox="0 0 65 65"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0H65V65H42V23H0V0Z" fill="#7811f7" />
                        </svg>
                      </div>

                      {/* Header row with logo */}
                      <div className="flex justify-between items-start pt-1 px-1">
                        <div className="flex items-center space-x-0.5 tracking-tight">
                          <span className="text-base font-extrabold text-[#022c22] font-sans">
                            ilu
                          </span>
                          <span className="text-base font-extrabold text-[#022c22] font-sans">
                            ng
                          </span>
                          <span className="text-base font-extrabold text-[#022c22] font-sans relative">
                            i
                            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7811f7]"></span>
                          </span>
                        </div>
                      </div>

                      {/* Title block */}
                      <div className="text-center">
                        <h2 className="text-xl font-black tracking-[0.2em] text-[#022c22] font-sans mt-2 leading-none">
                          CERTIFICADO
                        </h2>
                        <p className="text-[7px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                          A ACADEMIA ILUNGI certifica que:
                        </p>
                      </div>

                      {/* Recipient area */}
                      <div className="text-center my-1">
                        <h3 className="text-xs font-black text-slate-900 uppercase">
                          {formInputs.recipientName || "SÉRGIO DAMIÃO DA SILVA"}
                        </h3>
                        <p className="text-[7px] text-slate-400 font-medium mt-0.5">
                          Concluiu com êxito o programa de formação:
                        </p>
                        <h4 className="text-[9px] font-bold text-[#022c22] uppercase tracking-wide leading-tight mt-1 px-1">
                          {formInputs.courseName ||
                            "HIGIENE, SAÚDE E SEGURANÇA DO TRABALHO"}
                        </h4>
                      </div>

                      {/* Dates & Hours parameters */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] bg-slate-50 p-1.5 rounded border border-slate-100 text-left font-sans">
                        <div>
                          <span className="text-slate-400 font-medium">
                            Data de Início:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            {formInputs.startDate || "05 de maio de 2025"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-medium">
                            Duração:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            {formInputs.hours || "120"} horas
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">
                            Data de término:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            {formInputs.endDate || "30 de maio de 2025"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-medium">
                            Pontuação final:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            {formInputs.grade || "18 (de 20 valores)"}
                          </span>
                        </div>
                      </div>

                      {/* Program schedule list block */}
                      <div className="text-left font-sans mt-1 space-y-0.5 bg-slate-50/50 p-1 text-[7px] border-l border-[#022c22] rounded max-h-[80px] overflow-hidden">
                        <p className="font-bold text-slate-700 text-[8px] leading-none mb-0.5">
                          Programa:
                        </p>
                        <div className="space-y-0.5 text-slate-600 font-medium max-h-[55px] overflow-y-auto pr-0.5 scrollbar-thin">
                          {(
                            formInputs.curriculum ||
                            `• Módulo 1 - Enquadramento Jurídico Da Shst E Conceitos Fundamentais
• Módulo 2A - Risco De Incêndio
• Módulo 2B - Risco Eléctrico
• Módulo 3A - AMBIENTE TÉRMICO / QUALIDADE DO AR
• Módulo 3B - EXPOSIÇÃO A AGENTES QUÍMICOS`
                          )
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, idx) => (
                              <div
                                key={idx}
                                className="truncate select-none leading-tight"
                              >
                                {line}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Bottom row signatures and metadata */}
                      <div className="grid grid-cols-2 gap-2 items-end mt-1 pt-1 border-t border-slate-100 font-sans text-left pb-1">
                        <div className="text-[6px] text-slate-500 space-y-0.5 scale-95 origin-left">
                          <div>
                            <span className="font-bold">
                              ILUNGI® Certificado No:
                            </span>{" "}
                            <span className="font-mono text-slate-800 font-bold">
                              {generatedCode}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              ILUNGI® Data de Emissão:
                            </span>{" "}
                            <span className="text-slate-800">
                              {formInputs.issueDate || "30 de maio de 2025"}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              ILUNGI® Data de Validade:
                            </span>{" "}
                            <span className="text-slate-800">N/A</span>
                          </div>
                          <div>
                            <span className="font-bold">ILUNGI® Curso No:</span>{" "}
                            <span className="font-mono text-slate-800">
                              {formInputs.courseNo || "MEQR"}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              INEFOP Licença No:
                            </span>{" "}
                            <span className="font-mono text-slate-800">
                              {formInputs.inefopLicense || "917.01/LDA./2014"}
                            </span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <div className="relative inline-block w-full text-center">
                            <span className="font-mono text-[8.5px] text-indigo-900 block italic leading-none h-4 flex items-center justify-center">
                              {profile.signatureText ||
                                formInputs.signatoryName ||
                                "Manuel R. J. Calado"}
                            </span>
                            <div className="w-full border-b border-slate-200 mt-0.5"></div>
                          </div>
                          <p className="text-[5.5px] font-bold text-slate-500 uppercase tracking-tight leading-none">
                            DIRECTOR GERAL | ILUNGI
                          </p>
                        </div>
                      </div>

                      {/* Bottom left corner green shape */}
                      <div className="absolute bottom-0 left-0 pointer-events-none">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 45 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0H18V27H45V45H0V0Z" fill="#022c22" />
                        </svg>
                      </div>

                      {/* Footnote of Angola / INEFOP */}
                      <div className="pl-12 text-right space-y-0.5 font-sans text-slate-500 scale-90 origin-right">
                        <div className="flex items-center justify-end space-x-0.5 text-[5px] leading-none">
                          <span className="bg-blue-600 text-white rounded-[1px] px-0.5 py-0.1 font-bold">
                            INEFOP
                          </span>
                          <span className="text-blue-800 font-bold">
                            Academia Oficial
                          </span>
                        </div>
                        <p className="font-medium text-[4.5px] text-slate-400 truncate">
                          https://ilungi.ao | +244 935 793 270 | Luanda
                        </p>
                      </div>
                    </div>
                  ) : (
                    // LAYOUT PADRÃO (CLÁSSICO, TECH, ETC)
                    <>
                      {/* Marcas de água e decorações de cantos finos */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-amber-600 opacity-60"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-amber-600 opacity-60"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-amber-600 opacity-60"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-amber-600 opacity-60"></div>

                      {/* Header */}
                      <div
                        className={`text-center space-y-1.5 ${selectedTemplate.orientation === "portrait" ? "mt-1" : "mt-4"}`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white shrink-0"
                            style={{
                              backgroundColor: selectedTemplate.primaryColor,
                            }}
                          >
                            <i className="ti ti-school text-xs"></i>
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-medium text-slate-500 truncate max-w-[200px]">
                            {institution.name}
                          </span>
                        </div>
                        <h4
                          className="text-sm md:text-base font-bold tracking-tight uppercase"
                          style={{ color: selectedTemplate.primaryColor }}
                        >
                          {editorStyle.titleText}
                        </h4>
                        <p className="text-[9px] text-slate-400 italic">
                          {editorStyle.subtitleText}
                        </p>
                      </div>

                      {/* Body Texto do Aluno */}
                      <div
                        className={`text-center space-y-2.5 ${selectedTemplate.orientation === "portrait" ? "my-2.5 px-1 text-[11px]" : "my-6 px-6"}`}
                      >
                        <span className="text-[9px] text-slate-400 block font-regular">
                          Certifica-se formalmente que
                        </span>
                        <strong className="text-base block font-bold underline decoration-amber-500 underline-offset-4 text-slate-800">
                          {formInputs.recipientName || "[Nome do Aluno]"}
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto font-regular">
                          concluiu o {formInputs.type.toLowerCase()} de{" "}
                          <strong className="font-semibold text-slate-700">
                            {formInputs.courseName || "[Nome do Curso/Estudos]"}
                          </strong>
                          , ministrado em conformidade pedagógica, com carga
                          total avaliada em{" "}
                          <strong className="font-semibold text-slate-700">
                            {formInputs.hours || "0"} horas
                          </strong>{" "}
                          letivas.
                        </p>
                        {formInputs.grade && (
                          <p className="text-[9px] text-amber-700 font-bold bg-amber-50/60 inline-block px-2.5 py-0.5 rounded border border-amber-200">
                            Classificação Final: {formInputs.grade}
                          </p>
                        )}
                      </div>

                      {/* Footer - Selos, Assinaturas e QR Code */}
                      <div
                        className={`grid grid-cols-3 items-end border-t border-slate-100 pt-4 mt-auto ${selectedTemplate.orientation === "portrait" ? "gap-1" : ""}`}
                      >
                        {/* Código de Validação do lado esquerdo */}
                        <div className="text-left space-y-0.5">
                          <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tight block">
                            Validação Oficial
                          </span>
                          <p className="text-[8px] font-mono font-bold text-indigo-700 truncate">
                            {generatedCode}
                          </p>
                          <p className="text-[6px] text-slate-400">
                            PKI Segura CerGest
                          </p>
                        </div>

                        {/* Selo no Centro */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          {selectedTemplate.hasSeal ? (
                            <div className="w-10 h-10 rounded-full border border-amber-400 bg-amber-50 flex items-center justify-center relative">
                              <div className="w-8 h-8 rounded-full border border-dashed border-amber-500 flex items-center justify-center">
                                <i className="ti ti-award text-amber-600 text-base"></i>
                              </div>
                              {/* Fitas do selo */}
                              <div className="absolute -bottom-1 w-1.5 h-2.5 bg-amber-500 transform rotate-12 origin-top"></div>
                              <div className="absolute -bottom-1 w-1.5 h-2.5 bg-amber-500 transform -rotate-12 origin-top"></div>
                            </div>
                          ) : (
                            <span className="text-[7px] text-slate-300 font-mono italic">
                              Sem Selo
                            </span>
                          )}
                        </div>

                        {/* Assinatura no Lado Direito */}
                        <div className="text-right space-y-0.5">
                          <div className="relative inline-block w-full">
                            {/* Linha de assinatura simulada por cima do texto */}
                            <div className="absolute -top-3 w-full text-center border-b border-slate-200"></div>
                            {/* Assinatura manuscrita simulada com font elegante de preview */}
                            <span className="font-mono text-[9px] text-indigo-900 block italic h-4 flex items-center justify-end leading-none">
                              {profile.signatureText ||
                                formInputs.signatoryName ||
                                "[Assinatura]"}
                            </span>
                          </div>
                          <span className="text-[8px] font-semibold text-slate-700 block truncate leading-none">
                            {formInputs.signatoryName}
                          </span>
                          <span className="text-[7px] text-slate-400 block truncate leading-none">
                            {formInputs.signatoryRole}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Info Box */}
                <div className="p-4 theme-rounded bg-[var(--color-bg-primary)] theme-border text-xs">
                  <div className="flex items-start space-x-2 text-[var(--color-text-secondary)]">
                    <i className="ti ti-info-square-rounded text-lg text-[var(--color-brand-accent)]"></i>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        Sincronização Ativa
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-regular">
                        Qualquer alteração efetuada nos campos à esquerda é
                        replicada instantaneamente. Utilize as definições gerais
                        de instituição para alterar o logotipo default ou os
                        assinantes permanentes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="section-table"
            style={{ display: activePage === "table" ? "block" : "none" }}
            className="space-y-5"
          >
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <i className="ti ti-search text-base"></i>
                  </span>
                  <input
                    id="table-search-input"
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Pesquisar por código, titular ou curso..."
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-sm"
                  />
                  {tableSearch && (
                    <button
                      id="btn-clear-search"
                      onClick={() => setTableSearch("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-red-500 transition-colors"
                      title="Limpar pesquisa"
                    >
                      <i className="ti ti-x text-xs"></i>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Estado
                    </span>
                    <select
                      id="filter-status-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent focus:outline-none text-sm font-bold text-slate-950"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Activo">Activo</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Expirado">Expirado</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Tipo
                    </span>
                    <select
                      id="filter-type-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-transparent focus:outline-none text-sm font-bold text-slate-950"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Curso">Curso</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminário">Seminário</option>
                      <option value="Palestra">Palestra</option>
                    </select>
                  </div>

                  <div className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-bold text-white">
                    {totalFilteredCount} resultados
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.14em] font-black text-slate-500">
                      <th className="p-4">Código Digital</th>
                      <th className="p-4">Titular</th>
                      <th className="p-4">Curso / Tipo</th>
                      <th className="p-4">Emissão</th>
                      <th className="p-4">Nota</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedCertificates.length > 0 ? (
                      paginatedCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-colors">
                                <i className="ti ti-fingerprint text-xs"></i>
                              </span>
                              <div>
                                <span className="block font-mono font-bold text-slate-800">
                                  {cert.verificationCode}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  {cert.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="block font-bold text-slate-950">
                              {cert.recipientName}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Certificado académico
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="block text-slate-700">
                                {cert.courseName}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{cert.hours} Horas</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                                  {cert.type}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-slate-500">
                            {cert.issueDate}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {cert.grade || "—"}
                          </td>

                          <td className="p-4">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black"
                              style={{
                                backgroundColor:
                                  cert.status === "Activo"
                                    ? "#ecfdf5"
                                    : cert.status === "Rascunho"
                                      ? "#fffbeb"
                                      : "#fef2f2",
                                color:
                                  cert.status === "Activo"
                                    ? "#059669"
                                    : cert.status === "Rascunho"
                                      ? "#d97706"
                                      : "#dc2626",
                              }}
                            >
                              {cert.status}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                id={`btn-view-${cert.id}`}
                                onClick={() => {
                                  setViewingCert(cert);
                                  addToast(
                                    `Visualizando o certificado ${cert.id}`,
                                    "info",
                                  );
                                }}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950 transition-colors"
                                title="Ver Completo"
                              >
                                <i className="ti ti-eye"></i>
                              </button>

                              <button
                                id={`btn-edit-${cert.id}`}
                                onClick={() => startEditCertificate(cert)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                                title="Editar"
                              >
                                <i className="ti ti-edit"></i>
                              </button>

                              <button
                                id={`btn-download-${cert.id}`}
                                onClick={() => downloadCertificatePDF(cert)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600 transition-colors"
                                title="Descarregar PDF Premium"
                              >
                                <i className="ti ti-file-type-pdf"></i>
                              </button>

                              <button
                                id={`btn-delete-${cert.id}`}
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Tem a certeza que pretende apagar o certificado de ${cert.recipientName} permanentemente do registo eletrónico?`,
                                    )
                                  ) {
                                    deleteCertificate(cert.id);
                                  }
                                }}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600 transition-colors"
                                title="Eliminar Definitivamente"
                              >
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-10 text-center text-slate-400"
                        >
                          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                            <i className="ti ti-database-off text-xl"></i>
                          </div>
                          Nenhum certificado corresponde aos filtros ativos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 gap-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-3">
                  <span>Itens por página:</span>
                  <select
                    id="pagination-limit-select"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-slate-400">
                    Mostrando {totalFilteredCount ? startIndex + 1 : 0} a{" "}
                    {Math.min(startIndex + itemsPerPage, totalFilteredCount)} de{" "}
                    {totalFilteredCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-pagination-prev"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    Anterior
                  </button>

                  <span className="px-3 py-2 rounded-xl bg-slate-950 text-white">
                    Pág. {currentPage} / {totalPages}
                  </span>

                  <button
                    id="btn-pagination-next"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 4: GALERIA DE MODELOS */}
          <div
            id="section-gallery"
            style={{ display: activePage === "gallery" ? "block" : "none" }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#022c22] to-slate-900 p-5 text-white overflow-hidden relative shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-[#7811f7]/20 blur-3xl pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <i className="ti ti-templates text-xl"></i>
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Galeria de Modelos</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{templates.length} modelos de certificado disponíveis — escolha um modelo base para personalizar</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((temp) => (
                <div
                  key={temp.id}
                  className="p-5 theme-rounded theme-border bg-[var(--color-bg-primary)] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header do card de template */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                        {temp.name}
                      </h3>
                      <span className="px-2 py-0.5 theme-rounded bg-[var(--color-bg-secondary)] theme-border text-[9px] font-mono uppercase text-[var(--color-text-secondary)]">
                        Estilo: {temp.styleName}
                      </span>
                    </div>

                    {/* Miniature visual of custom rendering layout */}
                    <div
                      className="w-full h-32 border theme-rounded bg-slate-50 relative flex flex-col justify-center items-center overflow-hidden transition-all p-3"
                      style={{
                        borderColor: temp.borderColor,
                        borderStyle: temp.borderStyle,
                        borderWidth:
                          temp.borderStyle === "double" ? "4px" : "2px",
                        fontFamily:
                          temp.fontFamily === "serif"
                            ? "Georgia, serif"
                            : temp.fontFamily === "mono"
                              ? "Courier, monospace"
                              : "sans-serif",
                      }}
                    >
                      <span className="bg-amber-100 text-amber-800 text-[7px] tracking-widest font-medium uppercase px-2 py-0.2 rounded border border-amber-200">
                        Padrão de Layout
                      </span>
                      <p className="text-[9px] font-medium text-slate-800 mt-1 uppercase text-center block max-w-xs truncate">
                        CERTIFICADO OFICIAL
                      </p>
                      <p className="text-[7px] text-slate-400 mt-1.5 text-center font-regular leading-snug">
                        conclusão autenticada • carga letiva avaliada • PKI
                        ativo
                      </p>
                      {temp.hasSeal && (
                        <div className="absolute right-3 bottom-3 w-6 h-6 rounded-full border border-amber-400 bg-amber-50 flex items-center justify-center">
                          <i className="ti ti-award text-amber-600 text-[10px]"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta Informações */}
                  <div className="text-xs text-[var(--color-text-secondary)] border-t pt-3 theme-border space-y-2 font-regular">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-[var(--color-text-muted)] block">
                          Tipografia Ativa
                        </span>
                        <span className="font-mono text-[var(--color-text-primary)] capitalize">
                          {temp.fontFamily}-serif
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)] block font-regular">
                          Cor Primária
                        </span>
                        <span className="font-mono text-[var(--color-text-primary)] flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border"
                            style={{ backgroundColor: temp.primaryColor }}
                          ></span>
                          <span>{temp.primaryColor}</span>
                        </span>
                      </div>
                    </div>

                    {/* Botões de Acção do card de template */}
                    <div className="flex pt-2.5 space-x-2">
                      <button
                        id={`btn-select-temp-${temp.id}`}
                        onClick={() => handleSelectTemplate(temp)}
                        className="flex-1 py-1.5 text-[11px] theme-rounded text-slate-950 font-medium bg-[var(--color-brand-accent)] cursor-pointer hover:opacity-95 transition-all text-center block"
                      >
                        <i className="ti ti-circle-check mr-1.5"></i>
                        Escolher Modelo
                      </button>
                      <button
                        id={`btn-editor-temp-${temp.id}`}
                        onClick={() => {
                          setSelectedTemplate(temp);
                          setEditorStyle((prev) => ({
                            ...prev,
                            borderColor: temp.borderColor,
                            primaryColor: temp.primaryColor,
                            fontFamily: temp.fontFamily,
                            hasSeal: temp.hasSeal,
                            borderStyle: temp.borderStyle,
                          }));
                          showPage("editor");
                          addToast(
                            `Carregado "${temp.name}" no editor para customização avançada.`,
                            "info",
                          );
                        }}
                        className="px-3 py-1.5 text-[11px] font-medium border theme-border theme-rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                      >
                        Ver Detalhes Estúdio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECÇÃO 5: EDITOR */}
          <div
            id="section-editor"
            style={{ display: activePage === "editor" ? "block" : "none" }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#7811f7] to-slate-900 p-5 text-white overflow-hidden relative shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <i className="ti ti-palette text-xl"></i>
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Editor de Estilos</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Customize fontes, cores, bordas e elementos visuais do certificado em tempo real</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* CANVAS CENTRAL DE DESIGN (2 COLUNAS DE ESPAÇO) */}
              <div className="xl:col-span-2 space-y-4">
                {/* Cabeçalho do Canvas */}
                <div className="p-4 theme-rounded theme-border bg-[var(--color-bg-primary)] flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      Canvas Interativo de Edição
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-regular">
                      Clique em qualquer elemento de texto para pré-editar
                      abaixo no painel
                    </p>
                  </div>
                  <div className="text-[10px] px-3 py-1 theme-rounded border text-[var(--color-text-secondary)] theme-border bg-[var(--color-bg-secondary)] font-medium font-mono uppercase">
                    Modelo Ativo: {selectedTemplate.name}
                  </div>
                </div>

                {/* Grande Visual do Certificado para Alterações Dinâmicas de Estilo */}
                <div
                  id="large-editor-certificate-canvas"
                  className={`border theme-rounded transition-all duration-300 relative bg-white text-slate-900 shadow-sm flex flex-col justify-between ${
                    editorStyle.orientation === "portrait"
                      ? "aspect-[1/1.414] max-w-[420px] mx-auto p-6 text-[11px]"
                      : "aspect-[1.414/1] w-full p-10"
                  }`}
                  style={{
                    borderColor: editorStyle.borderColor,
                    borderStyle: editorStyle.borderStyle,
                    borderWidth:
                      editorStyle.borderStyle === "double" ? "8px" : "4px",
                    fontFamily:
                      editorStyle.fontFamily === "serif"
                        ? "Georgia, serif"
                        : editorStyle.fontFamily === "mono"
                          ? "Courier, monospace"
                          : "sans-serif",
                  }}
                >
                  {selectedTemplate.styleName === "ilungi" ? (
                    // DESIGN STUDIO: LAYOUT PREMIUM ILUNGI
                    <div className="w-full h-full flex flex-col justify-between relative p-1 pb-1">
                      {/* Top right purple block */}
                      <div className="absolute top-0 right-0 pointer-events-none">
                        <svg
                          width="65"
                          height="65"
                          viewBox="0 0 65 65"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0H65V65H42V23H0V0Z" fill="#7811f7" />
                        </svg>
                      </div>

                      {/* Header row with logo */}
                      <div className="flex justify-between items-start pt-1 px-1">
                        <div className="flex items-center space-x-0.5 tracking-tight">
                          <span className="text-base font-extrabold text-[#022c22] font-sans">
                            ilu
                          </span>
                          <span className="text-base font-extrabold text-[#022c22] font-sans">
                            ng
                          </span>
                          <span className="text-base font-extrabold text-[#022c22] font-sans relative">
                            i
                            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7811f7]"></span>
                          </span>
                        </div>
                      </div>

                      {/* Title block */}
                      <div className="text-center">
                        <h2 className="text-xl font-black tracking-[0.2em] text-[#022c22] font-sans mt-2 leading-none">
                          CERTIFICADO
                        </h2>
                        <p className="text-[7px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                          A ACADEMIA ILUNGI certifica que:
                        </p>
                      </div>

                      {/* Recipient area */}
                      <div className="text-center my-1.5">
                        <h3 className="text-xs font-black text-slate-900 uppercase">
                          [Nome do Aluno Cadastrado]
                        </h3>
                        <p className="text-[7px] text-slate-400 font-medium mt-0.5">
                          Concluiu com êxito o programa de formação:
                        </p>
                        <h4 className="text-[9px] font-bold text-[#022c22] uppercase tracking-wide leading-tight mt-1 px-1">
                          [Tema / Título do Programa Curricular Avançado]
                        </h4>
                      </div>

                      {/* Dates & Hours parameters */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] bg-slate-50 p-2 rounded border border-slate-100 text-left font-sans">
                        <div>
                          <span className="text-slate-400 font-medium">
                            Data de Início:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            05 de maio de 2025
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-medium">
                            Duração:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            120 horas
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">
                            Data de término:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            30 de maio de 2025
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-medium">
                            Pontuação final:
                          </span>{" "}
                          <span className="text-slate-800 font-bold">
                            18 (de 20 valores)
                          </span>
                        </div>
                      </div>

                      {/* Program schedule list block */}
                      <div className="text-left font-sans mt-2 space-y-0.5 bg-slate-50/50 p-1.5 text-[7px] border-l border-[#022c22] rounded max-h-[80px] overflow-hidden">
                        <p className="font-bold text-slate-700 text-[8px] leading-none mb-0.5">
                          Programa:
                        </p>
                        <div className="space-y-0.5 text-slate-600 font-medium max-h-[55px] overflow-y-auto pr-0.5 scrollbar-thin">
                          {`• Módulo 1 - Enquadramento Jurídico Da Shst E Conceitos Fundamentais
• Módulo 2A - Risco De Incêndio
• Módulo 2B - Risco Eléctrico
• Módulo 3A - AMBIENTE TÉRMICO / QUALIDADE DO AR`
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, idx) => (
                              <div
                                key={idx}
                                className="truncate select-none leading-tight"
                              >
                                {line}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Bottom row signatures and metadata */}
                      <div className="grid grid-cols-2 gap-2 items-end mt-2 pt-1.5 border-t border-slate-100 font-sans text-left pb-1">
                        <div className="text-[6px] text-slate-500 space-y-0.5 scale-95 origin-left">
                          <div>
                            <span className="font-bold">
                              ILUNGI® Certificado No:
                            </span>{" "}
                            <span className="font-mono text-slate-800 font-bold">
                              {institution.prefix}-XXXX-0000
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              ILUNGI® Data de Emissão:
                            </span>{" "}
                            <span className="text-slate-800">
                              30 de maio de 2025
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              ILUNGI® Data de Validade:
                            </span>{" "}
                            <span className="text-slate-800">N/A</span>
                          </div>
                          <div>
                            <span className="font-bold">ILUNGI® Curso No:</span>{" "}
                            <span className="font-mono text-slate-800">
                              MEQR
                            </span>
                          </div>
                          <div>
                            <span className="font-bold">
                              INEFOP Licença No:
                            </span>{" "}
                            <span className="font-mono text-slate-800">
                              917.01/LDA./2014
                            </span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <div className="relative inline-block w-full text-center">
                            <span className="font-mono text-[8.5px] text-indigo-900 block italic leading-none h-4 flex items-center justify-center">
                              {institution.defaultSignatory}
                            </span>
                            <div className="w-full border-b border-slate-200 mt-0.5"></div>
                          </div>
                          <p className="text-[5.5px] font-bold text-slate-500 uppercase tracking-tight leading-none">
                            DIRECTOR GERAL | ILUNGI
                          </p>
                        </div>
                      </div>

                      {/* Bottom left corner green shape */}
                      <div className="absolute bottom-0 left-0 pointer-events-none">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 45 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0H18V27H45V45H0V0Z" fill="#022c22" />
                        </svg>
                      </div>

                      {/* Footnote of Angola / INEFOP */}
                      <div className="pl-12 text-right space-y-0.5 font-sans text-slate-500 scale-90 origin-right">
                        <div className="flex items-center justify-end space-x-0.5 text-[5px] leading-none">
                          <span className="bg-blue-600 text-white rounded-[1px] px-0.5 py-0.1 font-bold">
                            INEFOP
                          </span>
                          <span className="text-blue-800 font-bold">
                            Academia Oficial
                          </span>
                        </div>
                        <p className="font-medium text-[4.5px] text-slate-400 truncate">
                          https://ilungi.ao | +244 935 793 270 | Luanda
                        </p>
                      </div>
                    </div>
                  ) : (
                    // DESENHO PADRÃO
                    <>
                      {/* Cantos decorados decorativas */}
                      <div
                        className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 opacity-70"
                        style={{ borderColor: editorStyle.borderColor }}
                      ></div>
                      <div
                        className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 opacity-70"
                        style={{ borderColor: editorStyle.borderColor }}
                      ></div>
                      <div
                        className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 opacity-70"
                        style={{ borderColor: editorStyle.borderColor }}
                      ></div>
                      <div
                        className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 opacity-70"
                        style={{ borderColor: editorStyle.borderColor }}
                      ></div>

                      {/* Topo Logo e Nome da Inst */}
                      <div className="text-center space-y-2 mt-6">
                        <div className="flex items-center justify-center space-x-2">
                          {editorStyle.showLogo && (
                            <span
                              className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-white"
                              style={{
                                backgroundColor: editorStyle.primaryColor,
                              }}
                            >
                              <i className="ti ti-school text-sm"></i>
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-widest font-medium text-slate-500 font-medium">
                            {institution.name}
                          </span>
                        </div>

                        {/* Título Editável */}
                        <h2
                          className="text-2xl font-medium tracking-tight uppercase cursor-pointer hover:bg-amber-50 rounded px-2 transition-all block focus:outline-none"
                          style={{ color: editorStyle.primaryColor }}
                          title="Clique para renomear"
                        >
                          {editorStyle.titleText}
                        </h2>

                        {/* Subtítulo Editável */}
                        <p className="text-[11px] text-slate-400 italic max-w-md mx-auto">
                          {editorStyle.subtitleText}
                        </p>
                      </div>

                      {/* Corpo Texto */}
                      <div className="text-center my-8 space-y-4 px-8">
                        <span className="text-xs text-slate-400 block font-regular">
                          Certifica-se para todas as finalidades jurídicas que
                        </span>

                        <strong className="text-xl block font-medium underline decoration-amber-500 underline-offset-4 text-slate-800">
                          [Nome do Estudante Titular do Certificado]
                        </strong>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto font-regular">
                          concluiu com êxito todas as avaliações pedagógicas
                          relativas ao conteúdo programático de certificação em{" "}
                          <strong className="font-medium text-slate-800">
                            [Nome do Curso de Excelência]
                          </strong>{" "}
                          ministrado eletronicamente hoje pelo portal CerGest,
                          com carga curricular horária correspondente.
                        </p>
                      </div>

                      {/* Rodapé Interno */}
                      <div className="grid grid-cols-3 items-end border-t border-slate-100 pt-6 mt-auto">
                        {/* Validador de Chave */}
                        <div className="text-left space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-medium">
                            Autenticidade PKI
                          </span>
                          <p className="text-[10px] font-mono text-indigo-700">
                            {institution.prefix}-XXXX-0000
                          </p>
                          <p className="text-[8px] text-slate-400">
                            Verificação QR Code
                          </p>
                        </div>

                        {/* Selo Centralizador se Ativo */}
                        <div className="flex flex-col items-center justify-center">
                          {editorStyle.hasSeal ? (
                            <div className="w-14 h-14 rounded-full border border-amber-400 bg-amber-50 flex items-center justify-center relative shadow-sm">
                              <div className="w-12 h-12 rounded-full border border-dashed border-amber-500 flex items-center justify-center">
                                <i className="ti ti-school text-amber-600 text-xl"></i>
                              </div>
                              {/* Fitas decorativos coloridas */}
                              <div className="absolute -bottom-2 w-2.5 h-4 bg-amber-500 transform rotate-12 origin-top"></div>
                              <div className="absolute -bottom-2 w-2.5 h-4 bg-amber-500 transform -rotate-12 origin-top"></div>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-mono italic">
                              Selo Desativado
                            </span>
                          )}
                        </div>

                        {/* Assinatura Direita */}
                        <div className="text-right space-y-1">
                          <span className="font-mono text-[11px] text-indigo-900 block italic text-right">
                            {institution.defaultSignatory}
                          </span>
                          <span className="text-[10px] font-medium text-slate-700 block">
                            {institution.defaultSignatory}
                          </span>
                          <span className="text-[8px] text-slate-400 block">
                            {institution.defaultRole}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PAINEL LATERAL DE CONTROLO DE ATRIBUTOS (CORES, TIPOGRAFIA, CANVAS) */}
              <div className="p-6 theme-rounded theme-border bg-[var(--color-bg-primary)] space-y-5 text-xs font-regular">
                <div className="border-b pb-3 theme-border">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Controlador Visual
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-regular">
                    Modifique o estilo em tempo real no canvas
                  </p>
                </div>

                {/* Inputs de Textos do Título Geral */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                      Título Principal do Certificado
                    </label>
                    <input
                      id="editor-input-title"
                      type="text"
                      value={editorStyle.titleText}
                      onChange={(e) =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          titleText: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                      Subtítulo / Descritivo Inicial
                    </label>
                    <input
                      id="editor-input-subtitle"
                      type="text"
                      value={editorStyle.subtitleText}
                      onChange={(e) =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          subtitleText: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>

                {/* Seletores de Paletas de Cores */}
                <div className="space-y-3">
                  <span className="block text-[var(--color-text-secondary)] font-medium font-regular">
                    Configuração de Cores Principais
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-[var(--color-text-muted)]">
                        Cor Primária
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          id="editor-color-primary"
                          type="color"
                          value={editorStyle.borderColor}
                          onChange={(e) =>
                            setEditorStyle((prev) => ({
                              ...prev,
                              borderColor: e.target.value,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border theme-border cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                          {editorStyle.borderColor}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-[var(--color-text-muted)]">
                        Cor de Acento
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          id="editor-color-accent"
                          type="color"
                          value={editorStyle.accentColor}
                          onChange={(e) =>
                            setEditorStyle((prev) => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border theme-border cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                          {editorStyle.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* dropdown de escolha tipografica */}
                <div className="space-y-3">
                  <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                    Tipografia / Família de Fontes
                  </label>
                  <select
                    id="editor-font-family-select"
                    value={editorStyle.fontFamily}
                    onChange={(e) =>
                      setEditorStyle((prev) => ({
                        ...prev,
                        fontFamily: e.target.value as "serif" | "sans" | "mono",
                      }))
                    }
                    className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                  >
                    <option value="serif">Académico Serif (Georgia)</option>
                    <option value="sans">
                      Institucional Sans (Inter/Helvetica)
                    </option>
                    <option value="mono">
                      Código Técnico Mono (Fira/Courier)
                    </option>
                  </select>
                </div>

                {/* Orientação da Folha */}
                <div className="space-y-2">
                  <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                    Orientação da Folha (Disposição)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="btn-orientation-landscape"
                      onClick={() =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          orientation: "landscape",
                        }))
                      }
                      className={`py-1.5 border theme-rounded font-medium text-[10px] flex items-center justify-center space-x-1 cursor-pointer transition-colors ${editorStyle.orientation !== "portrait" ? "border-amber-500 bg-amber-50 text-amber-800" : "theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"}`}
                    >
                      <i className="ti ti-rectangle text-xs"></i>
                      <span>Horizontal (Paisagem)</span>
                    </button>
                    <button
                      type="button"
                      id="btn-orientation-portrait"
                      onClick={() =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          orientation: "portrait",
                        }))
                      }
                      className={`py-1.5 border theme-rounded font-medium text-[10px] flex items-center justify-center space-x-1 cursor-pointer transition-colors ${editorStyle.orientation === "portrait" ? "border-amber-500 bg-amber-50 text-amber-800" : "theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"}`}
                    >
                      <i className="ti ti-rectangle-vertical text-xs"></i>
                      <span>Vertical (Retrato)</span>
                    </button>
                  </div>
                </div>

                {/* dropdown do estilo da borda */}
                <div className="space-y-2">
                  <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                    Linha de Borda Externa
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["solid", "dashed", "double"].map((style) => (
                      <button
                        key={style}
                        id={`btn-border-style-${style}`}
                        type="button"
                        onClick={() =>
                          setEditorStyle((prev) => ({
                            ...prev,
                            borderStyle: style as any,
                          }))
                        }
                        className={`py-1.5 border theme-rounded font-medium capitalize text-[10px] ${editorStyle.borderStyle === style ? "border-amber-500 bg-amber-50 text-amber-800" : "theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* toggle de opcionais: seals e logos */}
                <div className="space-y-2 pt-2 border-t theme-border">
                  <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                    Elementos do Modelo
                  </span>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">
                      Exibir Selo Dourado Académico
                    </span>
                    <button
                      id="toggle-editor-seal"
                      type="button"
                      onClick={() =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          hasSeal: !prev.hasSeal,
                        }))
                      }
                      className={`w-10 py-1 rounded text-center text-[10px] font-medium font-mono ${editorStyle.hasSeal ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {editorStyle.hasSeal ? "SIM" : "NÃO"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[var(--color-text-secondary)]">
                      Exibir Logotipo do Emissor
                    </span>
                    <button
                      id="toggle-editor-logo"
                      type="button"
                      onClick={() =>
                        setEditorStyle((prev) => ({
                          ...prev,
                          showLogo: !prev.showLogo,
                        }))
                      }
                      className={`w-10 py-1 rounded text-center text-[10px] font-medium font-mono ${editorStyle.showLogo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {editorStyle.showLogo ? "SIM" : "NÃO"}
                    </button>
                  </div>
                </div>

                {/* Botões de Ação do Editor */}
                <div className="pt-4 space-y-2">
                  <button
                    id="editor-btn-save"
                    onClick={handleApplyEditorDesign}
                    className="w-full py-2.5 theme-rounded text-slate-950 font-medium bg-[var(--color-brand-accent)] hover:opacity-95 transition-colors font-medium flex items-center justify-center space-x-1"
                  >
                    <i className="ti ti-device-floppy"></i>
                    <span>Sincronizar no Banco de Modelos</span>
                  </button>

                  <button
                    id="editor-btn-reset"
                    onClick={() => {
                      setEditorStyle({
                        titleText: "CERTIFICADO DE PARTICIPAÇÃO",
                        subtitleText:
                          "Certifica-se o aproveitamento e excelência do estudante",
                        borderColor: "#0f172a",
                        primaryColor: "#0f172a",
                        accentColor: "#d97706",
                        borderStyle: "solid",
                        fontFamily: "serif",
                        hasSeal: true,
                        showLogo: true,
                        logoUrl:
                          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120",
                        orientation: "landscape",
                      });
                      addToast(
                        "Definições do canvas restauradas para padrões clássicos.",
                        "info",
                      );
                    }}
                    className="w-full py-2 border theme-border theme-rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors font-medium"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 6: CONFIGURAÇÕES */}
          <div
            id="section-settings"
            style={{ display: activePage === "settings" ? "block" : "none" }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-5 text-white overflow-hidden relative shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-[#7811f7]/20 blur-3xl pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <i className="ti ti-settings text-xl"></i>
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Configurações Gerais</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Personalize a identidade da instituição, assinaturas e parâmetros do sistema</p>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto p-6 theme-rounded theme-border bg-[var(--color-bg-primary)] space-y-6">
              <div className="border-b pb-4 theme-border">
                <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                  Definições da Instituição Credenciada
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] font-regular">
                  Personalize o logotipo, canais de verificação e os nomes
                  aplicados aos formulários
                </p>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="space-y-4 text-xs font-regular"
              >
                {/* Nome da Instituição */}
                <div className="space-y-1">
                  <label className="block text-[var(--color-text-secondary)] font-medium">
                    Nome Formal da Entidade Educacional
                  </label>
                  <input
                    id="settings-institution-name"
                    type="text"
                    value={institution.name}
                    onChange={(e) =>
                      setInstitution((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    required
                  />
                </div>

                {/* Contactos */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      E-mail Administrativo Oficial
                    </label>
                    <input
                      id="settings-institution-email"
                      type="email"
                      value={institution.email}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Telefone Geral de Certificados
                    </label>
                    <input
                      id="settings-institution-phone"
                      type="text"
                      value={institution.phone}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>

                {/* Assinatura Padrão do Diretor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Nome do Diretor / Assinador Permanente
                    </label>
                    <input
                      id="settings-default-signatory"
                      type="text"
                      value={institution.defaultSignatory}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          defaultSignatory: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium font-regular">
                      Cargo / Título Institucional
                    </label>
                    <input
                      id="settings-default-role"
                      type="text"
                      value={institution.defaultRole}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          defaultRole: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      required
                    />
                  </div>
                </div>

                {/* Prefixo de Certificação */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Prefixo de Amostragem (Código SHA)
                    </label>
                    <input
                      id="settings-prefix"
                      type="text"
                      value={institution.prefix}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          prefix: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-mono"
                      maxLength={8}
                      required
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)] font-regular">
                      Gera códigos no formato: PREFIXO-TIPO-ALGARISMOS
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      URL URL do Logotipo Oficial
                    </label>
                    <input
                      id="settings-logo-url"
                      type="text"
                      value={institution.logoUrl || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          logoUrl: e.target.value,
                        }))
                      }
                      placeholder="https://exemplo.com/logo.png"
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>

                {/* Linha de canais SMTP Secundárias */}
                <div className="p-4 theme-rounded bg-[var(--color-bg-secondary)] theme-border text-[var(--color-text-secondary)] leading-relaxed space-y-2">
                  <p className="font-medium text-[var(--color-text-primary)] text-xs">
                    Informação de Segurança Eletrónica
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-regular">
                    Cada certificado gerado cria uma assinatura simétrica que
                    vincula os dados completos do aluno com a hash do Diretor e
                    a chave criptográfica da academia. Este processo
                    impossibilita qualquer adulteração retroativa sem quebrar o
                    algoritmo de verificação digital do CerGest.
                  </p>
                </div>

                {/* Submissão */}
                <div className="pt-4 border-t theme-border text-right">
                  <button
                    id="settings-btn-save"
                    type="submit"
                    className="px-6 py-2.5 theme-rounded text-slate-950 font-medium bg-[var(--color-brand-accent)] hover:opacity-95 transition-all text-xs font-medium"
                  >
                    Guardar Todas as Definições
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SECÇÃO 7: PERFIL DO PROFISSIONAL */}
          <div
            id="section-profile"
            style={{ display: activePage === "profile" ? "block" : "none" }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#022c22] via-slate-900 to-[#7811f7] p-5 text-white overflow-hidden relative shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <i className="ti ti-user text-xl"></i>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">{profile.name}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{profile.role} · {profile.email}</p>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto p-6 theme-rounded theme-border bg-[var(--color-bg-primary)] space-y-6">
              <div className="border-b pb-4 theme-border flex items-center space-x-3">
                <span className="w-10 h-10 rounded-full bg-[var(--color-brand-accent-bg)] text-[var(--color-brand-accent)] flex items-center justify-center">
                  <i className="ti ti-user-cog text-xl"></i>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    Gestão de Perfil Enterprise
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-regular">
                    Personalize as suas credenciais oficiais e controle o estilo
                    de sua assinatura digital
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] border theme-border">
                <div className="w-20 h-20 rounded-full border-2 border-[var(--color-brand-accent)] overflow-hidden flex items-center justify-center bg-slate-200 shadow-inner shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <i className="ti ti-user text-4xl text-slate-400"></i>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left text-xs">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {profile.name}
                  </h4>
                  <p className="text-[10px] text-[var(--color-brand-accent)] font-semibold mt-0.5">
                    {profile.role}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                    {profile.email}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2 justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setProfile((prev) => ({
                          ...prev,
                          avatarUrl:
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
                        }));
                        addToast(
                          "Foto de Perfil Executiva Masculina/Feminina Atualizada.",
                          "success",
                        );
                      }}
                      className="px-2 py-1 text-[10px] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border theme-border theme-rounded font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Usar Executiva F
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile((prev) => ({
                          ...prev,
                          avatarUrl:
                            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
                        }));
                        addToast(
                          "Foto de Perfil Executivo Executivo Atualizada.",
                          "success",
                        );
                      }}
                      className="px-2 py-1 text-[10px] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border theme-border theme-rounded font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Usar Executivo M
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile((prev) => ({ ...prev, avatarUrl: "" }));
                        addToast("Avatar removido.", "warning");
                      }}
                      className="px-2 py-1 text-[10px] hover:text-red-600 font-medium transition-colors cursor-pointer"
                    >
                      Remover Foto
                    </button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Sincronizar dados oficiais nas configurações gerais
                  setInstitution((prev) => ({
                    ...prev,
                    defaultSignatory: profile.name,
                    defaultRole: profile.role,
                  }));
                  // Sincronizar com formulário atual
                  setFormInputs((prev) => ({
                    ...prev,
                    signatoryName: profile.name,
                    signatoryRole: profile.role,
                  }));
                  addToast(
                    "Perfil institucional salvo com sucesso!",
                    "success",
                  );
                  addToast(
                    "Signatário oficial atualizado em todos os novos modelos.",
                    "info",
                  );
                }}
                className="space-y-4 text-xs font-regular"
              >
                <div className="space-y-1">
                  <label className="block text-[var(--color-text-secondary)] font-medium">
                    Nome Completo do Administrador/Diretor
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    required
                  />
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Este nome é impresso como assinante oficial do certificado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-medium">
                      Cargo/Função Institucional
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      required
                    />
                  </div>
                </div>

                {/* Rubrica ou Texto da Assinatura com fontes customizadas */}
                <div className="p-4 rounded-xl border theme-border space-y-3 bg-[var(--color-bg-primary)]">
                  <div className="space-y-1">
                    <label className="block text-[var(--color-text-secondary)] font-semibold">
                      Assinatura Digital Manuscrita (Texto Cursivo)
                    </label>
                    <input
                      type="text"
                      value={profile.signatureText}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          signatureText: e.target.value,
                        }))
                      }
                      placeholder="Ex: Sofia Albuquerque"
                      className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-mono"
                    />
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Modifique o texto para alterar a assinatura que simula
                      escrita manual nos templates.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                      Estilos de Traçado de Assinatura
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className="p-2.5 border rounded-lg text-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-[#b89047] transition-all"
                        onClick={() =>
                          addToast(
                            "Estilo cursiva moderna selecionado.",
                            "info",
                          )
                        }
                      >
                        <span className="font-mono text-xs italic text-indigo-900 block font-bold select-none h-5 overflow-hidden">
                          S. Albuquerque
                        </span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-medium">
                          Modern Signature
                        </span>
                      </div>
                      <div
                        className="p-2.5 border rounded-lg text-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-[#b89047] transition-all"
                        onClick={() =>
                          addToast(
                            "Estilo clássico medieval selecionado.",
                            "info",
                          )
                        }
                      >
                        <span
                          className="font-serif italic text-xs text-slate-800 dark:text-slate-200 font-bold select-none h-5 overflow-hidden block"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          S. Albuquerque
                        </span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-semibold">
                          Classic Georgia
                        </span>
                      </div>
                      <div
                        className="p-2.5 border rounded-lg text-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-[#b89047] transition-all"
                        onClick={() =>
                          addToast("Estilo técnico fino selecionado.", "info")
                        }
                      >
                        <span className="font-sans text-xs text-indigo-950 dark:text-slate-200 block select-none h-5 overflow-hidden tracking-wider font-semibold">
                          SofiaAlbuquerque
                        </span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-medium">
                          Academic Block
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alterar Password da conta */}
                <div className="space-y-1.5 pt-2 border-t theme-border">
                  <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                    Segurança de Acesso
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Palavra-passe Atual
                      </label>
                      <input
                        type="password"
                        value="••••••••••••"
                        disabled
                        className="w-full px-3 py-2 theme-rounded theme-border bg-slate-100 dark:bg-slate-800 text-[var(--color-text-muted)] font-mono text-xs border"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[var(--color-text-secondary)] font-medium">
                        Nova Palavra-passe
                      </label>
                      <input
                        type="password"
                        placeholder="Insira para alterar..."
                        onChange={(e) => {
                          if (
                            e.target.value.length > 0 &&
                            e.target.value.length < 6
                          ) {
                            // feedback sutil
                          }
                        }}
                        className="w-full px-3 py-2 theme-rounded theme-border bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t theme-border text-right gap-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 theme-rounded text-slate-950 font-medium bg-[var(--color-brand-accent)] hover:opacity-95 transition-all text-xs font-semibold cursor-pointer"
                  >
                    Guardar Perfil Administrativo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* CONTROLO DO MODAL DE VER DETALHES DE CERTIFICADO */}
        {viewingCert && (
          <div
            id="modal-view-certificate"
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setViewingCert(null)}
          >
            <div
              className={`flex flex-col space-y-4 max-h-[95vh] overflow-y-auto w-full ${
                selectedTemplate.orientation === "portrait"
                  ? "max-w-md"
                  : "max-w-4xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ÁREA IMPRIMÍVEL DO CERTIFICADO (Capturado por html2canvas) */}
              <div
                id="printable-certificate-area"
                className="bg-white text-slate-900 shadow-2xl relative transition-all duration-300 flex flex-col justify-between overflow-hidden"
                style={{
                  borderColor: selectedTemplate.borderColor,
                  borderStyle: selectedTemplate.borderStyle,
                  borderWidth:
                    selectedTemplate.borderStyle === "double" ? "12px" : "6px",
                  fontFamily:
                    selectedTemplate.fontFamily === "serif"
                      ? "Georgia, serif"
                      : selectedTemplate.fontFamily === "mono"
                        ? "Courier, monospace"
                        : "sans-serif",
                  minHeight:
                    selectedTemplate.orientation === "portrait"
                      ? "460px"
                      : "520px",
                  aspectRatio:
                    selectedTemplate.orientation === "portrait"
                      ? "1 / 1.414"
                      : "1.414 / 1",
                  padding:
                    selectedTemplate.orientation === "portrait"
                      ? "24px"
                      : "40px",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                {selectedTemplate.styleName === "ilungi" ? (
                  // MODELO DE VISUALIZAÇÃO INTERATIVA ILUNGI
                  <div className="w-full h-full flex flex-col justify-between relative p-1 pb-1">
                    {/* Top right purple block */}
                    <div className="absolute top-0 right-0 pointer-events-none">
                      <svg
                        width="75"
                        height="75"
                        viewBox="0 0 65 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 0H65V65H42V23H0V0Z" fill="#7811f7" />
                      </svg>
                    </div>

                    {/* Header row with logo */}
                    <div className="flex justify-between items-start pt-1 px-1">
                      <div className="flex items-center space-x-0.5 tracking-tight">
                        <span className="text-xl font-extrabold text-[#022c22] font-sans">
                          ilu
                        </span>
                        <span className="text-xl font-extrabold text-[#022c22] font-sans">
                          ng
                        </span>
                        <span className="text-xl font-extrabold text-[#022c22] font-sans relative">
                          i
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#7811f7]"></span>
                        </span>
                      </div>
                    </div>

                    {/* Title block */}
                    <div className="text-center mt-2">
                      <h2 className="text-2xl font-black tracking-[0.25em] text-[#022c22] font-sans">
                        CERTIFICADO
                      </h2>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                        A ACADEMIA ILUNGI certifica que:
                      </p>
                    </div>

                    {/* Recipient area */}
                    <div className="text-center my-3">
                      <h3 className="text-lg font-black text-[#022c22] uppercase tracking-wide">
                        {viewingCert.recipientName || "ALUNO INTERATIVO"}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        Concluiu com êxito o programa de formação:
                      </p>
                      <h4 className="text-[11px] font-bold text-[#022c22] uppercase tracking-wide leading-tight mt-1 px-2">
                        {viewingCert.courseName || "TITULO DO CURSO"}
                      </h4>
                    </div>

                    {/* Dates & Hours parameters */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] bg-slate-50 p-2.5 rounded border border-slate-100 text-left font-sans">
                      <div>
                        <span className="text-slate-400 font-medium">
                          Data de Início:
                        </span>{" "}
                        <span className="text-slate-800 font-bold">
                          {viewingCert.startDate || "05 de maio de 2025"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-medium">
                          Duração:
                        </span>{" "}
                        <span className="text-slate-800 font-bold">
                          {viewingCert.hours || "0"} horas
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">
                          Data de término:
                        </span>{" "}
                        <span className="text-slate-800 font-bold">
                          {viewingCert.endDate || "30 de maio de 2025"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-medium">
                          Pontuação final:
                        </span>{" "}
                        <span className="text-slate-800 font-bold">
                          {viewingCert.grade || "18 (de 20 valores)"}
                        </span>
                      </div>
                    </div>

                    {/* Program schedule list block */}
                    <div className="text-left font-sans mt-2 space-y-0.5 bg-slate-50/50 p-2 text-[8px] border-l-2 border-[#022c22] rounded max-h-[105px] overflow-hidden">
                      <p className="font-bold text-slate-700 text-[9px] leading-none mb-1">
                        Programa:
                      </p>
                      <div className="space-y-0.5 text-slate-600 font-medium max-h-[75px] overflow-y-auto pr-0.5 scrollbar-thin">
                        {(
                          viewingCert.curriculum ||
                          `• Módulo 1 - Enquadramento Jurídico Da Shst E Conceitos Fundamentais
• Módulo 2A - Risco De Incêndio
• Módulo 2B - Risco Eléctrico
• Módulo 3A - AMBIENTE TÉRMICO / QUALIDADE DO AR
• Módulo 3B - EXPOSIÇÃO A AGENTES QUÍMICOS`
                        )
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, idx) => (
                            <div
                              key={idx}
                              className="truncate select-none leading-tight"
                            >
                              {line}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Bottom row signatures and metadata */}
                    <div className="grid grid-cols-2 gap-4 items-end mt-2 pt-1 border-t border-slate-100 font-sans text-left pb-1">
                      <div className="text-[7px] text-slate-500 space-y-0.5 scale-95 origin-left">
                        <div>
                          <span className="font-bold">
                            ILUNGI® Certificado No:
                          </span>{" "}
                          <span className="font-mono text-slate-800 font-bold">
                            {viewingCert.verificationCode}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">
                            ILUNGI® Data de Emissão:
                          </span>{" "}
                          <span className="text-slate-800">
                            {viewingCert.issueDate || "30 de maio de 2025"}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">
                            ILUNGI® Data de Validade:
                          </span>{" "}
                          <span className="text-slate-800">N/A</span>
                        </div>
                        <div>
                          <span className="font-bold">ILUNGI® Curso No:</span>{" "}
                          <span className="font-mono text-slate-800">
                            {viewingCert.courseNo || "MEQR"}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">INEFOP Licença No:</span>{" "}
                          <span className="font-mono text-slate-800">
                            {viewingCert.inefopLicense || "917.01/LDA./2014"}
                          </span>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <div className="relative inline-block w-full text-center">
                          <span className="font-mono text-[9.5px] text-indigo-900 block italic leading-none h-4 flex items-center justify-center">
                            {profile.signatureText ||
                              viewingCert.signatoryName ||
                              "Manuel R. J. Calado"}
                          </span>
                          <div className="w-full border-b border-slate-200 mt-0.5"></div>
                        </div>
                        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tight leading-none text-center">
                          DIRECTOR GERAL | ILUNGI
                        </p>
                      </div>
                    </div>

                    {/* Bottom left corner green shape */}
                    <div className="absolute bottom-0 left-0 pointer-events-none">
                      <svg
                        width="45"
                        height="45"
                        viewBox="0 0 45 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 0H18V27H45V45H0V0Z" fill="#022c22" />
                      </svg>
                    </div>

                    {/* Footnote of Angola / INEFOP */}
                    <div className="pl-14 text-right space-y-0.5 font-sans text-slate-500 scale-95 origin-right">
                      <div className="flex items-center justify-end space-x-0.5 text-[6px] leading-none">
                        <span className="bg-blue-600 text-white rounded-[1px] px-0.5 py-0.1 font-bold">
                          INEFOP
                        </span>
                        <span className="text-blue-800 font-bold">
                          Academia Oficial
                        </span>
                      </div>
                      <p className="font-medium text-[5px] text-slate-400 truncate">
                        https://ilungi.ao | +244 935 793 270 | Luanda
                      </p>
                    </div>
                  </div>
                ) : (
                  // CONFIGURAÇÃO DOS CANTO CLÁSSICOS PADRÃO
                  <>
                    {/* Moldura Clássica Decorativa nos Cantos */}
                    <div
                      className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 opacity-80"
                      style={{ borderColor: selectedTemplate.borderColor }}
                    ></div>
                    <div
                      className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 opacity-80"
                      style={{ borderColor: selectedTemplate.borderColor }}
                    ></div>
                    <div
                      className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 opacity-80"
                      style={{ borderColor: selectedTemplate.borderColor }}
                    ></div>
                    <div
                      className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 opacity-80"
                      style={{ borderColor: selectedTemplate.borderColor }}
                    ></div>

                    {/* Header do Certificado */}
                    <div
                      className={`text-center space-y-2 ${selectedTemplate.orientation === "portrait" ? "mt-2" : "mt-6"}`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span
                          className="w-8 h-8 rounded shrink-0 bg-slate-950 flex items-center justify-center text-white"
                          style={{
                            backgroundColor: selectedTemplate.primaryColor,
                          }}
                        >
                          <i className="ti ti-school text-lg"></i>
                        </span>
                        <span className="text-xs uppercase tracking-widest font-heading text-slate-500 font-medium">
                          {institution.name}
                        </span>
                      </div>

                      <h2
                        className={`${selectedTemplate.orientation === "portrait" ? "text-lg md:text-xl" : "text-3xl"} font-bold tracking-tight uppercase`}
                        style={{ color: selectedTemplate.primaryColor }}
                      >
                        {selectedTemplate.titleText || "CERTIFICADO DE CONEXÃO"}
                      </h2>
                      <p className="text-[10px] text-slate-400 italic">
                        {selectedTemplate.subtitleText ||
                          "Documento comprobatório de excelência curricular"}
                      </p>
                    </div>

                    {/* Corpo Principal Texto do Certificado */}
                    <div
                      className={`text-center ${selectedTemplate.orientation === "portrait" ? "my-4 space-y-3 px-2" : "my-10 space-y-5 px-8"}`}
                    >
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                        Certificado Oficial de Formação Profissional
                      </p>

                      <span className="text-xs text-slate-500 block font-regular">
                        Certificamos com plena distinção pedagógica que
                      </span>

                      <strong
                        className={`${selectedTemplate.orientation === "portrait" ? "text-lg" : "text-2xl"} block font-bold underline decoration-amber-500 underline-offset-4 text-slate-900 leading-tight`}
                      >
                        {viewingCert.recipientName}
                      </strong>

                      <p className="text-xs text-slate-700 leading-relaxed max-w-2xl mx-auto font-regular">
                        concluiu com êxito todos os módulos avaliativos do{" "}
                        <strong className="font-semibold text-slate-950">
                          {viewingCert.type.toLowerCase()}
                        </strong>{" "}
                        de{" "}
                        <strong className="font-semibold text-slate-950">
                          {viewingCert.courseName}
                        </strong>
                        , correspondendo a uma carga total de{" "}
                        <strong className="font-semibold text-slate-950">
                          {viewingCert.hours} horas
                        </strong>{" "}
                        letivas com emissão registada em{" "}
                        <strong className="font-semibold text-slate-950">
                          {viewingCert.issueDate}
                        </strong>
                        .
                      </p>

                      {viewingCert.grade && (
                        <p className="text-[10px] text-amber-800 font-bold bg-amber-50 inline-block px-3 py-1 rounded border border-amber-200">
                          Classificação Geral Obtida: {viewingCert.grade}
                        </p>
                      )}
                    </div>

                    {/* Rodapé - Selos, Assinaturas e Informação PKI */}
                    <div className="grid grid-cols-3 items-end border-t border-slate-100 pt-8 mt-auto pb-6">
                      {/* Validação de Código */}
                      <div className="text-left space-y-1 text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          Chave Única PKI
                        </span>
                        <p className="font-mono text-indigo-700 font-medium text-xs">
                          {viewingCert.verificationCode}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          Verificável em {institution.email}
                        </p>

                        {/* Mock de Código QR simulado */}
                        <div className="flex items-center space-x-1.5 mt-2">
                          <span className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center p-1 bg-white">
                            <span className="grid grid-cols-3 gap-0.5 w-full h-full">
                              <span className="bg-slate-950"></span>
                              <span className="bg-[var(--color-bg-primary)]"></span>
                              <span className="bg-slate-950"></span>
                              <span className="bg-[var(--color-bg-primary)]"></span>
                              <span className="bg-slate-950"></span>
                              <span className="bg-[var(--color-bg-primary)]"></span>
                              <span className="bg-slate-950"></span>
                              <span className="bg-[var(--color-bg-primary)]"></span>
                              <span className="bg-slate-950"></span>
                            </span>
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">
                            Ler Código QR
                          </span>
                        </div>
                      </div>

                      {/* Selo no Meio */}
                      <div className="flex flex-col items-center justify-center">
                        {selectedTemplate.hasSeal ? (
                          <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center relative shadow-sm">
                            <div className="w-13 h-13 rounded-full border border-dashed border-amber-500 flex items-center justify-center">
                              <i className="ti ti-school text-amber-600 text-2xl animate-pulse"></i>
                            </div>
                            <div className="absolute -bottom-2 w-3.5 h-5 bg-amber-500 transform rotate-12 origin-top"></div>
                            <div className="absolute -bottom-2 w-3.5 h-5 bg-amber-500 transform -rotate-12 origin-top"></div>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-mono italic">
                            Sem Selo Ativo
                          </span>
                        )}
                      </div>

                      {/* Assinatura no lado direito */}
                      <div className="text-right space-y-2 text-xs">
                        <div className="relative inline-block">
                          <div className="absolute -top-3 w-full text-center border-b border-slate-300"></div>
                          <span className="font-mono text-xs text-indigo-900 block italic h-6 text-right">
                            {viewingCert.signatoryName || "[Assinatura]"}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800 text-xs">
                          {viewingCert.signatoryName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {viewingCert.signatoryRole}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Botões de Ações e Download no rodapé do Modal (Fora da área imprimível) */}
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-850 p-4 rounded-xl flex flex-wrap gap-2.5 items-center justify-between text-xs text-white z-20">
                <div className="flex flex-wrap gap-2">
                  <button
                    id="modal-btn-download"
                    disabled={isExportingPDF}
                    onClick={() => downloadCertificatePDF(viewingCert)}
                    className={`py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isExportingPDF
                        ? "bg-amber-600 animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    <i
                      className={`ti ${isExportingPDF ? "ti-loader animate-spin" : "ti-file-type-pdf"} text-sm`}
                    ></i>
                    <span>
                      {isExportingPDF
                        ? "A gerar PDF..."
                        : "Descarregar PDF Premium"}
                    </span>
                  </button>

                  <button
                    id="modal-btn-download-json"
                    onClick={() => {
                      const dataStr =
                        "data:text/json;charset=utf-8," +
                        encodeURIComponent(
                          JSON.stringify(viewingCert, null, 2),
                        );
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute(
                        "download",
                        `certificado-${viewingCert.verificationCode}.json`,
                      );
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      addToast(
                        "Ficheiro de assinatura eletrónica JSON descarregado.",
                        "success",
                      );
                    }}
                    className="py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors font-medium flex items-center justify-center space-x-1 cursor-pointer"
                    title="Ficha Cadastral e Dados Técnicos em JSON"
                  >
                    <i className="ti ti-braces text-xs text-indigo-400"></i>
                    <span>Dados JSON</span>
                  </button>

                  <button
                    id="modal-btn-print"
                    onClick={() => {
                      window.print();
                      addToast("Sistema de impressão acionado.", "info");
                    }}
                    className="py-2.5 px-3.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors font-medium flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <i className="ti ti-printer text-sm"></i>
                    <span>Imprimir</span>
                  </button>
                </div>

                <button
                  id="modal-btn-close-bottom"
                  onClick={() => setViewingCert(null)}
                  className="py-2.5 px-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
