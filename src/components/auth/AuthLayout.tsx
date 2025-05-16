import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Decorative background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-salon-50 via-background to-salon-100" />
        <div className="absolute inset-0 bg-grid-salon-200 opacity-20" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-playfair font-semibold text-salon-800 mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}