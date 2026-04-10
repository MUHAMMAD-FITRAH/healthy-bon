import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Kamu adalah Healthy Bon AI, sistem analisis gizi dari struk belanja Indonesia.

TUGAS: Analisis gambar struk belanja. Ekstrak SEMUA item makanan dan minuman.

LANGKAH:
1. Baca teks pada struk (OCR) - tangkap semua item
2. Identifikasi setiap produk makanan/minuman dari nama di struk
3. Estimasi nilai gizi berdasarkan pengetahuan tentang produk Indonesia
4. Hitung health_score per produk (0-100, dimana 100 = sangat sehat)
5. Hitung overall_score sebagai rata-rata tertimbang
6. Berikan 3-5 rekomendasi belanja berikutnya yang spesifik

PANDUAN SCORING:
- Buah & Sayur segar: 80-95
- Susu, Yogurt: 60-75
- Roti gandum, oatmeal: 65-80
- Minuman probiotik: 55-65
- Daging segar: 55-70
- Mie instan: 20-35
- Snack kemasan: 20-35
- Minuman manis/bersoda: 15-30
- Makanan ultra-processed: 15-30

BALAS HANYA JSON VALID tanpa backtick atau markdown:
{
  "store_name": "nama toko jika terlihat",
  "date": "tanggal jika terlihat",
  "ocr_raw": ["baris teks mentah per item dari struk"],
  "items": [
    {
      "raw_text": "teks asli di struk",
      "product_name": "nama produk lengkap dalam Bahasa Indonesia",
      "category": "kategori (Mie Instan/Snack/Minuman Manis/Minuman Sehat/Susu/Buah/Sayur/Daging/Bumbu/Roti/Makanan Beku/Minuman Kemasan/dll)",
      "calories": 0,
      "sugar_g": 0,
      "sodium_mg": 0,
      "fat_g": 0,
      "fiber_g": 0,
      "protein_g": 0,
      "health_score": 0
    }
  ],
  "recommendations": [
    {"icon": "emoji yang relevan", "text": "rekomendasi spesifik dan actionable", "priority": "high/medium/good"}
  ],
  "overall_score": 0,
  "summary": "ringkasan 1-2 kalimat tentang kualitas belanjaan ini"
}

Jika gambar BUKAN struk belanja, kembalikan JSON dengan items kosong dan overall_score 0.`;

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "API key belum dikonfigurasi. Set ANTHROPIC_API_KEY di environment variables." },
        { status: 500 }
      );
    }

    const { image, mediaType } = await request.json();

    if (!image) {
      return Response.json({ error: "Tidak ada gambar yang dikirim." }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: "Analisis struk belanja ini. Ekstrak semua item makanan dan minuman, berikan skor kesehatan, dan rekomendasi.",
            },
          ],
        },
      ],
    });

    const text = response.content?.find((c) => c.type === "text")?.text || "";

    let parsed;
    try {
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || !parsed.items) {
      parsed = {
        store_name: "-",
        date: "-",
        ocr_raw: ["Struk tidak terbaca"],
        items: [],
        recommendations: [
          { icon: "📸", text: "Coba foto ulang dengan pencahayaan yang lebih baik dan pastikan seluruh struk terlihat", priority: "medium" },
        ],
        overall_score: 0,
        summary: "Struk belanja tidak dapat dibaca. Pastikan gambar jelas dan tidak buram.",
      };
    }

    return Response.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error?.status === 401) {
      return Response.json({ error: "API key tidak valid." }, { status: 401 });
    }
    if (error?.status === 429) {
      return Response.json({ error: "Terlalu banyak permintaan. Coba lagi dalam beberapa detik." }, { status: 429 });
    }

    return Response.json(
      { error: "Terjadi kesalahan saat menganalisis. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
