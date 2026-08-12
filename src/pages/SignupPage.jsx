import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  PartyPopper,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { api, saveSession } from "../api";
import { useRouter } from "../router";

export default function SignupPage() {
  const { navigate } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api("/host/register", {
        method: "POST",
        body: JSON.stringify({
          name: `${form.get("first_name")} ${form.get("last_name")}`,
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      saveSession({
        token: result.token,
        user: result.user,
        portalAccesses: result.portal_accesses,
      });
      setDone(true);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="auth-page signup">
        <aside className="auth-story signup-story">
          <a className="public-brand" href="/">
            <span>
              <Zap size={20} fill="currentColor" />
            </span>
            vibfy
          </a>
        </aside>
        <main className="auth-main">
          <div className="success-card">
            <span>
              <PartyPopper />
            </span>
            <small>YOU'RE IN</small>
            <h1>Welcome to Vibfy.</h1>
            <p>Your Vibfy membership and host workspace are ready.</p>
            <button className="auth-submit" onClick={() => navigate("/host")}>
              Go to host portal <ArrowRight />
            </button>
          </div>
        </main>
      </div>
    );

  return (
    <div className="auth-page signup">
      <aside className="auth-story signup-story">
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
          <span className="mini-eyebrow">BUILT FOR AMBITIOUS HOSTS</span>
          <h2>
            Bring people together.
            <br />
            We'll handle the rest.
          </h2>
          <ul>
            <li>
              <Check /> Publish events in minutes
            </li>
            <li>
              <Check /> Reach thousands of local explorers
            </li>
            <li>
              <Check /> Track bookings and performance
            </li>
            <li>
              <Check /> Get support from a local team
            </li>
          </ul>
        </div>
        <small>No setup fees · Cancel anytime</small>
      </aside>
      <main className="auth-main signup-main">
        <button className="back-link" onClick={() => navigate("/")}>
          <ArrowLeft /> Back to home
        </button>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-heading">
            <span>HOST APPLICATION</span>
            <h1>Create your account</h1>
            <p>This creates your Vibfy member identity and host workspace.</p>
          </div>
          <div className="auth-grid">
            <label>
              First name
              <input name="first_name" required placeholder="Jane" />
            </label>
            <label>
              Last name
              <input name="last_name" required placeholder="Wanjiku" />
            </label>
          </div>
          <label>
            Business or venue name
            <input
              name="business"
              required
              placeholder="e.g. The Garden House"
            />
          </label>
          <label>
            Work email
            <input
              name="email"
              required
              type="email"
              placeholder="jane@yourvenue.com"
            />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              required
              type="tel"
              placeholder="+254 700 000 000"
            />
          </label>
          <label>
            Create password
            <div className="password-input">
              <input
                name="password"
                required
                minLength="8"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
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
          <label className="terms">
            <input required type="checkbox" />{" "}
            <span>
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </span>
          </label>
          <button className="auth-submit" disabled={loading}>
            {loading ? (
              "Creating account…"
            ) : (
              <>
                Create host account <ArrowRight />
              </>
            )}
          </button>
          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")}>
              Log in
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
