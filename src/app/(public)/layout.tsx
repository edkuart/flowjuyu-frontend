import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <Header />
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </>
  );
}
