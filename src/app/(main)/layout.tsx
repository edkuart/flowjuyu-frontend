import { AppSidebar } from "@/components/ui/sidebar/AppSidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 bg-white shadow md:px-6 px-3 py-2">
          <Header />
        </header>

        <main className="flex-1 px-3 md:px-6 py-4 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}