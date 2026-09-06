import {
    ArrowLeft,
    Coins,
    FileCheck2,
    LayoutDashboard,
    MessageCircle,
    ShieldCheck,
    Store,
    Users,
  } from "lucide-react";
  
  import type {
    ReactNode,
  } from "react";
  
  import {
    Link,
  } from "react-router-dom";
  
  export type AdminSection =
    | "dashboard"
    | "users"
    | "requirements"
    | "sellers"
    | "inquiries"
    | "credits";
  
  interface Props {
    activeSection:
      AdminSection;
  
    onChange: (
      section: AdminSection
    ) => void;
  
    children: ReactNode;
  }
  
  export default function AdminLayout({
    activeSection,
    onChange,
    children,
  }: Props) {
    const menuItems: {
      id: AdminSection;
      label: string;
      icon: ReactNode;
    }[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <LayoutDashboard
            size={18}
          />
        ),
      },
  
      {
        id: "users",
        label: "Users",
        icon: (
          <Users size={18} />
        ),
      },
  
      {
        id: "requirements",
        label:
          "Buyer Requirements",
        icon: (
          <FileCheck2
            size={18}
          />
        ),
      },
  
      {
        id: "sellers",
        label:
          "Seller Verification",
        icon: (
          <ShieldCheck
            size={18}
          />
        ),
      },
  
      {
        id: "inquiries",
        label: "Inquiries",
        icon: (
          <MessageCircle
            size={18}
          />
        ),
      },
  
      {
        id: "credits",
        label: "Credits",
        icon: (
          <Coins size={18} />
        ),
      },
    ];
  
    return (
      <div className="min-h-screen bg-slate-50">
        {/* MOBILE HEADER */}
  
        <header className="border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">
                Khoj
                <span className="text-blue-600">
                  Market
                </span>
              </p>
  
              <p className="text-xs text-slate-400">
                Admin Panel
              </p>
            </div>
  
            <Link
              to="/"
              className="rounded-xl border border-slate-200 p-2.5"
            >
              <ArrowLeft
                size={18}
              />
            </Link>
          </div>
  
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {menuItems.map(
              (item) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    onChange(
                      item.id
                    )
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    activeSection ===
                    item.id
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {item.icon}
  
                  {item.label}
                </button>
              )
            )}
          </div>
        </header>
  
        <div className="flex">
          {/* DESKTOP SIDEBAR */}
  
          <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 p-6 text-white lg:flex">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <Store size={21} />
              </div>
  
              <h1 className="mt-5 text-xl font-black">
                KhojMarket
              </h1>
  
              <p className="mt-1 text-sm text-slate-400">
                Admin Panel
              </p>
            </div>
  
            <nav className="mt-10 space-y-2">
              {menuItems.map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      onChange(
                        item.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activeSection ===
                      item.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.icon}
  
                    {item.label}
                  </button>
                )
              )}
            </nav>
  
            <div className="mt-auto">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                <ArrowLeft
                  size={18}
                />
  
                Back to Marketplace
              </Link>
            </div>
          </aside>
  
          {/* CONTENT */}
  
          <main className="w-full lg:ml-72">
            {children}
          </main>
        </div>
      </div>
    );
  }