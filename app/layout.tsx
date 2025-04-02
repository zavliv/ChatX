import { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { UserProvider } from "@/context/UserContext";

import "./globals.css";

const inter = Montserrat({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chaton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
