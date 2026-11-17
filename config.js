/* Tetapan laman. Edit fail ini sahaja. */
window.SKLB_CONFIG = {
  /* 1) Tampal tetapan Firebase anda di sini (Firebase Console > Project settings > Your apps > Web app).
        Selagi nilai ini belum diganti, laman berjalan dalam MOD DEMO (data disimpan dalam pelayar sendiri sahaja). */
  firebase: {
    apiKey: "GANTI_APIKEY",
    authDomain: "GANTI.firebaseapp.com",
    projectId: "GANTI",
    storageBucket: "GANTI.firebasestorage.app",
    appId: "GANTI"
  },

  /* 2) E-mel Google admin sekolah (huruf kecil). Mesti sama dengan senarai dalam firestore.rules. */
  admins: ["admin@contoh.com"],

  /* 3) Muat naik fail dalam Arkib dokumen memerlukan Firebase Storage (pelan Blaze). Biar false jika tidak guna. */
  useStorage: false,
  storageMaxBytes: 1000000000,

  /* 4) Pembantu AI (butang "Tanya"). Kosongkan jika tidak guna. Isi URL Cloudflare Worker dari folder ai-proxy/. */
  aiEndpoint: ""
};
