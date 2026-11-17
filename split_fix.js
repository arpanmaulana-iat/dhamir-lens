import fs from 'fs';

const raw = fs.readFileSync('src/data/ui_content.js', 'utf-8');

// 1. Ambil murni kode ui_content.js (dari export const penelitiInfo sampai penutup kuisData)
const startUi = raw.indexOf('export const penelitiInfo');
const endUi = raw.indexOf('### Langkah 2');

// 2. Ambil murni kode App.jsx (dari import React sampai kurung kurawal penutup terakhir)
const startApp = raw.indexOf("import React, { useState");
const endApp = raw.lastIndexOf('}');

if (startUi !== -1 && endUi !== -1 && startApp !== -1) {
  let cleanUi = raw.slice(startUi, endUi).trim();
  // Bersihkan sisa pagar markdown ``` atau `; di ujung bawah ui_content
  cleanUi = cleanUi.replace(/`+;?\s*$/, '').replace(/```\s*$/, '').trim();

  const cleanApp = raw.slice(startApp, endApp + 1).trim();

  fs.writeFileSync('src/data/ui_content.js', cleanUi + '\n', 'utf-8');
  fs.writeFileSync('src/App.jsx', cleanApp + '\n', 'utf-8');
  console.log('✅ BERHASIL: ui_content.js dan App.jsx telah dipisahkan dan dibersihkan!');
} else {
  console.log('⚠️ Pola pemisah tidak ditemukan.');
}