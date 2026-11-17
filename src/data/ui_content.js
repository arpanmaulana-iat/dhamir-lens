export const definisiDhamir = {
    judul: "Definisi Al-Dhamir (الضَّمَائِر)",
    arab: "الضَّمَائِرُ جَمْعُ ضَمِيرٍ، وَهُوَ عِنْدَ النُّحَاةِ مَا دَلَّ عَلَى مُتَكَلِّمٍ كَـ (أَنَا)، أَوْ مُخَاطَبٍ كَـ (أَنْتَ)، أَوْ غَائِبٍ كَـ (هُوَ).",
    penjelasan: "Secara istilah nahwu, dhamir adalah kata ganti yang menunjukkan pembicara (mutakallim), lawan bicara (mukhathab), atau pihak ketiga (gha'ib). Dalam Qawa'id at-Tafsir, ketepatan menentukan tempat kembalinya dhamir (marja') sangat menentukan validitas produk penafsiran.",
    rujukan: ["Al-Mu'jam al-Wasith, madah: ضم, 1/544", "Mu'jam al-I'rab wa al-Imla': 257-262"],
    halaman: "399",
    langkah_penggunaan: [
      {
        judul: "1. Eksplorasi 9 Kaidah & Ayat",
        deskripsi: "Buka menu '9 Kaidah' untuk membaca kerangka teori utuh, atau langsung ke 'Peta Ayat' untuk memilih ayat yang ingin dibedah."
      },
      {
        judul: "2. Analisis Kurva & Jalur Rujukan",
        deskripsi: "Amati garis lengkung panah dari Dhamir menuju Marja'-nya. Bandingkan argumen ulama pada ayat yang memiliki lebih dari satu pendekatan."
      },
      {
        judul: "3. Inspeksi I'rab & Uji Pemahaman",
        deskripsi: "Ketuk langsung kata bahasa Arab di kanvas mushaf untuk melihat kedudukan nahwunya, lalu uji pemahaman di menu 'Latihan'."
      }
    ]
  };
  
  export const glosariumData = [
    {
      istilah: "Dhamir",
      arti: "Kata ganti (pronomina) yang digunakan untuk menyebut pembicara (mutakallim), lawan bicara (mukhathab), atau pihak ketiga (gha'ib) demi keringkasan kalimat (ijaz).",
      contoh: "Dhamir ـهُ pada lafaz فَمُلَاقِيهِ (QS. Al-Insyiqaq: 6)."
    },
    {
      istilah: "Marja' al-Dhamir",
      arti: "Lafaz, makna, atau konteks kalimat yang menjadi tempat kembalinya sebuah kata ganti dalam ayat.",
      contoh: "Lafaz رَبِّكَ menjadi marja' dari dhamir ـهُ pada فَمُلَاقِيهِ."
    },
    {
      istilah: "Qarinah",
      arti: "Indikator atau petunjuk kontekstual (baik tekstual, logika akal, maupun syariat) yang menetapkan atau mengalihkan arah rujukan dhamir.",
      contoh: "Lafaz نُطْفَةً (air mani) pada QS. Al-Mu'minun: 13 menjadi qarinah bahwa dhamir kembali kepada keturunan Adam, bukan Adam secara fisik."
    },
    {
      istilah: "Mudhaf & Mudhaf Ilayh",
      arti: "Susunan dua kata benda yang digabungkan (idhafah), di mana kata pertama (mudhaf) disandarkan pada kata kedua (mudhaf ilayh) sebagai penjelas.",
      contoh: "Susunan نِعْمَةَ اللَّهِ (nikmat Allah) pada QS. Ibrahim: 34."
    },
    {
      istilah: "Siyaq al-Kalam",
      arti: "Konteks pembicaraan atau alur kalimat sebelum dan sesudah ayat yang membimbing pembaca memahami rujukan tanpa harus disebutkan eksplisit.",
      contoh: "Dhamir pada أَنزَلْنَاهُ (QS. Al-Qadr: 1) langsung dipahami merujuk pada Al-Qur'an melalui siyaq kemuliaan malam turunnya wahyu."
    },
    {
      istilah: "Al-Iktifa'",
      arti: "Gaya bahasa Al-Qur'an yang menyebutkan dua hal namun mencukupkan dhamir tunggal kepada salah satunya saja, padahal keduanya sama-sama dimaksudkan.",
      contoh: "Penyebutan Allah dan Rasul-Nya dalam QS. At-Taubah: 62, namun ditutup dengan dhamir tunggal يُرْضُوهُ."
    },
    {
      istilah: "Mulabis",
      arti: "Sesuatu yang memiliki keterkaitan erat dengan kata yang disebutkan sebelumnya, sehingga dhamir kembali ke hal yang berkaitan tersebut.",
      contoh: "Dhamir pada ضُحَاهَا (QS. An-Nazi'at: 46) kembali kepada 'hari' yang memuat waktu sore (عَشِيَّةً) tersebut."
    },
    {
      istilah: "Tanafur",
      arti: "Kejanggalan atau ketidaksinkronan makna apabila rangkaian dhamir yang berurutan dipaksakan kembali ke satu rujukan yang sama.",
      contoh: "Pemisahan rujukan dhamir antara pemuda Ashabul Kahfi dan kaum Yahudi pada QS. Al-Kahfi: 22."
    }
  ];
  
  export const kuisData = [
    {
      id: "Q1",
      kaidahTerkait: "Kaidah 1",
      soal: "Bagaimana sikap mufassir menurut Kaidah 1 apabila dhamir memungkinkan kembali ke lebih dari satu lafaz dan seluruh maknanya sahih tanpa ada penghalang?",
      pilihan: [
        { kode: "A", teks: "Wajib memilih satu pendapat saja (tarjih) agar tidak membingungkan pembaca." },
        { kode: "B", teks: "Dihimpun dan dibawa kepada seluruh maknanya (Al-Jam'u bayna al-Maraji')." },
        { kode: "C", teks: "Mengabaikan rujukan tekstual dan mencari rujukan di luar ayat." }
      ],
      jawabanBenar: "B",
      pembahasan: "Kaidah 1 menegaskan bahwa Al-Qur'an memiliki keluasan makna dengan lafaz yang ringkas. Selama kedua rujukan sahih dan saling melazimkan (seperti menemui Tuhan dan menemui amal pada QS. Al-Insyiqaq: 6), keduanya dihimpun."
    },
    {
      id: "Q2",
      kaidahTerkait: "Kaidah 2",
      soal: "Apabila dalam satu ayat terdapat susunan Mudhaf dan Mudhaf Ilayh, ke manakah hukum asal kembalinya dhamir setelahnya?",
      pilihan: [
        { kode: "A", teks: "Kembali kepada Mudhaf karena ia adalah pokok pembicaraan (al-muhaddats 'anhu)." },
        { kode: "B", teks: "Kembali kepada Mudhaf Ilayh karena ia adalah lafaz yang paling dekat posisinya." },
        { kode: "C", teks: "Wajib kembali kepada keduanya secara bersamaan." }
      ],
      jawabanBenar: "A",
      pembahasan: "Berdasarkan Kaidah ke-2, hukum asal dhamir setelah susunan idhafah adalah kembali kepada mudhaf (seperti dhamir menghitung nikmat pada QS. Ibrahim: 34). Pengecualian ke mudhaf ilayh hanya terjadi jika ada qarinah khusus."
    },
    {
      id: "Q3",
      kaidahTerkait: "Kaidah 2 & 8",
      soal: "Dalam QS. Al-An'am: 145 ('Aw lahma khinzirin fa-innahu rijsun'), mengapa Abu Hayyan mengembalikan dhamir '-hu' kepada 'lahm' (daging), sedangkan Ibnu Hazm mengembalikannya kepada 'khinzir' (babi)?",
      pilihan: [
        { kode: "A", teks: "Abu Hayyan berpegang pada hukum asal Mudhaf sebagai pokok bahasan, sedangkan Ibnu Hazm berpegang pada lafaz terdekat (aqrab madzkur)." },
        { kode: "B", teks: "Abu Hayyan menggunakan kaidah iktifa', sedangkan Ibnu Hazm menggunakan kaidah tatsniyah." },
        { kode: "C", teks: "Keduanya menganggap dhamir tersebut kembali kepada bangkai yang disebut di awal ayat." }
      ],
      jawabanBenar: "A",
      pembahasan: "Perbedaan ini adalah contoh klasik pertarungan Kaidah 2 (kembali ke Mudhaf: lahm) yang dipegang Abu Hayyan melawan kaidah umum lafaz terdekat (Mudhaf Ilayh: khinzir) yang dipegang Ibnu Hazm dan Al-Mawardi."
    },
    {
      id: "Q4",
      kaidahTerkait: "Kaidah 3",
      soal: "Pada QS. Al-Mu'minun: 12-13, Allah menyebutkan penciptaan 'Al-Insan' (Adam) dari tanah, lalu berfirman 'Tsumma ja'alnahu nuthfatan' (Kemudian Kami menjadikannya air mani). Kemana kembalinya dhamir '-hu'?",
      pilihan: [
        { kode: "A", teks: "Kembali kepada Nabi Adam AS secara fisik." },
        { kode: "B", teks: "Bersambung secara lahir ke Al-Insan (Adam), namun maknanya ditujukan untuk anak keturunan Adam." },
        { kode: "C", teks: "Kembali kepada saripati tanah (sulalah min thin)." }
      ],
      jawabanBenar: "B",
      pembahasan: "Berdasarkan Kaidah ke-3, terkadang dhamir bersambung pada satu kata namun maknanya untuk selainnya (jenis/keturunannya), karena Nabi Adam AS tidak diciptakan dari air mani."
    },
    {
      id: "Q5",
      kaidahTerkait: "Kaidah 4",
      soal: "Dalam QS. Al-Baqarah: 8 ('Wa minan-nasi man yaqulu amanna... wa ma hum bi-mu'minin'), mengapa fi'il pertama berbentuk tunggal (yaqulu) lalu berubah menjadi jamak (hum)?",
      pilihan: [
        { kode: "A", teks: "Karena terjadi pergantian objek pembicaraan dari orang kafir ke orang munafik." },
        { kode: "B", teks: "Karena mendahulukan sisi lafaz 'man' yang tunggal, lalu baru memperhatikan sisi maknanya yang jamak." },
        { kode: "C", teks: "Karena mengikuti gaya bahasa iktifa' (mencukupkan satu kata)." }
      ],
      jawabanBenar: "B",
      pembahasan: "Berdasarkan Kaidah ke-4 (Mura'at al-Lafzh wa al-Ma'na), ketika berkumpul pertimbangan lafaz dan makna pada isim maushul seperti 'man', Al-Qur'an memulai dengan bentuk mufrad (mengikuti lafaz), lalu menutup dengan jamak (mengikuti makna)."
    },
    {
      id: "Q6",
      kaidahTerkait: "Kaidah 5",
      soal: "Dalam QS. At-Taubah: 62 ('Wallahu wa rasuluhu ahaqqu an yurdhuhu'), disebutkan dua pihak (Allah dan Rasul-Nya) namun dhamir pada 'yurdhuhu' berbentuk tunggal. Fenomena ini disebut...",
      pilihan: [
        { kode: "A", teks: "Al-Iktifa' — mencukupkan dhamir tunggal kepada salah satunya, padahal keduanya sama-sama dimaksudkan." },
        { kode: "B", teks: "Tanafur — memisahkan rujukan karena kejanggalan makna." },
        { kode: "C", teks: "Tatsniyah — menggunakan dhamir ganda untuk satu pihak." }
      ],
      jawabanBenar: "A",
      pembahasan: "Berdasarkan Kaidah ke-5, dhamir tunggal pada 'yurdhuhu' mencukupkan penyebutan satu rujukan secara lafaz, namun secara makna keridaan Allah dan Rasul-Nya adalah satu kesatuan yang tak terpisahkan."
    },
    {
      id: "Q7",
      kaidahTerkait: "Kaidah 6",
      soal: "Pada QS. Al-Kahfi: 61 ('Fawajada... nasiya hutahuma' — keduanya lupa akan ikannya), dhamir berbentuk ganda (tatsniyah), padahal secara hakikat siapa yang lupa?",
      pilihan: [
        { kode: "A", teks: "Nabi Musa AS dan pembantunya sama-sama lupa." },
        { kode: "B", teks: "Hanya pembantu Nabi Musa (Yusya' bin Nun) saja yang lupa, sebagaimana ditegaskan pada ayat 63." },
        { kode: "C", teks: "Hanya Nabi Musa AS saja yang lupa." }
      ],
      jawabanBenar: "B",
      pembahasan: "Berdasarkan Kaidah ke-6 (kebalikan Kaidah 5), terkadang dhamir dijadikan bentuk ganda (tatsniyah), padahal ia hanya kembali kepada salah satu dari dua pihak yang disebutkan."
    },
    {
      id: "Q8",
      kaidahTerkait: "Kaidah 7",
      soal: "Pada QS. Al-Qadr: 1 ('Inna anzalnahu fi laylatil-qadr'), dhamir '-hu' langsung merujuk kepada Al-Qur'an meskipun kata Al-Qur'an tidak disebutkan sebelumnya. Kaidah ini disebut...",
      pilihan: [
        { kode: "A", teks: "Dhamir Gha'ib yang ditafsirkan oleh konteks pembicaraan (Siyaq al-Kalam)." },
        { kode: "B", teks: "Dhamir Tatsniyah yang kembali kepada salah satu dari dua hal." },
        { kode: "C", teks: "Kesatuan marja' pada dhamir yang berurutan (Ta'aqub adh-Dhama'ir)." }
      ],
      jawabanBenar: "A",
      pembahasan: "Berdasarkan Kaidah ke-7, dhamir gha'ib terkadang kembali kepada sesuatu yang tidak disebutkan secara eksplisit karena sudah sangat jelas dipahami melalui konteks pembicaraan (siyaq al-kalam)."
    },
    {
      id: "Q9",
      kaidahTerkait: "Kaidah 8",
      soal: "Apabila terdapat beberapa kalimat berturut-turut, lalu setelahnya datang dhamir berbentuk tunggal (mufrad), maka hukum asalnya dhamir tersebut kembali ke mana?",
      pilihan: [
        { kode: "A", teks: "Kembali ke kalimat paling awal sebagai pembuka pembicaraan." },
        { kode: "B", teks: "Khusus kembali ke kalimat yang paling akhir disebutkan karena paling dekat." },
        { kode: "C", teks: "Mencakup seluruh kalimat yang disebutkan sebelumnya." }
      ],
      jawabanBenar: "B",
      pembahasan: "Berdasarkan Kaidah ke-8, jika dhamir setelah beberapa kalimat berbentuk jamak maka ia mencakup semuanya, namun jika berbentuk tunggal (mufrad) maka ia khusus kembali ke kalimat terakhir (seperti pada QS. Ar-Ra'd: 10-11)."
    },
    {
      id: "Q10",
      kaidahTerkait: "Kaidah 9",
      soal: "Dalam QS. Al-'Adiyat: 6-8 ('Innal-insana li-rabbihi lakanud, wa innahu 'ala dzalika lasyahid, wa innahu lihubbil-khayri lasyadid'), mengapa dhamir pada ayat 7 lebih utama dikembalikan kepada 'Al-Insan' daripada 'Rabb'?",
      pilihan: [
        { kode: "A", teks: "Demi menjaga kesatuan marja' (ittihad al-marja') pada rangkaian dhamir yang berurutan agar susunan kalimat (nazhm) tidak rusak." },
        { kode: "B", teks: "Karena lafaz Al-Insan lebih dekat secara posisi huruf." },
        { kode: "C", teks: "Karena terdapat tanafur (kejanggalan makna) jika dikembalikan kepada manusia." }
      ],
      jawabanBenar: "A",
      pembahasan: "Berdasarkan Kaidah ke-9, apabila beberapa dhamir datang berurutan, hukum asalnya adalah menyatukan marja'-nya. Karena ayat 6 dan 8 pasti merujuk pada manusia, maka ayat 7 juga dikembalikan pada manusia."
    }
  ];