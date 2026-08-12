import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { api, saveSession } from "../api";
import { useRouter } from "../router";

export default function LoginPage() {
  const { navigate } = useRouter();
  const [role, setRole] = useState("host");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api("/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          portal: role,
          device_name: "vibfy-web",
        }),
      });
      saveSession({
        token: result.token,
        user: result.user,
        portalAccesses: result.portal_accesses,
      });
      navigate(`/${role}`, { replace: true });
    } catch (problem) {
      setError(
        problem.status === 422
          ? "That email or password isn't correct. Please check your details and try again."
          : problem.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-story">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="public-brand"
        >
          <span>
            <Zap size={20} fill="currentColor" />
          </span>
          vibfy
        </a>
        <div>
          <span className="auth-quote-mark">“</span>
          <blockquote>
            Vibfy gives us a clear view of every event, every guest and every
            opportunity to grow.
          </blockquote>
          <p>
            <strong>Amara N.</strong>
            <br />
            Host, Nairobi
          </p>
        </div>
        <small>Made for Africa's best experiences.</small>
      </aside>
      <main className="auth-main">
        <button className="back-link" onClick={() => navigate("/")}>
          <ArrowLeft /> Back to home
        </button>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-heading">
            <span>WELCOME BACK</span>
            <h1>Log in to your portal</h1>
            <p>Use your Vibfy member account and choose your workspace.</p>
          </div>
          <div className="role-selector">
            <button
              type="button"
              className={role === "host" ? "active" : ""}
              onClick={() => setRole("host")}
            >
              <Store />
              <span>
                <strong>Host</strong>
                <small>Manage venues & events</small>
              </span>
            </button>
            <button
              type="button"
              className={role === "manager" ? "active" : ""}
              onClick={() => setRole("manager")}
            >
              <ShieldCheck />
              <span>
                <strong>Manager</strong>
                <small>Manage the platform</small>
              </span>
            </button>
          </div>
          <label>
            Email address
            <input
              name="email"
              required
              type="email"
              placeholder={
                role === "host" ? "host@vibfy.com" : "manager@vibfy.com"
              }
            />
          </label>
          <label>
            Password
            <div className="password-input">
              <input
                name="password"
                required
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                minLength="6"
              />
              <button
                type="button"
                aria-label="Show password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-meta">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <button type="button">Forgot password?</button>
          </div>
          <button className="auth-submit" disabled={loading}>
            {loading ? (
              "Opening portal…"
            ) : (
              <>
                Log in as {role} <ArrowRight />
              </>
            )}
          </button>
          <p className="auth-switch">
            New to Vibfy?{" "}
            <button type="button" onClick={() => navigate("/signup")}>
              Create a host account
            </button>
          </p>
          <div className="secure-note">
            <LockKeyhole /> Your connection is encrypted and secure
          </div>
        </form>
      </main>
    </div>
  );
}
