/* Menggantikan runtime platform (window.claude) supaya dashboard berjalan di GitHub Pages.
   db -> Firebase Firestore, user -> Firebase Auth (Google), assets -> Firebase Storage,
   sample -> Cloudflare Worker (pilihan), downloads -> muat turun pelayar.
   Tanpa tetapan Firebase: MOD DEMO (data dalam localStorage pelayar ini). */
(function () {
  var C = window.SKLB_CONFIG || {};
  var F = C.firebase || {};
  var live = !!(F.apiKey && !/GANTI/.test(F.apiKey) && window.firebase);
  var ns = {};

  /* ---------- downloads ---------- */
  ns.downloads = {
    save: async function (o) {
      var d = o.data;
      var blob = d instanceof Blob ? d : new Blob([d], { type: o.type || 'application/octet-stream' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = o.filename || 'fail';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      return { saved: true };
    }
  };

  /* ---------- sample (AI) ---------- */
  if (C.aiEndpoint) {
    var sample = async function (input, opts) {
      opts = opts || {};
      var r = await fetch(C.aiEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: String(input) }), signal: opts.signal
      });
      if (r.status === 429) throw { code: 'rate_limited', message: 'rate limited' };
      if (!r.ok) throw { code: 'error', message: 'AI error', text: '' };
      var j = await r.json(); var t = j.text || '';
      if (opts.onText) opts.onText({ text: t, delta: t });
      return { text: t, truncated: false };
    };
    ns.sample = sample;
  }

  /* ---------- banner kecil ---------- */
  function badge(txt) {
    var b = document.createElement('div');
    b.textContent = txt;
    b.style.cssText = 'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:99999;background:#d98200;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25)';
    document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(b); });
    if (document.body) document.body.appendChild(b);
  }

  if (live) {
    firebase.initializeApp(F);
    var auth = firebase.auth(), fs = firebase.firestore();
    var admins = (C.admins || []).map(function (s) { return String(s).toLowerCase(); });
    var authReady = new Promise(function (res) { var off = auth.onAuthStateChanged(function (u) { off(); res(u); }); });

    function loginButton() {
      function mk() {
        var b = document.createElement('button');
        b.textContent = 'Log masuk dengan Google';
        b.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:99999;background:#4a63e7;color:#fff;border:0;border-radius:999px;padding:10px 16px;font:600 13px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer';
        b.onclick = async function () {
          try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); location.reload(); }
          catch (e) { alert('Log masuk gagal: ' + (e && e.message || e)); }
        };
        document.body.appendChild(b);
      }
      if (document.body) mk(); else document.addEventListener('DOMContentLoaded', mk);
    }

    var userP = authReady.then(function (u) {
      if (!u) { loginButton(); return null; }
      var isAdmin = admins.indexOf((u.email || '').toLowerCase()) >= 0;
      return {
        id: async function () { return u.uid; },
        me: async function () { return { id: u.uid, name: u.displayName || u.email || '', email: u.email || '' }; },
        canEdit: async function () { return isAdmin; },
        isOwner: function () { return isAdmin; },
        can: function () { return null; },
        signOut: async function () { await auth.signOut(); location.reload(); }
      };
    });

    ns.user = userP;
    ns.db = userP.then(function (u) { return u ? fs : null; });

    if (C.useStorage && F.storageBucket) {
      ns.assets = userP.then(function (u) {
        if (!u) return null;
        return new Promise(function (res) {
          var s = document.createElement('script');
          s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js';
          s.onload = function () {
            var st = firebase.storage();
            res({
              upload: async function (file) {
                var uid = await u.id();
                var path = 'lampiran/' + uid + '/' + Date.now() + '_' + String(file.name || 'fail').replace(/[^\w.\-]+/g, '_');
                var snap = await st.ref(path).put(file, { contentType: file.type || 'application/octet-stream' });
                return { id: path, url: window.SKLB_BLOB(path), sizeBytes: file.size, contentType: file.type || snap.metadata.contentType };
              },
              list: async function () {
                var q = await fs.collection('lampiran').limit(1000).get(); var b = 0;
                q.docs.forEach(function (d) { b += (d.data().size || 0) * (d.data().assetId ? 1 : 0); });
                return { assets: [], usage: { bytes: b, maxBytes: C.storageMaxBytes || 1e9 } };
              },
              delete: async function (id) { await st.ref(id).delete(); }
            });
          };
          s.onerror = function () { res(null); };
          document.head.appendChild(s);
        });
      });
    }
    window.SKLB_BLOB = function (id) {
      return 'https://firebasestorage.googleapis.com/v0/b/' + F.storageBucket + '/o/' + encodeURIComponent(id) + '?alt=media';
    };
  } else {
    /* ---------- MOD DEMO: Firestore ringkas atas localStorage ---------- */
    badge('MOD DEMO: data disimpan dalam pelayar ini sahaja');
    var KEY = 'sklb_demo_db', store = {}, subs = [];
    try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { store = {}; }
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
    var clone = function (o) { return o === undefined ? o : JSON.parse(JSON.stringify(o)); };
    var notify = function () { subs.slice().forEach(function (s) { s(); }); };
    var uid = function () { return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
    function docSnap(path) {
      var ex = Object.prototype.hasOwnProperty.call(store, path);
      return { id: path.split('/').pop(), exists: ex, data: function () { return ex ? clone(store[path]) : undefined; }, ref: docRef(path) };
    }
    function docRef(path) {
      return {
        id: path.split('/').pop(), path: path,
        get: async function () { return docSnap(path); },
        set: async function (d, o) { store[path] = (o && o.merge && store[path]) ? Object.assign({}, store[path], clone(d)) : clone(d); save(); notify(); },
        update: async function (d) { if (!store[path]) throw new Error('not-found'); store[path] = Object.assign({}, store[path], clone(d)); save(); notify(); },
        delete: async function () { delete store[path]; save(); notify(); },
        collection: function (p) { return colRef(path + '/' + p); },
        onSnapshot: function (cb) { var f = function () { cb(docSnap(path)); }; subs.push(f); setTimeout(f, 0); return function () { subs = subs.filter(function (x) { return x !== f; }); }; }
      };
    }
    function colRef(path, filters, lim) {
      filters = filters || []; lim = lim || 1e9;
      function snap() {
        var depth = path.split('/').length + 1, pre = path + '/';
        var docs = Object.keys(store).filter(function (k) { return k.indexOf(pre) === 0 && k.split('/').length === depth; })
          .map(docSnap).filter(function (d) {
            var v = d.data();
            return filters.every(function (f) {
              var x = v[f[0]];
              return f[1] === '==' ? x === f[2] : f[1] === '>=' ? x >= f[2] : f[1] === '<=' ? x <= f[2] : f[1] === '>' ? x > f[2] : f[1] === '<' ? x < f[2] : true;
            });
          }).slice(0, lim);
        return { docs: docs, size: docs.length, empty: !docs.length, forEach: function (fn) { docs.forEach(fn); } };
      }
      return {
        doc: function (id) { return docRef(path + '/' + (id || uid())); },
        add: async function (d) { var r = docRef(path + '/' + uid()); await r.set(d); return r; },
        where: function (f, op, v) { return colRef(path, filters.concat([[f, op, v]]), lim); },
        limit: function (n) { return colRef(path, filters, n); },
        orderBy: function () { return colRef(path, filters, lim); },
        get: async function () { return snap(); },
        onSnapshot: function (cb) { var f = function () { cb(snap()); }; subs.push(f); setTimeout(f, 0); return function () { subs = subs.filter(function (x) { return x !== f; }); }; }
      };
    }
    ns.db = { doc: function (p) { return docRef(p); }, collection: function (p) { return colRef(p); } };
    ns.user = {
      id: async function () { return 'demo-admin'; },
      me: async function () { return { id: 'demo-admin', name: 'Admin (demo)', email: '' }; },
      canEdit: async function () { return true; }, isOwner: function () { return true; }, can: function () { return null; }
    };
    window.SKLB_BLOB = function () { return ''; };
  }

  window.claude = {
    use: async function (name) { return ns[name] ? await ns[name] : null; }
  };
})();
