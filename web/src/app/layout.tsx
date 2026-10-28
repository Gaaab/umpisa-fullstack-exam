import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppApolloProvider } from "@/lib/apollo-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Taskboard", template: "%s · Taskboard" },
  description: "Team task board",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppApolloProvider>{children}</AppApolloProvider>
      </body>
    </html>
  );
}
