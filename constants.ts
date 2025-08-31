import { Template, Quote } from './types';

export const VIDEO_DURATIONS = ['15 detik', '35 detik', '60 detik'];
export const SCRIPT_GOALS = ['Edukasi', 'Soft Sell', 'Hard Sell', 'Brand Awareness', 'Konversi Penjualan'];
export const COPYWRITING_FORMULAS = [
    'HPSBC',
    'AIDA',
    'PAS',
    'FAB',
    '4P',
    'Storytelling',
    'Testimonial',
    'ACCA'
];
export const HOOK_TYPES = [
    'Pain Point',
    'Curiosity',
    'Pattern Interrupt',
    'Relatable',
    'FOMO',
    'Problem-Solution',
    'Social Proof',
    'Dramatic Statement',
    'Empathy',
    'Novelty (Hal Baru / Unik)',
    'Surprise / Shock (Kejutan / Kaget)',
    'Loss Aversion (Takut Rugi / Nyesel)',
    'Authority Bias (Otoritas / Figur Ahli)',
    'Urgency (Desakan Waktu)',
    'Greed / Value (Ingin Untung Banyak)',
    'Fomo (harga)',
    'Positif spin',
    'Direct call out',
    'Controversial hook',
    'How to hook'
];
export const TONES_AND_STYLES = ['Friendly', 'Edukasi', 'Formal', 'Santai', 'Lucu', 'Storytelling', 'Inspiratif', 'Meyakinkan'];
export const CTA_STYLES = ['Hard Sell (Beli Sekarang)', 'Soft Sell (Cek Info)', 'Engagement (Komen & Share)', 'Urgency (Promo Terbatas)', 'Discount (Klaim Voucher)', 'Testimonial (Lihat Review)', 'Educative (Pelajari Lebih Lanjut)'];

// Constants for Link Script Generator
export const CONTENT_STYLES = [
    'Jujur Sambil Ngeluh',
    'Jujur Sambil Ngomel',
    'Drama Lebay',
    'Storytelling',
    'To the Point',
    'Edukasi Sambil Nyantai',
    'Lucu/Sarkas'
];
export const LINK_VIDEO_DURATIONS = ['15 detik', '30 detik', '60 detik'];
export const HOOK_KILLERS = [
    'FOMO',
    'Controversial hook',
    'Curiosity Gap',
    'Problem–Solution',
    'Drama',
    'Pattern Interrupt',
    'Pertanyaan',
    'Empathy/Relatable',
    'Angka/Data',
    'Novelty (Hal Baru / Unik)',
    'Surprise / Shock (Kejutan / Kaget)',
    'Loss Aversion (Takut Rugi / Nyesel)',
    'Social Proof (Bukti Sosial / Ikut-ikutan)',
    'Authority Bias (Otoritas / Figur Ahli)',
    'Urgency (Desakan Waktu)',
    'Greed / Value (Ingin Untung Banyak)',
    'Fomo (harga)',
    'Positif spin',
    'Direct call out',
    'How to hook'
];
export const HOOK_FORMATS = ['Hook Pernyataan', 'Hook Pertanyaan'];
export const CONTENT_TYPES = ['Soft Sell', 'Hard Sell'];

// Constants for Hook Generator
export const HOOK_CATEGORIES = [
    'Acak Semua Kategori',
    'Surprise / Shock (Kejutan / Kaget)',
    'Loss Aversion (Takut Rugi / Nyesel)',
    'Problem-Solution',
    'Fear of Missing Out (FOMO / Takut Ketinggalan)',
    'Curiosity (Rasa Penasaran)',
    'Social Proof (Bukti Sosial / Ikut-ikutan)',
    'Authority Bias (Otoritas / Figur Ahli)',
    'Novelty (Hal Baru / Unik)',
    'Relatability (Dekat dengan Masalah Audiens)',
    'Urgency (Desakan Waktu)',
    'Greed / Value (Ingin Untung Banyak)',
    'Fomo (harga)',
    'Positif spin',
    'Direct call out',
    'Controversial hook',
    'How to hook'
];

// Constants for Video Generator
export const VIDEO_ASPECT_RATIOS = ['9:16 (Vertical)', '16:9 (Horizontal)', '1:1 (Square)', '4:3 (Classic)', '3:4 (Portrait)'];
export const VIDEO_STYLES = ['Default', 'Cinematic', 'Anime', 'Cartoon', 'Drone Shot', 'Claymation', 'Photorealistic', 'Minimalist'];


// FIX: Renamed DEFAULT_TEMPLATES to TEMPLATES to match imports.
export const TEMPLATES: Template[] = [
  {
    id: 'beauty-1',
    niche: 'Beauty',
    title: 'Review Serum Pencerah Wajah',
    description: 'Template soft-selling untuk produk serum yang fokus pada mencerahkan kulit kusam.',
    formData: {
      targetAudience: 'Mahasiswa',
      scriptGoal: 'Soft Sell',
      copywritingFormula: 'PAS',
      hookTypes: ['Pain Point', 'Relatable'],
      toneAndStyle: 'Friendly',
      ctaStyle: 'Soft Sell (Cek Info)',
    }
  },
  {
    id: 'gadget-1',
    niche: 'Gadget',
    title: 'Unboxing TWS Kualitas Premium',
    description: 'Template hard-selling untuk produk TWS (True Wireless Stereo) dengan fitur unggulan.',
    formData: {
      targetAudience: 'Pekerja Kantoran',
      scriptGoal: 'Hard Sell',
      copywritingFormula: 'AIDA',
      hookTypes: ['Curiosity', 'Social Proof'],
      toneAndStyle: 'Edukasi',
      ctaStyle: 'Hard Sell (Beli Sekarang)',
    }
  },
  {
    id: 'food-1',
    niche: 'Food',
    title: 'Promo Cemilan Pedas Viral',
    description: 'Template untuk mempromosikan makanan ringan dengan penawaran diskon terbatas.',
    formData: {
      targetAudience: 'Remaja',
      scriptGoal: 'Konversi Penjualan',
      copywritingFormula: '4P',
      hookTypes: ['FOMO', 'Dramatic Statement'],
      toneAndStyle: 'Santai',
      ctaStyle: 'Urgency (Promo Terbatas)',
    }
  },
    {
    id: 'fashion-1',
    niche: 'Fashion',
    title: 'OOTD Kemeja Linen Kekinian',
    description: 'Template untuk menampilkan outfit of the day (OOTD) menggunakan produk fashion.',
    formData: {
      targetAudience: 'Mahasiswa',
      scriptGoal: 'Brand Awareness',
      copywritingFormula: 'Storytelling',
      hookTypes: ['Relatable', 'Pattern Interrupt'],
      toneAndStyle: 'Inspiratif',
      ctaStyle: 'Engagement (Komen & Share)',
    }
  }
];


// FIX: Added 'id' to each quote object to satisfy the Quote type.
export const MOTIVATIONAL_QUOTES: Quote[] = [
    { id: 'mot_1', author: "BOS Ai", quote: "Kamu bisa scroll motivasi seharian, tapi kalau ujung-ujungnya nggak praktek, ya tetap nggak ada hasil. Jangan tunggu pede, jangan tunggu alat bagus, jangan tunggu momen tepat. Mulai aja dengan apa yang ada. Ingat, video pertama yang jelek itu jauh lebih berharga daripada video bagus yang cuma ada di kepala." },
    { id: 'mot_2', author: "BOS Ai", quote: "Belajar teori itu penting, tapi jangan jadi pecandu teori. Sukses itu bukan soal siapa paling banyak nonton tutorial, tapi siapa paling sering praktek. Gagal? Ya wajar, semua orang juga gagal. Bedanya, yang sukses itu mereka yang terus praktek meskipun jatuh berkali-kali." },
    { id: 'mot_3', author: "BOS Ai", quote: "Kalau kamu cuma nyimpen ide di catatan, jangan kaget kalau hasilmu nol. Ide itu baru bernilai ketika dipraktekin. Satu video jelek yang kamu upload bisa ngasih pelajaran nyata. Tapi seribu ide tanpa praktek? Cuma bikin kamu capek mikir." },
    { id: 'mot_4', author: "BOS Ai", quote: "Praktek itu memang nyakitin ego. Kamu bakal salah ngomong, salah edit, salah angle. Tapi justru dari situ kamu belajar. Kalau kamu nggak pernah praktek, kamu nggak bakal pernah punya pengalaman. Dan tanpa pengalaman, jangan mimpi penghasilan." },
    { id: 'mot_5', author: "BOS Ai", quote: "Kamu nggak perlu nunggu pinter buat mulai. Justru kamu akan jadi pinter karena kamu mulai. Semua yang kamu iri-in sekarang juga dulunya berantakan. Bedanya, mereka praktek. Jadi kalau kamu masih banyak alasan, jangan iri kalau mereka udah panen hasil duluan." },
    { id: 'mot_6', author: "BOS Ai", quote: "Kebanyakan mikir bikin kamu capek, kebanyakan praktek bikin kamu cepet dapet hasil." },
    { id: 'mot_7', author: "BOS Ai", quote: "Kalau kamu takut gagal, yaudah jangan harap sukses. Gagal itu bagian dari praktek." },
    { id: 'mot_8', author: "BOS Ai", quote: "Sampai kapan mau jadi penonton YouTube motivasi? Sekali-sekali jadi pelaku!" },
    { id: 'mot_9', author: "BOS Ai", quote: "Ilmu itu kayak bensin. Percuma penuh kalau motornya nggak kamu nyalain buat jalan." },
    { id: 'mot_10', author: "BOS Ai", quote: "Praktek itu guru terbaik. Dia keras, tapi hasilnya nyata." },
    { id: 'mot_11', author: "BOS Ai", quote: "Kamu nggak bisa belajar renang cuma dari baca buku. Lompat ke kolam, basah, itu baru belajar." },
    { id: 'mot_12', author: "BOS Ai", quote: "Ide bagus tanpa praktek cuma mimpi. Ide biasa dengan praktek bisa jadi uang." },
    { id: 'mot_13', author: "BOS Ai", quote: "Setiap video gagal tetap lebih bernilai daripada ribuan video yang cuma rencana." },
    { id: 'mot_14', author: "BOS Ai", quote: "Kalau kamu masih nunggu momen tepat, berarti kamu nggak akan pernah mulai. Momen tepat itu tercipta pas kamu praktek." },
    { id: 'mot_15', author: "BOS Ai", quote: "Hasil nggak datang ke yang banyak teori. Hasil datang ke yang rajin praktek." },
    { id: 'mot_16', author: "BOS Ai", quote: "Kamu tuh bukan kekurangan ide, bukan kekurangan bahan, tapi kebanyakan mikir. Setiap hari sibuk analisis: ‘Bagus nggak ya? Cocok nggak ya?’ Sampai akhirnya video yang harusnya bisa tayang, malah mati di kepalamu. Dengar, ide itu nggak dibayar. Yang dibayar itu konten yang diposting. Jadi, hajar aja! Jelek? Biarin. Salah? Perbaiki di video berikutnya. Ingat, kesempurnaan lahir dari praktek, bukan dari overthinking." },
    { id: 'mot_17', author: "BOS Ai", quote: "Kalau kamu udah punya ide, punya produk, punya bahan, tapi masih diem… itu bukan masalah kurang siap, tapi kurang berani. Ingat, kamu nggak akan pernah tahu hasilnya kalau nggak praktek. Kebanyakan analisis cuma bikin kamu kalah start. Sementara kamu sibuk mikir, orang lain sudah upload, sudah closing, sudah dapet komisi. Mau sampai kapan jadi penonton?" },
    { id: 'mot_18', author: "BOS Ai", quote: "Overthinking itu racun. Dia bikin kamu sibuk muter-muter di kepala, tapi nggak pernah jalan di dunia nyata. Konten itu kayak otot, makin sering dipakai makin kuat. Kalau kamu nggak praktek, ya bakal lemah terus. Jadi berhenti analisis kebangetan. Rekam, edit seadanya, posting. Titik. Nanti seiring waktu skill-mu bakal terbentuk. Tapi kalau nggak pernah praktek, skill itu nggak akan lahir." },
    { id: 'mot_19', author: "BOS Ai", quote: "Jangan buang waktu nanya ‘Apa kontenku bakal laku?’ Itu pertanyaan bodoh. Jawabannya cuma ada satu: posting dulu baru tau! Analisis berlebihan itu cuma bikin kamu merasa sibuk, padahal kenyataannya kamu lagi nol besar. Yang bikin hasil itu tindakan, bukan pikiran. Jadi daripada otakmu panas kebanyakan mikir, mending jemarinmu panas bikin konten." },
    { id: 'mot_20', author: "BOS Ai", quote: "Jangan jadi pemikir abadi, jadilah eksekutor." },
    { id: 'mot_21', author: "BOS Ai", quote: "Ide tanpa upload = mimpi basi." },
    { id: 'mot_22', author: "BOS Ai", quote: "Overthinking bikin miskin, praktek bikin jalan." },
    { id: 'mot_23', author: "BOS Ai", quote: "Konten itu buat diposting, bukan dipajang di otak." },
    { id: 'mot_24', author: "BOS Ai", quote: "Kurangi analisis, tambahin aksi." },
    { id: 'mot_25', author: "BOS Ai", quote: "Kebanyakan mikir = ketinggalan rezeki." },
    { id: 'mot_26', author: "BOS Ai", quote: "Kamu nggak butuh teori lagi, kamu butuh upload." },
    { id: 'mot_27', author: "BOS Ai", quote: "Ide nggak bernilai sampai dipraktekkan." },
    { id: 'mot_28', author: "BOS Ai", quote: "Stop jadi penonton ide sendiri." },
    { id: 'mot_29', author: "BOS Ai", quote: "Eksekusi sekarang, belajar sambil jalan." },
    { id: 'mot_30', author: "BOS Ai", quote: "Kamu tuh pinter, tapi kebanyakan mikir. Coba deh upload, biar kepintaranmu keliatan hasilnya." },
    { id: 'mot_31', author: "BOS Ai", quote: "Aku tau kamu bisa, cuma kamu yang masih ngerem diri sendiri. Ayo hajar, jangan ditunda." },
    { id: 'mot_32', author: "BOS Ai", quote: "Sayang banget idemu kalau cuma mati di kepala. Kasih kesempatan dong biar dunia lihat." },
    { id: 'mot_33', author: "BOS Ai", quote: "Kamu bukan malas, cuma terlalu takut salah. Ingat, salah itu bagian dari belajar." },
    { id: 'mot_34', author: "BOS Ai", quote: "Aku cerewet gini bukan apa-apa, aku cuma nggak mau kamu nyesel karena kebanyakan nunda." },
    { id: 'mot_35', author: "BOS Ai", quote: "Ide yang kamu punya tuh bagus banget, tapi tanpa praktek nilainya nol. Jangan disia-siain, oke?" },
    { id: 'mot_36', author: "BOS Ai", quote: "Aku percaya kamu bisa lebih jauh dari yang kamu kira, tapi syaratnya satu: jangan cuma mikir, praktek." },
    { id: 'mot_37', author: "BOS Ai", quote: "Aku marah bukan karena benci, tapi karena aku tau kamu sebenarnya bisa lebih." },
    { id: 'mot_38', author: "BOS Ai", quote: "Kamu punya bahan, punya potensi, tinggal action. Jangan bikin aku kecewa lihat kamu diem aja." },
    { id: 'mot_39', author: "BOS Ai", quote: "Kamu itu bukan nggak bisa, tapi kebanyakan alasan. Padahal aku tau, kalau kamu nekat upload sekali aja, hasilnya bakal bikin kamu kaget." },
    { id: 'mot_40', author: "BOS Ai", quote: "Jangan pura-pura sibuk analisis, aku tau kamu cuma takut salah. Hei, salah itu normal, tapi nggak pernah mulai itu bahaya." },
    { id: 'mot_41', author: "BOS Ai", quote: "Kamu punya ide bagus, punya bahan, tinggal rekam. Sayang banget kalau semua itu mati di otakmu." },
    { id: 'mot_42', author: "BOS Ai", quote: "Kamu mikir terlalu banyak, sampai lupa praktek. Aku nggak butuh kamu sempurna, aku cuma butuh kamu berani coba." },
    { id: 'mot_43', author: "BOS Ai", quote: "Kalau kamu upload, mungkin hasilnya jelek. Tapi kalau kamu diem, hasilnya pasti nol. Kamu pilih yang mana?" },
    { id: 'mot_44', author: "BOS Ai", quote: "Aku marah-marah karena aku tau kamu punya potensi besar. Jangan bikin aku lihat potensi itu kebuang sia-sia." },
    { id: 'mot_45', author: "BOS Ai", quote: "Rezeki itu udah nunggu kamu di luar sana. Tapi kalau kamu masih diam, rezeki itu pindah ke orang lain. Kamu rela?" },
    { id: 'mot_46', author: "BOS Ai", quote: "Aku percaya sama kamu, tapi percuma kalau kamu nggak percaya sama dirimu sendiri." },
    { id: 'mot_47', author: "BOS Ai", quote: "Ayo, jangan cuma jadi penonton. Dunia juga harus lihat karyamu. Jangan takut, aku ada di belakangmu." }
];

export const TOUGH_LOVE_QUOTES: Quote[] = [
    { id: 'tl_1', author: "BOS Ai", quote: "Kamu sadar nggak sih? Bukan ide yang kurang, bukan bahan yang nggak ada—masalahmu cuma satu: kamu kebanyakan mikir. Analisis terus, action nol. Hei murid, kalau cuma mikir bisa bikin kaya, sekarang orang pintar udah jadi miliarder semua. Nyatanya? Yang jadi miliarder itu orang yang praktek, bukan tukang overthinking." },
    { id: 'tl_2', author: "BOS Ai", quote: "Dengar baik-baik! Dunia nggak peduli sama rencanamu. Dunia cuma peduli sama hasil yang kamu kasih. Jadi kalau idemu cuma jadi catatan, ya siap-siap dilupakan. Tapi kalau kamu upload, meskipun jelek, setidaknya dunia bisa lihat usahamu. Itu pintu pertama menuju hasil besar." },
    { id: 'tl_3', author: "BOS Ai", quote: "Kamu tuh pengen sukses, tapi kelakuanmu masih kayak penonton. Nonton tutorial, scroll motivasi, nulis rencana—tapi nggak ada eksekusi. Kalau terus kayak gini, kamu bukan calon kreator sukses, kamu calon arsip hidup. Dan aku nggak mau muridku jadi arsip!" },
    { id: 'tl_4', author: "BOS Ai", quote: "Bangun! Algoritma itu nggak bisa baca pikiranmu. Algoritma cuma kenal konten yang diposting. Jadi kalau kamu diem aja, jangan salahin rezeki kabur ke orang lain. Sementara kamu sibuk mikirin ‘nanti gimana’, orang lain udah closing ribuan." },
    { id: 'tl_5', author: "BOS Ai", quote: "Aku marah karena aku tau kamu bisa. Aku cerewet karena aku nggak rela lihat kamu stuck di tempat. Jadi mulai sekarang, kurangin analisis, tambahin aksi. Reset pikiranmu: sempurna itu bonus, praktek itu wajib." },
    { id: 'tl_6', author: "BOS Ai", quote: "Kamu tuh maunya apa? Ide udah ada, bahan udah siap, tapi nggak jalan juga. Jangan-jangan kamu lebih seneng jadi kolektor alasan daripada kreator konten. Bangun! Dunia nggak butuh rencana yang sempurna, dunia butuh aksimu sekarang." },
    { id: 'tl_7', author: "BOS Ai", quote: "Aku bilang jujur ya… selama kamu masih sibuk mikirin hasil, kamu nggak akan pernah dapet hasil. Hasil itu lahir dari praktek, bukan dari analisis tanpa ujung. Jadi stop jadi penonton ide sendiri. Upload sekarang, jangan tunggu besok. Besok itu nggak pernah datang." },
    { id: 'tl_8', author: "BOS Ai", quote: "Hei, denger baik-baik! Konten jelek yang kamu upload hari ini lebih berharga daripada ribuan ide yang kamu simpen di otak. Jadi jangan sok pinter dengan analisis berlebihan. Yang bikin kaya itu praktek, bukan teori." },
    { id: 'tl_9', author: "BOS Ai", quote: "Kamu nunggu apa lagi? Nunggu malaikat turun kasih kamu skrip? Nunggu algoritma jemput kamu di rumah? Bangun, murid! Algoritma cuma kenal satu hal: video yang diposting, bukan video yang kamu khayalkan." },
    { id: 'tl_10', author: "BOS Ai", quote: "Kamu tuh ya… ide banyak, bahan numpuk, tapi upload nggak jalan. Jangan-jangan hobimu bukan bikin konten, tapi ngumpulin draft buat museum masa depan. Ayo lah, sayang. Konten itu nggak dibayar kalau cuma dipajang di galeri. Posting dulu, jelek nggak apa-apa, nanti bisa diperbaiki. Tapi kalau nggak pernah praktek, skillmu ya segitu-segitu aja." },
    { id: 'tl_11', author: "BOS Ai", quote: "Overthinking mulu, kayak laptop kentang kebanyakan buka tab. Panas, nge-lag, terus mati sendiri. Lah kamu juga gitu, kepalamu panas mikirin konten, tapi hasilnya nol besar. Aku ngomel ini karena aku tau kamu sebenernya bisa. Tinggal praktek! Nggak usah nunggu sempurna, karena sempurna itu lahirnya setelah dicoba." },
    { id: 'tl_12', author: "BOS Ai", quote: "Aku tau kok, kamu ngerasa belum siap. Tapi hei, kapan sih manusia siap? Lahir aja duluan nangis, belajar ngomong belakangan. Sama aja bikin konten. Rekam aja dulu, edit seadanya, upload. Salah? Ya biarin. Justru dari salah itu nanti kamu pinter. Kalau nunggu sempurna, yang ada kontenmu malah jadi fosil di otak." },
    { id: 'tl_13', author: "BOS Ai", quote: "Kamu tuh kayak motor lengkap bensin, lengkap kunci, tapi nggak pernah distarter. Ya kapan majunya? Jangan-jangan kamu lebih suka duduk di atas motor sambil ngebayangin touring, padahal nggak pernah jalan. Ayo dong, jangan jadi penghayal, jadi pelaku! Muridku sayang, aku cerewet karena aku nggak mau kamu keburu kalah start sama orang lain." },
    { id: 'tl_14', author: "BOS Ai", quote: "Kalau kamu terus mikir, terus analisis, tapi nggak praktek… jangan salahin rezeki mampir ke orang lain duluan. Algoritma itu bukan dukun, dia nggak bisa nemuin konten yang nggak ada. Jadi daripada sibuk ngelamun, ayo rekam, ayo posting. Nanti kalau udah jalan, baru deh otakmu punya alasan buat mikir lebih pinter lagi." },
    { id: 'tl_15', author: "BOS Ai", quote: "Kamu itu bukan nggak bisa, kamu itu manja. Semua sudah ada: ide ada, bahan ada, tapi kamu masih nyari alasan. Hei murid, alasan nggak bisa bikin kamu dibayar. Yang bikin kamu dibayar itu konten yang kamu upload." },
    { id: 'tl_16', author: "BOS Ai", quote: "Kamu nunggu sempurna? Oke, aku kasih tau: sempurna itu nggak ada kalau kamu nggak pernah mulai. Semua orang yang sekarang keliatan jago, dulunya juga berantakan. Bedanya mereka praktek, kamu masih sibuk mikirin." },
    { id: 'tl_17', author: "BOS Ai", quote: "Kalau kamu terus-terusan analisis, terus nunda, jangan salahin Tuhan kalau rezekimu diambil orang lain duluan. Rezeki itu dijemput, bukan ditunggu. Dan jemputnya itu lewat praktek, bukan lamunan." },
    { id: 'tl_18', author: "BOS Ai", quote: "Aku muak lihat kamu main aman terus. Kamu bilang pengen sukses, tapi takut salah. Lah, sukses itu lahir dari ribuan kesalahan. Kalau kamu nggak pernah salah, berarti kamu nggak pernah mencoba. Dan kalau nggak mencoba, ya jangan mimpi hasil." },
    { id: 'tl_19', author: "BOS Ai", quote: "Aku keras karena aku sayang. Aku nggak mau kamu jadi penonton seumur hidup. Jadi mulai sekarang, reset mindsetmu: upload dulu, belajar belakangan. Konten jelek itu guru, konten yang nggak pernah tayang itu kuburan." }
];