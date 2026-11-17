// ui_content.js
// Berisi teks statis untuk antarmuka Beranda, Glosarium, dan Kuis

export const definisiDhamir = {
    judul: "Definisi Al-Dhamir (الضَّمَائِر)",
    arab: "الضَّمَائِرُ جَمْعُ ضَمِيرٍ، وَهُوَ عِنْدَ النُّحَاةِ مَا دَلَّ عَلَى مُتَكَلِّمٍ كَـ (أَنَا)، أَوْ مُخَاطَبٍ كَـ (أَنْتَ)، أَوْ غَائِبٍ كَـ (هُوَ).",
    penjelasan: "Secara istilah nahwu, dhamir adalah kata ganti yang menunjukkan pembicara (mutakallim), lawan bicara (mukhathab), atau pihak ketiga (gha'ib). Dalam Qawa'id at-Tafsir, ketepatan menentukan tempat kembalinya dhamir (marji') sangat menentukan validitas produk penafsiran.",
    rujukan: ["Al-Mu'jam al-Wasith, madah: ضم, 1/544", "Mu'jam al-I'rab wa al-Imla': 257-262"],
    halaman: "399"
  };
  
  export const glosariumData = [
    { istilah: "Dhamir", arti: "Kata ganti (pronomina) yang digunakan untuk menyebut mutakallim (pembicara), mukhathab (lawan bicara), atau gha'ib (pihak ketiga)." },
    { istilah: "Marja' al-Dhamir", arti: "Lafaz, makna, atau konteks (siyaq) yang menjadi tempat kembalinya sebuah kata ganti." },
    { istilah: "Qarinah", arti: "Petunjuk, indikator, atau konteks (baik secara tekstual maupun logika) yang menetapkan atau memalingkan suatu rujukan makna." },
    { istilah: "Siyaq al-Kalam", arti: "Konteks pembicaraan atau untaian kalimat sebelum dan sesudah ayat yang sangat memengaruhi penafsiran." },
    { istilah: "Al-Iktifa'", arti: "Gaya bahasa Al-Qur'an yang mencukupkan penyebutan satu hal untuk mewakili hal lain yang saling berkaitan erat." },
    { istilah: "Mulabis", arti: "Sesuatu yang memiliki keterkaitan, kedekatan, atau hubungan kelaziman dengan objek aslinya." }
  ];
  
  export const kuisData = [
    {
      id: "Q1",
      soal: "Apabila dalam satu ayat terdapat susunan Mudhaf dan Mudhaf Ilayh, ke manakah hukum asal kembalinya dhamir?",
      pilihan: [
        "A. Kembali kepada Mudhaf karena ia adalah pokok pembicaraan (al-muhaddats 'anhu).",
        "B. Kembali kepada Mudhaf Ilayh karena ia adalah lafaz yang paling dekat posisinya.",
        "C. Kembali kepada keduanya secara bersamaan."
      ],
      jawabanBenar: "A",
      pembahasan: "Berdasarkan Kaidah ke-2, hukum asal dhamir setelah mudhaf dan mudhaf ilayh adalah kembali kepada mudhaf. Pengecualian terjadi jika ada qarinah logika atau syariat yang memalingkannya ke mudhaf ilayh."
    },
    {
      id: "Q2",
      soal: "Bagaimana Kaidah Qawaid Tafsir menyikapi dhamir yang memiliki kemungkinan kembali ke beberapa lafaz dan semuanya memiliki makna yang sahih tanpa saling bertentangan?",
      pilihan: [
        "A. Wajib ditarjih (dipilih salah satu) berdasarkan riwayat ulama salaf tertua.",
        "B. Dihimpun seluruh kemungkinan tersebut (Al-Jam'u bayna al-Maraji') karena Al-Qur'an memuat makna luas dengan lafaz ringkas.",
        "C. Dhamir tersebut dianggap mutasyabihat dan diserahkan maknanya kepada Allah."
      ],
      jawabanBenar: "B",
      pembahasan: "Berdasarkan Kaidah ke-1, apabila tidak ada dalil (mani') yang saling menggugurkan, maka seluruh makna yang sahih diakomodasi (dihimpun) secara bersamaan untuk menunjukkan mukjizat dan keluasan makna Al-Qur'an."
    }
  ];