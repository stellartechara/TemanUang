"use client";

import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Coffee,
  CreditCard,
  Ellipsis,
  FileText,
  Globe,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  getSupabaseClient,
  type TransactionRecord,
} from "@/lib/supabase";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

type View = "overview" | "transactions" | "budget";

const categories = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Tagihan",
  "Hiburan",
  "Kos",
  "Kesehatan",
  "Gaji",
  "Lainnya",
];

const categoryColors: Record<string, string> = {
  Makanan: "#f4a261",
  Transportasi: "#73a9ad",
  Belanja: "#a18ad3",
  Tagihan: "#e58b9b",
  Hiburan: "#e8bb62",
  Kos: "#80a77b",
  Kesehatan: "#dc8b67",
  Gaji: "#4d9278",
  Lainnya: "#a7a9b5",
};

const rupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const displayDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

function makeDemoTransactions(): Transaction[] {
  const today = new Date();
  const date = (daysAgo: number) => {
    const value = new Date(today);
    value.setDate(value.getDate() - daysAgo);
    return value.toISOString().slice(0, 10);
  };

  return [
    { id: "demo-1", type: "income", amount: 6500000, category: "Gaji", description: "Gaji bulanan", date: date(1) },
    { id: "demo-2", type: "expense", amount: 1500000, category: "Kos", description: "Bayar kos bulan ini", date: date(2) },
    { id: "demo-3", type: "expense", amount: 42000, category: "Makanan", description: "Makan siang", date: date(2) },
    { id: "demo-4", type: "expense", amount: 25000, category: "Transportasi", description: "Ojek ke kantor", date: date(3) },
    { id: "demo-5", type: "expense", amount: 180000, category: "Belanja", description: "Belanja kebutuhan rumah", date: date(4) },
    { id: "demo-6", type: "expense", amount: 350000, category: "Tagihan", description: "Internet & listrik", date: date(6) },
    { id: "demo-7", type: "expense", amount: 58000, category: "Makanan", description: "Makan malam bareng teman", date: date(7) },
    { id: "demo-8", type: "expense", amount: 30000, category: "Transportasi", description: "KRL & bus", date: date(9) },
    { id: "demo-9", type: "expense", amount: 125000, category: "Hiburan", description: "Nonton bioskop", date: date(11) },
    { id: "demo-10", type: "expense", amount: 46000, category: "Makanan", description: "Sarapan", date: date(13) },
  ];
}

function transactionFromRecord(record: TransactionRecord): Transaction {
  return {
    id: record.id,
    type: record.type,
    amount: Number(record.amount),
    category: record.category,
    description: record.description,
    date: record.occurred_at,
  };
}

function categoryIcon(category: string) {
  if (category === "Makanan") return <Utensils size={17} />;
  if (category === "Transportasi") return <TrainFront size={17} />;
  if (category === "Belanja") return <ShoppingBag size={17} />;
  if (category === "Tagihan") return <CreditCard size={17} />;
  if (category === "Gaji") return <ArrowDownLeft size={17} />;
  if (category === "Kos") return <Home size={17} />;
  return <Coffee size={17} />;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<View>("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [authFeedback, setAuthFeedback] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(3500000);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(today);
  const supabaseConfigured = Boolean(getSupabaseClient());

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const savedBudget = Number(
          window.localStorage.getItem("teman-uang-monthly-budget"),
        );
        if (Number.isFinite(savedBudget) && savedBudget > 0) {
          setBudgetLimit(savedBudget);
        }
      } catch {
        setErrorMessage("Pengaturan anggaran gagal dibaca dari browser.");
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(error.message);
          setIsLoaded(true);
          return;
        }
        if (active && data.session) {
          setUserEmail(data.session.user.email ?? "");
          setIsCloudMode(true);
          const result = await supabase
            .from("transactions")
            .select("*")
            .order("occurred_at", { ascending: false });
          if (result.error) {
            setErrorMessage(result.error.message);
          } else if (active) {
            setTransactions(
              (result.data as TransactionRecord[]).map(transactionFromRecord),
            );
          }
          setIsLoaded(true);
          return;
        }
      }

      try {
        const saved = window.localStorage.getItem("teman-uang-transactions");
        const parsed: unknown = saved ? JSON.parse(saved) : null;
        const savedTransactions = Array.isArray(parsed) ? parsed as Transaction[] : [];
        setTransactions(
          savedTransactions.length ? savedTransactions : makeDemoTransactions(),
        );
      } catch {
        setTransactions(makeDemoTransactions());
        setErrorMessage("Data demo gagal dibaca dari browser.");
      }
      setIsLoaded(true);
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !isCloudMode) {
      window.localStorage.setItem(
        "teman-uang-transactions",
        JSON.stringify(transactions),
      );
    }
  }, [isLoaded, isCloudMode, transactions]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!showProfileMenu) return;

    function closeProfileMenu(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    function closeProfileMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowProfileMenu(false);
    }

    document.addEventListener("mousedown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenuOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenuOnEscape);
    };
  }, [showProfileMenu]);

  const monthTransactions = transactions.filter((transaction) =>
    transaction.date.startsWith(currentMonth),
  );
  const totalIncome = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = totalIncome - totalExpense;

  const weeks = Array.from({ length: 4 }, () => ({ income: 0, expense: 0 }));
  monthTransactions.forEach((transaction) => {
    const weekIndex = Math.min(
      Math.floor((Number(transaction.date.slice(8, 10)) - 1) / 7),
      3,
    );
    weeks[weekIndex][transaction.type] += transaction.amount;
  });
  const chartMaxValue = Math.max(
    ...weeks.flatMap((week) => [week.income, week.expense]),
    1,
  );
  const chartScale = Math.ceil(chartMaxValue / 1000000) * 1000000;
  const chartTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    new Intl.NumberFormat("id-ID", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(chartScale * ratio),
  );

  const totalsByCategory = new Map<string, number>();
  monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totalsByCategory.set(
        transaction.category,
        (totalsByCategory.get(transaction.category) ?? 0) + transaction.amount,
      );
    });
  const expenseByCategory = [...totalsByCategory.entries()].sort((a, b) => b[1] - a[1]);

  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filteredTransactions = [...monthTransactions]
    .filter((transaction) =>
      !normalizedQuery ||
      transaction.description.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
      transaction.category.toLocaleLowerCase("id-ID").includes(normalizedQuery),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const recentTransactions = filteredTransactions.slice(0, 5);
  const budgetProgress = Math.min((totalExpense / budgetLimit) * 100, 100);
  const dailyAverage = totalExpense / Math.max(today.getDate(), 1);
  const biggestCategory = expenseByCategory[0];

  async function handleAddTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "Lainnya");
    const type = String(formData.get("type")) as Transaction["type"];
    const date = String(formData.get("date"));

    if (!Number.isFinite(amount) || amount <= 0 || !date) {
      setErrorMessage("Isi nominal yang valid dan tanggal transaksi.");
      return;
    }

    const supabase = getSupabaseClient();
    if (isCloudMode && supabase) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setErrorMessage(userError?.message ?? "Sesi login tidak ditemukan.");
        return;
      }
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userData.user.id,
          type,
          amount,
          category,
          description,
          occurred_at: date,
        })
        .select("*")
        .single();
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setTransactions((current) => [transactionFromRecord(data as TransactionRecord), ...current]);
    } else {
      setTransactions((current) => [
        {
          id: crypto.randomUUID(),
          type,
          amount,
          category,
          description,
          date,
        },
        ...current,
      ]);
    }
    setShowTransactionModal(false);
    setNotice("Transaksi berhasil disimpan.");
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setAuthFeedback("");
    setConfirmationEmail("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMessage("Tambahkan URL dan anon key Supabase di file .env.local.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setIsAuthLoading(true);
    const result =
      authMode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setIsAuthLoading(false);
      setErrorMessage(result.error.message);
      return;
    }
    if (!result.data.session || !result.data.user) {
      setIsAuthLoading(false);
      setConfirmationEmail(email);
      setAuthFeedback(
        "Akun berhasil didaftarkan. Buka email konfirmasi dari Supabase untuk mengaktifkan akun. Cek juga folder Spam.",
      );
      return;
    }

    setUserEmail(result.data.user.email ?? email);
    setIsCloudMode(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("occurred_at", { ascending: false });
    if (error) {
      setIsAuthLoading(false);
      setErrorMessage(error.message);
      return;
    }
    setTransactions((data as TransactionRecord[]).map(transactionFromRecord));
    setIsAuthLoading(false);
    setShowAuthModal(false);
    setNotice("Berhasil terhubung ke akun Supabase.");
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setAuthFeedback("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMessage("Tambahkan URL dan anon key Supabase di file .env.local.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setIsAuthLoading(false);
      setErrorMessage(
        error.message.includes("Unsupported provider") ||
          error.message.includes("provider is not enabled")
          ? "Login Google belum diaktifkan di Supabase. Aktifkan provider Google di Authentication > Sign In / Providers."
          : error.message,
      );
    }
  }

  async function handleResendConfirmation() {
    const supabase = getSupabaseClient();
    if (!supabase || !confirmationEmail) {
      setErrorMessage("Email konfirmasi tidak bisa dikirim. Coba daftar kembali.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmationEmail,
    });
    setIsAuthLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setAuthFeedback(`Email konfirmasi dikirim ulang ke ${confirmationEmail}.`);
  }

  async function handleSignOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setIsCloudMode(false);
    setUserEmail("");
    setShowProfileMenu(false);
    setTransactions(makeDemoTransactions());
    setNotice("Kamu keluar dari akun. Data demo ditampilkan.");
  }

  function handleSaveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("budget"));
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Isi batas anggaran yang lebih besar dari nol.");
      return;
    }
    window.localStorage.setItem("teman-uang-monthly-budget", String(amount));
    setBudgetLimit(amount);
    setShowBudgetModal(false);
    setNotice("Batas anggaran berhasil diperbarui.");
  }

  const navItems: { key: View; label: string; icon: typeof Home }[] = [
    { key: "overview", label: "Ringkasan", icon: Home },
    { key: "transactions", label: "Transaksi", icon: FileText },
    { key: "budget", label: "Anggaran", icon: Target },
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${showMobileNav ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={() => setActiveView("overview")}>
          <span className="brand-mark"><Wallet size={19} strokeWidth={2.2} /></span>
          <span>teman<span className="brand-light">uang</span></span>
        </a>

        <div className="workspace-label">MENU UTAMA</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              className={`nav-link ${activeView === key ? "nav-link-active" : ""}`}
              key={key}
              onClick={() => {
                setActiveView(key);
                setShowMobileNav(false);
              }}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {key === "transactions" && <span className="nav-count">{monthTransactions.length}</span>}
            </button>
          ))}
        </nav>

        <div className="workspace-label second-label">LAINNYA</div>
        <button className="nav-link" onClick={() => setNotice("Bantuan akan segera hadir.")}>
          <CircleHelp size={18} strokeWidth={1.9} /><span>Bantuan</span>
        </button>
        <button className="nav-link" onClick={() => setNotice("Pengaturan akan segera hadir.")}>
          <Settings size={18} strokeWidth={1.9} /><span>Pengaturan</span>
        </button>

        <div className="sidebar-bottom">
          <div className="side-tip">
            <span className="tip-icon"><Sparkles size={16} /></span>
            <p>Langkah kecil hari ini, bikin keuangan lebih berarti.</p>
            <span className="tip-doodle">✳</span>
          </div>
          <div className="profile-card">
            <div className="avatar">{isCloudMode ? userEmail.slice(0, 1).toUpperCase() : "A"}</div>
            <div className="profile-copy">
              <strong>{isCloudMode ? userEmail.split("@")[0] : "Akun demo"}</strong>
              <span>{isCloudMode ? "Supabase" : "Data tersimpan lokal"}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Buka menu" onClick={() => setShowMobileNav(!showMobileNav)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumb"><span>Keuangan</span><span className="crumb-slash">/</span><strong>
            {activeView === "overview" ? "Ringkasan" : activeView === "transactions" ? "Transaksi" : "Anggaran"}
          </strong></div>
          <div className="topbar-actions">
            <div className="month-pill"><CalendarDays size={15} /><span>{monthLabel}</span><ChevronDown size={14} /></div>
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                className="top-avatar"
                aria-label="Menu profil"
                aria-expanded={showProfileMenu}
                aria-controls="profile-menu-list"
                title={isCloudMode ? userEmail : "Akun demo"}
                onClick={() => setShowProfileMenu((open) => !open)}
              >
                {isCloudMode ? userEmail.slice(0, 1).toUpperCase() : "A"}
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown" id="profile-menu-list" role="group" aria-label="Akun">
                  <div className="profile-dropdown-account">
                    <strong>{isCloudMode ? userEmail : "Akun demo"}</strong>
                    <span>{isCloudMode ? "Akun terhubung" : "Data tersimpan lokal"}</span>
                  </div>
                  {isCloudMode ? (
                    <button className="profile-dropdown-action" onClick={() => void handleSignOut()}>
                      <LogOut size={16} /> Keluar
                    </button>
                  ) : supabaseConfigured ? (
                    <button className="profile-dropdown-action" onClick={() => {
                      setShowProfileMenu(false);
                      setShowAuthModal(true);
                    }}>
                      <ArrowUpRight size={16} /> Hubungkan akun
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeView === "overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot" /> FINANCIAL SNAPSHOT</div>
                  <h1>Uangmu, lebih <span>terarah.</span></h1>
                  <p className="page-subtitle">Hai! Yuk intip kondisi keuanganmu bulan ini.</p>
                </div>
                <button className="primary-button add-button" onClick={() => setShowTransactionModal(true)}>
                  <Plus size={18} strokeWidth={2.2} /> Catat transaksi
                </button>
              </section>

              {!isCloudMode && (
                <div className="demo-banner">
                  <span className="demo-sparkle"><Sparkles size={15} /></span>
                  <span><strong>Mode demo aktif.</strong> Data hanya tersimpan di browser ini.</span>
                  {supabaseConfigured ? (
                    <button onClick={() => setShowAuthModal(true)}>Hubungkan Supabase <ArrowRight size={14} /></button>
                  ) : (
                    <span className="demo-hint">Tambahkan kredensial Supabase untuk menyimpan data online.</span>
                  )}
                </div>
              )}

              <section className="summary-grid" aria-label="Ringkasan keuangan">
                <article className="summary-card balance-card">
                  <div className="card-heading"><span>Total saldo</span><span className="card-icon wallet-icon"><Wallet size={17} /></span></div>
                  <div className="summary-amount">{rupiah(balance)}</div>
                  <div className="card-foot"><span className="positive-change"><TrendingUp size={13} /> Bulan ini</span><span className="foot-muted">dari pemasukan & pengeluaran</span></div>
                  <div className="balance-decoration decoration-one" /><div className="balance-decoration decoration-two" />
                </article>
                <article className="summary-card">
                  <div className="card-heading"><span>Pemasukan</span><span className="card-icon income-icon"><ArrowDownLeft size={17} /></span></div>
                  <div className="summary-amount">{rupiah(totalIncome)}</div>
                  <div className="card-foot"><span className="card-description">Total pemasukan bulan ini</span></div>
                </article>
                <article className="summary-card">
                  <div className="card-heading"><span>Pengeluaran</span><span className="card-icon expense-icon"><ArrowUpRight size={17} /></span></div>
                  <div className="summary-amount">{rupiah(totalExpense)}</div>
                  <div className="card-foot"><span className="card-description">Total pengeluaran bulan ini</span></div>
                </article>
              </section>

              <section className="dashboard-grid">
                <article className="panel spending-panel">
                  <div className="panel-heading">
                    <div><h2>Arus keuangan</h2><p>Ringkasan pemasukan dan pengeluaranmu</p></div>
                    <button className="select-pill" onClick={() => setNotice("Menampilkan data bulan ini.")}>Bulan ini <ChevronDown size={14} /></button>
                  </div>
                  <div className="chart-legend">
                    <span><i className="legend-dot income-dot" /> Pemasukan</span>
                    <span><i className="legend-dot expense-dot" /> Pengeluaran</span>
                  </div>
                  <div className="chart-area">
                    <div className="chart-y-labels">{chartTicks.map((tick, index) => <span key={index}>{tick}</span>)}</div>
                    <div className="chart-plot">
                      <div className="chart-grid-lines"><i /><i /><i /><i /><i /></div>
                      <div className="bar-groups">
                        {weeks.map((week, index) => (
                          <div className="bar-group" key={index}>
                            <div className="bars">
                              <div className="bar income-bar" style={{ height: `${(week.income / chartScale) * 100}%` }} title={`Pemasukan ${rupiah(week.income)}`} />
                              <div className="bar expense-bar" style={{ height: `${(week.expense / chartScale) * 100}%` }} title={`Pengeluaran ${rupiah(week.expense)}`} />
                            </div>
                            <span>Minggu {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-summary"><span><span className="summary-dot green" /> Pemasukan <strong>{rupiah(totalIncome)}</strong></span><span><span className="summary-dot coral" /> Pengeluaran <strong>{rupiah(totalExpense)}</strong></span></div>
                </article>

                <article className="panel budget-panel">
                  <div className="panel-heading">
                    <div><h2>Anggaran bulanan</h2><p>Jaga pengeluaran tetap terkendali</p></div>
                    <button className="icon-button more-button" aria-label="Opsi anggaran"><Ellipsis size={20} /></button>
                  </div>
                  <div className="budget-total-row"><strong>{rupiah(totalExpense)}</strong><span>dari {rupiah(budgetLimit)}</span></div>
                  <div className="budget-track"><div className={`budget-fill ${budgetProgress > 85 ? "budget-warning" : ""}`} style={{ width: `${budgetProgress}%` }} /></div>
                  <div className="budget-meta"><span>{Math.round(budgetProgress)}% terpakai</span><span>{rupiah(Math.max(budgetLimit - totalExpense, 0))} tersisa</span></div>
                  <div className="budget-divider" />
                  <div className="budget-insight"><span className="insight-icon"><Sparkles size={15} /></span><span>{biggestCategory ? `${biggestCategory[0]} jadi pengeluaran terbesarmu bulan ini.` : "Catat transaksi untuk mulai melihat insight."}</span></div>
                  <button className="text-link" onClick={() => setActiveView("budget")}>Lihat detail anggaran <ArrowRight size={15} /></button>
                </article>
              </section>

              <section className="lower-grid">
                <article className="panel transactions-panel">
                  <div className="panel-heading">
                    <div><h2>Transaksi terbaru</h2><p>Aktivitas keuangan bulan ini</p></div>
                    <button className="text-link header-link" onClick={() => setActiveView("transactions")}>Lihat semua <ArrowRight size={15} /></button>
                  </div>
                  <TransactionList transactions={recentTransactions} />
                </article>
                <article className="panel category-panel">
                  <div className="panel-heading"><div><h2>Pengeluaran per kategori</h2><p>Kemana saja uangmu pergi</p></div></div>
                  {expenseByCategory.length ? (
                    <div className="category-list">
                      {expenseByCategory.slice(0, 4).map(([category, amount]) => (
                        <div className="category-row" key={category}>
                          <span className="category-icon" style={{ color: categoryColors[category] ?? categoryColors.Lainnya, backgroundColor: `${categoryColors[category] ?? categoryColors.Lainnya}1c` }}>{categoryIcon(category)}</span>
                          <span className="category-name">{category}</span>
                          <div className="category-bar"><i style={{ width: `${Math.max((amount / (biggestCategory?.[1] ?? amount)) * 100, 8)}%`, backgroundColor: categoryColors[category] ?? categoryColors.Lainnya }} /></div>
                          <strong>{rupiah(amount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState message="Belum ada pengeluaran bulan ini." />}
                </article>
              </section>
            </>
          )}

          {activeView === "transactions" && (
            <section className="subpage">
              <div className="welcome-row">
                <div><div className="eyebrow"><span className="eyebrow-dot" /> CATATAN KEUANGAN</div><h1>Semua <span>transaksi.</span></h1><p className="page-subtitle">Lihat dan kelola pemasukan serta pengeluaranmu.</p></div>
                <button className="primary-button add-button" onClick={() => setShowTransactionModal(true)}><Plus size={18} /> Catat transaksi</button>
              </div>
              <article className="panel transactions-full-panel">
                <div className="panel-heading transaction-toolbar">
                  <div><h2>Transaksi bulan ini</h2><p>{monthTransactions.length} transaksi tercatat</p></div>
                  <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari transaksi..." /></label>
                </div>
                <TransactionList transactions={filteredTransactions} />
              </article>
            </section>
          )}

          {activeView === "budget" && (
            <section className="subpage">
              <div className="welcome-row">
                <div><div className="eyebrow"><span className="eyebrow-dot" /> RENCANA BULANAN</div><h1>Atur <span>anggaranmu.</span></h1><p className="page-subtitle">Tetap mindful tanpa harus berhenti menikmati hidup.</p></div>
                <button className="primary-button add-button" onClick={() => setShowBudgetModal(true)}><Plus size={18} /> Atur anggaran</button>
              </div>
              <div className="budget-overview-grid">
                <article className="panel budget-main-card">
                  <div className="budget-card-top"><span className="card-icon wallet-icon"><Target size={17} /></span><span className="budget-caption">ANGGARAN BULAN INI</span></div>
                  <div className="budget-big-number">{rupiah(budgetLimit)}</div>
                  <p>Batas pengeluaran yang kamu tetapkan</p>
                  <div className="budget-track large-track"><div className={`budget-fill ${budgetProgress > 85 ? "budget-warning" : ""}`} style={{ width: `${budgetProgress}%` }} /></div>
                  <div className="budget-meta"><span>{rupiah(totalExpense)} sudah digunakan</span><span>{Math.round(budgetProgress)}%</span></div>
                  <div className="budget-note"><Sparkles size={16} /> {budgetProgress > 85 ? "Anggaranmu hampir habis. Yuk lebih mindful!" : "Kamu masih punya ruang untuk pengeluaran bulan ini."}</div>
                </article>
                <article className="panel budget-stat-card"><span className="budget-stat-icon"><ArrowDownRight size={18} /></span><span className="budget-caption">RATA-RATA HARIAN</span><strong>{rupiah(dailyAverage)}</strong><p>Pengeluaran rata-rata per hari</p></article>
                <article className="panel budget-stat-card"><span className="budget-stat-icon coral-stat"><Wallet size={18} /></span><span className="budget-caption">SISA ANGGARAN</span><strong>{rupiah(Math.max(budgetLimit - totalExpense, 0))}</strong><p>Sisa batas pengeluaranmu</p></article>
              </div>
              <article className="panel budget-category-panel">
                <div className="panel-heading"><div><h2>Rincian pengeluaran</h2><p>Pengeluaranmu berdasarkan kategori</p></div></div>
                {expenseByCategory.length ? <div className="category-list budget-category-list">
                  {expenseByCategory.map(([category, amount]) => (
                    <div className="category-row" key={category}>
                      <span className="category-icon" style={{ color: categoryColors[category] ?? categoryColors.Lainnya, backgroundColor: `${categoryColors[category] ?? categoryColors.Lainnya}1c` }}>{categoryIcon(category)}</span>
                      <span className="category-name">{category}</span>
                      <div className="category-bar"><i style={{ width: `${Math.max((amount / (biggestCategory?.[1] ?? amount)) * 100, 8)}%`, backgroundColor: categoryColors[category] ?? categoryColors.Lainnya }} /></div>
                      <strong>{rupiah(amount)}</strong>
                    </div>
                  ))}
                </div> : <EmptyState message="Belum ada pengeluaran bulan ini." />}
              </article>
            </section>
          )}

          <footer className="app-footer"><span>Made with care for your everyday money <span className="footer-heart">♥</span></span><span>TemanUang © {today.getFullYear()}</span></footer>
        </div>
      </section>

      {showMobileNav && <button className="mobile-backdrop" aria-label="Tutup menu" onClick={() => setShowMobileNav(false)} />}
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}</div>}
      {errorMessage && (
        <div className="error-toast" role="alert">
          <span>{errorMessage}</span><button aria-label="Tutup pesan" onClick={() => setErrorMessage("")}><X size={15} /></button>
        </div>
      )}

      {showTransactionModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowTransactionModal(false);
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
            <div className="modal-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> TRANSAKSI BARU</div><h2 id="transaction-modal-title">Catat transaksi</h2></div><button className="icon-button" aria-label="Tutup" onClick={() => setShowTransactionModal(false)}><X size={20} /></button></div>
            <form className="transaction-form" onSubmit={(event) => void handleAddTransaction(event)}>
              <div className="form-field"><span className="form-label">Jenis transaksi</span><div className="type-toggle"><label><input type="radio" name="type" value="expense" defaultChecked /><span><ArrowUpRight size={15} /> Pengeluaran</span></label><label><input type="radio" name="type" value="income" /><span><ArrowDownLeft size={15} /> Pemasukan</span></label></div></div>
              <label>Nominal<div className="amount-input"><span>Rp</span><input name="amount" type="number" min="1" step="1" placeholder="0" required autoFocus /></div></label>
              <label>Kategori<select name="category" defaultValue="Makanan">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Catatan <span className="optional-label">opsional</span><input name="description" type="text" placeholder="Contoh: makan siang di dekat kantor" /></label>
              <label>Tanggal<input name="date" type="date" defaultValue={today.toISOString().slice(0, 10)} required /></label>
              <button className="primary-button submit-button" type="submit"><Plus size={17} /> Simpan transaksi</button>
            </form>
          </section>
        </div>
      )}

      {showBudgetModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowBudgetModal(false);
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="budget-modal-title">
            <div className="modal-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> RENCANA BULANAN</div><h2 id="budget-modal-title">Atur anggaran</h2></div><button className="icon-button" aria-label="Tutup" onClick={() => setShowBudgetModal(false)}><X size={20} /></button></div>
            <p className="auth-intro">Tentukan batas total pengeluaran yang ingin kamu jaga setiap bulan.</p>
            <form className="transaction-form" onSubmit={handleSaveBudget}>
              <label>Batas pengeluaran bulanan<div className="amount-input"><span>Rp</span><input name="budget" type="number" min="1" step="10000" defaultValue={budgetLimit} required autoFocus /></div></label>
              <p className="budget-storage-note">Pengaturan anggaran disimpan di browser ini.</p>
              <button className="primary-button submit-button" type="submit"><Check size={17} /> Simpan anggaran</button>
            </form>
          </section>
        </div>
      )}

      {showAuthModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowAuthModal(false);
        }}>
          <section className="modal-card auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="modal-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> SIMPAN DATA ONLINE</div><h2 id="auth-modal-title">{authMode === "login" ? "Selamat datang lagi" : "Buat akun baru"}</h2></div><button className="icon-button" aria-label="Tutup" onClick={() => setShowAuthModal(false)}><X size={20} /></button></div>
            {!supabaseConfigured ? (
              <div className="setup-instructions"><p>Hubungkan project Supabase untuk menyimpan transaksimu secara online.</p><ol><li>Buat project di Supabase.</li><li>Salin <strong>Project URL</strong> dan <strong>anon key</strong>.</li><li>Isi keduanya di file <code>.env.local</code>, lalu jalankan ulang aplikasi.</li><li>Jalankan SQL dari <code>supabase/schema.sql</code> di SQL Editor.</li></ol><button className="secondary-button" onClick={() => setShowAuthModal(false)}>Mengerti</button></div>
            ) : (
              <>
                {confirmationEmail ? (
                  <div className="auth-confirmation" role="status">
                    <span className="confirmation-icon"><Check size={19} /></span>
                    <h3>Cek email kamu</h3>
                    <p>{authFeedback}</p>
                    <button className="secondary-button resend-button" onClick={() => void handleResendConfirmation()} disabled={isAuthLoading}>
                      {isAuthLoading ? "Mengirim..." : "Kirim ulang email konfirmasi"}
                    </button>
                    <button className="confirmation-login" onClick={() => { setConfirmationEmail(""); setAuthFeedback(""); setAuthMode("login"); }}>
                      Kembali ke masuk
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="auth-intro">Masuk atau daftar untuk menyimpan transaksi dengan aman di akun pribadimu.</p>
                    <button className="google-button" onClick={() => void handleGoogleSignIn()} disabled={isAuthLoading}>
                      <Globe size={17} /> {isAuthLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
                    </button>
                    <div className="auth-divider"><span>atau pakai email</span></div>
                    <form className="transaction-form" onSubmit={(event) => void handleAuth(event)}>
                      <label>Email<input name="email" type="email" placeholder="kamu@email.com" autoComplete="email" required /></label>
                      <label>Password<input name="password" type="password" minLength={6} placeholder="Minimal 6 karakter" autoComplete={authMode === "login" ? "current-password" : "new-password"} required /></label>
                      <button className="primary-button submit-button" type="submit" disabled={isAuthLoading}>{isAuthLoading ? "Memproses..." : authMode === "login" ? "Masuk ke akun" : "Buat akun"}</button>
                    </form>
                    <p className="auth-switch">{authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?"} <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setErrorMessage(""); setAuthFeedback(""); }}>{authMode === "login" ? "Daftar" : "Masuk"}</button></p>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return <EmptyState message="Belum ada transaksi. Yuk catat yang pertama!" />;
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <div className="transaction-row" key={transaction.id}>
          <span className={`transaction-icon ${transaction.type === "income" ? "transaction-income" : ""}`} style={transaction.type === "expense" ? { color: categoryColors[transaction.category] ?? categoryColors.Lainnya, backgroundColor: `${categoryColors[transaction.category] ?? categoryColors.Lainnya}1c` } : undefined}>
            {transaction.type === "income" ? <ArrowDownLeft size={17} /> : categoryIcon(transaction.category)}
          </span>
          <span className="transaction-copy"><strong>{transaction.description || transaction.category}</strong><span>{transaction.category} · {displayDate(transaction.date)}</span></span>
          <strong className={`transaction-amount ${transaction.type === "income" ? "amount-income" : ""}`}>{transaction.type === "income" ? "+" : "−"}{rupiah(transaction.amount)}</strong>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="empty-state"><span><Wallet size={19} /></span><p>{message}</p></div>;
}
