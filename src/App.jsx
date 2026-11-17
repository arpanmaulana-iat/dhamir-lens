import React, { useState, useEffect, useRef, useCallback } from 'react';
import dhamirData from './data/dhamir_data.json';
import { definisiDhamir, glosariumData, kuisData } from './data/ui_content.js';

export default function App() {
  // --- STATE NAVIGASI & INTERAKSI ---
  const [tabUtama, setTabUtama] = useState('beranda'); // 'beranda' | 'visualisasi' | 'indeks' | 'glosarium' | 'kuis'
  const [bukaTawdhih, setBukaTawdhih] = useState(false);
  const [cariGlosarium, setCariGlosarium] = useState('');
  const [cariIndeksKaidah, setCariIndeksKaidah] = useState('');
  const [jawabanUser, setJawabanUser] = useState({});
  const [infoIstilahAktif, setInfoIstilahAktif] = useState(null);

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

  // --- DATA FILTER & STATISTIK ---
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

  const indeksKaidahTerfilter = dhamirData.filter((item) => {
    const q = cariIndeksKaidah.toLowerCase();
    return (
      item.judul_kaidah.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      item.terjemah_kaidah.toLowerCase().includes(q) ||
      item.tawdhih_kaidah.toLowerCase().includes(q) ||
      item.daftar_ayat.some((a) => a.surah_ayat.toLowerCase().includes(q))
    );
  });

  const glosariumTerfilter = glosariumData.filter(
    (item) =>
      item.istilah.toLowerCase().includes(cariGlosarium.toLowerCase()) ||
      item.arti.toLowerCase().includes(cariGlosarium.toLowerCase())
  );

  const dataAktif = dhamirData.find((item) => item.id === kaidahIdAktif) || dhamirData[0];
  const ayatAktif = dataAktif.daftar_ayat[ayatIdxAktif] || dataAktif.daftar_ayat[0];
  const perspektifAktif = ayatAktif?.perspektif[perspektifIdx] || ayatAktif?.perspektif[0];

  const totalAyatKorpus = dhamirData.reduce((acc, k) => acc + k.daftar_ayat.length, 0);

  const totalTerjawab = Object.keys(jawabanUser).length;
  const totalBenar = kuisData.reduce(
    (acc, q) => (jawabanUser[q.id] === q.jawabanBenar ? acc + 1 : acc),
    0
  );

  // --- FUNGSI MENGHITUNG KOORDINAT PANAH SVG ---
  const hitungKoordinatPanah = useCallback(() => {
    if (!stageRef.current || tabUtama !== 'visualisasi' || !perspektifAktif) return;
    const stageRect = stageRef.current.getBoundingClientRect();

    const hasil = perspektifAktif.panah
      .map((item, index) => {
        const elDari = tokenRefs.current[item.dari];
        const elKe =
          item.ke === 'external' ? externalMarjaRef.current : tokenRefs.current[item.ke];

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

  const pilihKaidah = (id, indexAyat = 0) => {
    tokenRefs.current = {};
    setKaidahIdAktif(id);
    setAyatIdxAktif(indexAyat);
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

  const infoLegenda = {
    dhamir: "Dhamir: Kata ganti (seperti -hu, -ha, hum) yang merujuk pada lafaz lain.",
    marja: "Marja': Kata atau entitas yang menjadi tempat kembalinya dhamir.",
    qarinah: "Qarinah: Indikator atau petunjuk konteks dalam ayat yang menguatkan arah kembalinya dhamir."
  };

  // ==========================================================
  // TAB 1: BERANDA
  // ==========================================================
  const renderBeranda = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-12 space-y-8 sm:space-y-10 animate-fade-in">
      <div className="text-center space-y-3.5">
        <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full">
          Instrumen Penelitian R&D Ilmu Al-Qur'an & Tafsir
        </span>
        <h2 className="text-2xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
          Selamat Datang di Dhamir-Lens
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Laboratorium digital interaktif untuk memetakan dan memvisualisasikan kaidah{' '}
          <em>Marja' al-Dhamir</em> berdasarkan kitab <strong>Qawa'id al-Tafsir</strong> karya Dr. Khalid bin Utsman al-Sabt.
        </p>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setTabUtama('indeks')}
          className="bg-white hover:border-emerald-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition"
        >
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">{dhamirData.length}</div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1">Kaidah Utama →</div>
        </button>
        <button
          onClick={() => setTabUtama('visualisasi')}
          className="bg-white hover:border-amber-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition"
        >
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{totalAyatKorpus}</div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1">Ayat Tathbiq →</div>
        </button>
        <button
          onClick={() => setTabUtama('glosarium')}
          className="bg-white hover:border-emerald-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition"
        >
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">{glosariumData.length}</div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1">Istilah Kunci →</div>
        </button>
        <button
          onClick={() => setTabUtama('kuis')}
          className="bg-white hover:border-amber-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition"
        >
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{kuisData.length}</div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1">Soal Evaluasi →</div>
        </button>
      </div>

      {/* Kartu Definisi Dhamir (Berwarna & Elegan) */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-xl shadow-emerald-900/20 space-y-5 sm:space-y-6 relative overflow-hidden mb-8">
        {/* Ornamen Latar (Glow effect) */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-arab font-bold text-xl pb-1">
              ض
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 drop-shadow-sm">
              {definisiDhamir.judul}
            </h3>
          </div>
          <span className="text-xs font-extrabold bg-emerald-950/80 text-amber-200 px-3.5 py-1.5 rounded-full border border-emerald-700/50 shadow-inner">
            Kitab Hlm. {definisiDhamir.halaman}
          </span>
        </div>
        
        <p
          dir="rtl"
          className="font-arab text-2xl sm:text-3xl text-right text-white leading-[2.2] bg-black/25 p-5 sm:p-6 rounded-2xl border border-emerald-800/60 relative z-10 shadow-inner"
        >
          {definisiDhamir.arab}
        </p>
        
        <p className="text-emerald-50 leading-relaxed text-sm sm:text-base border-l-4 border-amber-400 pl-4 sm:pl-5 bg-emerald-950/40 py-4 pr-4 rounded-r-xl relative z-10">
          {definisiDhamir.penjelasan}
        </p>
        
        <div className="pt-4 border-t border-emerald-800/60 text-xs sm:text-sm text-emerald-200/80 relative z-10">
          <strong className="text-amber-400 tracking-wide">Otoritas Rujukan:</strong> {definisiDhamir.rujukan.join(' | ')}
        </div>
      </div>

      {/* Panduan 3 Langkah Penggunaan */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 text-center">
          Alur Penggunaan Laboratorium Dhamir-Lens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {definisiDhamir.langkah_penggunaan.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-900 text-amber-300 font-extrabold text-sm flex items-center justify-center">
                {idx + 1}
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{item.judul}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.deskripsi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tombol Aksi Cepat */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <button
          onClick={() => setTabUtama('visualisasi')}
          className="bg-emerald-900 hover:bg-emerald-800 text-white px-7 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base shadow-md transition"
        >
          Buka Peta Visualisasi Ayat →
        </button>
        <button
          onClick={() => setTabUtama('indeks')}
          className="bg-white hover:bg-stone-100 text-emerald-950 border border-stone-300 px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition"
        >
          Lihat Indeks 9 Kaidah
        </button>
      </div>
    </div>
  );

  // ==========================================================
  // TAB 3: INDEKS PENGHIMPUN 9 KAIDAH (FITUR BARU)
  // ==========================================================
  const renderIndeksKaidah = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-6 animate-fade-in">
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              Korpus Utuh Bab Al-Dhama'ir (Hlm. 398–419)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-1">
              Himpunan 9 Kaidah Marja' al-Dhamir
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Rangkuman sistematis seluruh kaidah beserta matan Arab, terjemahan, dan daftar ayat penerapannya. Klik salah satu ayat untuk langsung membuka visualisasi panahnya.
            </p>
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <input
              type="text"
              value={cariIndeksKaidah}
              onChange={(e) => setCariIndeksKaidah(e.target.value)}
              placeholder="Cari kaidah atau surah..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
        </div>
      </div>

      <div className="space-y-4">
        {indeksKaidahTerfilter.map((k) => (
          <div
            key={k.id}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 hover:border-emerald-500 transition shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-950 text-amber-300 text-xs sm:text-sm font-extrabold flex items-center justify-center shrink-0">
                  {k.nomor_kaidah}
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Kategori: {k.kategori}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                    {k.judul_kaidah}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  pilihKaidah(k.id, 0);
                  setTabUtama('visualisasi');
                }}
                className="text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white transition shrink-0"
              >
                Buka di Peta Ayat ({k.daftar_ayat.length} Ayat) →
              </button>
            </div>

            <div className="kanvas-mushaf p-4 rounded-xl border border-amber-200/80 border-r-4 border-r-emerald-800 space-y-2.5">
              <p dir="rtl" className="font-arab text-xl sm:text-2xl text-right text-slate-950 leading-loose">
                {k.redaksi_kaidah}
              </p>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-2 border-t border-stone-200/70">
                <strong className="text-emerald-950">Terjemah:</strong> {k.terjemah_kaidah}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Tawdhih:</strong> {k.tawdhih_kaidah}
              </p>
            </div>

            {/* Daftar Tombol Pintas ke Setiap Ayat dalam Kaidah */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider">
                  Daftar Ayat Penerapan (Ketuk untuk langsung membedah):
                </span>
                <span>{k.sumber_kitab}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {k.daftar_ayat.map((a, idx) => (
                  <button
                    key={a.id_ayat}
                    onClick={() => {
                      pilihKaidah(k.id, idx);
                      setTabUtama('visualisasi');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-amber-400 hover:text-emerald-950 text-slate-700 border border-stone-200 transition"
                  >
                    {a.surah_ayat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================================
  // TAB 4: GLOSARIUM
  // ==========================================================
  const renderGlosarium = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Glosarium Istilah</h2>
          <p className="text-sm sm:text-base text-slate-600">
            Kamus ringkas terminologi Ulumul Qur'an dan Nahwu dalam pemetaan dhamir.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={cariGlosarium}
            onChange={(e) => setCariGlosarium(e.target.value)}
            placeholder="Cari istilah (mis: Qarinah)..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
      </div>

      {glosariumTerfilter.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-slate-500 text-sm">
          Istilah "{cariGlosarium}" tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glosariumTerfilter.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 hover:border-emerald-600 transition shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-block text-base sm:text-lg font-extrabold text-emerald-950 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {item.istilah}
                </span>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{item.arti}</p>
              </div>
              {item.contoh && (
                <div className="bg-amber-50/80 border-l-4 border-amber-400 p-3 rounded-r-xl text-xs sm:text-sm text-amber-950">
                  <strong>Contoh:</strong> {item.contoh}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-emerald-950 text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-extrabold text-amber-300">
            Ingin melihat penerapan istilah di atas secara langsung?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100">
            Seluruh istilah teknis ini diimplementasikan secara visual pada kanvas Peta Ayat.
          </p>
        </div>
        <button
          onClick={() => setTabUtama('visualisasi')}
          className="shrink-0 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-5 py-2.5 rounded-xl text-sm font-extrabold transition"
        >
          Buka Peta Ayat →
        </button>
      </div>
    </div>
  );

  // ==========================================================
  // TAB 5: KUIS INTERAKTIF (10 SOAL + INDIKATOR KAIDAH)
  // ==========================================================
  const renderKuis = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-6 animate-fade-in">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-20 z-20">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Evaluasi Pemahaman ({kuisData.length} Soal)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pilih opsi jawaban A, B, atau C untuk menguji penguasaan 9 Kaidah Dhamir Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl shrink-0">
          <div className="text-right">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Skor Anda</div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-950">
              {totalBenar} / {kuisData.length} Benar
            </div>
          </div>
          {totalTerjawab > 0 && (
            <button
              onClick={() => setJawabanUser({})}
              className="text-xs font-bold bg-white text-slate-700 hover:bg-stone-100 border border-stone-300 px-3 py-1.5 rounded-lg transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {kuisData.map((quiz, idx) => {
          const pilihanUser = jawabanUser[quiz.id];
          const sudahJawab = Boolean(pilihanUser);

          return (
            <div
              key={quiz.id}
              className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  Soal {idx + 1} • {quiz.kaidahTerkait}
                </span>
                {sudahJawab && (
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                      pilihanUser === quiz.jawabanBenar
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {pilihanUser === quiz.jawabanBenar ? 'Benar' : 'Kurang Tepat'}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {quiz.soal}
              </h3>

              <div className="space-y-2.5">
                {quiz.pilihan.map((opsi) => {
                  const dipilih = pilihanUser === opsi.kode;
                  const adalahKunci = opsi.kode === quiz.jawabanBenar;

                  let kelasTombol =
                    'bg-stone-50 hover:bg-amber-50/60 text-slate-800 border-stone-200';
                  if (sudahJawab) {
                    if (adalahKunci) {
                      kelasTombol =
                        'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                    } else if (dipilih && !adalahKunci) {
                      kelasTombol =
                        'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                    } else {
                      kelasTombol = 'bg-stone-50 text-slate-400 border-stone-200 opacity-75';
                    }
                  }

                  return (
                    <button
                      key={opsi.kode}
                      type="button"
                      onClick={() =>
                        setJawabanUser((prev) => ({ ...prev, [quiz.id]: opsi.kode }))
                      }
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 text-sm sm:text-base transition flex items-start gap-3 ${kelasTombol}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                          sudahJawab && adalahKunci
                            ? 'bg-emerald-600 text-white'
                            : sudahJawab && dipilih && !adalahKunci
                            ? 'bg-rose-600 text-white'
                            : 'bg-stone-200 text-slate-800'
                        }`}
                      >
                        {opsi.kode}
                      </span>
                      <span className="flex-1 leading-relaxed">{opsi.teks}</span>
                    </button>
                  );
                })}
              </div>

              {sudahJawab && (
                <div
                  className={`p-4 sm:p-5 rounded-xl border animate-fade-in text-sm sm:text-base ${
                    pilihanUser === quiz.jawabanBenar
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="font-extrabold mb-1">
                    {pilihanUser === quiz.jawabanBenar
                      ? '✓ Analisis Anda Tepat!'
                      : `✗ Jawaban yang Tepat: Opsi ${quiz.jawabanBenar}`}
                  </div>
                  <p className="leading-relaxed text-slate-700">{quiz.pembahasan}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ==========================================================
  // TAB 2: VISUALISASI PETA AYAT (DIKSI DINAMIS & KARTU TERPADU)
  // ==========================================================
  const renderVisualisasi = () => {
    const punyaBanyakPerspektif = ayatAktif && ayatAktif.perspektif.length > 1;

    return (
      <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-fade-in">
        {/* Navigasi Kaidah Horizontal untuk HP */}
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
              const kosong = !item.daftar_ayat || item.daftar_ayat.length === 0;
              return (
                <button
                  key={item.id}
                  disabled={kosong}
                  onClick={() => !kosong && pilihKaidah(item.id)}
                  className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition ${
                    kosong
                      ? 'bg-stone-100 text-slate-400 border-stone-200 opacity-60 cursor-not-allowed'
                      : aktif
                      ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                      : 'bg-white text-slate-800 border-stone-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        aktif
                          ? 'bg-amber-400 text-emerald-950'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      Kaidah {item.nomor_kaidah}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        aktif ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      {kosong ? 'Segera Hadir' : `${item.daftar_ayat.length} Ayat`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Desktop */}
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
                  const kosong = !item.daftar_ayat || item.daftar_ayat.length === 0;
                  return (
                    <button
                      key={item.id}
                      disabled={kosong}
                      onClick={() => !kosong && pilihKaidah(item.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        kosong
                          ? 'bg-stone-100 text-slate-400 border-stone-200 opacity-60 cursor-not-allowed'
                          : aktif
                          ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                          : 'bg-stone-50/70 text-slate-800 border-stone-200 hover:border-emerald-500 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            aktif
                              ? 'bg-amber-400 text-emerald-950'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          Bab: {item.kategori}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            aktif ? 'text-amber-300' : 'text-slate-500'
                          }`}
                        >
                          {kosong ? 'Segera Hadir' : `${item.daftar_ayat.length} Ayat`}
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-snug">{item.judul_kaidah}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Area Utama Kanvas */}
          <section className="lg:col-span-8 space-y-5">
            {/* Kartu Rumusan Kaidah dengan Akordeon Collapsible */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Rumusan Kaidah ({dataAktif.kategori})
                </span>
                <span className="text-xs font-bold text-slate-500">{dataAktif.sumber_kitab}</span>
              </div>

              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                {dataAktif.judul_kaidah}
              </h2>

              <div className="kanvas-mushaf border border-amber-200/80 border-r-4 border-r-emerald-800 p-4 sm:p-5 rounded-xl space-y-3">
                <p
                  dir="rtl"
                  className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
                >
                  {dataAktif.redaksi_kaidah}
                </p>

                <div className="pt-2 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={() => setBukaTawdhih(!bukaTawdhih)}
                    className="w-full flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-900 hover:text-emerald-700 py-1 text-left"
                  >
                    <span>
                      {bukaTawdhih
                        ? 'Sembunyikan Terjemah & Tawdhih Kaidah'
                        : 'Lihat Terjemah & Penjelasan (Tawdhih) Kaidah'}
                    </span>
                    <span className="text-sm ml-2 shrink-0">{bukaTawdhih ? '▲' : '▼'}</span>
                  </button>

                  {bukaTawdhih && (
                    <div className="mt-3 space-y-2 text-sm animate-fade-in">
                      <p className="text-slate-800 leading-relaxed">
                        <span className="font-bold text-emerald-950">Terjemah Kaidah:</span>{' '}
                        {dataAktif.terjemah_kaidah}
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800">Tawdhih al-Qa'idah:</span>{' '}
                        {dataAktif.tawdhih_kaidah}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pilihan Ayat dalam Kaidah */}
              <div className="pt-1 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Pilih Ayat Penerapan / Tathbiq ({dataAktif.daftar_ayat.length} Ayat):
                </span>
                <div className="flex flex-wrap gap-2">
                  {dataAktif.daftar_ayat.map((ayat, idx) => {
                    const aktif = idx === ayatIdxAktif;
                    return (
                      <button
                        key={ayat.id_ayat}
                        onClick={() => pilihAyat(idx)}
                        className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition text-left ${
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

            {/* Kanvas Visualisasi Ayat */}
            {ayatAktif && perspektifAktif && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-extrabold text-emerald-950">
                        {ayatAktif.surah_ayat}
                      </span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full">
                        {ayatAktif.label_kategori}
                      </span>
                    </div>
                    {/* Diksi Dinamis Sesuai Jumlah Perspektif */}
                    <span className="text-xs sm:text-sm text-slate-500 block mt-1">
                      {punyaBanyakPerspektif
                        ? 'Ayat ini memiliki khilaf/ragam tinjauan: ketuk tombol pendapat ulama di bawah untuk membandingkan arah panah'
                        : 'Ketuk kata bahasa Arab pada mushaf atau kartu jalur di bawah untuk menyorot arah rujukan dhamir'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTampilkanPanah(!tampilkanPanah)}
                    className={`self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 shrink-0 ${
                      tampilkanPanah
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {tampilkanPanah ? 'Panah Visual: Aktif' : 'Mode Uji: Panah Disembunyikan'}
                  </button>
                </div>

                {/* Tombol Pendapat Ulama atau Badge Pendekatan Kaidah */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {punyaBanyakPerspektif
                      ? `Perbandingan Pendapat Ulama (${ayatAktif.perspektif.length} Perspektif):`
                      : 'Pendekatan Kaidah & Penafsiran:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ayatAktif.perspektif.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPerspektifIdx(idx);
                          setPanahTerpilih(null);
                        }}
                        className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition text-left ${
                          perspektifIdx === idx
                            ? 'bg-emerald-900 text-white shadow-md'
                            : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                        }`}
                      >
                        {p.nama}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legenda Warna Interaktif */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setInfoIstilahAktif(infoIstilahAktif === 'dhamir' ? null : 'dhamir')
                        }
                        className="inline-flex items-center gap-1.5 font-semibold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Isim Dhamir ⓘ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInfoIstilahAktif(infoIstilahAktif === 'marja' ? null : 'marja')
                        }
                        className="inline-flex items-center gap-1.5 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        Marja' (Rujukan) ⓘ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInfoIstilahAktif(infoIstilahAktif === 'qarinah' ? null : 'qarinah')
                        }
                        className="inline-flex items-center gap-1.5 font-semibold bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        Qarinah ⓘ
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">Ketuk kata Arab untuk i'rab</span>
                  </div>

                  {infoIstilahAktif && (
                    <div className="bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                      <span>{infoLegenda[infoIstilahAktif]}</span>
                      <button
                        onClick={() => setInfoIstilahAktif(null)}
                        className="text-amber-300 font-bold shrink-0"
                      >
                        Tutup
                      </button>
                    </div>
                  )}
                </div>

                {/* Panggung Kanvas Mushaf */}
                <div
                  key={`${dataAktif.id}-${ayatIdxAktif}`}
                  ref={stageRef}
                  className="kanvas-mushaf relative pt-28 pb-9 px-3.5 sm:px-8 rounded-2xl border-2 border-amber-300/60 shadow-inner overflow-x-auto"
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

                {/* Lencana Marja' Siyaqi Eksternal (Sistem Kebal Eror) */}
                {perspektifAktif.panah.some(p => p.ke === 'external') && (
                  <div className="flex justify-center mb-12 relative z-10">
                    <div
                      ref={externalMarjaRef}
                      dir="rtl"
                      className="font-arab text-lg sm:text-xl font-bold bg-emerald-950 text-amber-200 px-5 py-1.5 rounded-full border-2 border-amber-400 shadow-md"
                    >
                      {ayatAktif.marja_eksternal || "مرجع خارجي (Rujukan di luar ayat)"}
                    </div>
                  </div>
                )}

                  <div
                    dir="rtl"
                    className="font-arab flex flex-wrap justify-center items-baseline gap-x-2.5 sm:gap-x-4 gap-y-6 text-3xl sm:text-5xl relative z-10"
                  >
                    {ayatAktif.tokens.map((token) => {
                      const terpilih = kataTerpilih?.id === token.id;
                      let gayaKata =
                        'text-slate-950 hover:bg-amber-100/50 px-1.5 py-1 rounded-lg';
                      let tagKecil = null;

                      if (token.peran === 'dhamir') {
                        gayaKata =
                          'bg-amber-200/75 text-amber-950 border-b-4 border-amber-500 px-2.5 py-1 rounded-t-xl font-bold';
                        tagKecil = { teks: 'Dhamir', warna: 'text-amber-800' };
                      } else if (token.peran === 'marja') {
                        gayaKata =
                          'bg-emerald-100/85 text-emerald-950 border-b-4 border-emerald-600 px-2.5 py-1 rounded-t-xl font-bold';
                        tagKecil = { teks: "Marja'", warna: 'text-emerald-800' };
                      } else if (token.peran === 'qarinah') {
                        gayaKata =
                          'bg-sky-100/75 text-sky-950 border-b-4 border-sky-500 px-2 py-1 rounded-t-xl';
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
                              className={`font-sans text-[10px] sm:text-[11px] font-extrabold tracking-wide -mt-1 ${tagKecil.warna}`}
                            >
                              {tagKecil.teks}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Box I'rab Kata */}
                {kataTerpilih && (
                  <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          dir="rtl"
                          className="font-arab text-2xl sm:text-3xl text-amber-300 font-bold"
                        >
                          {kataTerpilih.teks}
                        </span>
                        {kataTerpilih.arti && (
                          <span className="text-xs sm:text-sm font-semibold text-emerald-200">
                            ("{kataTerpilih.arti}")
                          </span>
                        )}
                        <span className="text-xs font-bold bg-emerald-900 text-amber-200 px-3 py-1 rounded-lg border border-emerald-700">
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

                {/* Rincian Jalur Panah */}
                {tampilkanPanah && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Rincian Jalur Panah Rujukan (Ketuk untuk sorot panah)
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
                              <p className="text-sm font-bold text-slate-900">{p.label}</p>
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

                {/* Terjemahan Ayat */}
                <blockquote className="text-sm sm:text-base italic text-slate-700 bg-stone-50 border-l-4 border-emerald-700 px-4 py-3.5 rounded-r-xl leading-relaxed">
                  "{ayatAktif.terjemahan}"
                </blockquote>

                {/* KARTU TERPADU: ANALISIS TARJIH, QARINAH, & TAKHRIJ KITAB (TANPA RUANG KOSONG MUBAZIR) */}
                <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 overflow-hidden">
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-950">
                        Analisis Tarjih & Qarinah ({perspektifAktif.nama})
                      </h3>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300/70 px-2.5 py-0.5 rounded-md">
                        Metode: {perspektifAktif.metode_tarjih}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {perspektifAktif.analisis}
                    </p>

                    <div className="text-xs sm:text-sm text-emerald-950 bg-white p-3.5 rounded-xl border border-emerald-200/80 leading-relaxed shadow-sm">
                      <span className="font-extrabold text-emerald-900">Qarinah Penentu:</span>{' '}
                      {perspektifAktif.qarinah}
                    </div>
                  </div>

                  {/* Bar Takhrij Terintegrasi di Bawah Tanpa Menyisakan Whitespace */}
                  <div className="bg-amber-50/90 border-t border-amber-200/80 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs sm:text-sm">
                    <div className="text-amber-950">
                      <span className="font-extrabold uppercase tracking-wider text-[11px] bg-amber-200/70 px-2 py-0.5 rounded mr-2">
                        Takhrij Kitab
                      </span>
                      <span className="font-semibold">{perspektifAktif.rujukan}</span>
                    </div>
                    <span className="text-xs text-amber-900/75 italic">
                      Qawa'id al-Tafsir (Dr. Khalid al-Sabt)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  // ==========================================================
  // RENDER UTAMA APLIKASI
  // ==========================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f0]">
      {/* Header Responsif dengan Kunci Warna Putih untuk Judul */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTabUtama('beranda')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                <span className="font-arab text-xl font-bold text-amber-300 pt-1">ض</span>
              </div>
              <div>
                <h1
                  style={{ color: '#ffffff' }}
                  className="text-base sm:text-lg font-extrabold tracking-tight leading-none text-white group-hover:text-amber-300 transition"
                >
                  Dhamir-Lens
                </h1>
                <span className="text-[11px] text-emerald-200/90 block mt-0.5">
                  Laboratorium Digital Qawaid Tafsir
                </span>
              </div>
            </button>
          </div>

          {/* 5 Tab Navigasi Responsif (Muat 1 Baris di HP & Laptop) */}
          <nav className="grid grid-cols-5 sm:flex gap-1 sm:gap-1.5 bg-emerald-900/70 p-1 rounded-xl border border-emerald-800">
            {[
              { id: 'beranda', label: 'Beranda' },
              { id: 'visualisasi', label: 'Peta Ayat' },
              { id: 'indeks', label: '9 Kaidah' },
              { id: 'glosarium', label: 'Glosarium' },
              { id: 'kuis', label: 'Latihan' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabUtama(tab.id)}
                className={`px-1.5 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-sm font-bold text-center transition-colors truncate ${
                  tabUtama === tab.id
                    ? 'bg-amber-400 text-emerald-950 shadow-sm font-extrabold'
                    : 'text-emerald-100 hover:bg-emerald-800/70 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {tabUtama === 'beranda' && renderBeranda()}
        {tabUtama === 'visualisasi' && renderVisualisasi()}
        {tabUtama === 'indeks' && renderIndeksKaidah()}
        {tabUtama === 'glosarium' && renderGlosarium()}
        {tabUtama === 'kuis' && renderKuis()}
      </main>

      <footer className="bg-white border-t border-stone-200 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-slate-500 font-medium">
          <strong>Dhamir-Lens</strong> — Instrumen R&D Visualisasi Marja' al-Dhamir (Rujukan Kitab Dr. Khalid bin Utsman al-Sabt)
        </div>
      </footer>
    </div>
  );
}