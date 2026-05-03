import { Header } from "./Header";

/**
 * Layout — main page layout with header and content area.
 */

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): React.JSX.Element => {
  return (
    <div className="min-h-screen bg-bee-cream">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
};
