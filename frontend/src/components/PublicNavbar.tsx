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
    <header className="sticky top-0 z-40 border-b border-rule bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <ChristCrestMark className="h-9 w-9" tone="light" />
          <div>
            <span className="block font-display text-sm font-extrabold tracking-tight text-bone">
              CONCOURSE
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              CHRIST CENTRAL // BLR
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Primary concourse navigation"
          className="hidden items-center gap-7 font-mono text-xs uppercase tracking-wider text-silver lg:flex"
        >
          <a href="#conclaves" className="transition hover:text-bone">
            Conclaves
          </a>
          <a href="#itinerary-planner" className="transition hover:text-bone">
            Planner
          </a>
          <a href="#precinct-3d" className="transition hover:text-bone">
            3D Precinct
          </a>
          <a href="#governance" className="transition hover:text-bone">
            Governance
          </a>
          <a href="#league" className="transition hover:text-bone">
            League
          </a>
          <a href="#chronicle" className="transition hover:text-bone">
            Chronicle
          </a>
          <a href="#faq" className="transition hover:text-bone">
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <button
            type="button"
            onClick={dispatchOpenCommandPalette}
            className="inline-flex items-center gap-2 rounded-md border border-rule-strong bg-carbon px-3 py-1.5 font-mono text-[11px] text-silver transition hover:border-vermilion hover:text-bone"
          >
            <Search className="h-3.5 w-3.5 text-vermilion" />
            <span>Search</span>
            <kbd className="rounded border border-rule px-1.5 py-0.5 text-[10px] text-ink-muted">
              Ctrl K
            </kbd>
          </button>

          {isAuthenticated ? (
            <Link
              to={workspaceHref}
              className="inline-flex items-center gap-1.5 rounded-md bg-vermilion px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
            >
              <span>Enter Workspace</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md border border-rule-strong px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition hover:border-bone"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-md bg-vermilion px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
              >
                <span>Get Pass</span>
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
          className="rounded-md border border-rule-strong p-2 text-bone sm:hidden"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="space-y-3 border-t border-rule bg-carbon px-4 py-4 sm:hidden">
          <div className="grid grid-cols-2 gap-2 font-mono text-xs uppercase text-silver">
            <a
              href="#conclaves"
              onClick={() => setMobileOpen(false)}
              className="rounded border border-rule px-3 py-2 hover:text-bone"
            >
              Conclaves
            </a>
            <a
              href="#precinct-3d"
              onClick={() => setMobileOpen(false)}
              className="rounded border border-rule px-3 py-2 hover:text-bone"
            >
              3D Precinct
            </a>
            <a
              href="#governance"
              onClick={() => setMobileOpen(false)}
              className="rounded border border-rule px-3 py-2 hover:text-bone"
            >
              Governance
            </a>
            <a
              href="#chronicle"
              onClick={() => setMobileOpen(false)}
              className="rounded border border-rule px-3 py-2 hover:text-bone"
            >
              Chronicle
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            {isAuthenticated ? (
              <Link
                to={workspaceHref}
                className="w-full rounded-md bg-vermilion py-2.5 text-center font-mono text-xs font-bold uppercase text-void"
              >
                Enter Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-1/2 rounded-md border border-rule-strong py-2.5 text-center font-mono text-xs font-semibold uppercase text-bone"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="w-1/2 rounded-md bg-vermilion py-2.5 text-center font-mono text-xs font-bold uppercase text-void"
                >
                  Get Pass
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
