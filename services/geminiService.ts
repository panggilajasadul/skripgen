import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse, GenerateVideosOperation, Modality } from "@google/genai";
import { FormData, Script, LinkFormData, LinkScript, HookGeneratorFormData, BrandProfile, AngleGeneratorFormData, ReviewAngle, HashtagGeneratorFormData, HashtagCategory, VideoGeneratorFormData, ContentPlannerFormData, ContentPlan, GeneratedScriptOutput, MarketResearchFormData, MarketResearchResult, PersonalInsights, ImageStudioFormData, EditedImageOutput } from "../types";
import { apiKeyService } from "./apiKeyService";

// FIX: Made `getAiClient` async to correctly handle the promise returned by `apiKeyService.getApiKey`.
const getAiClient = async (): Promise<GoogleGenAI | null> => {
    const apiKey = await apiKeyService.getApiKey();
    if (!apiKey) {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(apiCall: () => Promise<T>, maxRetries = 5): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            
            let isRateLimitError = false;
            const errorString = (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)).toLowerCase();

            if (errorString.includes('resource_exhausted') || errorString.includes('429')) {
                isRateLimitError = true;
            }

            if (isRateLimitError) {
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
                console.warn(`Rate limit exceeded. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${i + 1}/${maxRetries})`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
    
    let isLastErrorRateLimit = false;
    const lastErrorString = (typeof lastError === 'object' && lastError !== null ? JSON.stringify(lastError) : String(lastError)).toLowerCase();
    if (lastErrorString.includes('resource_exhausted') || lastErrorString.includes('429')) {
        isLastErrorRateLimit = true;
    }
    
    if (isLastErrorRateLimit) {
      throw new Error("Server AI sedang sibuk. Silakan coba lagi.");
    }

    throw lastError;
}


const generatePrompt = (data: FormData, brandProfile?: BrandProfile, goodExamples?: Script[], personalInsights?: PersonalInsights): string => {
  const formulaDefinitions: { [key: string]: string } = {
    'HPSBC': 'Struktur: H (Hook), P (Problem - didramatisir), S (Solution), B (Benefit - bukan fitur), C (Call to Action).',
    'AIDA': 'Struktur: A (Attention/Hook), I (Interest), D (Desire), A (Action/CTA).',
    'PAS': 'Struktur: P (Problem), A (Agitate), S (Solution). Tambahkan Hook di awal dan CTA di akhir.',
    'FAB': 'Struktur: F (Features), A (Advantages), B (Benefits). Tambahkan Hook di awal dan CTA di akhir.',
    '4P': 'Struktur: P (Picture), P (Promise), P (Prove), P (Push/CTA).',
    'Storytelling': 'Struktur naratif: Setup (pengenalan), Conflict (masalah), Resolution (solusi dengan produk). Tambahkan Hook di awal dan CTA di akhir.',
    'Testimonial': 'Struktur: Kutipan/Cerita Pelanggan, Hubungkan ke Produk, Call to Action. Gunakan Hook di awal.',
    'ACCA': 'Struktur: A (Awareness/Hook), C (Comprehension), C (Conviction), A (Action/CTA).'
  };

  const formulaInstruction = `*   **Formula Copywriting:** ${data.copywritingFormula}. Ikuti struktur ini dengan ketat: ${formulaDefinitions[data.copywritingFormula] || 'Gunakan struktur standar Hook, Body, CTA.'}`;
  
  const ctaInstruction = data.customCTA.trim()
    ? `*   **Call-to-Action (CTA):** Gunakan CTA spesifik berikut: "${data.customCTA.trim()}"`
    : `*   **Gaya Call-to-Action (CTA):** ${data.ctaStyle}. Buat CTA yang natural sesuai gaya ini.`;
    
  const sceneInstruction = `**PENTING - Sertakan Rekomendasi Scene:** Untuk setiap bagian skrip (seperti "Hook", "Problem", dll.), tambahkan satu baris rekomendasi scene yang natural dan mudah dipraktekkan. Gunakan format \`(Rekomendasi Scene: deskripsi singkat adegan)\`. Contoh: \`(Rekomendasi Scene: Tunjukkan tekstur produk di tanganmu)\`. Ini WAJIB ADA di setiap bagian skrip.`;

  const uspInstruction = data.usp.trim()
    ? `*   **Unique Selling Proposition (USP):** ${data.usp.trim()}. Ini adalah alasan UTAMA mengapa pelanggan harus memilih produk ini. Jadikan ini sebagai pesan inti dalam skrip.`
    : '';

  let brandProfileInstruction = `
### Persona & Gaya (Selalu Aktif)
Anda berperan sebagai AHLI konten afiliasi produk untuk TikTok Shop & Shopee. 
Tugas Anda adalah membuat 3 variasi skrip video short-form yang sangat natural seperti percakapan manusia, dan siap pakai untuk promosi produk. 
Skrip harus terasa engaging, blak-blakan, dan emosional. Hindari bahasa yang terlalu formal atau kaku.
`;

  if (brandProfile && brandProfile.toneOfVoice) {
    if (brandProfile.personaType === 'brand') {
       brandProfileInstruction = `
### Persona & Gaya (WAJIB DIIKUTI - BRAND PROFILE)
Anda HARUS berperan sebagai representasi resmi dari brand "${brandProfile.brandName || 'yang tidak disebutkan namanya'}". Anda adalah suara brand itu sendiri.
*   **Deskripsi Brand:** ${brandProfile.brandDescription || 'Tidak ada.'}
*   **Target Audiens Utama Brand:** ${brandProfile.mainAudience || 'Tidak ada.'}
*   **TONE OF VOICE WAJIB:** Anda HARUS menggunakan gaya bahasa resmi brand: **${brandProfile.toneOfVoice}**.
*   **KATA-TERLARANG:** JANGAN PERNAH menggunakan kata-kata berikut: **${brandProfile.forbiddenWords || 'Tidak ada.'}**.

Tugas Anda adalah membuat 3 variasi skrip video yang sangat natural dan konsisten dengan persona brand di atas.
`;
    } else { // personaType === 'user'
       brandProfileInstruction = `
### Persona & Gaya (WAJIB DIIKUTI - USER/CREATOR PERSONA)
Anda HARUS berperan sebagai seorang content creator/affiliate bernama "${brandProfile.brandName || 'Kreator'}". Anda BUKAN brand, tapi seorang pengguna yang sedang me-review atau merekomendasikan produk.
*   **Deskripsi Diri/Channel Anda:** ${brandProfile.brandDescription || 'Tidak ada.'}
*   **Target Audiens Utama Anda:** ${brandProfile.mainAudience || 'Tidak ada.'}
*   **GAYA BICARA WAJIB:** Anda HARUS menggunakan gaya bicara personal Anda: **${brandProfile.toneOfVoice}**.
*   **KATA-TERLARANG:** JANGAN PERNAH menggunakan kata-kata berikut dalam gaya bicara Anda: **${brandProfile.forbiddenWords || 'Tidak ada.'}**.

Tugas Anda adalah membuat 3 variasi skrip video dari sudut pandang seorang kreator dengan persona di atas.
`;
    }
  }
  
  let goodExamplesInstruction = '';
  if(goodExamples && goodExamples.length > 0) {
    const examplesText = goodExamples.map(script => {
      const parts = script.parts.map(p => `${p.partName}: ${p.content}`).join('\n');
      return `--- CONTOH SKRIP YANG DISUKAI ---\nJudul: ${script.title}\n${parts}\n------------------------------`;
    }).join('\n\n');
    goodExamplesInstruction = `
### Referensi Gaya (SANGAT PENTING)
Pengguna ini telah memberikan feedback positif pada skrip-skrip berikut. PELAJARI gaya, struktur, dan pilihan kata dari contoh-contoh ini. Buat skrip baru Anda dengan gaya yang SANGAT MIRIP dengan contoh-contoh ini.

${examplesText}
`;
  }

  let personalInsightsInstruction = '';
  if (personalInsights && personalInsights.topFormula !== 'N/A') {
      personalInsightsInstruction = `
### PENTING: Wawasan Pribadi Pengguna (WAJIB DIIKUTI)
Berdasarkan analisis data kinerjanya, pengguna ini mendapatkan hasil TERBAIK ketika menggunakan kombinasi berikut. Anda HARUS MEMPRIORITASKAN penggunaan elemen-elemen ini dalam skrip yang Anda buat untuk memaksimalkan peluang keberhasilan:
*   **Formula Paling Sukses:** ${personalInsights.topFormula}
*   **Hook Paling Sukses:** ${personalInsights.topHook}
*   **Tone Paling Sukses:** ${personalInsights.topTone}
`;
  }


  const personaAndStyleInstruction = `
${brandProfileInstruction}

${personalInsightsInstruction}

Gunakan **tabel hook & template kalimat** berikut sebagai referensi utama untuk inspirasi, terutama untuk bagian "Hook" dari formula yang dipilih. Improvisasikan tiap kali membuat skrip agar tiap video unik:

| No | Kombinasi Hook              | Template Kalimat (bisa diimprovisasi)                                               |
| -- | --------------------------- | ----------------------------------------------------------------------------------- |
| 1  | Pain → Surprise             | “Udah capek [pain audiens]… eh ternyata sekarang ada ${data.productName} yang [keunggulan].” |
| 2  | Curiosity → Reveal          | “Tau nggak [pertanyaan unik]? Ternyata jawabannya ada di ${data.productName}.”          |
| 3  | Relatable → Solution        | “Pernah ngalamin [masalah umum]? Tenang, ${data.productName} ini bisa [keunggulan].”   |
| 4  | Drama → Edukasi             | “Dulu aku harus [drama/repot banget]… sekarang cukup pake ${data.productName} yang [keunggulan].” |
| 5  | Shock Value → Benefit       | “Nggak nyangka ${data.productName} ini bisa [fakta mengejutkan]! Plus ada fitur [keunggulan].” |
| 6  | Question → Proof            | “Masih [masalah umum]? Nih aku kasih bukti kalau ${data.productName} bisa [keunggulan].” |
| 7  | FOMO → Harga Promo          | “Semua orang udah coba ${data.productName}… dan sekarang malah lagi diskon!”         |
| 8  | Exaggeration → Klarifikasi  | “Serius ${data.productName} ini bisa bikin kamu [lebay/hasil wow]! Karena ada [keunggulan].” |
| 9  | Social Proof → Demo         | “Udah ribuan orang pake ${data.productName}… ini alasan kenapa.”                       |
| 10 | Pain → Solution → CTA Cepat | “Suka kesel [pain]? ${data.productName} ini solusinya. Buruan sebelum kehabisan!”       |
| 11 | Curhat → Twist Positif      | “Gangerti lagi, dulu aku [curhat/pain]… eh sekarang ${data.productName} malah [kejutan positif].” |
| 12 | Problem → Hack              | “Ngira [mitos/kendala]? Salah banget! ${data.productName} ini bisa [keunggulan].”      |
| 13 | Myth Busting → Truth        | “Katanya [mitos]? Faktanya ${data.productName} justru [keunggulan nyata].”             |
| 14 | Before After → Benefit      | “Liat bedanya: sebelum pake [kategori produk]… dan setelah pake ${data.productName}.”   |
| 15 | Challenge → Proof           | “Coba setup ${data.productName} dalam 5 detik… hasilnya kayak studio!”                 |
| 16 | Teasing → Satisfaction      | “Aku nemuin alat kecil yang bikin [hasil wow]… ternyata ${data.productName} ini.”       |
| 17 | Shock Price → Value         | “Kok bisa ${data.productName} segede ini harganya cuma segini??”                         |
| 18 | Behind The Scene → Produk   | “Rahasia kenapa [hasil bagus]? Karena aku pake ${data.productName}.”                    |
| 19 | Comparison → Winner         | “Bandingin aja: ${data.productName} vs [kompetitor]. Jelas banget menangnya.”           |
| 20 | Pain → Relatable → Solution | “Males banget [pain relatable]? Aku juga. Untung ada ${data.productName} yang [keunggulan].” |

### Aturan Wajib untuk Improvisasi:
1.  **Prioritaskan Struktur Formula:** Yang paling penting, **gunakan struktur dari "Formula Copywriting" yang diberikan sebagai kerangka utama skrip Anda**. Gunakan kreativitas dan tabel hook untuk membuat konten di dalam setiap bagian struktur tersebut.
2.  **Narasi Mengalir:** Buat narasi yang mengalir seperti sedang ngobrol dengan teman, bukan seperti membaca daftar fitur.
3.  **CTA Natural:** Selalu akhiri dengan CTA yang natural sesuai instruksi CTA yang diberikan.
4.  **Ganti Placeholder:** Ganti semua placeholder dalam kurung siku (seperti \`[pain audiens]\`, \`[masalah umum]\`) menggunakan informasi dari **Data Produk & Audiens** di bawah.
`;

  return `
${personaAndStyleInstruction}

${goodExamplesInstruction}

Tugas Anda adalah membuat 3 variasi skrip video produk yang menarik berdasarkan detail berikut.

**Detail Produk:**
*   **Nama Produk:** ${data.productName}
*   **Keunggulan:** ${data.productAdvantages.join(', ')}
${uspInstruction}
*   **Masalah Audience:** ${data.audienceProblem || 'Tidak spesifik'}

**Tujuan & Target:**
*   **Tujuan Skrip:** ${data.scriptGoal}
*   **Target Audience:** ${data.targetAudience}

**Struktur & Gaya Skrip:**
*   **Durasi Video Target:** ${data.videoDuration}
${formulaInstruction}
*   **Jenis Hook yang Diinginkan (sebagai inspirasi):** ${data.hookTypes.join(', ')}. Biarkan AI yang menentukan format hook terbaik (pernyataan, pertanyaan, dll.) agar hasilnya paling efektif.
*   **Tone & Style:** ${data.toneAndStyle}
${ctaInstruction}

**Instruksi Tambahan:**
*   Buat skrip yang ringkas dan padat, sesuaikan panjangnya agar sesuai dengan durasi video target yaitu ${data.videoDuration}.
*   Gunakan bahasa yang relevan dengan target audience.
${sceneInstruction}

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa sebuah objek tunggal dengan properti berikut: "killerTitle", "variations", "explanation", "caption", dan "hashtags".
- "killerTitle" harus berupa string judul video yang sangat clickbait, membuat penasaran, dan memaksimalkan click-through rate.
- "variations" harus berupa array yang berisi 3 objek skrip. Setiap objek skrip harus memiliki properti "title" (string) dan "parts" (sebuah array objek). Setiap objek di dalam "parts" harus memiliki "partName" dan "content". Urutan "parts" HARUS mengikuti struktur formula copywriting yang dipilih (${data.copywritingFormula}).
- "explanation" harus berupa sebuah string yang berisi analisis strategi singkat (2-3 kalimat) mengapa kombinasi formula, hook, dan gaya ini efektif untuk target audiens yang diberikan.
- "caption" harus berupa string caption singkat yang menarik untuk postingan media sosial (misalnya, TikTok).
- "hashtags" harus berupa string tunggal berisi hashtag relevan yang dipisahkan spasi (contoh: "#racuntiktok #serumviral #skincare").
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};


export const generateScriptVariations = async (data: FormData, brandProfile?: BrandProfile, goodExamples?: Script[], personalInsights?: PersonalInsights): Promise<GeneratedScriptOutput> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateScriptVariations.");
        return Promise.resolve({
            killerTitle: "Mock Killer Title: Bibir Pecah-Pecah Auto Sirna?!",
            variations: [
                { title: "Mock Script 1: Lip Tint Viral!", parts: [
                    { partName: "Hook", content: "Bibir kering pecah-pecah? Stop scroll! \n(Rekomendasi Scene: Close-up bibir kering)" },
                    { partName: "Body", content: "Ini dia lip tint yang gak cuma ngasih warna cantik, tapi juga ngelembabin bibir kamu seharian. Formulanya ringan banget, serasa gak pake apa-apa!" },
                    { partName: "CTA", content: "Yuk, cobain sekarang! Klik keranjang kuning ya!" }
                ]},
                { title: "Mock Script 2: Rahasia Bibir Plumpy", parts: [
                    { partName: "Hook", content: "Rahasia bibir sehat dan plumpy ala selebgram? Cuma pake ini!" },
                    { partName: "Body", content: "Dengan kandungan vitamin E dan jojoba oil, lip tint ini bikin bibir kamu ternutrisi. Warnanya juga tahan lama, gak perlu touch up terus! \n(Rekomendasi Scene: Swatch warna-warni di tangan)" },
                    { partName: "CTA", content: "Jangan sampai kehabisan, stok terbatas! Cek sekarang!" }
                ]},
                { title: "Mock Script 3: Lip Tint Andalan", parts: [
                    { partName: "Hook", content: "Udah coba berbagai lip tint tapi gak ada yang cocok? Mungkin ini jawabannya!" },
                    { partName: "Body", content: "Lihat deh warnanya, pigmented banget kan? Sekali oles langsung nutup! Plus, harganya ramah di kantong mahasiswa." },
                    { partName: "CTA", content: "Komen 'MAU' dan share ke temanmu! Link di bio!" }
                ]},
            ],
            explanation: "Ini adalah penjelasan mock karena API Key tidak diatur. Strategi ini menggunakan hook yang menargetkan masalah umum (pain point) untuk menarik perhatian, diikuti dengan penjelasan manfaat produk yang jelas dan diakhiri dengan CTA yang lugas untuk mendorong konversi.",
            caption: "Bibir auto plumpy pake lip tint viral ini! 😍 Wajib punya!",
            hashtags: "#liptintviral #racuntiktok #skincare #makeup"
        });
    }
    
  const prompt = generatePrompt(data, brandProfile, goodExamples, personalInsights);

  try {
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            killerTitle: {
              type: Type.STRING,
              description: "Judul video yang clickbait dan membuat penasaran."
            },
            variations: {
              type: Type.ARRAY,
              description: "Array berisi 3 variasi skrip.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Judul skrip yang menarik." },
                  parts: {
                    type: Type.ARRAY,
                    description: "Bagian-bagian skrip yang terstruktur sesuai formula copywriting.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        partName: { type: Type.STRING, description: "Nama bagian skrip (e.g., Hook, Problem, Solution, CTA)." },
                        content: { type: Type.STRING, description: "Konten teks untuk bagian skrip tersebut." },
                      },
                      required: ["partName", "content"],
                    },
                  },
                },
                required: ["title", "parts"],
              },
            },
            explanation: {
              type: Type.STRING,
              description: "Penjelasan strategi di balik skrip yang dihasilkan."
            },
            caption: {
              type: Type.STRING,
              description: "Caption singkat untuk media sosial."
            },
            hashtags: {
                type: Type.STRING,
                description: "String hashtag yang dipisahkan spasi."
            }
          },
          required: ["killerTitle", "variations", "explanation", "caption", "hashtags"],
        },
      },
    });
    
    const response: GenerateContentResponse = await withRetry(apiCall);

    let jsonText = response.text?.trim();
    if (!jsonText) {
        throw new Error("The AI returned an empty response. Please try adjusting your prompt.");
    }

    if (jsonText.startsWith("```json")) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith("```")) {
         jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    try {
        const result = JSON.parse(jsonText);
        return result as GeneratedScriptOutput;
    } catch(parseError) {
        console.error("Failed to parse JSON from Gemini API. Raw text:", jsonText, parseError);
        throw new Error("The AI returned a response that was not in the expected JSON format. Please try again.");
    }

  } catch (error) {
    console.error("Error generating script from Gemini API:", error);
    throw error;
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateImageFromPrompt.");
        return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }
    
    try {
        const apiCall = () => ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A simple, clean, minimalist storyboard sketch of: ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        const response: GenerateImagesResponse = await withRetry(apiCall);
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("Image generation returned no images.");
        }
    } catch (error) {
        console.error("Error generating image from Gemini API:", error);
        throw error;
    }
};


const PERSONA_STARTERS: { [key: string]: string[] } = {
  'Jujur Sambil Ngeluh': [
    "Jujur ya, aku tuh capek banget...",
    "Sumpah ya, pusing banget kalau...",
    "Capek banget gak sih kalau harus...",
    "Aku tuh udah nyerah sama yang namanya...",
    "Ada yang sama gak sih, kesel banget sama...",
    "Capek banget…",
    "Jujur aja…",
    "Kadang kesel deh…",
    "Entah kenapa ya…",
    "Heran banget…",
    "Kenapa sih…",
    "Sering banget kejadian gini…",
    "Udah coba macam-macam, tapi…",
    "Bingung banget…",
    "Aneh ya…",
    "Sumpah, nggak ngerti lagi…",
    "Lucunya…",
    "Yang bikin bete…",
    "Males banget kalau…",
    "Kenapa tiap kali…",
    "Serius deh…",
    "Nggak habis pikir…",
    "Kadang pengen nyerah aja…",
    "Gila ya…",
    "Tau nggak sih yang bikin sebel…",
    "Rasanya tuh…",
    "Pernah nggak sih…",
    "Sialnya…",
    "Ya ampun…",
    "Parah banget kalau…",
    "Gimana coba…",
    "Sumpah bikin emosi…",
    "Yang bikin aneh…",
    "Udah usaha, tetep aja…",
    "Kadang suka mikir…"
  ],
  'Jujur Sambil Ngomel': [
    "Kenapa sih…", "Lagian ya…", "Aneh banget deh…", "Coba pikir…", "Heran deh…",
    "Tau nggak sih yang bikin kesel…", "Giliran…", "Udah dibilangin…", "Yang bikin tambah ribet…",
    "Niatnya baik, tapi…", "Kesel banget kalau…", "Jadi gini ya…", "Kok bisa-bisanya…",
    "Lucu banget, tapi ngeselin…", "Paling males kalau…", "Parah banget sih…", "Gimana ceritanya…",
    "Coba bayangin…", "Nggak masuk akal deh…", "Yaelah…", "Tau nggak, paling ngeselin tuh…",
    "Kebiasaan banget…", "Sumpah ya, bikin geleng-geleng…", "Kok bisa ya…", "Nggak ngerti lagi deh…",
    "Yang bikin tambah kacau…", "Bisa-bisanya…", "Sumpah bikin pusing…", "Udah biasa banget sih…",
    "Paling aneh kalau…", "Nih ya…", "Coba deh…", "Dasar banget…", "Paling nyebelin tuh…",
    "Beneran deh…", "Udalah…", "Aduh, please deh…", "Nggak banget sih kalau…", "Sering kan…",
    "Nih yang bikin gue heran…", "Masalahnya tuh…", "Kebayang nggak…", "Paling bodoh tuh…",
    "Lucu sih, tapi ngeselin…", "Harusnya kan…", "Kadang tuh…", "Salahnya tuh…", "Tolong banget deh…",
    "Gimana nggak kesel coba…", "Yaelah, masih aja…", "Astaga…", "Sering banget nih…",
    "Bukannya apa-apa, tapi…", "Kadang suka heran deh…", "Ya ampun, kok bisa…", "Bete banget kalau…",
    "Coba pikir ya…", "Yang paling ngeselin…", "Gila sih ini…", "Paling absurd tuh…",
    "Udah sering kejadian…", "Kenapa juga…", "Kayak gimana coba…", "Serius, nggak lucu banget…",
    "Paling tolol tuh…", "Ini sih kebangetan…", "Rasanya pengen ngomel…",
    "Paling bikin geleng-geleng…", "Yaelah, tiap hari aja…", "Pernah ngalamin nggak…",
    "Yang bikin sakit hati…", "Padahal ya…", "Udah tau, tapi tetep aja…",
    "Kayak nggak ada kerjaan lain aja…", "Giliran gue butuh…", "Paling aneh tuh…",
    "Luar biasa ngeselin…", "Tiap kali coba serius…", "Coba bayangin deh…", "Herannya…",
    "Kesel nggak sih kalau…", "Lucu-lucu nyebelin…", "Bikin darah naik banget…",
    "Yaelah, dasar banget…", "Paling nggak masuk akal…", "Sumpah ini bikin muak…",
    "Coba lo pikir…", "Udah sering diingetin…", "Bikin males banget…", "Tiap kali kejadian…"
  ],
  'Drama Lebay': [
    "OMG, kalian harus tahu!",
    "Gila, gila, gila! Ini tuh...",
    "Aku lagi syok banget, ternyata...",
    "Dramanya dimulai ketika...",
    "Ini lebih seru dari sinetron!"
  ],
  'Storytelling': [
    "Jadi, ceritanya waktu itu...",
    "Dulu aku pernah ngalamin...",
    "Semuanya berawal dari...",
    "Biar aku ceritain sesuatu...",
    "Ada sebuah kisah tentang..."
  ],
  'To the Point': [
    "Langsung aja, ini solusinya.",
    "Ini yang kamu butuhin.",
    "Nggak pake lama, ini dia...",
    "Intinya, produk ini bisa...",
    "Simpelnya gini..."
  ],
};

const generateLinkPrompt = (data: LinkFormData, brandProfile?: BrandProfile): string => {
  let brandProfileInstruction = `
### Persona & Gaya (Selalu Aktif)
Anda berperan sebagai AHLI konten afiliasi produk untuk TikTok Shop & Shopee. 
Tugas Anda adalah membuat 1 skrip video short-form yang sangat natural seperti percakapan manusia, dan siap pakai untuk promosi produk dari link yang diberikan. 
Skrip harus terasa engaging, blak-blakan, dan emosional. Hindari bahasa yang terlalu formal atau kaku.
`;

  if (brandProfile && brandProfile.toneOfVoice) {
    if (brandProfile.personaType === 'brand') {
       brandProfileInstruction = `
### Persona & Gaya (WAJIB DIIKUTI - BRAND PROFILE)
Anda HARUS berperan sebagai representasi resmi dari brand "${brandProfile.brandName || 'yang tidak disebutkan namanya'}". Anda adalah suara brand itu sendiri.
*   **Deskripsi Brand:** ${brandProfile.brandDescription || 'Tidak ada.'}
*   **TONE OF VOICE WAJIB:** Anda HARUS menggunakan gaya bahasa resmi brand: **${brandProfile.toneOfVoice}**.
*   **KATA-TERLARANG:** JANGAN PERNAH menggunakan kata-kata berikut: **${brandProfile.forbiddenWords || 'Tidak ada.'}**.
`;
    } else { // personaType === 'user'
       brandProfileInstruction = `
### Persona & Gaya (WAJIB DIIKUTI - USER/CREATOR PERSONA)
Anda HARUS berperan sebagai seorang content creator/affiliate bernama "${brandProfile.brandName || 'Kreator'}". Anda BUKAN brand, tapi seorang pengguna yang sedang me-review atau merekomendasikan produk.
*   **Deskripsi Diri/Channel Anda:** ${brandProfile.brandDescription || 'Tidak ada.'}
*   **GAYA BICARA WAJIB:** Anda HARUS menggunakan gaya bicara personal Anda: **${brandProfile.toneOfVoice}**.
*   **KATA-TERLARANG:** JANGAN PERNAH menggunakan kata-kata berikut dalam gaya bicara Anda: **${brandProfile.forbiddenWords || 'Tidak ada.'}**.
`;
    }
  }

  const personaStarter = PERSONA_STARTERS[data.contentStyle] ? `Gunakan salah satu dari kalimat pembuka berikut sebagai inspirasi hook: "${PERSONA_STARTERS[data.contentStyle].join('", "')}"` : '';

  return `
${brandProfileInstruction}

Tugas Anda adalah membuat skrip video pendek (Hook, Body, CTA) berdasarkan link produk dan detail berikut. Anda TIDAK BISA mengakses link, jadi Anda harus berimprovisasi dan membuat asumsi yang masuk akal tentang produk berdasarkan URL-nya.

**Detail Permintaan:**
*   **Link Produk (untuk inspirasi nama/kategori):** ${data.productLink}
*   **Target Audience:** ${data.targetAudience || 'Umum'}
*   **Gaya Konten (Persona):** ${data.contentStyle}. ${personaStarter}
*   **Durasi Video Target:** ${data.videoDuration}
*   **Hook Killer (Kombinasikan):** ${data.hookKillers.join(', ')}. Ini adalah elemen psikologis yang HARUS ada di dalam hook.
*   **Format Hook:** ${data.hookFormat}
*   **Tipe Konten:** ${data.contentType}

**Aturan Wajib:**
1.  **Improvisasi Produk:** Berdasarkan link, buat asumsi tentang nama produk, manfaat, dan fitur. Jika linknya umum (misal, tokopedia.com/shop), buat asumsi produk yang populer. Buat skrip yang meyakinkan seolah-olah Anda tahu produknya.
2.  **Struktur Hook-Body-CTA:** Skrip harus jelas terbagi menjadi tiga bagian.
3.  **Hook Kuat:** Buat hook yang sangat menarik berdasarkan "Hook Killer" dan "Format Hook" yang diberikan.
4.  **Body Ringkas:** Jelaskan masalah audiens dan bagaimana produk ini adalah solusinya. Fokus pada 1-2 manfaat utama.
5.  **CTA Jelas:** Buat ajakan bertindak yang kuat dan sesuai dengan tipe konten.
6.  **Bahasa Natural:** Gunakan bahasa sehari-hari yang sesuai dengan persona.
7.  **Sertakan Rekomendasi Scene:** Di dalam teks untuk "hook", "body", dan "cta", sertakan rekomendasi scene yang relevan dan mudah dipraktekkan. Gunakan format \`(Rekomendasi Scene: deskripsi singkat adegan)\`.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan properti berikut: "killerTitle", "hook", "body", "cta", "explanation", "caption", dan "hashtags".
- "killerTitle" harus berupa string judul video yang sangat clickbait, membuat penasaran, dan memaksimalkan click-through rate.
- "explanation" harus berupa sebuah string yang berisi analisis strategi singkat (2-3 kalimat) mengapa skrip ini efektif.
- "caption" harus berupa string caption singkat yang menarik untuk postingan media sosial.
- "hashtags" harus berupa string tunggal berisi hashtag relevan yang dipisahkan spasi.
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateScriptFromLink = async (data: LinkFormData, brandProfile?: BrandProfile): Promise<LinkScript> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateScriptFromLink.");
        return Promise.resolve({
            killerTitle: "Mock Killer Title: Link Ajaib Ini Bikin Dompet Tebal!",
            hook: "Mock Hook: Produk ini lagi viral banget di TikTok, kamu udah punya belum? (Rekomendasi Scene: Tunjukkan produk ke kamera)",
            body: "Mock Body: Sumpah, ini bagus banget buat [masalah audiens]. Aku udah pake seminggu dan hasilnya [manfaat produk]. Gak nyesel sama sekali belinya.",
            cta: "Mock CTA: Buruan cek keranjang kuning sebelum kehabisan!",
            explanation: "Penjelasan mock: Menggunakan FOMO untuk hook dan bukti sosial di body.",
            caption: "Jangan sampai ketinggalan produk viral ini! ✨",
            hashtags: "#tiktokmademebuyit #racuntiktok #productreview"
        });
    }

    const prompt = generateLinkPrompt(data, brandProfile);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            killerTitle: { type: Type.STRING },
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
            explanation: { type: Type.STRING },
            caption: { type: Type.STRING },
            hashtags: { type: Type.STRING }
          },
          required: ["killerTitle", "hook", "body", "cta", "explanation", "caption", "hashtags"]
        }
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating script from link:", error);
        throw error;
    }
};

const generateHooksPrompt = (data: HookGeneratorFormData): string => {
  return `
Tugas Anda adalah membuat 10 variasi hook video pendek yang sangat menarik (scroll-stopping) untuk sebuah produk.

**Detail Produk:**
*   **Produk/Link:** ${data.product}
*   **Benefit/Fitur Utama:** ${data.benefit || 'Tidak disebutkan, improvisasi berdasarkan nama produk.'}
*   **Kategori Hook yang Diinginkan:** ${data.category}

**Aturan Wajib:**
1.  **Fokus pada Kategori:** Jika kategori spesifik diberikan (selain "Acak Semua Kategori"), mayoritas hook HARUS sesuai dengan kategori tersebut. Jika "Acak", buat variasi dari berbagai macam kategori psikologis (FOMO, Curiosity, Pain Point, dll).
2.  **Variatif:** Setiap hook harus unik dan menawarkan angle yang berbeda.
3.  **Ringkas & Kuat:** Buat hook yang pendek (maksimal 1-2 kalimat) dan langsung menarik perhatian.
4.  **Improvisasi:** Jika benefit tidak ada, buat asumsi yang masuk akal berdasarkan nama produk/link.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan dua properti: "hooks" dan "explanation".
- "hooks" harus berupa array yang berisi 10 string hook.
- "explanation" harus berupa sebuah string yang berisi analisis strategi singkat (2-3 kalimat) mengapa hook-hook ini efektif.
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateHooksWithAI = async (data: HookGeneratorFormData): Promise<{ hooks: string[], explanation: string }> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateHooksWithAI.");
        return Promise.resolve({
            hooks: Array(10).fill("This is a mock hook generated because the API key is missing."),
            explanation: "This is a mock explanation. The hooks are varied to test different psychological triggers."
        });
    }

    const prompt = generateHooksPrompt(data);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["hooks", "explanation"]
        }
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating hooks from Gemini API:", error);
        throw error;
    }
};

const generateAnglesPrompt = (data: AngleGeneratorFormData): string => {
  return `
Tugas Anda adalah menghasilkan 5 sudut pandang (angle) review yang unik dan kreatif untuk sebuah produk. Setiap angle harus dilengkapi dengan contoh skrip singkat (Hook, Body, CTA).

**Detail Produk:**
*   **Produk/Link:** ${data.product}
*   **Benefit/Fitur Utama:** ${data.benefit || 'Tidak disebutkan, improvisasi.'}
*   **Target Audiens:** ${data.audience || 'Umum'}

**Aturan Wajib:**
1.  **Angle Unik:** Setiap angle harus menawarkan cara yang berbeda untuk membahas produk. Hindari angle yang terlalu umum seperti "Review Jujur" atau "Unboxing". Pikirkan lebih dalam: "Angle dari sudut pandang pemula", "Angle 'Apakah ini worth it di 2024?'", "Angle perbandingan dengan produk X", dll.
2.  **Deskripsi Jelas:** Jelaskan secara singkat mengapa angle tersebut menarik.
3.  **Contoh Konkret:** Untuk setiap angle, buat contoh skrip singkat yang terdiri dari Hook, Body, dan CTA yang relevan dengan angle tersebut.
4.  **Improvisasi:** Buat asumsi cerdas tentang produk jika informasinya terbatas.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan dua properti: "angles" dan "explanation".
- "angles" harus berupa array yang berisi 5 objek. Setiap objek harus memiliki properti: "title" (string), "description" (string), "exampleHook" (string), "exampleBody" (string), dan "exampleCta" (string).
- "explanation" harus berupa sebuah string yang berisi analisis strategi singkat (2-3 kalimat) mengapa angle-angle ini efektif.
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateReviewAngles = async (data: AngleGeneratorFormData): Promise<{ angles: ReviewAngle[], explanation: string }> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateReviewAngles.");
        return Promise.resolve({
            angles: Array(5).fill({
                title: "Mock Angle: The Skeptic's Review",
                description: "Reviewing the product from the perspective of someone who was initially doubtful.",
                exampleHook: "Jujur, awalnya aku kira produk ini cuma gimmick...",
                exampleBody: "Tapi setelah aku coba seminggu, ternyata gila banget perubahannya. Fitur [X] nya beneran kepake banget buat [masalah audiens].",
                exampleCta: "Buat yang masih ragu, liat aja keranjang kuning, jangan sampe nyesel."
            }),
            explanation: "This is a mock explanation because the API key is not set. This strategy uses various angles to appeal to different audience segments, from skeptics to practical users."
        });
    }

    const prompt = generateAnglesPrompt(data);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            angles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  exampleHook: { type: Type.STRING },
                  exampleBody: { type: Type.STRING },
                  exampleCta: { type: Type.STRING }
                },
                required: ["title", "description", "exampleHook", "exampleBody", "exampleCta"]
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["angles", "explanation"]
        }
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating review angles from Gemini API:", error);
        throw error;
    }
};

const generateHashtagsPrompt = (data: HashtagGeneratorFormData): string => {
  return `
Tugas Anda adalah menghasilkan 3-4 kategori hashtag yang strategis untuk sebuah video produk di TikTok.

**Detail Video:**
*   **Produk/Topik:** ${data.productTopic}
*   **Target Audiens:** ${data.audience || 'Umum'}

**Aturan Wajib:**
1.  **Kategori Strategis:** Buat kategori yang jelas, contoh: "Hashtag Umum (Jangkauan Luas)", "Hashtag Niche (Target Spesifik)", "Hashtag Viral/Trending", "Hashtag Brand".
2.  **Relevansi:** Semua hashtag harus sangat relevan dengan produk dan audiens.
3.  **Jumlah:** Setiap kategori harus berisi sekitar 5-10 hashtag.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan dua properti: "categories" dan "explanation".
- "categories" harus berupa array objek. Setiap objek harus memiliki "categoryName" (string) dan "hashtags" (array of strings).
- "explanation" harus berupa sebuah string yang berisi analisis strategi singkat (2-3 kalimat) mengapa kombinasi kategori hashtag ini efektif.
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateHashtags = async (data: HashtagGeneratorFormData): Promise<{ categories: HashtagCategory[], explanation: string }> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateHashtags.");
        return Promise.resolve({
            categories: [{
                categoryName: "Mock Category: General",
                hashtags: ["#fyp", "#tiktokshop", "#productreview", "#viral", `#${data.productTopic.replace(/\s+/g, '')}`]
            }],
            explanation: "This is a mock explanation. A mix of broad and niche hashtags is used for optimal reach."
        });
    }

    const prompt = generateHashtagsPrompt(data);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryName: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["categoryName", "hashtags"]
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["categories", "explanation"]
        }
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating hashtags from Gemini API:", error);
        throw error;
    }
};

export const generateVideoWithAI = async (data: VideoGeneratorFormData): Promise<string | undefined> => {
    const ai = await getAiClient();
    if (!ai) {
        console.error("API key not set. Video generation is disabled.");
        throw new Error("Video generation is disabled. API key is not set.");
    }
    
    try {
        const aspectRatioMap: { [key: string]: string } = {
          '9:16 (Vertical)': '9:16',
          '16:9 (Horizontal)': '16:9',
          '1:1 (Square)': '1:1',
          '4:3 (Classic)': '4:3',
          '3:4 (Portrait)': '3:4',
        };
        
        let operation: GenerateVideosOperation = await withRetry(() => ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `${data.prompt}, ${data.style} style`,
            ...(data.image && { image: { imageBytes: data.image.data, mimeType: data.image.mimeType } }),
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatioMap[data.aspectRatio] || '9:16'
            }
        }), 3);

        while (!operation.done) {
            await sleep(10000); 
            operation = await withRetry(() => ai.operations.getVideosOperation({ operation: operation }), 5);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        return downloadLink;
    } catch (error) {
        console.error("Error generating video from Gemini API:", error);
        throw error;
    }
};

export const fetchVideoFromUri = async (uri: string): Promise<Blob> => {
    // FIX: Switched from `import.meta.env` to `apiKeyService.getApiKey()` to centralize API key access and fix the TypeScript error.
    const apiKey = await apiKeyService.getApiKey();
    if (!apiKey) {
        throw new Error("API key not set, cannot download video.");
    }
    const response = await fetch(`${uri}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to download video file. Status: ${response.status}`);
    }
    return response.blob();
};


const generateContentPlanPrompt = (data: ContentPlannerFormData): string => {
  return `
Anda adalah seorang **Senior TikTok Content Strategist** yang sangat ahli dalam merancang kampanye produk untuk affiliate marketing.
Tugas Anda adalah membuat rencana konten (content plan) yang terstruktur dan strategis untuk beberapa hari ke depan.

**Detail Kampanye:**
*   **Nama Produk:** ${data.productName}
*   **Tujuan Kampanye:** ${data.campaignGoal}
*   **Durasi Kampanye:** ${data.campaignDuration}
*   **Target Audiens:** ${data.targetAudience}
*   **Unique Selling Proposition (USP):** ${data.usp}

**Aturan Wajib:**
1.  **Strategi Keseluruhan:** Mulai dengan memberikan "overallStrategy", sebuah paragraf singkat (2-4 kalimat) yang menjelaskan logika di balik urutan tema harian. Contoh: "Kita mulai dengan awareness untuk membangun rasa penasaran, lalu masuk ke problem-solution untuk menunjukkan nilai, dan diakhiri dengan urgensi untuk mendorong konversi cepat."
2.  **Rencana Harian (dailyPlan):** Buat rencana untuk setiap hari sesuai durasi. Setiap hari harus memiliki:
    *   \`day\`: Nomor hari (misal: 1, 2, 3).
    *   \`theme\`: Tema utama hari itu (misal: "Awareness & Unboxing", "Problem-Solution", "Social Proof", "Urgency/FOMO", "Engagement/Q&A"). Tema harus bervariasi setiap hari.
    *   \`angle\`: Sudut pandang spesifik untuk konten hari itu. Contoh: "First impression sebagai pemula", "Membuktikan klaim X dari produk", "Menjawab komentar yang paling sering ditanyakan".
    *   \`hookIdea\`: Satu ide hook yang kuat dan relevan dengan tema hari itu. Contoh: "Stop scroll! Ternyata ini rahasia...", "Aku kira produk ini bakal gagal, ternyata...".
    *   \`cta\`: Jenis Call-to-Action yang paling cocok untuk tema hari itu. Contoh: "Komen 'mau' untuk info", "Cek keranjang kuning sekarang sebelum promo habis!".
3.  **Fokus pada Audiens & USP:** Seluruh rencana, mulai dari tema hingga CTA, harus dirancang untuk beresonansi dengan **Target Audiens** dan menonjolkan **USP** produk.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan dua properti: "overallStrategy" (string) dan "dailyPlan" (array of objects).
- Setiap objek dalam "dailyPlan" harus memiliki properti: \`day\` (number), \`theme\` (string), \`angle\` (string), \`hookIdea\` (string), dan \`cta\` (string).
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateContentPlan = async (data: ContentPlannerFormData): Promise<ContentPlan> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateContentPlan.");
        return Promise.resolve({
            overallStrategy: "Ini adalah strategi mock. Rencana ini dirancang untuk membangun kesadaran terlebih dahulu, diikuti dengan edukasi tentang manfaat produk, dan diakhiri dengan CTA yang kuat untuk memaksimalkan konversi.",
            dailyPlan: [
                { day: 1, theme: "Awareness", angle: "Unboxing & First Impression", hookIdea: "Paket yang ditunggu-tunggu akhirnya datang!", cta: "Kira-kira isinya apa ya? Komen di bawah!" },
                { day: 2, theme: "Problem-Solution", angle: "Mengatasi masalah [X]", hookIdea: "Capek banget kan kalau [masalah audiens]?", cta: "Mau solusinya? Cek keranjang kuning." },
                { day: 3, theme: "Urgency", angle: "Promo Terbatas", hookIdea: "Promo 50% cuma berlaku HARI INI!", cta: "Jangan sampai nyesel, checkout sekarang!" }
            ]
        });
    }

    const prompt = generateContentPlanPrompt(data);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStrategy: { type: Type.STRING },
            dailyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  angle: { type: Type.STRING },
                  hookIdea: { type: Type.STRING },
                  cta: { type: Type.STRING }
                },
                required: ["day", "theme", "angle", "hookIdea", "cta"]
              }
            }
          },
          required: ["overallStrategy", "dailyPlan"]
        }
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating content plan from Gemini API:", error);
        throw error;
    }
};

const generateMarketResearchPrompt = (data: MarketResearchFormData): string => {
  return `
Anda adalah seorang **Analis Pasar Affiliate TikTok** yang sangat tajam dan berpengalaman.
Tugas Anda adalah melakukan riset pasar MENGGUNAKAN GOOGLE SEARCH untuk niche produk yang diberikan dan menyajikan hasilnya dalam laporan intelijen yang ringkas dan bisa langsung ditindaklanjuti.

**Niche Produk:** ${data.niche}

**Aturan Wajib:**
1.  **Gunakan Google Search:** Anda HARUS menggunakan alat pencarian untuk menemukan informasi yang paling relevan dan terkini. Jangan mengandalkan pengetahuan internal Anda saja.
2.  **Trending Products:** Identifikasi 3-5 produk spesifik yang sedang trending atau populer di niche ini saat ini. Untuk setiap produk, berikan alasan singkat mengapa produk tersebut populer (misalnya, "Viral karena review beauty vlogger X", "Banyak dicari karena fitur Y").
3.  **Audience Pain Points:** Identifikasi 3 masalah, keinginan, atau "rasa sakit" utama yang dihadapi oleh audiens di niche ini. Ini adalah amunisi untuk membuat konten yang relevan.
4.  **Popular Content Formats:** Temukan 3 format video yang paling berhasil di TikTok untuk niche ini. Contoh: "Unboxing Estetik", "Battle Produk A vs B", "Tutorial Problem-Solution", "GRWM (Get Ready With Me)".
5.  **Killer Hook Ideas:** Berikan 3 contoh ide hook yang terbukti efektif untuk menarik perhatian audiens di niche ini.

**Instruksi Format Output JSON:**
Harap berikan output dalam format JSON yang valid. Output harus berupa objek tunggal dengan properti berikut: "trendingProducts" (array of objects), "audiencePainPoints" (array of strings), "popularContentFormats" (array of strings), dan "killerHookIdeas" (array of strings).
- Setiap objek dalam "trendingProducts" harus memiliki "name" (string) dan "reason" (string).
Jangan sertakan markdown backticks ('''json ... ''') dalam output Anda.
`;
};

export const generateMarketResearch = async (data: MarketResearchFormData): Promise<MarketResearchResult> => {
    const ai = await getAiClient();
    if (!ai) {
        console.warn("API key not set. Returning mock data for generateMarketResearch.");
        return Promise.resolve({
            trendingProducts: [
                { name: "Mock Product 1 (e.g., Serum Niacinamide)", reason: "Viral di TikTok karena review dari influencer A." },
                { name: "Mock Product 2 (e.g., Sunscreen Spray)", reason: "Banyak dicari karena praktis untuk re-apply." }
            ],
            audiencePainPoints: [
                "Kulit kusam dan banyak bekas jerawat.",
                "Susah menemukan sunscreen yang tidak lengket.",
                "Ingin makeup tahan lama seharian."
            ],
            popularContentFormats: [
                "Tutorial 'Get Ready With Me (GRWM)'",
                "Battle Produk: Sunscreen A vs. Sunscreen B",
                "Video Problem-Solution ('Kalau kulitmu kusam, coba ini!')"
            ],
            killerHookIdeas: [
                "Stop scroll! Ini rahasia kulit glowing...",
                "Aku kira produk ini bakal gagal, ternyata...",
                "Cuma butuh 1 produk ini untuk mengatasi 3 masalah kulit."
            ]
        });
    }

    const prompt = generateMarketResearchPrompt(data);
    const apiCall = () => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    try {
        const response: GenerateContentResponse = await withRetry(apiCall);
        let jsonText = response.text.trim();
        
        const jsonStartIndex = jsonText.indexOf('{');
        const jsonEndIndex = jsonText.lastIndexOf('}');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
        } else if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating market research from Gemini API:", error);
        throw error;
    }
};


export const editImageWithAI = async (data: ImageStudioFormData): Promise<EditedImageOutput> => {
    const ai = await getAiClient();
    if (!ai) {
        console.error("API key not set. Image editing is disabled.");
        throw new Error("Fitur edit gambar dinonaktifkan. API key belum diatur.");
    }

    try {
        const apiCall = () => ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: data.image.data,
                            mimeType: data.image.mimeType,
                        },
                    },
                    {
                        text: data.prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const response: GenerateContentResponse = await withRetry(apiCall);
        
        const output: EditedImageOutput = { image: null, text: null };

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    output.text = part.text;
                } else if (part.inlineData) {
                    output.image = {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }
        
        if (!output.image) {
            throw new Error("AI tidak menghasilkan gambar. Coba prompt yang berbeda.");
        }

        return output;

    } catch (error) {
        console.error("Error editing image from Gemini API:", error);
        throw error;
    }
};