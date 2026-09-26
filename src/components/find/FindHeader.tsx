import {
  ChevronDown,
  CircleHelp,
  Search,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "../../types/auth";

interface FindHeaderProps {
  currentUser: User | null;
  showProfileMenu: boolean;
  onToggleProfileMenu: () => void;
  onLogin: () => void;
  onHowItWorks: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

export default function FindHeader({
  currentUser,
  showProfileMenu,
  onToggleProfileMenu,
  onLogin,
  onHowItWorks,
  onHelp,
  onLogout,
}: FindHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          to="/find"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Search size={18} />
          </div>

          <div className="text-lg font-black">
            Khoj
            <span className="text-blue-600">
              Market
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <HeaderIcon
            title="How It Works"
            onClick={onHowItWorks}
          >
            <WandSparkles size={19} />
          </HeaderIcon>

          <HeaderIcon
            title="Help"
            onClick={onHelp}
          >
            <CircleHelp size={19} />
          </HeaderIcon>

          {!currentUser ? (
            <button
              type="button"
              onClick={onLogin}
              className="ml-2 rounded-xl border border-slate-950 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-950 hover:text-white"
            >
              Login
            </button>
          ) : (
            <div className="relative ml-2">
              <button
                type="button"
                onClick={onToggleProfileMenu}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserRound size={17} />
                </div>

                <span className="hidden text-sm font-bold md:block">
                  {currentUser.name}
                </span>

                <ChevronDown size={14} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl border bg-white p-2 shadow-xl">
                  <Link
                    to="/profile"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderIcon({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      {children}
    </button>
  );
}
