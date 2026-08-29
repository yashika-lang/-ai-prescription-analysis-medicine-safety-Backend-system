import AppHeader from "./AppHeader";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8 sm:py-14">{children}</main>
      <Footer />
    </div>
  );
}
