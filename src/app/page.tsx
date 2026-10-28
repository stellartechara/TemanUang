import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: ArrowDownLeft,
    title: "Catat pemasukan & pengeluaran",
    description:
      "Simpan transaksi harian dengan kategori dan catatan agar jelas uangmu datang dan pergi untuk apa.",
  },
  {
    icon: Target,
    title: "Jaga anggaran bulanan",
    description:
      "Tentukan batas pengeluaran dan pantau pemakaiannya supaya rencana keuangan tetap terarah.",
  },
  {
    icon: Sparkles,
    title: "Lihat kebiasaanmu",
    description:
      "Ringkasan dan grafik sederhana membantu kamu memahami pola keuangan tanpa spreadsheet rumit.",
  },
];

export default function Page() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="TemanUang, beranda">
          <span className="landing-brand-mark"><Wallet size={19} /></span>
          <span>teman<span>uang</span></span>
        </Link>
        <nav className="landing-nav" aria-label="Navigasi halaman">
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
          <Link className="landing-nav-cta" href="/dashboard">Buka aplikasi <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span /> KEUANGAN HARIAN, LEBIH TERATUR</div>
          <h1>Tahu uangmu pergi ke mana, <span>tanpa ribet.</span></h1>
          <p>
            TemanUang bantu kamu mencatat pemasukan dan pengeluaran, melihat
            kebiasaan belanja, dan menjaga anggaran tetap sesuai rencana.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-primary-cta" href="/dashboard">Coba demo gratis <ArrowRight size={17} /></Link>
            <a className="landing-secondary-cta" href="#fitur">Kenali fiturnya</a>
          </div>
          <div className="landing-trust-note"><Check size={15} /> Bisa dicoba tanpa membuat akun</div>
        </div>

        <div className="landing-preview" aria-label="Contoh ringkasan keuangan">
          <div className="preview-window-bar"><span /><span /><span /><small>Ringkasan bulan ini</small></div>
          <div className="preview-content">
            <div className="preview-greeting"><span>RINGKASAN KEUANGAN</span><strong>Uangmu lebih terarah.</strong></div>
            <div className="preview-balance">
              <span><Wallet size={15} /> SALDO BULAN INI</span>
              <strong>Rp 4.365.000</strong>
              <small><ArrowUpRight size={13} /> Tersusun dari transaksi bulan ini</small>
            </div>
            <div className="preview-stats">
              <div><span>Pemasukan</span><strong><ArrowDownLeft size={14} /> Rp 6.500.000</strong></div>
              <div><span>Pengeluaran</span><strong><ArrowUpRight size={14} /> Rp 2.135.000</strong></div>
            </div>
            <div className="preview-budget">
              <div><span>Anggaran bulanan</span><strong>61%</strong></div>
              <i><b /></i>
              <small>Masih ada ruang untuk pengeluaranmu</small>
            </div>
            <div className="preview-footer"><span><span className="preview-dot" /> Data contoh</span><span>Privat & sederhana</span></div>
          </div>
          <div className="preview-float"><span><Sparkles size={16} /></span><div><strong>Lebih sadar</strong><small>mengelola uang</small></div></div>
        </div>
      </section>

      <section className="landing-features" id="fitur">
        <div className="landing-section-heading">
          <span>SEMUA YANG KAMU BUTUHKAN</span>
          <h2>Mulai dari hal sederhana.</h2>
          <p>Nggak perlu jadi ahli keuangan untuk mulai mengatur uang.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="landing-feature-card" key={title}>
              <span className="landing-feature-icon"><Icon size={19} /></span>
              <span className="landing-feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how" id="cara-kerja">
        <div>
          <span className="landing-section-kicker">MULAI DALAM HITUNGAN MENIT</span>
          <h2>Catat. Pahami. Atur.</h2>
          <p>Mulai dari demo, lalu hubungkan akun kalau ingin menyimpan data secara online.</p>
        </div>
        <ol>
          <li><span>1</span><div><strong>Coba dashboard demo</strong><small>Lihat contoh ringkasan dan transaksi tanpa daftar.</small></div></li>
          <li><span>2</span><div><strong>Catat transaksi sendiri</strong><small>Tambahkan pemasukan dan pengeluaran harianmu.</small></div></li>
          <li><span>3</span><div><strong>Simpan secara online</strong><small>Hubungkan akun Supabase saat siap menggunakan akunmu.</small></div></li>
        </ol>
      </section>

      <section className="landing-bottom-cta">
        <div><span>LANGKAH KECIL, DAMPAK BESAR</span><h2>Yuk, mulai lebih kenal dengan keuanganmu.</h2></div>
        <Link className="landing-primary-cta" href="/dashboard">Masuk ke TemanUang <ArrowRight size={17} /></Link>
      </section>

      <footer className="landing-footer">
        <Link className="landing-brand" href="/">
          <span className="landing-brand-mark"><Wallet size={17} /></span>
          <span>teman<span>uang</span></span>
        </Link>
        <span>Dibuat untuk membantu mengatur keuangan sehari-hari.</span>
      </footer>
    </main>
  );
}
