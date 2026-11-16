import React, { useState, useEffect, useRef, useCallback } from 'react';
import dhamirData from './data/dhamir_data.json';

const TAKSONOMI_9_KAIDAH = [
  { no: 1, judul: "Menghimpun Multi-Rujukan (Al-Jam'u bayna al-Maraji')", status: "Aktif" },
  { no: 2, judul: "Mengembalikan Dhamir ke Lafaz Terdekat (Al-'Awdu ila al-Aqrab)", status: "Aktif" },
  { no: 3, judul: "Dhamir Merujuk pada Makna Siyaqi Non-Eksplisit (Ghayru Madzkur)", status: "Aktif" },
  { no: 4, judul: "Kesesuaian Jenis & Bilangan antara Dhamir dan Marja' (Al-Muthabaqah)", status: "Siap Diinput" },
  { no: 5, judul: "Kembalinya Dhamir pada Lafaz vs Makna (Al-Lafzh wa al-Ma'na)", status: "Siap Diinput" },
  { no: 6, judul: "Dhamir al-Sya'n & Dhamir al-Qishshah (Penegas Perkara Besar)", status: "Siap Diinput" },
  { no: 7, judul: "Dhamir al-Fashl sebagai Pembatas Makna (Al-Hashr wa al-Taukid)", status: "Siap Diinput" },
  { no: 8, judul: "Pergeseran Gaya Bahasa Dhamir (Al-Iltifat fi al-Dhama'ir)", status: "Siap Diinput" },
  { no: 9, judul: "Kesatuan vs Distribusi Marja' pada Dhamir Berurutan", status: "Aktif" }
];

export default function App() {
  const [tabAktif, setTabAktif] = useState('visualisasi');
  const [pencarian, setPencarian] = useState('');
  const [kaidahIdAktif, setKaidahIdAktif] = useState(dhamirData[0].id);
  const [perspektifIdx, setPerspektifIdx] = useState(0);
  const [panahTerpilih, setPanahTerpilih] = useState(null);
  const [kataTerpilih, setKataTerpilih] = useState(null);
  const [garisPanah, setGarisPanah] = useState([]);

  const stageRef = useRef(null);
  const tokenRefs = useRef({});
  const externalMarjaRef = useRef(null);

  const dataTerfilter = dhamirData.filter((item) => {
    const q = pencarian.toLowerCase();
    return (
      item.judul_kaidah.toLowerCase().includes(q) ||
      item.surah_ayat.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q)
    );
  });

  const dataAktif =
    dhamirData.find((item) => item.id === kaidahIdAktif) || dhamirData[0];
  const perspektifAktif =
    dataAktif.perspektif[perspektifIdx] || dataAktif.perspektif[0];

  const hitungKoordinatPanah = useCallback(() => {
    if (!stageRef.current || tabAktif !== 'visualisasi') return;
    const stageRect = stageRef.current.getBoundingClientRect();

    const hasil = perspektifAktif.panah
      .map((item, index) => {
        const elDari = tokenRefs.current[item.dari];
        const elKe =
          item.ke === 'external'
            ? externalMarjaRef.current
            : tokenRefs.current[item.ke];

        if (!elDari || !elKe) return null;

        const rectDari = elDari.getBoundingClientRect();
        const rectKe = elKe.getBoundingClientRect();

        const startX = rectDari.left - stageRect.left + rectDari.width / 2;
        const startY = rectDari.top - stageRect.top;

        const endX = rectKe.left - stageRect.left + rectKe.width / 2;
        const endY =
          item.ke === 'external'
            ? rectKe.bottom - stageRect.top + 6
            : rectKe.top - stageRect.top;

        const jarakHorizontal = Math.abs(endX - startX);
        const tinggiLengkungan =
          item.ke === 'external'
            ? 24
            : Math.min(92, Math.max(44, jarakHorizontal * 0.28)) + index * 18;

        const midX = (startX + endX) / 2;
        const controlY =
          item.ke === 'external'
            ? (startY + endY) / 2 - 12
            : Math.min(startY, endY) - tinggiLengkungan;

        // Titik puncak kurva Bezier kuadratik (t = 0.5) untuk penempatan nomor indeks
        const puncakX = 0.25 * startX + 0.5 * midX + 0.25 * endX;
        const puncakY = 0.25 * (startY - 4) + 0.5 * controlY + 0.25 * (endY - 6);

        return {
          ...item,
          index,
          path: `M ${startX} ${startY - 4} Q ${midX} ${controlY} ${endX} ${endY - 6}`,
          puncakX,
          puncakY,
          markerId: `arrow-${dataAktif.id}-${perspektifIdx}-${index}`
        };
      })
      .filter(Boolean);

    setGarisPanah(hasil);
  }, [dataAktif.id, perspektifAktif, perspektifIdx, tabAktif]);

  useEffect(() => {
    hitungKoordinatPanah();
    const timer = setTimeout(hitungKoordinatPanah, 180);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(hitungKoordinatPanah);
    }

    const observer = new ResizeObserver(() => {
      hitungKoordinatPanah();
    });

    if (stageRef.current) {
      observer.observe(stageRef.current);
    }

    window.addEventListener('resize', hitungKoordinatPanah);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', hitungKoordinatPanah);
    };
  }, [hitungKoordinatPanah]);

  const pilihKaidah = (id) => {
    setKaidahIdAktif(id);
    setPerspektifIdx(0);
    setPanahTerpilih(null);
    setKataTerpilih(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Bilah Navigasi Akademik */}
      <nav className="bg-emerald-950 text-white border-b border-emerald-800/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner border border-emerald-400/30 shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Dhamir-Lens
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Lab Qawaid Tafsir
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Peta Interaktif Marja' al-Dhamir & Komparasi Manhaj Mufassirin
              </p>
            </div>
          </div>

          <div className="flex bg-emerald-900/80 p-1 rounded-xl border border-emerald-800 self-start sm:self-auto">
            <button
              onClick={() => setTabAktif('visualisasi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                tabAktif === 'visualisasi'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Visualisasi Ayat
            </button>
            <button
              onClick={() => setTabAktif('kerangka')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                tabAktif === 'kerangka'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Kerangka 9 Kaidah
            </button>
          </div>
        </div>
      </nav>

      {/* Konten Utama */}
      {tabAktif === 'visualisasi' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Kiri: Daftar Kaidah & Pencarian */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Indeks Kaidah & Studi Ayat
                </h2>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {dataTerfilter.length} Kaidah
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari surah, kaidah, atau kategori..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {dataTerfilter.map((item) => {
                  const aktif = item.id === dataAktif.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => pilihKaidah(item.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        aktif
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            aktif
                              ? 'bg-emerald-800 text-emerald-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.surah_ayat}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            aktif ? 'text-amber-300' : 'text-emerald-700'
                          }`}
                        >
                          {item.perspektif.length} Perspektif
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-snug">
                        {item.judul_kaidah}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          aktif ? 'text-emerald-200' : 'text-slate-500'
                        }`}
                      >
                        Bab: {item.kategori}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Panel Kanan: Panggung Visualisasi & Analisis Tafsir */}
          <section className="lg:col-span-8 space-y-5">
            {/* Kartu Redaksi Kaidah Usul Tafsir */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Rumusan Kaidah Tafsir
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  {dataAktif.surah_ayat}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {dataAktif.judul_kaidah}
              </h2>

              <div className="bg-gradient-to-l from-emerald-50/90 to-slate-50 border-r-4 border-emerald-700 p-4 rounded-xl space-y-2">
                <p
                  dir="rtl"
                  className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
                >
                  {dataAktif.redaksi_kaidah}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-200/70">
                  <span className="font-semibold text-slate-800">Arti Kaidah:</span>{' '}
                  {dataAktif.terjemah_kaidah}
                </p>
              </div>
            </div>

            {/* Panggung Interaktif Panah Ayat */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              {/* Pengalih Perspektif Mufassir */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Komparasi Pendapat Mufassir
                  </span>
                  <span className="text-xs text-slate-600">
                    Pilih manhaj penafsiran untuk melihat perubahan arah panah marja'
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dataAktif.perspektif.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPerspektifIdx(idx);
                        setPanahTerpilih(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        perspektifIdx === idx
                          ? 'bg-emerald-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.nama}
                    </button>
                  ))}
                </div>
              </div>

              {/* Petunjuk Interaksi Singkat */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-300 border border-amber-600"></span>
                    Isim Dhamir
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-emerald-600"></span>
                    Marja' (Rujukan)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-100 border border-sky-500"></span>
                    Qarinah Konteks
                  </span>
                </div>
                <span className="text-[11px] italic text-slate-400">
                  Klik kata Arab untuk melihat analisis i'rab
                </span>
              </div>

              {/* Kanvas Ayat & SVG Panah */}
              <div
                ref={stageRef}
                className="relative pt-28 pb-8 px-4 sm:px-6 bg-slate-50/90 rounded-2xl border border-slate-200/80 overflow-x-auto"
              >
                {/* Lapisan SVG Kurva Panah */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  <defs>
                    {garisPanah.map((g) => (
                      <marker
                        key={g.markerId}
                        id={g.markerId}
                        markerWidth="8"
                        markerHeight="8"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                      >
                        <path d="M0,0 L0,7 L8,3.5 z" fill={g.warna} />
                      </marker>
                    ))}
                  </defs>

                  {garisPanah.map((g) => {
                    const isRedup =
                      panahTerpilih !== null && panahTerpilih !== g.index;
                    const isFokus = panahTerpilih === g.index;

                    return (
                      <g
                        key={g.index}
                        style={{
                          opacity: isRedup ? 0.2 : 1,
                          transition: 'opacity 200ms ease'
                        }}
                      >
                        <path
                          d={g.path}
                          fill="none"
                          stroke={g.warna}
                          strokeWidth={isFokus ? '3.5' : '2.5'}
                          strokeDasharray={g.index > 0 ? '6,4' : 'none'}
                          className={isFokus ? 'animate-panah' : ''}
                          markerEnd={`url(#${g.markerId})`}
                        />
                        {/* Lencana Nomor Urut di Puncak Kurva */}
                        <circle
                          cx={g.puncakX}
                          cy={g.puncakY}
                          r="10"
                          fill={g.warna}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={g.puncakX}
                          y={g.puncakY + 3.5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {g.index + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Lencana Marja' Siyaqi Eksternal (Khusus Kaidah 3 / Ghayru Madzkur) */}
                {dataAktif.marja_eksternal && (
                  <div className="flex justify-center mb-10 relative z-10">
                    <div
                      ref={externalMarjaRef}
                      dir="rtl"
                      className="font-arab text-lg sm:text-xl font-bold bg-emerald-900 text-amber-200 px-4 py-1.5 rounded-full border-2 border-amber-400 shadow-sm"
                    >
                      {dataAktif.marja_eksternal}
                    </div>
                  </div>
                )}

                {/* Susunan Token Kata Al-Qur'an */}
                <div
                  dir="rtl"
                  className="font-arab flex flex-wrap justify-center items-end gap-x-3.5 gap-y-6 text-3xl sm:text-4xl relative z-10"
                >
                  {dataAktif.tokens.map((token) => {
                    const terpilih = kataTerpilih?.id === token.id;

                    let gayaBadge =
                      'text-slate-900 hover:bg-white hover:shadow-sm px-2.5 py-1.5 rounded-xl border border-transparent';
                    let labelPeran = null;

                    if (token.peran === 'dhamir') {
                      gayaBadge =
                        'bg-amber-200/90 text-amber-950 px-3.5 py-1.5 rounded-xl border-2 border-amber-500 font-bold shadow-sm';
                      labelPeran = 'Dhamir';
                    } else if (token.peran === 'marja') {
                      gayaBadge =
                        'bg-emerald-100 text-emerald-950 px-3.5 py-1.5 rounded-xl border-2 border-emerald-600 font-bold shadow-sm';
                      labelPeran = "Marja'";
                    } else if (token.peran === 'qarinah') {
                      gayaBadge =
                        'bg-sky-100/90 text-sky-950 px-3 py-1.5 rounded-xl border border-sky-400';
                      labelPeran = 'Qarinah';
                    }

                    return (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => setKataTerpilih(token)}
                        ref={(el) => (tokenRefs.current[token.id] = el)}
                        className={`group relative flex flex-col items-center transition-transform active:scale-95 cursor-pointer ${gayaBadge} ${
                          terpilih ? 'ring-4 ring-emerald-500/30 scale-105' : ''
                        }`}
                      >
                        {labelPeran && (
                          <span
                            dir="ltr"
                            className="font-sans text-[10px] font-extrabold uppercase tracking-wider mb-0.5 opacity-80"
                          >
                            {labelPeran}
                          </span>
                        )}
                        <span className="leading-normal">{token.teks}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inspektor Gramatikal Kata (Muncul saat kata diklik) */}
              {kataTerpilih && (
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span dir="rtl" className="font-arab text-2xl text-amber-300 font-bold">
                        {kataTerpilih.teks}
                      </span>
                      <span className="text-xs font-semibold bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                        {kataTerpilih.jenis_nahwu}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {kataTerpilih.keterangan_kata}
                    </p>
                  </div>
                  <button
                    onClick={() => setKataTerpilih(null)}
                    className="text-xs text-slate-400 hover:text-white self-end sm:self-center px-2.5 py-1 rounded-lg bg-slate-800"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* Legenda Interaktif Panah (Klik untuk isolasi panah) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Peta Relasi Panah (Klik untuk menyorot jalur spesifik)
                  </span>
                  {panahTerpilih !== null && (
                    <button
                      onClick={() => setPanahTerpilih(null)}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Tampilkan Semua Panah
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {perspektifAktif.panah.map((p, idx) => {
                    const aktif = panahTerpilih === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setPanahTerpilih(aktif ? null : idx)
                        }
                        style={{
                          borderColor: aktif ? p.warna : '#e2e8f0'
                        }}
                        className={`text-left p-3 rounded-xl border-2 transition flex items-start gap-2.5 ${
                          aktif ? 'bg-slate-50 shadow-sm' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: p.warna }}
                          className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {p.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {p.penjelasan_singkat}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terjemahan Ayat */}
              <blockquote className="text-sm italic text-slate-600 bg-slate-50 border-l-4 border-emerald-600 px-4 py-3 rounded-r-xl">
                "{dataAktif.terjemahan}"
              </blockquote>

              {/* Kartu Analisis Qarinah & Rujukan Kitab Turats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                      Analisis Tarjih & Qarinah
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {perspektifAktif.metode_tarjih}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {perspektifAktif.analisis}
                  </p>
                  <p className="text-xs text-emerald-900 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold">Qarinah Penentu:</span>{' '}
                    {perspektifAktif.qarinah}
                  </p>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                      Otoritas Rujukan Kitab Tafsir
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {perspektifAktif.rujukan}
                    </p>
                  </div>
                  <div className="text-[11px] text-amber-900/80 border-t border-amber-200/60 pt-2">
                    Diverifikasi berdasarkan kaidah klasik *Qawaid al-Tafsir* & kaidah *Nahwu* rujukan marja'.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* Tab Kedua: Kerangka Teoretis 9 Kaidah Dhamir */
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              Landasan Teoretis Penelitian R&D
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Taksonomi 9 Kaidah Marja' al-Dhamir dalam Qawaid Tafsir
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Aplikasi <strong>Dhamir-Lens</strong> memetakan sembilan kaidah utama penentuan rujukan kata ganti (<em>marja' al-dhamir</em>) dalam Al-Qur'an untuk menjembatani analisis gramatika bahasa Arab (<em>nahwu-balaghah</em>) dengan istinbath makna penafsiran para ulama muktabar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {TAKSONOMI_9_KAIDAH.map((k) => {
                const tersedia = k.status === 'Aktif';
                return (
                  <div
                    key={k.no}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {k.no}
                      </span>
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {k.judul}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        tersedia
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-950 text-emerald-100 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Identitas Pengembangan Produk Digital
              </h3>
              <p className="text-xs text-emerald-200">
                Program Studi Ilmu Al-Qur'an dan Tafsir (IAT) • Fakultas Ushuluddin • UIN Sunan Gunung Djati Bandung
              </p>
            </div>
            <button
              onClick={() => setTabAktif('visualisasi')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition self-start sm:self-auto"
            >
              Kembali ke Visualisasi Ayat
            </button>
          </div>
        </main>
      )}

      {/* Footer Akademik */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            <strong>Dhamir-Lens</strong> — Media Pembelajaran & Analisis Digital Qawaid Tafsir
          </span>
          <span>
            Dikembangkan untuk Penelitian Skripsi R&D Ilmu Al-Qur'an dan Tafsir
          </span>
        </div>
      </footer>
    </div>
  );
}