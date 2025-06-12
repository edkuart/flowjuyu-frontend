import localFont from "next/font/local"

export const geistSans = localFont({
  src: [
    {
      path: "../../public/fonts/Geist-Sans.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
})

export const geistMono = localFont({
  src: [
    {
      path: "../../public/fonts/Geist-Mono.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
})
