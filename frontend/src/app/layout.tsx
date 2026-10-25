import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fruti Delicias | Fruta fresca + chocolate real",
    template: "%s | Fruti Delicias",
  },
  description:
    "Frescura por fuera, chocolate por todas partes. Bowls, brochetas y antojos hechos al momento con fruta natural y chocolate artesanal. Pide por WhatsApp o recoge en el local.",
  keywords: [
    "fruta fresca",
    "chocolate artesanal",
    "bowls de fruta",
    "brochetas de fruta",
    "antojos",
    "Fruti Delicias",
  ],
  openGraph: {
    title: "Fruti Delicias | Fruta fresca + chocolate real",
    description:
      "Fresca, crocante e irresistible. Tu pausa dulce del día acaba de ponerse crujiente.",
    type: "website",
    locale: "es_CO",
    siteName: "Fruti Delicias",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fruti Delicias | Fruta fresca + chocolate real",
    description:
      "Fresca, crocante e irresistible. Tu pausa dulce del día acaba de ponerse crujiente.",
  },
};

export const viewport: Viewport = {
  themeColor: "#730D0D",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-chocolate font-sans text-cream">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
