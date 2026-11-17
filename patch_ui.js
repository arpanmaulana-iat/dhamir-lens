import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Menentukan lokasi file App.jsx
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'src', 'App.jsx');

// Desain Kartu Definisi Baru yang Elegan (Gradasi Emerald & Amber)
const newCardJSX = `{/* Kartu Definisi Dhamir (Berwarna & Elegan) */}
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

      `;

try {
    console.log("Membaca file src/App.jsx...");
    let appCode = fs.readFileSync(filePath, 'utf-8');

    // Regex pintar: Mencari blok {/* Kartu Definisi Dhamir */} sampai sebelum {/* Panduan 3 Langkah Penggunaan */}
    const regexTarget = /\{\/\*\s*Kartu Definisi Dhamir[\s\S]*?(?=\{\/\*\s*Panduan 3 Langkah Penggunaan\s*\*\/})/g;

    if (regexTarget.test(appCode)) {
        appCode = appCode.replace(regexTarget, newCardJSX);
        fs.writeFileSync(filePath, appCode, 'utf-8');
        console.log("✅ BERHASIL: Desain Kartu Definisi di Beranda telah diubah menjadi warna hijau elegan!");
    } else {
        console.log("⚠️ PERHATIAN: Kartu Definisi lama tidak ditemukan atau sudah pernah diganti sebelumnya.");
    }

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`❌ ERROR: File tidak ditemukan di ${filePath}.`);
    } else {
        console.error("❌ ERROR: Terjadi kesalahan ->", error.message);
    }
}