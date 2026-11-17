/* Tetapan laman. Edit fail ini sahaja. */
window.SKLB_CONFIG = {
  /* 1) Tampal tetapan Firebase anda di sini (Firebase Console > Project settings > Your apps > Web app).
        Selagi nilai ini belum diganti, laman berjalan dalam MOD DEMO (data disimpan dalam pelayar sendiri sahaja). */
  firebaseConfig: {
    apiKey: "AIzaSyC3HzKmcbTs7XkJMZtWx0MFp6TVSi9fcWA",
    authDomain: "pembantu-sk-langkabong.firebaseapp.com",
    projectId: "pembantu-sk-langkabong",
    storageBucket: "pembantu-sk-langkabong.firebasestorage.app",
    messagingSenderId: "858639087748",
    appId: "1:858639087748:web:ed6cf9e830bf36bfa4ead1",
    measurementId: "G-0RPHHYHNB9"
  },

  /* 2) E-mel Google admin sekolah (huruf kecil). Mesti sama dengan senarai dalam firestore.rules. */
  admins: ["ricxleyjohn@gmail.com"],

  /* 3) Muat naik fail dalam Arkib dokumen memerlukan Firebase Storage (pelan Blaze). Biar false jika tidak guna. */
  useStorage: false,
  storageMaxBytes: 1000000000,

  /* 4) Pembantu AI (butang "Tanya"). Kosongkan jika tidak guna. Isi URL Cloudflare Worker dari folder ai-proxy/. */
  aiEndpoint: "https://sk-langkabong-ai.tdr8jf8k2j.workers.dev/"
};
