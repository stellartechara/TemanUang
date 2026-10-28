# TemanUang

Dashboard pencatatan keuangan pribadi yang dibangun dengan Next.js, TypeScript, dan Supabase. Aplikasi bisa langsung dicoba dalam mode demo; data demo disimpan di browser. Setelah Supabase dikonfigurasi, pengguna bisa masuk atau membuat akun untuk menyimpan transaksi secara online.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman pengenalan TemanUang. Pilih **Coba demo gratis** atau **Buka aplikasi** untuk membuka dashboard di `/dashboard`.

## Menghubungkan Supabase

1. Buat project di [Supabase](https://supabase.com/).
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari pengaturan API project Supabase.
4. Jalankan isi [`supabase/schema.sql`](./supabase/schema.sql) lewat SQL Editor di dashboard Supabase.
5. Mulai ulang server development.
6. Di dashboard, buka menu avatar kanan atas, pilih **Hubungkan akun**, lalu masuk atau daftar dengan email dan password.

Row Level Security pada tabel `transactions` membatasi setiap pengguna hanya dapat membaca dan mengubah transaksinya sendiri. Jangan pernah menaruh service-role key di variabel `NEXT_PUBLIC_*` atau di browser.

## Konfigurasi redirect dan login Google

Di dashboard Supabase, buka **Authentication > URL Configuration**:

- Saat development, set **Site URL** ke `http://localhost:3000`.
- Tambahkan `http://localhost:3000/**` ke **Redirect URLs**. Jika Next.js berjalan di port lain, tambahkan origin dan port tersebut juga.
- Untuk deployment, set Site URL ke domain aplikasi dan tambahkan domain itu ke Redirect URLs.

Saat daftar, link konfirmasi akan kembali ke origin aplikasi yang sedang dibuka. Untuk localhost, buka link di komputer yang sama saat server `npm run dev` sedang berjalan. Jika link lama masih mengarah ke alamat yang salah, kirim ulang email konfirmasi setelah pengaturan redirect diperbarui.

Untuk login Google:

1. Di Supabase, buka **Authentication > Sign In / Providers**, pilih **Google**, lalu aktifkan providernya dan isi OAuth Client ID serta Client Secret dari Google Cloud.
2. Salin **Callback URL** yang ditampilkan Supabase ke bagian Authorized redirect URIs di Google Cloud. Biasanya berbentuk `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Simpan perubahan di kedua dashboard. Tanpa mengaktifkan provider dan memasukkan kredensial OAuth, login Google akan ditolak oleh Supabase.

Untuk keluar dari akun, buka menu avatar kanan atas lalu pilih **Keluar**.

## Fitur MVP

- Ringkasan saldo, pemasukan, dan pengeluaran bulanan.
- Pencatatan pemasukan atau pengeluaran dengan kategori, tanggal, dan catatan.
- Riwayat dan pencarian transaksi.
- Grafik arus keuangan serta rincian pengeluaran per kategori.
- Ringkasan batas anggaran bulanan.
- Mode demo lokal dan autentikasi Supabase.

Transaksi akun demo disimpan di browser. Transaksi akun Supabase tersimpan di database; pengaturan batas anggaran saat ini disimpan lokal di browser.

## Perintah

```bash
npm run dev
npm run lint
npm run build
```
