import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  FileCheck2,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Avatar } from "../components/ui";
import { useRouter } from "../router";
import { api, clearSession, getSession } from "../api";

const managerNav = [
  ["Overview", "/manager", LayoutDashboard],
  ["Host approvals", "/manager/hosts", FileCheck2],
  ["Venue approvals", "/manager/venues", Store],
  ["Subscriptions", "/manager/subscriptions", CreditCard],
  ["Advertising", "/manager/advertising", Megaphone],
  ["Analytics", "/manager/analytics", BarChart3],
  ["Users", "/manager/users", Users],
];
const hostNav = [
  ["Overview", "/host", LayoutDashboard],
  ["My venues", "/host/venues", Store],
  ["Events", "/host/events", CalendarDays],
  ["Media library", "/host/media", Image],
  ["Performance", "/host/performance", TrendingUp],
  ["Team members", "/host/team", Users],
];

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <Zap size={20} fill="currentColor" />
      </span>
      <span>vibfy</span>
    </div>
  );
}

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { path, navigate } = useRouter();
  const session = getSession();
  const user = session?.user;
  const manager = path.startsWith("/manager");
  const nav = manager ? managerNav : hostNav;
  const switchRole = () => navigate(manager ? "/host" : "/manager");
  const canSwitchRole = session?.portalAccesses?.some(
    (access) => access.portal === (manager ? "host" : "manager"),
  );
  const logout = async () => {
    setLoggingOut(true);
    try {
      await api("/logout", { method: "POST" });
    } catch {
      // Local logout must still work if the API is temporarily unavailable.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-icon">
            {manager ? <ShieldCheck /> : <Store />}
          </span>
          <div>
            <small>Workspace</small>
            <strong>{manager ? "System manager" : "Event host"}</strong>
          </div>
          <ChevronDown size={16} />
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {nav.map(([label, target, Icon]) => (
            <a
              href={target}
              key={target}
              onClick={(event) => {
                event.preventDefault();
                navigate(target);
                setMobileOpen(false);
              }}
              className={`${path === target || (target !== "/host" && target !== "/manager" && path.startsWith(`${target}/`)) ? "active " : ""}nav-link`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Host approvals" && <em>4</em>}
            </a>
          ))}
          <p className="nav-label secondary">Account</p>
          <button>
            <Bell size={19} />
            <span>Notifications</span>
            <i />
          </button>
          <button>
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="support-card">
            <Sparkles size={20} />
            <strong>Need some help?</strong>
            <p>Talk to the Vibfy support team.</p>
            <button>Contact support</button>
          </div>
          <div className="profile-mini">
            <Avatar manager={manager} />
            <div>
              <strong>
                {user?.name || (manager ? "Vibfy Manager" : "Vibfy Host")}
              </strong>
              <small>{manager ? "Super administrator" : "Host account"}</small>
            </div>
            <button className="sidebar-logout" onClick={logout} title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button className="scrim" onClick={() => setMobileOpen(false)} />
      )}
      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <div className="global-search">
            <Search size={18} />
            <input placeholder="Search anything..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <div className="live-vibe">
              <span />
              <div>
                <small>Platform pulse</small>
                <strong>Vibes are live</strong>
              </div>
            </div>
            {canSwitchRole && (
              <button className="role-toggle" onClick={switchRole}>
                <span>{manager ? "Manager view" : "Host view"}</span>
                <ArrowUpRight size={15} />
              </button>
            )}
            <button className="icon-button">
              <Bell size={19} />
              <i />
            </button>
            <div className="account-menu-wrap">
              <button
                className="account-trigger"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <Avatar manager={manager} />
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="account-menu">
                  <div className="account-menu-user">
                    <strong>{user?.name || "Vibfy member"}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <button onClick={logout} disabled={loggingOut}>
                    <LogOut size={17} />
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content">
          <span className="ambient-orb ambient-orb-one" />
          <span className="ambient-orb ambient-orb-two" />
          <div className="content-inner">{children}</div>
        </div>
      </main>
    </div>
  );
}
