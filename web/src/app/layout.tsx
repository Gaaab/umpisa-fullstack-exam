import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppApolloProvider } from "@/lib/apollo-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taskboard",
  description: "Team task board",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppApolloProvider>{children}</AppApolloProvider>
      </body>
    </html>
  );
}
