import './globals.css'
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'Darwin Orchestrator',
  description: 'Browser agent dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("dark", figtree.variable)}>
      <body>{children}</body>
    </html>
  )
}
