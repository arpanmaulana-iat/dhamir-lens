export function bootManuscriptUI() {
  if (typeof document === "undefined") return;

  ["dl-theme-fab", "dl-menu-btn", "dl-scrim", "dl-drawer", "dl-quick-dock", "dl-top-btn"].forEach((id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
  });

  const K_THEME = "dhamir-lens-theme-v4";
  const K_SCALE = "dhamir-lens-arab-scale";
  const K_FONT  = "dhamir-lens-arab-font";
  const K_GAP   = "dhamir-lens-arab-gap";
  const K_FOCUS = "dhamir-lens-focus";

  let theme = localStorage.getItem(K_THEME) || localStorage.getItem("dhamir-lens-theme-v3") || "kertas";
  let arabScale = localStorage.getItem(K_SCALE) || "md";
  let arabFont = localStorage.getItem(K_FONT) || "scheherazade";
  let arabGap = localStorage.getItem(K_GAP) || "standar";
  let focusOn = localStorage.getItem(K_FOCUS) === "on";

  const THEME_COLORS = { kertas: "#FBF6EC", sepia: "#F3E8D1", zamrud: "#031915" };

  const triggerResize = () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 260);
  };

  const updateMetaTheme = (t) => {
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "theme-color");
      document.head.appendChild(m);
    }
    m.setAttribute("content", THEME_COLORS[t] || "#FBF6EC");
  };

  const applyAll = () => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-arab-scale", arabScale);
    root.setAttribute("data-arab-font", arabFont);
    root.setAttribute("data-arab-gap", arabGap);
    root.setAttribute("data-focus", focusOn ? "on" : "off");
    localStorage.setItem(K_THEME, theme);
    localStorage.setItem(K_SCALE, arabScale);
    localStorage.setItem(K_FONT, arabFont);
    localStorage.setItem(K_GAP, arabGap);
    localStorage.setItem(K_FOCUS, focusOn ? "on" : "off");
    updateMetaTheme(theme);

    document.querySelectorAll("[data-dl-theme]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-theme") === theme);
    });
    document.querySelectorAll("[data-dl-scale]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-scale") === arabScale);
    });
    document.querySelectorAll("[data-dl-font]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-font") === arabFont);
    });
    document.querySelectorAll("[data-dl-gap]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-gap") === arabGap);
    });
    const fBtn = document.getElementById("dl-focus-btn");
    if (fBtn) {
      fBtn.textContent = focusOn ? "✓ Mode Fokus Kanvas: Aktif" : "⤢ Mode Fokus Kanvas: Nonaktif";
    }
    triggerResize();
  };

  // 1. Tombol Strip Kiri Atas (☰) — Terpasang di Dalam <header> agar TIDAK pernah menimpa teks soal saat scroll!
  const menuBtn = document.createElement("button");
  menuBtn.id = "dl-menu-btn";
  menuBtn.type = "button";
  menuBtn.className = "dl-menu-btn";
  menuBtn.setAttribute("aria-label", "Buka Menu Studio Dhamir-Lens");
  menuBtn.title = "Menu & Studio Manuskrip";
  menuBtn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="15" y2="18"/></svg>';

  const mountMenuInHeader = () => {
    const hdr = document.querySelector("header");
    if (hdr) {
      if (menuBtn.parentNode !== hdr) hdr.appendChild(menuBtn);
      return true;
    }
    return false;
  };
  if (!mountMenuInHeader()) {
    const obs = new MutationObserver(() => {
      if (mountMenuInHeader()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { mountMenuInHeader(); obs.disconnect(); }, 2500);
  }

  // Ikon SVG bersih untuk Drawer
  const svgIcon = (path) =>
    `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--dl-gold)">${path}</svg>`;

  const IC = {
    home: svgIcon('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>'),
    map: svgIcon('<circle cx="12" cy="12" r="9"/><polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8"/>'),
    book: svgIcon('<path d="M2 4h7a4 4 0 0 1 3 1.4A4 4 0 0 1 15 4h7v15h-7a3 3 0 0 0-3 2 3 3 0 0 0-3-2H2z"/><line x1="12" y1="5.4" x2="12" y2="21"/>'),
    gloss: svgIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>'),
    quiz: svgIcon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>')
  };

  // 2. Scrim + Studio Drawer
  const scrim = document.createElement("div");
  scrim.id = "dl-scrim";
  scrim.className = "dl-scrim";

  const drawer = document.createElement("aside");
  drawer.id = "dl-drawer";
  drawer.className = "dl-drawer";
  drawer.setAttribute("aria-label", "Menu Studio Dhamir-Lens");
  drawer.innerHTML = `
    <div class="dl-drawer-head">
      <div class="dl-drawer-brand">
        <span style="width:36px;height:36px;border-radius:10px;border:1.5px solid var(--dl-line-strong);background:var(--dl-surf);display:grid;place-items:center;font-family:'Amiri',serif;font-size:21px;font-weight:700;color:var(--dl-gold)">ض</span>
        <div>
          <b>Dhamir-Lens</b>
          <small>Studio Manuskrip IAT</small>
        </div>
      </div>
      <button type="button" class="dl-drawer-close" id="dl-drawer-close" aria-label="Tutup Menu">✕</button>
    </div>
    <div class="dl-drawer-body">
      <div>
        <div class="dl-sec-title">Navigasi Utama</div>
        <div class="dl-nav-list">
          <button type="button" class="dl-nav-item" data-dl-tab="Beranda"><span class="dl-nav-left">${IC.home}<span>Beranda &amp; Definisi</span></span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Peta Ayat"><span class="dl-nav-left">${IC.map}<span>Peta Visualisasi Ayat</span></span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="9 Kaidah"><span class="dl-nav-left">${IC.book}<span>Himpunan 9 Kaidah</span></span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Glosarium"><span class="dl-nav-left">${IC.gloss}<span>Glosarium Istilah</span></span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Latihan"><span class="dl-nav-left">${IC.quiz}<span>Latihan &amp; Evaluasi</span></span><span>→</span></button>
        </div>
      </div>

      <div>
        <div class="dl-sec-title">Tema Manuskrip</div>
        <div class="dl-swatches">
          <button type="button" class="dl-sw" data-dl-theme="kertas" aria-label="Tema Kertas">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#FFFDF8 50%,#0F5C4A 50%)"></span>
            <span>Kertas</span>
          </button>
          <button type="button" class="dl-sw" data-dl-theme="sepia" aria-label="Tema Sepia">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#F3E6CC 50%,#6E3B13 50%)"></span>
            <span>Sepia</span>
          </button>
          <button type="button" class="dl-sw" data-dl-theme="zamrud" aria-label="Tema Zamrud">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#04211B 50%,#F2C866 50%)"></span>
            <span>Zamrud</span>
          </button>
        </div>
      </div>

      <div>
        <div class="dl-sec-title">Studio Baca Teks Arab</div>
        <div style="font-size:11.5px;color:var(--dl-muted);margin-bottom:6px;font-weight:600">Ukuran Khat Ayat (Auto-Sinkron Panah)</div>
        <div class="dl-pill-row" style="margin-bottom:10px">
          <button type="button" class="dl-pill" data-dl-scale="sm">A-</button>
          <button type="button" class="dl-pill" data-dl-scale="md">Normal</button>
          <button type="button" class="dl-pill" data-dl-scale="lg">A+</button>
          <button type="button" class="dl-pill" data-dl-scale="xl">A++</button>
        </div>
        <div style="font-size:11.5px;color:var(--dl-muted);margin-bottom:6px;font-weight:600">Jenis Khat Arab</div>
        <div class="dl-pill-row two" style="margin-bottom:10px">
          <button type="button" class="dl-pill" data-dl-font="scheherazade">Scheherazade</button>
          <button type="button" class="dl-pill" data-dl-font="amiri">Amiri Naskhi</button>
        </div>
        <div style="font-size:11.5px;color:var(--dl-muted);margin-bottom:6px;font-weight:600">Spasi Baris Ayat (Ruang Panah SVG)</div>
        <div class="dl-pill-row three" style="margin-bottom:10px">
          <button type="button" class="dl-pill" data-dl-gap="standar">Standar</button>
          <button type="button" class="dl-pill" data-dl-gap="lega">Lega</button>
          <button type="button" class="dl-pill" data-dl-gap="ekstra">Sangat Lega</button>
        </div>
        <button type="button" class="dl-action-btn" id="dl-focus-btn">⤢ Mode Fokus Kanvas: Nonaktif</button>
      </div>

      <div>
        <div class="dl-sec-title">Alat Akademik</div>
        <button type="button" class="dl-action-btn" id="dl-next-unanswered">⚡ Lompat ke Soal Belum Dijawab</button>
        <button type="button" class="dl-action-btn" id="dl-print-btn">🖨 Cetak / Simpan PDF (Catatan &amp; Rapor)</button>
      </div>

      <div class="dl-info-box">
        <b>Korpus Primer IAT</b><br>
        Kitab <em>Qawā‘id al-Tafsīr: Jam‘an wa Dirāsatan</em><br>
        Dr. Khālid bin ‘Uṡmān al-Sabt<br>
        Cet. Dār Ibn ‘Affān (1421 H / 2000 M), Jilid I, hlm. 398–419.<br><br>
        <b>Peneliti:</b> Arpan Maulana (1231030055)<br>
        Prodi Ilmu Al-Qur’an dan Tafsir (IAT)<br>
        Fakultas Ushuluddin • UIN Sunan Gunung Djati Bandung
      </div>
    </div>
  `;

  // 3. Quick Theme Switcher 3-Pill (Desktop Kanan Bawah)
  const quickDock = document.createElement("div");
  quickDock.id = "dl-quick-dock";
  quickDock.className = "dl-quick-dock";
  quickDock.innerHTML = `
    <button type="button" class="dl-qbtn" data-dl-theme="kertas" aria-label="Pilih Tema Kertas">☀ Kertas</button>
    <button type="button" class="dl-qbtn" data-dl-theme="sepia" aria-label="Pilih Tema Sepia">📜 Sepia</button>
    <button type="button" class="dl-qbtn" data-dl-theme="zamrud" aria-label="Pilih Tema Zamrud">☾ Zamrud</button>
  `;

  // 4. Tombol Kembali ke Atas (Back to Top)
  const topBtn = document.createElement("button");
  topBtn.id = "dl-top-btn";
  topBtn.type = "button";
  topBtn.className = "dl-top-btn";
  topBtn.setAttribute("aria-label", "Kembali ke atas");
  topBtn.title = "Kembali ke atas";
  topBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';

  document.body.appendChild(scrim);
  document.body.appendChild(drawer);
  document.body.appendChild(quickDock);
  document.body.appendChild(topBtn);

  const setOpen = (on) => {
    drawer.classList.toggle("open", on);
    scrim.classList.toggle("open", on);
    if (on) syncActiveTab();
  };

  const syncActiveTab = () => {
    const headerButtons = Array.from(document.querySelectorAll("header nav button"));
    let activeLabel = "";
    headerButtons.forEach((b) => {
      if (b.className.includes("bg-amber-400")) activeLabel = b.textContent.trim();
    });
    drawer.querySelectorAll("[data-dl-tab]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-tab") === activeLabel);
    });
  };

  const goTab = (label) => {
    const headerButtons = Array.from(document.querySelectorAll("header nav button"));
    const match = headerButtons.find((b) => b.textContent.trim() === label);
    if (match) match.click();
  };

  menuBtn.addEventListener("click", () => setOpen(true));
  scrim.addEventListener("click", () => setOpen(false));
  drawer.querySelector("#dl-drawer-close").addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  drawer.querySelectorAll("[data-dl-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      goTab(btn.getAttribute("data-dl-tab"));
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-dl-theme]").forEach((btn) => {
    btn.addEventListener("click", () => { theme = btn.getAttribute("data-dl-theme"); applyAll(); });
  });
  drawer.querySelectorAll("[data-dl-scale]").forEach((btn) => {
    btn.addEventListener("click", () => { arabScale = btn.getAttribute("data-dl-scale"); applyAll(); });
  });
  drawer.querySelectorAll("[data-dl-font]").forEach((btn) => {
    btn.addEventListener("click", () => { arabFont = btn.getAttribute("data-dl-font"); applyAll(); });
  });
  drawer.querySelectorAll("[data-dl-gap]").forEach((btn) => {
    btn.addEventListener("click", () => { arabGap = btn.getAttribute("data-dl-gap"); applyAll(); });
  });
  drawer.querySelector("#dl-focus-btn").addEventListener("click", () => { focusOn = !focusOn; applyAll(); });

  drawer.querySelector("#dl-next-unanswered").addEventListener("click", () => {
    setOpen(false);
    goTab("Latihan");
    setTimeout(() => {
      const pills = Array.from(document.querySelectorAll("main button.w-9.h-9.rounded-xl"));
      const firstUnanswered = pills.find((p) => p.className.includes("bg-stone-100"));
      if (firstUnanswered) {
        firstUnanswered.click();
        firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  });

  drawer.querySelector("#dl-print-btn").addEventListener("click", () => {
    setOpen(false);
    setTimeout(() => window.print(), 220);
  });

  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("show", window.scrollY > 360);
  }, { passive: true });

  // 5. Kolofon Akademik Lengkap Prodi IAT di Footer
  const addBar = () => {
    const f = document.querySelector("footer");
    if (f) {
      let d = f.querySelector(".dl-iat-badge-bar");
      if (!d) {
        d = document.createElement("div");
        d.className = "dl-iat-badge-bar";
        f.appendChild(d);
      }
      d.textContent =
        "✦ Program Studi Ilmu Al-Qur’an dan Tafsir (IAT) • Fakultas Ushuluddin • UIN Sunan Gunung Djati Bandung • Korpus: Qawā‘id al-Tafsīr (Dr. Khālid al-Sabt, Cet. Dār Ibn ‘Affān, Jilid I, hlm. 398–419) ✦";
    }
  };
  setTimeout(addBar, 250);
  setTimeout(addBar, 1200);

  applyAll();
}
