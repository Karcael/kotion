// Page templates with Tiptap JSON content

export type TemplateCategory = "is" | "kisisel" | "planlama" | "egitim" | "yaratici"

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: TemplateCategory
  content: object
}

export const categoryLabels: Record<TemplateCategory, string> = {
  is: "İş",
  kisisel: "Kişisel",
  planlama: "Planlama",
  egitim: "Eğitim",
  yaratici: "Yaratıcı",
}

// --- Helpers ---
// Note: ProseMirror rejects empty text nodes ({"type":"text","text":""}),
// so `p("")` must produce an empty paragraph without a content array.

const text = (t: string, marks?: { type: string }[]): object =>
  marks ? { type: "text", text: t, marks } : { type: "text", text: t }

const p = (...content: (string | object)[]): object => {
  const nodes = content
    .map((c) => (typeof c === "string" ? (c ? text(c) : null) : c))
    .filter((n): n is object => n !== null)
  return nodes.length > 0
    ? { type: "paragraph", content: nodes }
    : { type: "paragraph" }
}

const emptyP = (): object => ({ type: "paragraph" })

const h = (level: number, t: string): object => ({
  type: "heading",
  attrs: { level },
  content: [text(t)],
})

const bullet = (...items: string[]): object => ({
  type: "bulletList",
  content: items.map((item) => ({
    type: "listItem",
    content: [p(item)],
  })),
})

const ordered = (...items: string[]): object => ({
  type: "orderedList",
  attrs: { start: 1 },
  content: items.map((item) => ({
    type: "listItem",
    content: [p(item)],
  })),
})

const tasks = (...items: string[]): object => ({
  type: "taskList",
  content: items.map((item) => ({
    type: "taskItem",
    attrs: { checked: false },
    content: [p(item)],
  })),
})

const hr = (): object => ({ type: "horizontalRule" })

const quote = (t: string): object => ({
  type: "blockquote",
  content: [p(t)],
})

const tableRow = (cells: string[], header = false): object => ({
  type: "tableRow",
  content: cells.map((cell) => ({
    type: header ? "tableHeader" : "tableCell",
    content: [p(cell)],
  })),
})

const table = (headers: string[], ...rows: string[][]): object => ({
  type: "table",
  content: [tableRow(headers, true), ...rows.map((r) => tableRow(r))],
})

const columns = (count: number, ...cols: object[][]): object => ({
  type: "columns",
  attrs: { count },
  content: cols.map((col) => ({
    type: "column",
    content: col,
  })),
})

const doc = (...nodes: object[]): object => ({
  type: "doc",
  content: nodes,
})

// --- Templates ---

export const templates: Template[] = [
  // ═══ İŞ ═══
  {
    id: "meeting-notes",
    name: "Toplantı Notları",
    description: "Gündem, katılımcılar ve aksiyon maddeleri.",
    icon: "📋",
    category: "is",
    content: doc(
      h(2, "Toplantı Bilgileri"),
      bullet("Tarih: ", "Katılımcılar: ", "Süre: "),
      hr(),
      h(2, "Gündem"),
      ordered("Birinci madde", "İkinci madde", "Üçüncü madde"),
      hr(),
      h(2, "Notlar"),
      emptyP(),
      hr(),
      h(2, "Aksiyon Maddeleri"),
      tasks("Görev 1, Sorumlu: ", "Görev 2, Sorumlu: ", "Görev 3, Sorumlu: "),
    ),
  },
  {
    id: "project-plan",
    name: "Proje Planı",
    description: "Hedefler, zaman çizelgesi ve görev takibi.",
    icon: "🎯",
    category: "is",
    content: doc(
      h(2, "Proje Özeti"),
      p("Projenin kısa bir açıklamasını buraya yazın..."),
      h(2, "Hedefler"),
      bullet("Hedef 1", "Hedef 2", "Hedef 3"),
      h(2, "Zaman Çizelgesi"),
      table(
        ["Aşama", "Başlangıç", "Bitiş", "Durum"],
        ["Planlama", "", "", "Devam ediyor"],
        ["Geliştirme", "", "", "Beklemede"],
        ["Test", "", "", "Beklemede"],
        ["Yayınlama", "", "", "Beklemede"],
      ),
      h(2, "Görevler"),
      tasks("Görev 1", "Görev 2", "Görev 3"),
      h(2, "Riskler ve Çözümler"),
      emptyP(),
    ),
  },
  {
    id: "weekly-report",
    name: "Haftalık Rapor",
    description: "Tamamlananlar, devam edenler ve gelecek plan.",
    icon: "📊",
    category: "is",
    content: doc(
      h(2, "Bu Hafta Tamamlananlar"),
      tasks("Tamamlanan iş 1", "Tamamlanan iş 2"),
      h(2, "Devam Eden İşler"),
      tasks("Devam eden iş 1", "Devam eden iş 2"),
      h(2, "Engeller / Sorunlar"),
      emptyP(),
      h(2, "Gelecek Hafta Planı"),
      bullet("Plan maddesi 1", "Plan maddesi 2"),
    ),
  },
  {
    id: "retrospective",
    name: "Retrospektif",
    description: "Neler iyi gitti, neler geliştirilebilir.",
    icon: "🔄",
    category: "is",
    content: doc(
      h(2, "Ne İyi Gitti?"),
      bullet("Olumlu nokta 1", "Olumlu nokta 2"),
      h(2, "Ne Geliştirilebilir?"),
      bullet("Geliştirme alanı 1", "Geliştirme alanı 2"),
      h(2, "Denemeler / Yeni Fikirler"),
      bullet("Yeni fikir 1", "Yeni fikir 2"),
      h(2, "Aksiyon Maddeleri"),
      tasks("Aksiyon 1", "Aksiyon 2"),
    ),
  },
  {
    id: "product-requirements",
    name: "Ürün Gereksinimleri",
    description: "Problem, çözüm ve gereksinimler.",
    icon: "📝",
    category: "is",
    content: doc(
      h(2, "Özet"),
      p("Ürün gereksinimlerinin kısa bir özeti..."),
      h(2, "Problem Tanımı"),
      emptyP(),
      h(2, "Hedef Kitle"),
      emptyP(),
      h(2, "Çözüm Önerisi"),
      emptyP(),
      h(2, "Gereksinimler"),
      table(
        ["Gereksinim", "Öncelik", "Durum"],
        ["Gereksinim 1", "Yüksek", "Beklemede"],
        ["Gereksinim 2", "Orta", "Beklemede"],
        ["Gereksinim 3", "Düşük", "Beklemede"],
      ),
      h(2, "Başarı Kriterleri"),
      bullet("Kriter 1", "Kriter 2"),
    ),
  },

  // ═══ KİŞİSEL ═══
  {
    id: "daily-journal",
    name: "Günlük",
    description: "Günlük yansımalar, minnettarlık ve notlar.",
    icon: "📔",
    category: "kisisel",
    content: doc(
      h(2, "Bugün Nasıl Hissediyorum?"),
      emptyP(),
      h(2, "Minnettarlıklar"),
      bullet("Minnettarlık 1", "Minnettarlık 2", "Minnettarlık 3"),
      h(2, "Bugünün Notları"),
      emptyP(),
      h(2, "Yarın İçin"),
      tasks("Yapılacak 1", "Yapılacak 2"),
    ),
  },
  {
    id: "goals",
    name: "Hedefler",
    description: "Kısa ve uzun vadeli hedefler, aksiyon planı.",
    icon: "🏆",
    category: "kisisel",
    content: doc(
      h(2, "Kısa Vadeli Hedefler"),
      tasks("Hedef 1", "Hedef 2", "Hedef 3"),
      h(2, "Uzun Vadeli Hedefler"),
      tasks("Hedef 1", "Hedef 2"),
      h(2, "Aksiyon Planı"),
      table(
        ["Hedef", "Adım", "Teslim Tarihi"],
        ["", "İlk adım", ""],
        ["", "İlk adım", ""],
      ),
    ),
  },
  {
    id: "habit-tracker",
    name: "Alışkanlık Takibi",
    description: "Haftalık alışkanlık izleme tablosu.",
    icon: "✅",
    category: "kisisel",
    content: doc(
      h(2, "Alışkanlık Takibi"),
      table(
        ["Alışkanlık", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        ["Egzersiz", "", "", "", "", "", "", ""],
        ["Kitap okuma", "", "", "", "", "", "", ""],
        ["Su içme", "", "", "", "", "", "", ""],
        ["Meditasyon", "", "", "", "", "", "", ""],
      ),
      h(2, "Notlar"),
      emptyP(),
    ),
  },
  {
    id: "reading-list",
    name: "Okuma Listesi",
    description: "Okuduklarım, okuyacaklarım ve notlar.",
    icon: "📚",
    category: "kisisel",
    content: doc(
      h(2, "Şu An Okuduklarım"),
      tasks("Kitap adı, Yazar"),
      h(2, "Okuyacaklarım"),
      tasks("Kitap adı, Yazar", "Kitap adı, Yazar", "Kitap adı, Yazar"),
      h(2, "Okuduklarım"),
      table(
        ["Kitap", "Yazar", "Puan", "Notlar"],
        ["", "", "", ""],
        ["", "", "", ""],
      ),
    ),
  },

  // ═══ PLANLAMA ═══
  {
    id: "todo-list",
    name: "Yapılacaklar Listesi",
    description: "Öncelikli görevler ve takip listesi.",
    icon: "✏️",
    category: "planlama",
    content: doc(
      h(2, "Öncelikli"),
      tasks("Görev 1", "Görev 2"),
      h(2, "Normal"),
      tasks("Görev 1", "Görev 2", "Görev 3"),
      h(2, "Düşük Öncelik"),
      tasks("Görev 1"),
    ),
  },
  {
    id: "weekly-planner",
    name: "Haftalık Planlayıcı",
    description: "Günlere ayrılmış haftalık program.",
    icon: "📅",
    category: "planlama",
    content: doc(
      h(2, "Haftalık Plan"),
      table(
        ["Gün", "Sabah", "Öğle", "Akşam"],
        ["Pazartesi", "", "", ""],
        ["Salı", "", "", ""],
        ["Çarşamba", "", "", ""],
        ["Perşembe", "", "", ""],
        ["Cuma", "", "", ""],
        ["Cumartesi", "", "", ""],
        ["Pazar", "", "", ""],
      ),
      h(2, "Haftanın Notları"),
      emptyP(),
    ),
  },
  {
    id: "travel-plan",
    name: "Seyahat Planı",
    description: "Gezi programı, bavul listesi ve bütçe.",
    icon: "✈️",
    category: "planlama",
    content: doc(
      h(2, "Genel Bilgiler"),
      bullet("Hedef: ", "Tarihler: ", "Ulaşım: ", "Konaklama: "),
      h(2, "Gün Gün Program"),
      ordered("1. Gün: Varış ve yerleşme", "2. Gün: Gezi planı", "3. Gün: Serbest zaman"),
      h(2, "Bavul Listesi"),
      tasks("Pasaport / Kimlik", "Şarj aleti", "İlaçlar", "Kıyafetler"),
      h(2, "Bütçe"),
      table(
        ["Kalem", "Tahmini", "Gerçek"],
        ["Ulaşım", "", ""],
        ["Konaklama", "", ""],
        ["Yeme-içme", "", ""],
        ["Aktiviteler", "", ""],
        ["Toplam", "", ""],
      ),
    ),
  },
  {
    id: "budget",
    name: "Bütçe Planı",
    description: "Gelir, gider ve tasarruf takibi.",
    icon: "💰",
    category: "planlama",
    content: doc(
      h(2, "Gelirler"),
      table(
        ["Kaynak", "Tutar"],
        ["Maaş", ""],
        ["Diğer", ""],
      ),
      h(2, "Giderler"),
      table(
        ["Kategori", "Tahmini", "Gerçek"],
        ["Kira", "", ""],
        ["Faturalar", "", ""],
        ["Market", "", ""],
        ["Ulaşım", "", ""],
        ["Eğlence", "", ""],
        ["Diğer", "", ""],
      ),
      h(2, "Tasarruf Hedefleri"),
      tasks("Hedef 1, Tutar: ", "Hedef 2, Tutar: "),
    ),
  },
  {
    id: "event-planning",
    name: "Etkinlik Planı",
    description: "Etkinlik detayları, yapılacaklar ve davetliler.",
    icon: "🎉",
    category: "planlama",
    content: doc(
      h(2, "Etkinlik Detayları"),
      bullet("Etkinlik: ", "Tarih: ", "Yer: ", "Bütçe: "),
      h(2, "Yapılacaklar"),
      tasks("Mekan ayarlama", "Davetiye gönderme", "Menü planlama"),
      h(2, "Davetli Listesi"),
      table(
        ["İsim", "İletişim", "Katılım"],
        ["Davetli 1", "", "Beklemede"],
        ["Davetli 2", "", "Beklemede"],
        ["Davetli 3", "", "Beklemede"],
      ),
      h(2, "Notlar"),
      emptyP(),
    ),
  },

  // ═══ EĞİTİM ═══
  {
    id: "study-notes",
    name: "Ders Notları",
    description: "Anahtar kavramlar, notlar ve sorular.",
    icon: "📖",
    category: "egitim",
    content: doc(
      h(2, "Ders Bilgileri"),
      bullet("Ders: ", "Konu: ", "Tarih: "),
      hr(),
      h(2, "Anahtar Kavramlar"),
      bullet("Kavram 1", "Kavram 2", "Kavram 3"),
      h(2, "Notlar"),
      emptyP(),
      h(2, "Sorular"),
      bullet("Soru 1", "Soru 2"),
      h(2, "Özet"),
      emptyP(),
    ),
  },
  {
    id: "research-notes",
    name: "Araştırma Notları",
    description: "Araştırma sorusu, kaynaklar ve bulgular.",
    icon: "🔍",
    category: "egitim",
    content: doc(
      h(2, "Araştırma Sorusu"),
      emptyP(),
      h(2, "Kaynaklar"),
      bullet("Kaynak 1", "Kaynak 2"),
      h(2, "Bulgular"),
      emptyP(),
      h(2, "Analiz"),
      emptyP(),
      h(2, "Sonuç"),
      emptyP(),
    ),
  },
  {
    id: "cornell-notes",
    name: "Cornell Notları",
    description: "İki sütunlu akademik not sistemi.",
    icon: "🎓",
    category: "egitim",
    content: doc(
      h(2, "Konu"),
      emptyP(),
      hr(),
      columns(
        2,
        [h(3, "Anahtar Noktalar"), bullet("Soru / ipucu 1", "Soru / ipucu 2", "Soru / ipucu 3")],
        [h(3, "Notlar"), emptyP(), emptyP(), emptyP()],
      ),
      hr(),
      h(2, "Özet"),
      emptyP(),
    ),
  },

  // ═══ YARATICI ═══
  {
    id: "blog-post",
    name: "Blog Yazısı",
    description: "Giriş, gelişme, sonuç yapısı.",
    icon: "✍️",
    category: "yaratici",
    content: doc(
      h(2, "Giriş"),
      p("Okuyucunun dikkatini çekecek bir giriş paragrafı..."),
      h(2, "Ana Bölüm"),
      emptyP(),
      h(3, "Alt Başlık 1"),
      emptyP(),
      h(3, "Alt Başlık 2"),
      emptyP(),
      h(2, "Sonuç"),
      emptyP(),
      hr(),
      quote("Yazınızdan akılda kalmasını istediğiniz en önemli mesaj."),
    ),
  },
  {
    id: "brainstorm",
    name: "Beyin Fırtınası",
    description: "Fikirler, değerlendirme ve seçim.",
    icon: "💡",
    category: "yaratici",
    content: doc(
      h(2, "Konu / Problem"),
      emptyP(),
      h(2, "Fikirler"),
      bullet("Fikir 1", "Fikir 2", "Fikir 3", "Fikir 4", "Fikir 5"),
      h(2, "Değerlendirme"),
      table(
        ["Fikir", "Artıları", "Eksileri", "Puan"],
        ["Fikir 1", "", "", ""],
        ["Fikir 2", "", "", ""],
        ["Fikir 3", "", "", ""],
      ),
      h(2, "Sonuç / Karar"),
      emptyP(),
    ),
  },
  {
    id: "swot-analysis",
    name: "SWOT Analizi",
    description: "Güçlü ve zayıf yönler, fırsatlar ve tehditler.",
    icon: "📈",
    category: "yaratici",
    content: doc(
      h(2, "Konu"),
      emptyP(),
      hr(),
      columns(
        2,
        [h(3, "Güçlü Yönler"), bullet("Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3")],
        [h(3, "Zayıf Yönler"), bullet("Zayıf yön 1", "Zayıf yön 2", "Zayıf yön 3")],
      ),
      columns(
        2,
        [h(3, "Fırsatlar"), bullet("Fırsat 1", "Fırsat 2", "Fırsat 3")],
        [h(3, "Tehditler"), bullet("Tehdit 1", "Tehdit 2", "Tehdit 3")],
      ),
      hr(),
      h(2, "Değerlendirme"),
      emptyP(),
    ),
  },
]
