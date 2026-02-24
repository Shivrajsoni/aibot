import { ThemeProvider } from "@/components/theme/theme-provider";
import { Layout } from "@/components/layout/layout";
import { Toaster } from "@/components/ui/toaster";
import { SearchPage } from "@/components/search/search-page";

function ScanlineEffect() {
  return (
    <div className="scanline pointer-events-none fixed inset-0 z-[9999]" />
  );
}

export default function Home() {
  return(
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ScanlineEffect />
      <Layout>
        <SearchPage />
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}
