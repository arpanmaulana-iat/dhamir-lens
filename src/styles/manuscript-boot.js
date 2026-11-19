export function bootManuscriptUI() {
  if (typeof document === "undefined") return;

  ["dl-theme-fab", "dl-menu-btn", "dl-scrim", "dl-drawer", "dl-quick-dock"].forEach((id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
  });

  const K_THEME = "dhamir-lens-theme-v3";
  const K_SCALE = "dhamir-lens-arab-scale";
  const K_FONT  = "dhamir-lens-arab-font";
  const K_FOCUS = "dhamir-lens-focus";

  let theme = localStorage.getItem(K_THEME) || "kertas";
  let arabScale = localStorage.getItem(K_SCALE) || "md";
  let arabFont = localStorage.getItem(K_FONT) || "scheherazade";
  let focusOn = localStorage.getItem(K_FOCUS) === "on";

  const triggerResize = () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 260);
  };

  const applyAll = () => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-arab-scale", arabScale);
    root.setAttribute("data-arab-font", arabFont);
    root.setAttribute("data-focus", focusOn ? "on" : "off");
    localStorage.setItem(K_THEME, theme);
    localStorage.setItem(K_SCALE, arabScale);
    localStorage.setItem(K_FONT, arabFont);
    localStorage.setItem(K_FOCUS, focusOn ? "on" : "off");

    document.querySelectorAll("[data-dl-theme]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-theme") === theme);
    });
    document.querySelectorAll("[data-dl-scale]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-scale") === arabScale);
    });
    document.querySelectorAll("[data-dl-font]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-dl-font") === arabFont);
    });
    const fBtn = document.getElementById("dl-focus-btn");
    if (fBtn) {
      fBtn.textContent = focusOn ? "✓ Mode Fokus Kanvas: Aktif" : "⤢ Mode Fokus Kanvas: Nonaktif";
      fBtn.classList.toggle("active", focusOn);
    }
    triggerResize();
  };

  const menuBtn = document.createElement("button");
  menuBtn.id = "dl-menu-btn";
  menuBtn.type = "button";
  menuBtn.className = "dl-menu-btn";
  menuBtn.setAttribute("aria-label", "Buka Menu Studio Dhamir-Lens");
  menuBtn.title = "Menu & Studio Manuskrip";
  menuBtn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="15" y2="18"/></svg>';

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
      <button type="button" class="dl-drawer-close" id="dl-drawer-close" aria-label="Tutup">✕</button>
    </div>
    <div class="dl-drawer-body">
      <div>
        <div class="dl-sec-title">Navigasi Utama</div>
        <div class="dl-nav-list" id="dl-nav-list">
          <button type="button" class="dl-nav-item" data-dl-tab="Beranda"><span>🏠 Beranda &amp; Definisi</span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Peta Ayat"><span>🧭 Peta Visualisasi Ayat</span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="9 Kaidah"><span>📖 Himpunan 9 Kaidah</span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Glosarium"><span>🔤 Glosarium Istilah</span><span>→</span></button>
          <button type="button" class="dl-nav-item" data-dl-tab="Latihan"><span>✍️ Latihan &amp; Evaluasi</span><span>→</span></button>
        </div>
      </div>

      <div>
        <div class="dl-sec-title">Tema Manuskrip</div>
        <div class="dl-swatches">
          <button type="button" class="dl-sw" data-dl-theme="kertas">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#FFFDF8 50%,#C89E46 50%)"></span>
            <span>Kertas</span>
          </button>
          <button type="button" class="dl-sw" data-dl-theme="sepia">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#F3E6CC 50%,#8A4B16 50%)"></span>
            <span>Sepia</span>
          </button>
          <button type="button" class="dl-sw" data-dl-theme="zamrud">
            <span class="dl-sw-dot" style="background:linear-gradient(135deg,#04211B 50%,#F2C866 50%)"></span>
            <span>Zamrud</span>
          </button>
        </div>
      </div>

      <div>
        <div class="dl-sec-title">Studio Baca Teks Arab</div>
        <div style="font-size:11px;color:var(--dl-muted);margin-bottom:6px;font-weight:600">Ukuran Khat Ayat (Auto-Sinkron Panah)</div>
        <div class="dl-pill-row" style="margin-bottom:10px">
          <button type="button" class="dl-pill" data-dl-scale="sm">A-</button>
          <button type="button" class="dl-pill" data-dl-scale="md">Normal</button>
          <button type="button" class="dl-pill" data-dl-scale="lg">A+</button>
          <button type="button" class="dl-pill" data-dl-scale="xl">A++</button>
        </div>
        <div style="font-size:11px;color:var(--dl-muted);margin-bottom:6px;font-weight:600">Jenis Khat Arab</div>
        <div class="dl-pill-row two" style="margin-bottom:10px">
          <button type="button" class="dl-pill" data-dl-font="scheherazade">Scheherazade</button>
          <button type="button" class="dl-pill" data-dl-font="amiri">Amiri Naskhi</button>
        </div>
        <button type="button" class="dl-action-btn" id="dl-focus-btn">⤢ Mode Fokus Kanvas: Nonaktif</button>
      </div>

      <div>
        <div class="dl-sec-title">Alat Akademik</div>
        <button type="button" class="dl-action-btn" id="dl-print-btn">🖨 Cetak / Simpan PDF Halaman</button>
      </div>

      <div class="dl-info-box">
        <b>Korpus Primer IAT</b><br>
        Kitab <em>Qawā‘id al-Tafsīr: Jam‘an wa Dirāsatan</em> — Dr. Khalid bin ‘Utsman al-Sabt (Jilid I, hlm. 398–419).<br><br>
        <b>Peneliti:</b> Arpan Maulana (1231030055)<br>
        Prodi Ilmu Al-Qur’an dan Tafsir (IAT)<br>
        Fakultas Ushuluddin • UIN Sunan Gunung Djati Bandung
      </div>
    </div>
  `;

  const quickDock = document.createElement("div");
  quickDock.id = "dl-quick-dock";
  quickDock.className = "dl-quick-dock";
  quickDock.innerHTML = `
    <button type="button" class="dl-qbtn" data-dl-theme="kertas">☀ Kertas</button>
    <button type="button" class="dl-qbtn" data-dl-theme="sepia">📜 Sepia</button>
    <button type="button" class="dl-qbtn" data-dl-theme="zamrud">☾ Zamrud</button>
  `;

  document.body.appendChild(menuBtn);
  document.body.appendChild(scrim);
  document.body.appendChild(drawer);
  document.body.appendChild(quickDock);

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

  menuBtn.addEventListener("click", () => setOpen(true));
  scrim.addEventListener("click", () => setOpen(false));
  drawer.querySelector("#dl-drawer-close").addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  drawer.querySelectorAll("[data-dl-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-dl-tab");
      const headerButtons = Array.from(document.querySelectorAll("header nav button"));
      const match = headerButtons.find((b) => b.textContent.trim() === target);
      if (match) match.click();
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-dl-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      theme = btn.getAttribute("data-dl-theme");
      applyAll();
    });
  });
  drawer.querySelectorAll("[data-dl-scale]").forEach((btn) => {
    btn.addEventListener("click", () => {
      arabScale = btn.getAttribute("data-dl-scale");
      applyAll();
    });
  });
  drawer.querySelectorAll("[data-dl-font]").forEach((btn) => {
    btn.addEventListener("click", () => {
      arabFont = btn.getAttribute("data-dl-font");
      applyAll();
    });
  });
  drawer.querySelector("#dl-focus-btn").addEventListener("click", () => {
    focusOn = !focusOn;
    applyAll();
  });
  drawer.querySelector("#dl-print-btn").addEventListener("click", () => {
    setOpen(false);
    setTimeout(() => window.print(), 220);
  });

  const addBar = () => {
    const f = document.querySelector("footer");
    if (f && !f.querySelector(".dl-iat-badge-bar")) {
      const d = document.createElement("div");
      d.className = "dl-iat-badge-bar";
      d.textContent =
        "✦ Program Studi Ilmu Al-Qur’an dan Tafsir (IAT) • Fakultas Ushuluddin • UIN Sunan Gunung Djati Bandung • Korpus Qawā‘id al-Tafsīr (Jilid I, hlm. 398–419) ✦";
      f.appendChild(d);
    }
  };
  setTimeout(addBar, 250);
  setTimeout(addBar, 1200);

  applyAll();
}
