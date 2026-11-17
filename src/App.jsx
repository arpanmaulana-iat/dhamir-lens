import React, { useState, useEffect, useRef, useCallback } from 'react';
import dhamirData from './data/dhamir_data.json';
import { definisiDhamir, glosariumData, kuisData } from './data/ui_content.js';

export default function App() {
  // --- STATE NAVIGASI UTAMA ---
  const [tabUtama, setTabUtama] = useState('beranda');
  const [tampilJawabanId, setTampilJawabanId] = useState(null);

  // --- STATE VISUALISASI PANAH ---
  const [pencarian, setPencarian] = useState('');
  const [kaidahIdAktif, setKaidahIdAktif] = useState(dhamirData[0].id);
  const [ayatIdxAktif, setAyatIdxAktif] = useState(0);
  const [perspektifIdx, setPerspektifIdx] = useState(0);
  const [panahTerpilih, setPanahTerpilih] = useState(null);
  const [kataTerpilih, setKataTerpilih] = useState(null);
  const [tampilkanPanah, setTampilkanPanah] = useState(true);
  const [garisPanah, setGarisPanah] = useState([]);

  // --- REFS UNTUK SVG PANAH ---
  const stageRef = useRef(null);
  const tokenRefs = useRef({});
  const externalMarjaRef = useRef(null);

  // --- LOGIKA FILTER DATA ---
  const dataTerfilter = dhamirData.filter((item) => {
    const q = pencarian.toLowerCase();
    const cocokKaidah =
      item.judul_kaidah.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      item.terjemah_kaidah.toLowerCase().includes(q);
    const cocokAyat = item.daftar_ayat.some((a) =>
      a.surah_ayat.toLowerCase().includes(q)
    );
    return cocokKaidah || cocokAyat;
  });

  const dataAktif = dhamirData.find((item) => item.id === kaidahIdAktif) || dhamirData[0];
  const ayatAktif = dataAktif.daftar_ayat[ayatIdxAktif] || dataAktif.daftar_ayat[0];
  const perspektifAktif = ayatAktif.perspektif[perspektifIdx] || ayatAktif.perspektif[0];

  const totalAyatKorpus = dhamirData.reduce((acc, k) => acc + k.daftar_ayat.length, 0);

  // --- FUNGSI MENGHITUNG KOORDINAT PANAH ---
  const hitungKoordinatPanah = useCallback(() => {
    if (!stageRef.current || tabUtama !== 'visualisasi') return;
    const stageRect = stageRef.current.getBoundingClientRect();

    const hasil = perspektifAktif.panah
      .map((item, index) => {
        const elDari = tokenRefs.current[item.dari];
        const elKe = item.ke === 'external' ? externalMarjaRef.current : tokenRefs.current[item.ke];

        if (!elDari || !elKe) return null;

        const rectDari = elDari.getBoundingClientRect();
        const rectKe = elKe.getBoundingClientRect();

        const startX = rectDari.left - stageRect.left + rectDari.width / 2;
        const startY = rectDari.top - stageRect.top + 8;

        const endX = rectKe.left - stageRect.left + rectKe.width / 2;
        const endY =
          item.ke === 'external'
            ? rectKe.bottom - stageRect.top + 8
            : rectKe.top - stageRect.top + 8;

        const jarakHorizontal = Math.abs(endX - startX);
        const tinggiLengkungan =
          item.ke === 'external'
            ? 22
            : Math.min(96, Math.max(46, jarakHorizontal * 0.28)) + index * 20;

        const midX = (startX + endX) / 2;
        const controlY =
          item.ke === 'external'
            ? (startY + endY) / 2 - 10
            : Math.min(startY, endY) - tinggiLengkungan;

        const puncakX = 0.25 * startX + 0.5 * midX + 0.25 * endX;
        const puncakY = 0.25 * startY + 0.5 * controlY + 0.25 * (endY - 4);

        return {
          ...item,
          index,
          path: `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY - 4}`,
          puncakX,
          puncakY,
          markerId: `arrow-${dataAktif.id}-${ayatIdxAktif}-${perspektifIdx}-${index}`
        };
      })
      .filter(Boolean);

    setGarisPanah(hasil);
  }, [ayatIdxAktif, dataAktif.id, perspektifAktif, perspektifIdx, tabUtama]);

  // --- EFEK PEMANTAUAN RESIZE LAYAR ---
  useEffect(() => {
    hitungKoordinatPanah();
    const timer = setTimeout(hitungKoordinatPanah, 200);

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
  }, [hitungKoordinatPanah, tampilkanPanah]);

  const pilihKaidah = (id) => {
    tokenRefs.current = {};
    setKaidahIdAktif(id);
    setAyatIdxAktif(0);
    setPerspektifIdx(0);
    setPanahTerpilih(null);
    setKataTerpilih(null);
  };

  const pilihAyat = (idx) => {
    tokenRefs.current = {};
    setAyatIdxAktif(idx);
    setPerspektifIdx(0);
    setPanahTerpilih(null);
    setKataTerpilih(null);
  };

  // ==========================================================
  // KOMPONEN RENDER TAB 1: BERANDA
  // ==========================================================
  const renderBeranda = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-fade-in">
      <div className="text-center space-y-4">
        <span className="text-sm font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full">
          Instrumen Penelitian R&D
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
          Selamat Datang di Dhamir-Lens
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Laboratorium digital interaktif untuk membedah kaidah <em>Marja' al-Dhamir</em> dalam Al-Qur'an berdasarkan kitab <strong>Qawa'id al-Tafsir</strong> karya Dr. Khalid bin Utsman al-Sabt.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/40">
        <h3 className="text-xl font-extrabold text-amber-950 mb-4">{definisiDhamir.judul}</h3>
        <p dir="rtl" className="font-arab text-3xl text-right text-emerald-950 leading-loose mb-6">
          {definisiDhamir.arab}
        </p>
        <p className="text-slate-700 leading-relaxed text-lg border-l-4 border-amber-400 pl-4 bg-amber-50 p-4 rounded-r-xl">
          {definisiDhamir.penjelasan}
        </p>
        <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-slate-400">
          Rujukan: {definisiDhamir.rujukan.join(" | ")} (Hlm. {definisiDhamir.halaman})
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={() => setTabUtama('visualisasi')}
          className="bg-emerald-800 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:scale-105 transition-all"
        >
          Mulai Eksplorasi Peta Ayat →
        </button>
      </div>
    </div>
  );

  // ==========================================================
  // KOMPONEN RENDER TAB 3: GLOSARIUM
  // ==========================================================
  const renderGlosarium = () => (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900">Glosarium Istilah</h2>
        <p className="text-slate-600">Panduan istilah teknis Ulumul Qur'an dan Nahwu yang digunakan dalam aplikasi ini.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {glosariumData.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-emerald-500 transition shadow-sm">
            <h3 className="text-lg font-extrabold text-emerald-900 mb-2">{item.istilah}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{item.arti}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================================
  // KOMPONEN RENDER TAB 4: KUIS LATIHAN
  // ==========================================================
  const renderKuis = () => (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">Uji Pemahaman (Self-Assessment)</h2>
        <p className="text-slate-600">Jawab pertanyaan di dalam hati, lalu ketuk tombol untuk mencocokkan dengan analisis pakar tafsir.</p>
      </div>
      <div className="space-y-6">
        {kuisData.map((quiz) => (
          <div key={quiz.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-lg">
                {quiz.id}
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">{quiz.soal}</h3>
            </div>
            
            <div className="pl-14 space-y-2 text-sm text-slate-700 font-medium">
              {quiz.pilihan.map((opsi, i) => (
                <div key={i} className="flex gap-3 items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span>{opsi}</span>
                </div>
              ))}
            </div>

            <div className="pl-14 pt-2">
              {tampilJawabanId === quiz.id ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl animate-fade-in">
                  <div className="text-sm font-extrabold text-emerald-900 mb-2 uppercase tracking-wide">Jawaban Benar: {quiz.jawabanBenar}</div>
                  <p className="text-sm text-emerald-800 leading-relaxed">{quiz.pembahasan}</p>
                  <button onClick={() => setTampilJawabanId(null)} className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900">Sembunyikan Pembahasan</button>
                </div>
              ) : (
                <button 
                  onClick={() => setTampilJawabanId(quiz.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition"
                >
                  Lihat Kunci & Pembahasan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================================
  // KOMPONEN RENDER TAB 2: VISUALISASI PANAH (KODE LAMA ANDA)
  // ==========================================================
  const renderVisualisasi = () => (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-fade-in">
      <div className="lg:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
            Pilih Kaidah (1–9)
          </span>
          <span className="text-xs text-slate-500">Geser ke samping →</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {dhamirData.map((item) => {
            const aktif = item.id === dataAktif.id;
            return (
              <button
                key={item.id}
                onClick={() => pilihKaidah(item.id)}
                className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition ${
                  aktif
                    ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                    : 'bg-white text-slate-800 border-stone-200 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      aktif ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    Kaidah {item.nomor_kaidah}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      aktif ? 'text-emerald-200' : 'text-slate-500'
                    }`}
                  >
                    {item.daftar_ayat.length} Ayat
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Bab Al-Dhama'ir (9 Kaidah)
              </h2>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {totalAyatKorpus} Ayat
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari kaidah, kategori, atau surah..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {dataTerfilter.map((item) => {
                const aktif = item.id === dataAktif.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => pilihKaidah(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      aktif
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                        : 'bg-stone-50/70 text-slate-800 border-stone-200 hover:border-emerald-500 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          aktif ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        Bab: {item.kategori}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          aktif ? 'text-amber-300' : 'text-slate-500'
                        }`}
                      >
                        {item.daftar_ayat.length} Ayat
                      </span>
                    </div>
                    <p className="text-sm font-bold leading-snug">
                      {item.judul_kaidah}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Rumusan Kaidah ({dataAktif.kategori})
              </span>
              <span className="text-xs font-bold text-slate-500">
                {dataAktif.sumber_kitab}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {dataAktif.judul_kaidah}
            </h2>

            <div className="kanvas-mushaf border border-amber-200/80 border-r-4 border-r-emerald-800 p-4 sm:p-5 rounded-xl space-y-3">
              <p
                dir="rtl"
                className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
              >
                {dataAktif.redaksi_kaidah}
              </p>
              <div className="pt-2.5 border-t border-stone-200/80 space-y-1.5 text-sm">
                <p className="text-slate-800 leading-relaxed">
                  <span className="font-bold text-emerald-950">Terjemah Kaidah:</span>{' '}
                  {dataAktif.terjemah_kaidah}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Tawdhih al-Qa'idah:</span>{' '}
                  {dataAktif.tawdhih_kaidah}
                </p>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                Pilih Contoh Ayat Penerapan / Tathbiq ({dataAktif.daftar_ayat.length} Ayat dalam Kaidah Ini):
              </span>
              <div className="flex flex-wrap gap-2">
                {dataAktif.daftar_ayat.map((ayat, idx) => {
                  const aktif = idx === ayatIdxAktif;
                  return (
                    <button
                      key={ayat.id_ayat}
                      onClick={() => pilihAyat(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition text-left ${
                        aktif
                          ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-sm'
                          : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-emerald-500 hover:bg-white'
                      }`}
                    >
                      <span className="block font-extrabold">{ayat.surah_ayat}</span>
                      <span className="text-[11px] font-medium opacity-85">
                        {ayat.label_kategori}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-950">
                    {ayatAktif.surah_ayat}
                  </span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full">
                    {ayatAktif.label_kategori}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Pilih pendapat mufassir di bawah untuk membandingkan arah rujukan dhamir
                </span>
              </div>

              <button
                type="button"
                onClick={() => setTampilkanPanah(!tampilkanPanah)}
                className={`self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                  tampilkanPanah
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {tampilkanPanah ? 'Panah Visual: Aktif' : 'Mode Uji: Panah Disembunyikan'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {ayatAktif.perspektif.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPerspektifIdx(idx);
                    setPanahTerpilih(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                    perspektifIdx === idx
                      ? 'bg-emerald-900 text-white shadow-md'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  {p.nama}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1.5 rounded-full bg-amber-500"></span>
                  Isim Dhamir
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-600"></span>
                  Marja' (Rujukan)
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1.5 rounded-full bg-sky-500"></span>
                  Qarinah Konteks
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Ketuk kata Arab untuk inspeksi i'rab
              </span>
            </div>

            <div
              key={`${dataAktif.id}-${ayatIdxAktif}`}
              ref={stageRef}
              className="kanvas-mushaf relative pt-28 pb-9 px-4 sm:px-8 rounded-2xl border-2 border-amber-300/60 shadow-inner overflow-x-auto"
            >
              <div className="absolute top-2.5 left-3 text-[11px] font-bold tracking-widest uppercase text-amber-800/50 select-none">
                ﴿ رَسْمٌ عُثْمَانِيٌّ ﴾
              </div>

              {tampilkanPanah && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  <defs>
                    {garisPanah.map((g) => (
                      <marker
                        key={g.markerId}
                        id={g.markerId}
                        markerWidth="9"
                        markerHeight="9"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,0 L0,8 L9,4 z" fill={g.warna} />
                      </marker>
                    ))}
                  </defs>

                  {garisPanah.map((g) => {
                    const isRedup = panahTerpilih !== null && panahTerpilih !== g.index;
                    const isFokus = panahTerpilih === g.index;

                    return (
                      <g
                        key={g.index}
                        style={{
                          opacity: isRedup ? 0.18 : 1,
                          transition: 'opacity 200ms ease'
                        }}
                      >
                        <path
                          d={g.path}
                          fill="none"
                          stroke={g.warna}
                          strokeWidth={isFokus ? '3.5' : '2.75'}
                          strokeDasharray={g.index > 0 ? '6,4' : 'none'}
                          className={isFokus ? 'animate-panah' : ''}
                          markerEnd={`url(#${g.markerId})`}
                        />
                        <circle
                          cx={g.puncakX}
                          cy={g.puncakY}
                          r="11"
                          fill={g.warna}
                          stroke="#fcfbf7"
                          strokeWidth="2.5"
                        />
                        <text
                          x={g.puncakX}
                          y={g.puncakY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {g.index + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {ayatAktif.marja_eksternal && (
                <div className="flex justify-center mb-12 relative z-10">
                  <div
                    ref={externalMarjaRef}
                    dir="rtl"
                    className="font-arab text-lg sm:text-xl font-bold bg-emerald-950 text-amber-200 px-5 py-1.5 rounded-full border-2 border-amber-400 shadow-md"
                  >
                    {ayatAktif.marja_eksternal}
                  </div>
                </div>
              )}

              <div
                dir="rtl"
                className="font-arab flex flex-wrap justify-center items-baseline gap-x-3 sm:gap-x-4 gap-y-6 text-3xl sm:text-5xl relative z-10"
              >
                {ayatAktif.tokens.map((token) => {
                  const terpilih = kataTerpilih?.id === token.id;
                  let gayaKata = 'text-slate-950 hover:bg-amber-100/50 px-1.5 py-1 rounded-lg';
                  let tagKecil = null;

                  if (token.peran === 'dhamir') {
                    gayaKata = 'bg-amber-200/75 text-amber-950 border-b-4 border-amber-500 px-2.5 py-1 rounded-t-xl font-bold';
                    tagKecil = { teks: 'Dhamir', warna: 'text-amber-800' };
                  } else if (token.peran === 'marja') {
                    gayaKata = 'bg-emerald-100/85 text-emerald-950 border-b-4 border-emerald-600 px-2.5 py-1 rounded-t-xl font-bold';
                    tagKecil = { teks: "Marja'", warna: 'text-emerald-800' };
                  } else if (token.peran === 'qarinah') {
                    gayaKata = 'bg-sky-100/75 text-sky-950 border-b-4 border-sky-500 px-2 py-1 rounded-t-xl';
                    tagKecil = { teks: 'Qarinah', warna: 'text-sky-800' };
                  }

                  return (
                    <button
                      key={token.id}
                      type="button"
                      onClick={() => setKataTerpilih(token)}
                      ref={(el) => (tokenRefs.current[token.id] = el)}
                      className={`relative inline-flex flex-col items-center transition-all active:scale-95 cursor-pointer ${gayaKata} ${
                        terpilih ? 'ring-4 ring-amber-400/50 scale-105' : ''
                      }`}
                    >
                      <span className="leading-[1.7]">{token.teks}</span>
                      {tagKecil && (
                        <span
                          dir="ltr"
                          className={`font-sans text-[10px] font-extrabold tracking-wide -mt-1 ${tagKecil.warna}`}
                        >
                          {tagKecil.teks}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {kataTerpilih && (
              <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span dir="rtl" className="font-arab text-2xl sm:text-3xl text-amber-300 font-bold">
                      {kataTerpilih.teks}
                    </span>
                    <span className="text-xs font-bold bg-emerald-900 text-emerald-200 px-3 py-1 rounded-lg border border-emerald-700">
                      {kataTerpilih.jenis_nahwu}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-100 leading-relaxed">
                    {kataTerpilih.keterangan_kata}
                  </p>
                </div>
                <button
                  onClick={() => setKataTerpilih(null)}
                  className="text-xs font-bold text-amber-300 hover:text-white self-end sm:self-center px-3 py-1.5 rounded-lg bg-white/10"
                >
                  Tutup
                </button>
              </div>
            )}

            {tampilkanPanah && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Rincian Jalur Rujukan (Ketuk untuk sorot panah)
                  </span>
                  {panahTerpilih !== null && (
                    <button
                      onClick={() => setPanahTerpilih(null)}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      Tampilkan Semua
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {perspektifAktif.panah.map((p, idx) => {
                    const aktif = panahTerpilih === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPanahTerpilih(aktif ? null : idx)}
                        style={{
                          borderColor: aktif ? p.warna : '#e7e5e4'
                        }}
                        className={`text-left p-3.5 rounded-xl border-2 transition flex items-start gap-3 ${
                          aktif ? 'bg-stone-50 shadow-sm' : 'bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: p.warna }}
                          className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {p.label}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {p.penjelasan_singkat}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <blockquote className="text-sm sm:text-base italic text-slate-700 bg-stone-50 border-l-4 border-emerald-700 px-4 py-3.5 rounded-r-xl leading-relaxed">
              "{ayatAktif.terjemahan}"
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-emerald-50/75 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                    Analisis Tarjih & Qarinah
                  </h3>
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    {perspektifAktif.metode_tarjih}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {perspektifAktif.analisis}
                </p>
                <div className="text-xs sm:text-sm text-emerald-950 bg-white/90 p-3 rounded-xl border border-emerald-200/70 leading-relaxed">
                  <span className="font-bold">Qarinah Penentu:</span>{' '}
                  {perspektifAktif.qarinah}
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                    Takhrij & Otoritas Rujukan Kitab
                  </h3>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {perspektifAktif.rujukan}
                  </p>
                </div>
                <div className="text-xs text-amber-900/80 border-t border-amber-200/80 pt-2.5">
                  Sumber utama: <em>Qawa'id al-Tafsir Jam'an wa Dirasatan</em> (Dr. Khalid bin Utsman al-Sabt).
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // ==========================================================
  // HASIL RENDER UTAMA
  // ==========================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f0]">
      {/* NAVBAR UNIVERSAL */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="font-arab text-xl font-bold text-amber-400 pt-1">ض</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">Dhamir-Lens</h1>
          </div>
          
          <nav className="flex gap-2 overflow-x-auto no-scrollbar">
            {['beranda', 'visualisasi', 'glosarium', 'kuis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabUtama(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
                  tabUtama === tab ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                {tab === 'visualisasi' ? 'Peta Ayat' : tab === 'kuis' ? 'Latihan' : tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* RENDER KONTEN BERDASARKAN TAB AKTIF */}
      <main className="flex-1">
        {tabUtama === 'beranda' && renderBeranda()}
        {tabUtama === 'visualisasi' && renderVisualisasi()}
        {tabUtama === 'glosarium' && renderGlosarium()}
        {tabUtama === 'kuis' && renderKuis()}
      </main>

      <footer className="bg-white border-t border-stone-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 font-medium">
          Dhamir-Lens — Media Pembelajaran Qawaid Tafsir Berbasis R&D
        </div>
      </footer>
    </div>
  );
}