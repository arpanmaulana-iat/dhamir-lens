import React, { useState, useEffect, useRef, useCallback } from 'react';
  import dhamirData from './data/dhamir_data.json';
  import { penelitiInfo, definisiDhamir, glosariumData, kuisData } from './data/ui_content.js';
  
  // Helper penghapus harakat untuk pencarian Arab di Glosarium & Indeks
  const normalisasiArab = (teks = '') =>
    teks.replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim();
  
  // Helper merender teks Indonesia yang mengandung sisipan kata Arab agar font Arab besar, tidak putus harakat, dan aman RTL/LTR
  const renderTeksCampuran = (teks) => {
    if (!teks) return null;
    const bagian = teks.split(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g);
    return bagian.map((segmen, idx) => {
      if (/[\u0600-\u06FF]/.test(segmen)) {
        return (
          <bdi
            key={idx}
            lang="ar"
            dir="rtl"
            className="font-arab text-xl sm:text-2xl font-bold text-emerald-950 px-1 inline-block leading-normal align-middle"
          >
            {segmen}
          </bdi>
        );
      }
      return <span key={idx}>{segmen}</span>;
    });
  };
  
  // Helper merender Lencana Marja' Eksternal yang mencampur teks Arab dan kurung Latin agar tidak terbalik
  const renderMarjaEksternal = (teks) => {
    if (!teks) return 'مرجع خارجي (Rujukan Konteks)';
    const segmenPerGarisMiring = teks.split(/\s*\/\s*/);
    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        {segmenPerGarisMiring.map((segmen, idx) => {
          const match = segmen.match(/^([\u0600-\u06FF\s\u064B-\u065F\u0670]+)\s*(\(.+\))?$/);
          if (match) {
            const arab = match[1].trim();
            const latin = match[2] ? match[2].trim() : '';
            return (
              <React.Fragment key="{idx}">
                {idx > 0 && <span className="text-amber-400/70 font-sans">/</span>}
                <span className="inline-flex items-center gap-1.5">
                  <bdi lang="ar" dir="rtl" className="font-arab text-xl sm:text-2xl font-bold text-amber-200">
                    {arab}
                  </bdi>
                  {latin && (
                    <bdi dir="ltr" className="font-sans text-xs sm:text-sm font-semibold text-emerald-100">
                      {latin}
                    </bdi>
                  )}
                </span>
              </React.Fragment>
            );
          }
          return (
            <bdi key={idx} dir="auto" className="text-sm sm:text-base font-bold">
              {segmen}
            </bdi>
          );
        })}
      </span>
    );
  };
  
  export default function App() {
    // --- STATE NAVIGASI & INTERAKSI ---
    const [tabUtama, setTabUtama] = useState('beranda');
    const [bukaTawdhih, setBukaTawdhih] = useState(false);
    const [cariGlosarium, setCariGlosarium] = useState('');
    const [cariIndeksKaidah, setCariIndeksKaidah] = useState('');
    const [kaidahTerbuka, setKaidahTerbuka] = useState({ k1: true }); // Collapsible di tab 9 Kaidah
  
    // State Kuis dengan penyimpanan localStorage
    const [jawabanUser, setJawabanUser] = useState(() => {
      try {
        const tersimpan = localStorage.getItem('dhamir_lens_quiz_v2');
        return tersimpan ? JSON.parse(tersimpan) : {};
      } catch {
        return {};
      }
    });
    const [filterKaidahKuis, setFilterKaidahKuis] = useState('semua');
    const [modeKuis, setModeKuis] = useState('fokus'); // 'fokus' | 'semua' | 'rapor'
    const [soalAktifIdx, setSoalAktifIdx] = useState(0);
  
    const [infoIstilahAktif, setInfoIstilahAktif] = useState(null);
    const [notifikasiSalin, setNotifikasiSalin] = useState(false);
  
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
  
    // Simpan progres kuis ke localStorage
    useEffect(() => {
      try {
        localStorage.setItem('dhamir_lens_quiz_v2', JSON.stringify(jawabanUser));
      } catch {
        // Abaikan jika mode privat memblokir localStorage
      }
    }, [jawabanUser]);
  
    // --- FILTER DATA ---
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
      const qArab = normalisasiArab(cariIndeksKaidah);
      return (
        item.judul_kaidah.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.terjemah_kaidah.toLowerCase().includes(q) ||
        item.tawdhih_kaidah.toLowerCase().includes(q) ||
        (qArab && normalisasiArab(item.redaksi_kaidah).includes(qArab)) ||
        item.daftar_ayat.some((a) => a.surah_ayat.toLowerCase().includes(q))
      );
    });
  
    // Pencarian Glosarium mendukung Latin & Teks Arab (dengan/tanpa harakat)
    const glosariumTerfilter = glosariumData.filter((item) => {
      const q = cariGlosarium.toLowerCase().trim();
      if (!q) return true;
      const qArab = normalisasiArab(cariGlosarium);
      const cocokLatin =
        item.istilah.toLowerCase().includes(q) ||
        item.arti.toLowerCase().includes(q) ||
        (item.contoh && item.contoh.toLowerCase().includes(q));
      const cocokArab =
        qArab.length > 0 &&
        ((item.arab && normalisasiArab(item.arab).includes(qArab)) ||
          (item.contoh && normalisasiArab(item.contoh).includes(qArab)));
      return cocokLatin || cocokArab;
    });
  
    // Filter soal kuis berdasarkan kaidah
    const daftarSoalAktif =
      filterKaidahKuis === 'semua'
        ? kuisData
        : kuisData.filter((q) => q.kaidahId === filterKaidahKuis);
  
    const dataAktif = dhamirData.find((item) => item.id === kaidahIdAktif) || dhamirData[0];
    const ayatAktif = dataAktif.daftar_ayat[ayatIdxAktif] || dataAktif.daftar_ayat[0];
    const perspektifAktif = ayatAktif?.perspektif[perspektifIdx] || ayatAktif?.perspektif[0];
  
    const totalAyatKorpus = dhamirData.reduce((acc, k) => acc + k.daftar_ayat.length, 0);
  
    const totalTerjawab = Object.keys(jawabanUser).length;
    const totalBenar = kuisData.reduce(
      (acc, q) => (jawabanUser[q.id] === q.jawabanBenar ? acc + 1 : acc),
      0
    );
  
    // --- ALGORITMA SVG ANTI-TABRAKAN TEKS & BADGE NOMOR ANTI-MENUMPUK ---
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
  
          // Geser titik berangkat dan titik tiba jika ada > 1 panah agar garis tidak berhimpitan
          const arahSebaran = index === 0 ? 0 : index % 2 === 1 ? -14 : 14;
          const startX = rectDari.left - stageRect.left + rectDari.width / 2 + arahSebaran * 0.6;
          const endX =
            rectKe.left -
            stageRect.left +
            rectKe.width / 2 +
            (item.ke === 'external' ? arahSebaran * 1.6 : 0);
  
          const startY = rectDari.top - stageRect.top + 2;
          const endY =
            item.ke === 'external'
              ? rectKe.bottom - stageRect.top + 4
              : rectKe.top - stageRect.top + 2;
  
          const jarakX = Math.abs(endX - startX);
          const bedaBaris = Math.abs(startY - endY) > 28;
  
          let path = '';
          let puncakX = (startX + endX) / 2;
          let puncakY = Math.min(startY, endY) - 38;
  
          if (item.ke === 'external') {
            // Tarik kurva tinggi di ruang kosong antara lencana eksternal dan baris kata teratas
            const ctrlX1 = startX + arahSebaran * 1.8;
            const ctrlX2 = endX + arahSebaran * 1.8;
            const ctrlY = endY + (startY - endY) * 0.35;
  
            path = `M ${startX} ${startY} C ${ctrlX1} ${ctrlY}, ${ctrlX2} ${ctrlY}, ${endX} ${endY}`;
  
            // Tempatkan badge nomor di dekat lencana atas (ruang bebas kata) dan pisahkan kiri-kanan
            const t = 0.62;
            const mt = 1 - t;
            puncakX =
              mt * mt * mt * startX +
              3 * mt * mt * t * ctrlX1 +
              3 * mt * t * t * ctrlX2 +
              t * t * t * endX +
              (index === 0 ? -16 : 16);
            puncakY =
              mt * mt * mt * startY +
              3 * mt * mt * t * ctrlY +
              3 * mt * t * t * ctrlY +
              t * t * t * endY -
              (index % 2) * 8;
          } else {
            // Untuk panah internal, lambungkan di atas baris tertinggi dari kedua kata
            const topMostY = Math.min(startY, endY);
            const ekstraTinggi = bedaBaris
              ? 54 + index * 26
              : Math.min(84, Math.max(44, jarakX * 0.26)) + index * 24;
            const ctrlY = Math.max(16, topMostY - ekstraTinggi);
  
            path = `M ${startX} ${startY} C ${startX} ${ctrlY}, ${endX} ${ctrlY}, ${endX} ${endY}`;
            puncakX = 0.5 * startX + 0.5 * endX + (index > 0 ? (index % 2 === 1 ? -14 : 14) : 0);
            puncakY = 0.125 * startY + 0.75 * ctrlY + 0.125 * endY;
          }
  
          return {
            ...item,
            index,
            path,
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
      const timer = setTimeout(hitungKoordinatPanah, 220);
  
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
  
    const toggleLipatKaidah = (id) => {
      setKaidahTerbuka((prev) => ({ ...prev, [id]: !prev[id] }));
    };
  
    const bukaAtauTutupSemuaKaidah = (statusBuka) => {
      const baru = {};
      dhamirData.forEach((k) => {
        baru[k.id] = statusBuka;
      });
      setKaidahTerbuka(baru);
    };
  
    // --- FITUR EKSPOR SITASI ILMIAH R&D ---
    const salinSitasiIlmiah = () => {
      if (!ayatAktif || !perspektifAktif) return;
      const teksArabUtuh = ayatAktif.tokens.map((t) => t.teks).join(' ');
      const daftarJalur = perspektifAktif.panah
        .map((p, i) => `   ${i + 1}. ${p.label} (${p.penjelasan_singkat})`)
        .join('\n');
  
      const teksSitasi = `[SITASI LABORATORIUM DIGITAL DHAMIR-LENS]
  • Pengembang Instrumen: ${penelitiInfo.nama} (${penelitiInfo.email})
  • Kaidah: ${dataAktif.judul_kaidah} (${dataAktif.kategori})
  • Matan Kaidah: ${dataAktif.redaksi_kaidah}
  • Objek Ayat: ${ayatAktif.surah_ayat} — ﴿ ${teksArabUtuh} ﴾
  • Terjemahan: "${ayatAktif.terjemahan}"
  • Pendekatan / Perspektif: ${perspektifAktif.nama} (Metode: ${perspektifAktif.metode_tarjih})
  • Skema Jalur Rujukan Dhamir:
  ${daftarJalur}
  • Analisis: ${perspektifAktif.analisis}
  • Qarinah Penentu: ${perspektifAktif.qarinah}
  • Otoritas Rujukan: ${perspektifAktif.rujukan} | Kitab Qawa'id al-Tafsir Jam'an wa Dirasatan (Dr. Khalid bin Utsman al-Sabt)`;
  
      navigator.clipboard.writeText(teksSitasi);
      setNotifikasiSalin(true);
      setTimeout(() => setNotifikasiSalin(false), 3000);
    };
  
    const infoLegenda = {
      dhamir: "Dhamir: Kata ganti (seperti -hu, -ha, hum) yang merujuk pada lafaz lain.",
      marja: "Marja': Kata atau entitas yang menjadi tempat kembalinya dhamir.",
      qarinah: "Qarinah: Indikator atau petunjuk konteks dalam ayat yang menguatkan arah kembalinya dhamir."
    };
  
    // ==========================================================
    // TAB 1: BERANDA (DENGAN IDENTITAS PENELITI & KONTAK KRISAR)
    // ==========================================================
    const renderBeranda = () => (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-12 space-y-8 sm:space-y-10 animate-fade-in">
        <div className="text-center space-y-3.5">
          <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full">
            Instrumen Penelitian R&D Ilmu Al-Qur'an & Tafsir
          </span>
          <h2 className="text-2xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Selamat Datang di Dhamir-Lens
          </h2>
          <p className="text-sm sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
            Laboratorium digital interaktif untuk memetakan dan memvisualisasikan kaidah{' '}
            <em>Marja' al-Dhamir</em> berdasarkan kitab <strong>Qawa'id al-Tafsir</strong> karya Dr. Khalid bin Utsman al-Sabt.
          </p>
        </div>
  
        {/* Bar Statistik Interaktif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setTabUtama('indeks')}
            className="bg-white hover:border-emerald-600 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 group-hover:scale-105 transition">
              {dhamirData.length}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Kaidah Utama →</div>
          </button>
          <button
            onClick={() => setTabUtama('visualisasi')}
            className="bg-white hover:border-amber-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 group-hover:scale-105 transition">
              {totalAyatKorpus}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Ayat Tathbiq →</div>
          </button>
          <button
            onClick={() => setTabUtama('glosarium')}
            className="bg-white hover:border-emerald-600 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 group-hover:scale-105 transition">
              {glosariumData.length}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Istilah Kunci →</div>
          </button>
          <button
            onClick={() => setTabUtama('kuis')}
            className="bg-white hover:border-amber-500 p-4 sm:p-5 rounded-2xl border border-stone-200 text-center shadow-sm transition group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 group-hover:scale-105 transition">
              {kuisData.length}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Soal Evaluasi →</div>
          </button>
        </div>
  
        {/* Kartu Definisi Dhamir */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-xl space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 font-arab font-bold text-2xl pb-1 shadow">
                ض
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-amber-300">
                {definisiDhamir.judul}
              </h3>
            </div>
            <span className="text-xs font-extrabold bg-emerald-950/90 text-amber-200 px-3.5 py-1.5 rounded-full border border-amber-400/40">
              Kitab Hlm. {definisiDhamir.halaman}
            </span>
          </div>
  
          <p
            dir="rtl"
            lang="ar"
            className="font-arab text-2xl sm:text-3xl text-right text-white leading-[2.1] bg-black/25 p-5 sm:p-6 rounded-2xl border border-emerald-700/60 relative z-10"
          >
            {definisiDhamir.arab}
          </p>
  
          <p className="text-emerald-50 leading-relaxed text-sm sm:text-base border-l-4 border-amber-400 pl-4 sm:pl-5 bg-emerald-950/50 py-3.5 pr-4 rounded-r-xl relative z-10">
            {definisiDhamir.penjelasan}
          </p>
  
          <div className="pt-3 border-t border-emerald-800/80 text-xs sm:text-sm text-emerald-100 relative z-10">
            <strong className="text-amber-300">Otoritas Rujukan:</strong>{' '}
            {definisiDhamir.rujukan.join(' | ')}
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
                <p className="text-sm text-slate-700 leading-relaxed">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Kartu Identitas Penyusun Skripsi & Saluran Kritik/Saran */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-800/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-950 px-3 py-1 rounded-full border border-amber-300">
              Identitas Peneliti & Pengembang
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {penelitiInfo.nama}
            </h3>
            <p className="text-sm text-slate-700 font-semibold">
              {penelitiInfo.peran} — {penelitiInfo.bidang}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {penelitiInfo.catatanValidasi} Apabila Anda menemukan masukan terkait akurasi rujukan halaman, analisis i'rab, maupun pengalaman antarmuka (UI/UX), silakan kirimkan kritik dan saran Anda.
            </p>
          </div>
  
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <a
              href={`mailto:${penelitiInfo.email}?subject=Kritik%20%26%20Saran%20Aplikasi%20Dhamir-Lens`}
              className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-center shadow-sm transition"
            >
              ✉️ Kirim Kritik & Saran
            </a>
            <div className="text-xs font-bold text-slate-700 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200 text-center select-all">
              {penelitiInfo.email}
            </div>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
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
            Lihat Himpunan 9 Kaidah
          </button>
        </div>
      </div>
    );
  
    // ==========================================================
    // TAB 3: INDEKS PENGHIMPUN 9 KAIDAH (DENGAN KARTU COLLAPSIBLE)
    // ==========================================================
    const renderIndeksKaidah = () => (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-5 animate-fade-in">
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                Korpus Utuh Bab Al-Dhama'ir (Hlm. 398–419)
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-1">
                Himpunan 9 Kaidah Marja' al-Dhamir
              </h2>
              <p className="text-xs sm:text-sm text-slate-700">
                Ketuk judul kaidah untuk membuka atau melipat rincian matan dan daftar ayat penerapannya.
              </p>
            </div>
  
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={cariIndeksKaidah}
                  onChange={(e) => setCariIndeksKaidah(e.target.value)}
                  placeholder="Cari kaidah, teks Arab, atau surah..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => bukaAtauTutupSemuaKaidah(true)}
                  className="text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => bukaAtauTutupSemuaKaidah(false)}
                  className="text-xs font-bold text-slate-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-300 transition"
                >
                  Lipat Semua
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div className="space-y-3.5">
          {indeksKaidahTerfilter.map((k) => {
            const terbuka = Boolean(kaidahTerbuka[k.id]) || cariIndeksKaidah.trim().length > 0;
            return (
              <div
                key={k.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-600 transition shadow-sm overflow-hidden"
              >
                {/* Header Kaidah yang Bisa Diketuk (Collapsible) */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleLipatKaidah(k.id)}
                    className="flex items-center gap-3 text-left flex-1 min-w-[240px]"
                  >
                    <span className="w-9 h-9 rounded-xl bg-emerald-950 text-amber-300 text-sm font-extrabold flex items-center justify-center shrink-0">
                      {k.nomor_kaidah}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Bab: {k.kategori}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          ({k.daftar_ayat.length} Ayat)
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 mt-1">
                        {k.judul_kaidah}
                      </h3>
                    </div>
                    <span className="text-slate-500 font-bold text-sm px-2">
                      {terbuka ? '▲' : '▼'}
                    </span>
                  </button>
  
                  <button
                    type="button"
                    onClick={() => {
                      pilihKaidah(k.id, 0);
                      setTabUtama('visualisasi');
                    }}
                    className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white transition shrink-0"
                  >
                    Peta Ayat →
                  </button>
                </div>
  
                {terbuka && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-stone-100 animate-fade-in">
                    <div className="kanvas-mushaf p-4 rounded-xl border border-amber-300/80 border-r-4 border-r-emerald-800 space-y-2.5">
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
                      >
                        {k.redaksi_kaidah}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-2 border-t border-stone-200">
                        <strong className="text-emerald-950">Terjemah:</strong> {k.terjemah_kaidah}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Tawdhih:</strong> {k.tawdhih_kaidah}
                      </p>
                    </div>
  
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-semibold">
                        <span className="uppercase tracking-wider text-slate-600">
                          Pilih Ayat Penerapan ({k.daftar_ayat.length} Ayat):
                        </span>
                        <span className="text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          {k.sumber_kitab}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {k.daftar_ayat.map((a, idx) => (
                          <button
                            key={a.id_ayat}
                            onClick={() => {
                              pilihKaidah(k.id, idx);
                              setTabUtama('visualisasi');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-amber-400 hover:text-emerald-950 text-slate-800 border border-stone-300 transition"
                          >
                            {a.surah_ayat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  
    // ==========================================================
    // TAB 4: GLOSARIUM (BADGE TIDAK TABRAKAN & TEKS ARAB INLINE BESAR)
    // ==========================================================
    const renderGlosarium = () => (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Glosarium Istilah</h2>
            <p className="text-sm sm:text-base text-slate-700">
              Kamus ringkas terminologi Ulumul Qur'an dan Nahwu (mendukung pencarian Latin maupun Arab).
            </p>
          </div>
  
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={cariGlosarium}
              onChange={(e) => setCariGlosarium(e.target.value)}
              placeholder="Cari istilah Latin atau Arab (ضَمِير)..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
  
        {glosariumTerfilter.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-slate-600 text-sm">
            Istilah "{cariGlosarium}" tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glosariumTerfilter.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 hover:border-emerald-600 transition shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header dipisah dan diberi flex-wrap agar Mudhaf & Mudhaf Ilayh tidak bertabrakan dengan judul Arab */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <span className="inline-block text-sm sm:text-base font-extrabold text-emerald-950 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      {item.istilah}
                    </span>
                    {item.arab && (
                      <bdi
                        dir="rtl"
                        lang="ar"
                        className="font-arab text-2xl sm:text-3xl font-bold text-amber-900 leading-normal"
                      >
                        {item.arab}
                      </bdi>
                    )}
                  </div>
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
                    {renderTeksCampuran(item.arti)}
                  </p>
                </div>
                {item.contoh && (
                  <div className="bg-amber-50/90 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-xs sm:text-sm text-amber-950 leading-relaxed">
                    <strong>Contoh:</strong> {renderTeksCampuran(item.contoh)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  
    // ==========================================================
    // TAB 5: KUIS INTERAKTIF (4 OPSI, PENJELASAN OPSI SALAH, FILTER KAIDAH, & RAPOR SKOR)
    // ==========================================================
    const renderSatuKartuSoal = (quiz, idx, totalDaftar) => {
      const pilihanUser = jawabanUser[quiz.id];
      const sudahJawab = Boolean(pilihanUser);
      const objekPilihanUser = quiz.pilihan.find((o) => o.kode === pilihanUser);
  
      return (
        <div
          key={quiz.id}
          className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-950 px-3 py-1 rounded-full border border-amber-300">
              Soal {idx + 1} dari {totalDaftar} • {quiz.kaidahTerkait}
            </span>
            {sudahJawab && (
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  pilihanUser === quiz.jawabanBenar
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {pilihanUser === quiz.jawabanBenar ? '✓ Jawaban Anda Benar' : '✗ Jawaban Anda Kurang Tepat'}
              </span>
            )}
          </div>
  
          {/* Kutipan Matan Ayat Berbahasa Arab */}
          {quiz.kutipanArab && (
            <div className="kanvas-mushaf p-4 rounded-xl border border-amber-300/80 border-r-4 border-r-emerald-800">
              <p
                dir="rtl"
                lang="ar"
                className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
              >
                {quiz.kutipanArab}
              </p>
            </div>
          )}
  
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {renderTeksCampuran(quiz.soal)}
          </h3>
  
          <div className="space-y-2.5">
            {quiz.pilihan.map((opsi) => {
              const dipilih = pilihanUser === opsi.kode;
              const adalahKunci = opsi.kode === quiz.jawabanBenar;
  
              let kelasTombol =
                'bg-stone-50 hover:bg-amber-50/70 text-slate-900 border-stone-300';
              if (sudahJawab) {
                if (adalahKunci) {
                  kelasTombol =
                    'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-1 ring-emerald-500';
                } else if (dipilih && !adalahKunci) {
                  kelasTombol =
                    'bg-rose-50 border-rose-500 text-rose-950 font-semibold';
                } else {
                  // Kontras ditingkatkan agar tidak terlalu pucat saat selesai menjawab
                  kelasTombol = 'bg-stone-50 text-slate-700 border-stone-300';
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
                    className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                      sudahJawab && adalahKunci
                        ? 'bg-emerald-700 text-white'
                        : sudahJawab && dipilih && !adalahKunci
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-200 text-slate-900'
                    }`}
                  >
                    {sudahJawab && adalahKunci ? '✓' : sudahJawab && dipilih && !adalahKunci ? '✗' : opsi.kode}
                  </span>
                  <span className="flex-1 leading-relaxed">{renderTeksCampuran(opsi.teks)}</span>
                </button>
              );
            })}
          </div>
  
          {/* Umpan Balik Mendalam: Alasan Opsi yang Dipilih + Kunci Jawaban (Dengan Ikon ✓) */}
          {sudahJawab && (
            <div
              className={`p-4 sm:p-5 rounded-xl border animate-fade-in text-sm sm:text-base space-y-2.5 ${
                pilihanUser === quiz.jawabanBenar
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-slate-900'
              }`}
            >
              {pilihanUser !== quiz.jawabanBenar && objekPilihanUser?.alasan && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-950 text-xs sm:text-sm">
                  <strong>Mengapa Opsi {pilihanUser} Kurang Tepat?</strong> {objekPilihanUser.alasan}
                </div>
              )}
  
              <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <span>✓ Kunci Jawaban Benar: Opsi {quiz.jawabanBenar}</span>
              </div>
  
              <p className="leading-relaxed text-slate-800">{quiz.pembahasan}</p>
  
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    pilihKaidah(quiz.kaidahId, 0);
                    setTabUtama('visualisasi');
                  }}
                  className="text-xs font-extrabold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition"
                >
                  📖 Pelajari Kaidah Terkait di Peta Ayat →
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };
  
    // Komponen Rapor Skor Per Kaidah
    const renderRaporKaidah = () => (
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-5 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Rapor Penguasaan Per Kaidah (1–9)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Progres Anda tersimpan otomatis di peramban ini. Klik "Pelajari Ulang" pada kaidah yang belum dikuasai.
            </p>
          </div>
          <div className="bg-emerald-950 text-amber-300 px-4 py-2 rounded-xl text-sm font-extrabold">
            Total Skor: {totalBenar} / {kuisData.length} ({Math.round((totalBenar / kuisData.length) * 100)}%)
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {dhamirData.map((kaidah) => {
            const soalKaidahIni = kuisData.filter((q) => q.kaidahId === kaidah.id);
            const terjawabKaidah = soalKaidahIni.filter((q) => Boolean(jawabanUser[q.id])).length;
            const benarKaidah = soalKaidahIni.filter(
              (q) => jawabanUser[q.id] === q.jawabanBenar
            ).length;
  
            return (
              <div
                key={kaidah.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded">
                      Kaidah {kaidah.nomor_kaidah}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        terjawabKaidah === 0
                          ? 'bg-stone-200 text-slate-700'
                          : benarKaidah === soalKaidahIni.length
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      Skor: {benarKaidah}/{soalKaidahIni.length} Benar
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {kaidah.judul_kaidah}
                  </h4>
                </div>
  
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      pilihKaidah(kaidah.id, 0);
                      setTabUtama('visualisasi');
                    }}
                    className="text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg transition"
                  >
                    Pelajari Ulang Kaidah {kaidah.nomor_kaidah} →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterKaidahKuis(kaidah.id);
                      setSoalAktifIdx(0);
                      setModeKuis('fokus');
                    }}
                    className="text-xs font-bold bg-emerald-900 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Latihan Kaidah Ini
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  
    const renderKuis = () => {
      const idxAman = Math.min(soalAktifIdx, Math.max(0, daftarSoalAktif.length - 1));
      const soalSekarang = daftarSoalAktif[idxAman];
  
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-5 animate-fade-in">
          {/* Header Skor, Filter Kaidah, & Mode Tampilan */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Evaluasi Kaidah Dhamir
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Progres tersimpan otomatis: <strong>{totalTerjawab}</strong> dari {kuisData.length} soal terjawab
                </p>
              </div>
  
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl">
                  <span className="text-xs font-bold text-emerald-900 mr-1.5">Skor:</span>
                  <span className="text-base font-extrabold text-emerald-950">
                    {totalBenar} / {kuisData.length}
                  </span>
                </div>
  
                <button
                  type="button"
                  onClick={() => setModeKuis(modeKuis === 'rapor' ? 'fokus' : 'rapor')}
                  className={`text-xs font-extrabold px-3.5 py-2.5 rounded-xl border transition ${
                    modeKuis === 'rapor'
                      ? 'bg-amber-400 text-emerald-950 border-amber-500'
                      : 'bg-emerald-900 text-white border-emerald-950 hover:bg-emerald-800'
                  }`}
                >
                  📊 {modeKuis === 'rapor' ? 'Kembali ke Soal' : 'Rapor Per Kaidah'}
                </button>
  
                <button
                  type="button"
                  onClick={() => setModeKuis(modeKuis === 'semua' ? 'fokus' : 'semua')}
                  className="text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-800 px-3 py-2.5 rounded-xl border border-stone-300 transition"
                >
                  {modeKuis === 'semua' ? 'Mode: Per Soal' : 'Mode: Semua Soal'}
                </button>
  
                {totalTerjawab > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setJawabanUser({});
                      setSoalAktifIdx(0);
                      localStorage.removeItem('dhamir_lens_quiz_v2');
                    }}
                    className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-2.5 rounded-xl transition"
                  >
                    Reset Skor
                  </button>
                )}
              </div>
            </div>
  
            {/* Filter Latihan Per Kaidah */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Filter Latihan Per Kaidah:
              </span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setFilterKaidahKuis('semua');
                    setSoalAktifIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition shrink-0 ${
                    filterKaidahKuis === 'semua'
                      ? 'bg-emerald-950 text-white border-emerald-950'
                      : 'bg-stone-100 text-slate-800 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Semua ({kuisData.length})
                </button>
                {dhamirData.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      setFilterKaidahKuis(k.id);
                      setSoalAktifIdx(0);
                      if (modeKuis === 'rapor') setModeKuis('fokus');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition shrink-0 ${
                      filterKaidahKuis === k.id
                        ? 'bg-amber-400 text-emerald-950 border-amber-500 font-extrabold'
                        : 'bg-stone-100 text-slate-800 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Kaidah {k.nomor_kaidah}
                  </button>
                ))}
              </div>
            </div>
  
            {/* Bar Nomor Soal */}
            {modeKuis !== 'rapor' && (
              <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {daftarSoalAktif.map((q, idx) => {
                  const jwb = jawabanUser[q.id];
                  const aktif = modeKuis === 'fokus' && idxAman === idx;
                  let warnaPil = 'bg-stone-100 text-slate-800 border-stone-300';
                  if (jwb) {
                    warnaPil =
                      jwb === q.jawabanBenar
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-rose-600 text-white border-rose-700';
                  }
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setModeKuis('fokus');
                        setSoalAktifIdx(idx);
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold border transition shrink-0 flex items-center justify-center ${warnaPil} ${
                        aktif ? 'ring-2 ring-amber-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
  
          {/* Konten Kuis atau Rapor */}
          {modeKuis === 'rapor' ? (
            renderRaporKaidah()
          ) : modeKuis === 'fokus' && soalSekarang ? (
            <div className="space-y-4">
              {renderSatuKartuSoal(soalSekarang, idxAman, daftarSoalAktif.length)}
              <div className="flex items-center justify-between gap-3">
                {/* Kontras tombol Soal Sebelumnya dipertegas */}
                <button
                  type="button"
                  disabled={idxAman === 0}
                  onClick={() => setSoalAktifIdx((i) => Math.max(0, i - 1))}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-white hover:bg-stone-100 border-2 border-slate-400 text-slate-900 disabled:opacity-40 disabled:border-stone-300 transition shadow-sm"
                >
                  ← Soal Sebelumnya
                </button>
                {idxAman < daftarSoalAktif.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSoalAktifIdx((i) => Math.min(daftarSoalAktif.length - 1, i + 1))
                    }
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-900 hover:bg-emerald-800 text-white transition shadow-sm"
                  >
                    Soal Berikutnya →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModeKuis('rapor')}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-emerald-950 border border-amber-500 transition shadow-sm"
                  >
                    Lihat Rapor Hasil Akhir →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {daftarSoalAktif.map((quiz, idx) =>
                renderSatuKartuSoal(quiz, idx, daftarSoalAktif.length)
              )}
            </div>
          )}
        </div>
      );
    };
  
    // ==========================================================
    // TAB 2: VISUALISASI PETA AYAT
    // ==========================================================
    const renderVisualisasi = () => {
      const punyaBanyakPerspektif = ayatAktif && ayatAktif.perspektif.length > 1;
      const adaPanahEksternal =
        perspektifAktif && perspektifAktif.panah.some((p) => p.ke === 'external');
  
      return (
        <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-fade-in">
          {/* Navigasi Kaidah Horizontal untuk HP & Tablet */}
          <div className="lg:hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                Pilih Kaidah (1–9)
              </span>
              <span className="text-xs font-semibold text-slate-600">Geser ke samping →</span>
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
                          aktif
                            ? 'bg-amber-400 text-emerald-950'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        Kaidah {item.nomor_kaidah}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          aktif ? 'text-emerald-200' : 'text-slate-600'
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
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Bab Al-Dhama'ir (9 Kaidah)
                  </h2>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {totalAyatKorpus} Ayat
                  </span>
                </div>
  
                <div className="relative">
                  <input
                    type="text"
                    value={pencarian}
                    onChange={(e) => setPencarian(e.target.value)}
                    placeholder="Cari kaidah, kategori, atau surah..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <svg
                    className="w-4 h-4 text-slate-500 absolute left-3 top-3"
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
                            : 'bg-stone-50 text-slate-800 border-stone-200 hover:border-emerald-500 hover:bg-white'
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
                            className={`text-xs font-bold ${
                              aktif ? 'text-amber-300' : 'text-slate-600'
                            }`}
                          >
                            {item.daftar_ayat.length} Ayat
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
              {/* Kartu Rumusan Kaidah */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Rumusan Kaidah ({dataAktif.kategori})
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {dataAktif.sumber_kitab}
                  </span>
                </div>
  
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {dataAktif.judul_kaidah}
                </h2>
  
                <div className="kanvas-mushaf border border-amber-300/80 border-r-4 border-r-emerald-800 p-4 sm:p-5 rounded-xl space-y-3">
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-arab text-2xl sm:text-3xl text-right text-slate-950 leading-loose"
                  >
                    {dataAktif.redaksi_kaidah}
                  </p>
  
                  <div className="pt-2 border-t border-stone-200">
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
                        <p className="text-slate-900 leading-relaxed">
                          <span className="font-bold text-emerald-950">Terjemah Kaidah:</span>{' '}
                          {dataAktif.terjemah_kaidah}
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900">Tawdhih al-Qa'idah:</span>{' '}
                          {dataAktif.tawdhih_kaidah}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Pilihan Ayat */}
                <div className="pt-1 space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
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
                              : 'bg-stone-50 text-slate-800 border-stone-200 hover:border-emerald-500 hover:bg-white'
                          }`}
                        >
                          <span className="block font-extrabold">{ayat.surah_ayat}</span>
                          <span className="text-[11px] font-semibold opacity-90">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-emerald-950">
                          {ayatAktif.surah_ayat}
                        </span>
                        <span className="text-xs font-bold bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                          {ayatAktif.label_kategori}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 block mt-1">
                        {punyaBanyakPerspektif
                          ? 'Ayat ini memiliki khilaf/ragam tinjauan: ketuk tombol pendapat ulama di bawah untuk membandingkan arah panah'
                          : "Ketuk kata bahasa Arab pada kanvas atau kartu jalur di bawah untuk membedah i'rab dan rujukan dhamir"}
                      </span>
                    </div>
  
                    {/* Bar Tombol Aksi */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={salinSitasiIlmiah}
                        className="px-3 py-2 rounded-xl text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-stone-100 text-slate-800 transition flex items-center gap-1.5"
                      >
                        <span>{notifikasiSalin ? '✓ Sitasi Tersalin!' : '📋 Salin Sitasi R&D'}</span>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => setTampilkanPanah(!tampilkanPanah)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                          tampilkanPanah
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                            : 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {tampilkanPanah ? 'Panah: Aktif' : 'Mode Uji'}
                      </button>
                    </div>
                  </div>
  
                  {/* Tombol Pendapat Ulama */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
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
                              : 'bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200'
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
                          className="inline-flex items-center gap-1.5 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 transition"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          Isim Dhamir ⓘ
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setInfoIstilahAktif(infoIstilahAktif === 'marja' ? null : 'marja')
                          }
                          className="inline-flex items-center gap-1.5 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-950 transition"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          Marja' (Rujukan) ⓘ
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setInfoIstilahAktif(infoIstilahAktif === 'qarinah' ? null : 'qarinah')
                          }
                          className="inline-flex items-center gap-1.5 font-bold bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-300 text-sky-950 transition"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                          Qarinah ⓘ
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        💡 Ketuk kata Arab mana saja untuk membedah I'rab
                      </span>
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
                    className="kanvas-mushaf relative pt-28 pb-10 px-3.5 sm:px-8 rounded-2xl border-2 border-amber-300/80 shadow-inner overflow-x-auto"
                  >
                    {/* Label Pojok Kanvas dengan dir="rtl" dan ukuran lebih jelas agar kurung tidak terbalik */}
                    <div
                      dir="rtl"
                      lang="ar"
                      className="absolute top-2.5 right-3.5 font-arab text-sm sm:text-base font-bold text-amber-900/80 select-none bg-amber-100/70 px-3 py-0.5 rounded-full border border-amber-300/60"
                    >
                      ﴿ نَصُّ الْآيَةِ وَتَحْلِيلُ الضَّمَائِرِ ﴾
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
  
                    {/* Lencana Marja' Eksternal dengan Pemisahan RTL/LTR (<bdi>) & Jarak ekstra agar bebas tabrakan */}
                    {(ayatAktif.marja_eksternal || adaPanahEksternal) && (
                      <div className="flex justify-center mb-16 sm:mb-20 relative z-10">
                        <div
                          ref={externalMarjaRef}
                          className="bg-emerald-950 text-amber-200 px-5 py-2 rounded-full border-2 border-amber-400 shadow-md text-center"
                        >
                          {renderMarjaEksternal(ayatAktif.marja_eksternal)}
                        </div>
                      </div>
                    )}
  
                    {/* Baris Kaligrafi Ayat dengan Jarak Baris Longgar (gap-y-14) agar Panah Tidak Memotong Huruf */}
                    <div
                      dir="rtl"
                      lang="ar"
                      className="font-arab flex flex-wrap justify-center items-baseline gap-x-3.5 sm:gap-x-5 gap-y-14 text-3xl sm:text-5xl relative z-10"
                    >
                      {ayatAktif.tokens.map((token) => {
                        const terpilih = kataTerpilih?.id === token.id;
                        let gayaKata =
                          'text-slate-950 hover:bg-amber-100/70 px-2 py-1 rounded-lg border-b-2 border-dashed border-stone-300 hover:border-amber-500';
                        let tagKecil = null;
  
                        if (token.peran === 'dhamir') {
                          gayaKata =
                            'bg-amber-200/80 text-amber-950 border-b-4 border-amber-500 px-2.5 py-1 rounded-t-xl font-bold shadow-sm';
                          tagKecil = { teks: 'Dhamir', warna: 'text-amber-900' };
                        } else if (token.peran === 'marja') {
                          gayaKata =
                            'bg-emerald-100/90 text-emerald-950 border-b-4 border-emerald-600 px-2.5 py-1 rounded-t-xl font-bold shadow-sm';
                          tagKecil = { teks: "Marja'", warna: 'text-emerald-900' };
                        } else if (token.peran === 'qarinah') {
                          gayaKata =
                            'bg-sky-100/85 text-sky-950 border-b-4 border-sky-500 px-2.5 py-1 rounded-t-xl font-bold shadow-sm';
                          tagKecil = { teks: 'Qarinah', warna: 'text-sky-900' };
                        }
  
                        return (
                          <button
                            key={token.id}
                            type="button"
                            onClick={() => setKataTerpilih(token)}
                            ref={(el) => (tokenRefs.current[token.id] = el)}
                            className={`relative inline-flex flex-col items-center transition-all active:scale-95 cursor-pointer ${gayaKata} ${
                              terpilih ? 'ring-4 ring-amber-400/60 scale-105' : ''
                            }`}
                          >
                            <span className="leading-[1.75]">{token.teks}</span>
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
                    <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            dir="rtl"
                            lang="ar"
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
                        <p className="text-sm text-emerald-50 leading-relaxed">
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
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
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
                                borderColor: aktif ? p.warna : '#d6d3d1'
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
                                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
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
                  <blockquote className="text-sm sm:text-base italic text-slate-800 bg-stone-50 border-l-4 border-emerald-700 px-4 py-3.5 rounded-r-xl leading-relaxed">
                    "{ayatAktif.terjemahan}"
                  </blockquote>
  
                  {/* KARTU TERPADU: ANALISIS TARJIH, QARINAH, & TAKHRIJ KITAB */}
                  <div className="bg-emerald-50/80 rounded-2xl border border-emerald-300 overflow-hidden">
                    <div className="p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-950">
                          Analisis Tarjih & Qarinah ({perspektifAktif.nama})
                        </h3>
                        <span className="text-xs font-bold text-emerald-950 bg-emerald-200/70 border border-emerald-400 px-2.5 py-0.5 rounded-md">
                          Metode: {perspektifAktif.metode_tarjih}
                        </span>
                      </div>
  
                      <p className="text-sm sm:text-base text-slate-900 leading-relaxed">
                        {perspektifAktif.analisis}
                      </p>
  
                      <div className="text-xs sm:text-sm text-emerald-950 bg-white p-3.5 rounded-xl border border-emerald-300 leading-relaxed shadow-sm">
                        <span className="font-extrabold text-emerald-900">Qarinah Penentu:</span>{' '}
                        {perspektifAktif.qarinah}
                      </div>
                    </div>
  
                    <div className="bg-amber-100/90 border-t border-amber-300 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs sm:text-sm">
                      <div className="text-amber-950">
                        <span className="font-extrabold uppercase tracking-wider text-[11px] bg-amber-300/80 text-amber-950 px-2 py-0.5 rounded mr-2">
                          Takhrij Kitab
                        </span>
                        <span className="font-bold">{perspektifAktif.rujukan}</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-950">
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
  
    const daftarMenu = [
      { id: 'beranda', label: 'Beranda', ikon: '🏠' },
      { id: 'visualisasi', label: 'Peta Ayat', ikon: '🧭' },
      { id: 'indeks', label: '9 Kaidah', ikon: '📖' },
      { id: 'glosarium', label: 'Glosarium', ikon: '🔤' },
      { id: 'kuis', label: 'Latihan', ikon: '✍️' }
    ];
  
    return (
      <div className="min-h-screen flex flex-col bg-[#f4f3ee] pb-24 lg:pb-0">
        {/* Header Utama */}
        <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
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
                <span className="text-[11px] text-emerald-200 block mt-0.5">
                  Oleh: {penelitiInfo.nama}
                </span>
              </div>
            </button>
  
            {/* Navigasi Atas hanya untuk Layar Desktop Lebar (lg >= 1024px) agar HP dalam Mode Desktop tetap memakai Bottom Nav */}
            <nav className="hidden lg:flex gap-1.5 bg-emerald-900/80 p-1 rounded-xl border border-emerald-800">
              {daftarMenu.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabUtama(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
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
  
        {/* Bottom Navigation Bar untuk Semua Layar HP & Tablet (< 1024px) */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-emerald-950 text-white border-t border-emerald-800 z-50 grid grid-cols-5 py-2 px-1 shadow-2xl">
          {daftarMenu.map((tab) => {
            const aktif = tabUtama === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabUtama(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
                  aktif ? 'text-amber-300 font-extrabold' : 'text-emerald-100/80 font-medium'
                }`}
              >
                <span className="text-base leading-none mb-1">{tab.ikon}</span>
                <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
  
        {/* Footer dengan Identitas Peneliti, Email Krisar, dan Padding Bawah Aman */}
        <footer className="bg-white border-t border-stone-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-700 font-medium text-center sm:text-left">
            <div>
              <strong>Dhamir-Lens</strong> — Instrumen R&D Visualisasi Marja' al-Dhamir (Rujukan Kitab Dr. Khalid bin Utsman al-Sabt)
            </div>
            <div>
              Peneliti: <strong>{penelitiInfo.nama}</strong> • Kritik & Saran:{' '}
              <a
                href={`mailto:${penelitiInfo.email}?subject=Masukan%20Aplikasi%20Dhamir-Lens`}
                className="text-emerald-800 font-bold hover:underline"
              >
                {penelitiInfo.email}
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }
