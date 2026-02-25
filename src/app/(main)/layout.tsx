import { AppSidebar } from "@/components/ui/sidebar/AppSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-3 md:px-6 py-4 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}