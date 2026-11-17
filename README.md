# Dashboard SK Langkabong 2026 (GitHub Pages)

UI, imej dan data terbina dalam laman ini sama seperti versi asal. Perbezaannya hanya di belakang tabir:
pangkalan data dan log masuk kini guna **Firebase** (percuma), kerana GitHub Pages hanya hos fail statik.

## Cuba dahulu (tanpa Firebase)
Selagi `config.js` belum diisi, laman berjalan dalam **MOD DEMO**: semua fungsi boleh dicuba,
tetapi data disimpan dalam pelayar anda sahaja.

## A. Sediakan Firebase (sekali sahaja)
1. https://console.firebase.google.com > **Add project**.
2. **Build > Authentication > Get started > Sign-in method > Google > Enable**.
3. **Build > Firestore Database > Create database** (mod production).
4. Tab **Rules**: tampal isi `firestore.rules`, tukar `admin@contoh.com` kepada e-mel Google admin, kemudian **Publish**.
5. **Project settings > Your apps > Web (</>)**: daftar app, salin `firebaseConfig` ke dalam `config.js`.
6. Dalam `config.js`, tukar `admins` kepada e-mel admin yang sama seperti dalam rules.

## B. Deploy ke GitHub Pages
1. Cipta repo baharu di GitHub, muat naik SEMUA fail (termasuk folder `pages/` dan fail `.nojekyll`).
2. Repo > **Settings > Pages** > Deploy from a branch > `main` > `/ (root)` > Save.
3. Tunggu seminit. Laman ada di `https://NAMAANDA.github.io/NAMAREPO/`.
4. Firebase > Authentication > **Settings > Authorized domains** > tambah `NAMAANDA.github.io`.

Buka laman, tekan **Log masuk dengan Google**. E-mel admin menjadi Admin sistem.
Guru log masuk Google, hantar permohonan, dan admin luluskan seperti biasa.

## C. Pembantu AI (pilihan)
Guna Gemini melalui Cloudflare Worker supaya kunci tidak terdedah:
1. Cloudflare > Workers > Create > tampal `ai-proxy/worker.js`.
2. Variables and Secrets: `GEMINI_API_KEY` (Secret, guna kunci BARU), `ALLOWED_ORIGIN` = `https://NAMAANDA.github.io`.
3. Salin URL worker ke `aiEndpoint` dalam `config.js`.
Kunci Gemini yang pernah ditampal dalam sembang perlu di-revoke.

## D. Muat naik fail dalam Arkib dokumen (pilihan)
Perlu Firebase Storage (kini pelan Blaze). Biar `useStorage: false` jika tidak guna;
lampiran jenis pautan dan nota masih berfungsi.

## Perhatian
- Repo awam bermakna imej dalam `pages/` boleh dilihat sesiapa yang tahu URL. Jangan letak dokumen sulit.
- Kunci Firebase dalam `config.js` memang awam; keselamatan datang daripada `firestore.rules`.
- Pembantu AI di sini tidak boleh memanggil alat dalaman dashboard seperti dalam platform asal.
