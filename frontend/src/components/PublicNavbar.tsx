import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import { ChristCrestMark } from "./BrandMarks";
import { dispatchOpenCommandPalette } from "./CommandPalette";

export const PublicNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const workspaceHref = user
    ? resolveDefaultWorkspacePath(user.permissions)
    : "/app/discover";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-rule-strong bg-void/80 px-4 py-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:px-5">
        <Link to="/" className="flex items-center gap-3">
          <ChristCrestMark className="h-8 w-8 sm:h-9 sm:w-9" tone="light" />
          <div className="leading-none">
            <span className="block font-display text-[15px] font-bold tracking-tight text-bone">
              Concourse
            </span>
            <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
              Christ Central · BLR
            </span>
          </div>
        </Link>

        {/* Desktop Editorial Nav */}
        <nav
          aria-label="Primary concourse navigation"
          className="hidden items-center gap-6 text-[13px] font-medium text-silver lg:flex"
        >
          <a href="#conclaves" className="transition hover:text-bone">
            Conclaves
          </a>
          <a href="#itinerary-planner" className="transition hover:text-bone">
            Itinerary
          </a>
          <a href="#precinct-3d" className="transition hover:text-bone">
            3D Precinct
          </a>
          <a href="#governance" className="transition hover:text-bone">
            Architecture
          </a>
          <a href="#league" className="transition hover:text-bone">
            Standings
          </a>
          <a href="#chronicle" className="transition hover:text-bone">
            Chronicle
          </a>
          <a href="#faq" className="transition hover:text-bone">
            Briefing
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={dispatchOpenCommandPalette}
            className="inline-flex items-center gap-2 rounded-full border border-rule bg-carbon/90 px-3.5 py-1.5 text-xs font-medium text-silver transition hover:border-rule-strong hover:text-bone"
          >
            <Search className="h-3.5 w-3.5 text-gold" />
            <span>Quick Find</span>
            <kbd className="rounded-full border border-rule bg-void px-2 py-0.5 font-mono text-[10px] text-ink-muted">
              Ctrl K
            </kbd>
          </button>

          {isAuthenticated ? (
            <Link
              to={workspaceHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-xs font-semibold text-void transition hover:bg-gold"
            >
              <span>Workspace</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3.5 py-2 text-xs font-medium text-bone/90 transition hover:bg-white/5 hover:text-bone"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-xs font-semibold text-void shadow-sm transition hover:bg-gold"
              >
                <span>Claim Pass</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-full border border-rule-strong p-2 text-bone sm:hidden"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Glass Dropdown */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl space-y-3 rounded-2xl border border-rule-strong bg-carbon/95 p-4 shadow-2xl backdrop-blur-2xl sm:hidden">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-silver">
            <a
              href="#conclaves"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              Conclaves
            </a>
            <a
              href="#itinerary-planner"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              Itinerary
            </a>
            <a
              href="#precinct-3d"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              3D Precinct
            </a>
            <a
              href="#governance"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              Architecture
            </a>
            <a
              href="#league"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              Standings
            </a>
            <a
              href="#chronicle"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-rule bg-void/60 px-3.5 py-2.5 hover:text-bone"
            >
              Chronicle
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            {isAuthenticated ? (
              <Link
                to={workspaceHref}
                className="w-full rounded-full bg-bone py-2.5 text-center text-xs font-semibold text-void"
              >
                Enter Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-1/2 rounded-full border border-rule-strong py-2.5 text-center text-xs font-semibold text-bone"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="w-1/2 rounded-full bg-bone py-2.5 text-center text-xs font-semibold text-void"
                >
                  Claim Pass
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
