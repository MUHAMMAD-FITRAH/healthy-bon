import "./globals.css";

export const metadata = {
  title: "Healthy Bon — Pemantau Gizi Cerdas dari Struk Belanja",
  description: "Sistem AI yang mengubah struk belanja menjadi laporan kesehatan personal. Pindai struk, lihat skor kesehatan, dan pantau pola makan mingguan.",
  keywords: ["healthy bon", "gizi", "nutrisi", "struk belanja", "AI", "kesehatan", "OCR", "pemantauan gizi"],
  authors: [{ name: "Muhammad Fitrah", url: "https://github.com/muhfitrah" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Healthy Bon — Struk Belanja Berbicara",
    description: "AI yang mengubah struk belanja menjadi laporan kesehatan personal",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fdf4" },
    { media: "(prefers-color-scheme: dark)", color: "#052e16" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className="font-sans bg-forest-50 dark:bg-forest-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
