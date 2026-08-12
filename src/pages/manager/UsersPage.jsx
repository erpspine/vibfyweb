import {
  Check,
  ChevronDown,
  Clock3,
  Crown,
  Eye,
  Mail,
  MoreVertical,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../api";

const starterUsers = [
  {
    id: 1,
    name: "Duncan Osur",
    email: "duncan@vibfy.com",
    initials: "DO",
    role: "Super Admin",
    status: "Active",
    color: "purple",
  },
  {
    id: 2,
    name: "Lydia Mumbi",
    email: "lydia@vibfy.com",
    initials: "LM",
    role: "Admin",
    status: "Active",
    color: "green",
  },
  {
    id: 3,
    name: "Kevin Maina",
    email: "kevin@vibfy.com",
    initials: "KM",
    role: "Viewer",
    status: "Active",
    color: "cyan",
  },
  {
    id: 4,
    name: "Faith Achieng",
    email: "faith@vibfy.com",
    initials: "FA",
    role: "Admin",
    status: "Pending",
    color: "amber",
  },
];

const access = {
  Admin: [
    "Manage hosts and approvals",
    "Manage plans and advertising",
    "View platform analytics",
    "Invite and manage portal users",
  ],
  Viewer: [
    "View hosts and applications",
    "View subscriptions and adverts",
    "View platform analytics",
    "Cannot create or edit records",
  ],
};

export default function UsersPage() {
  const [users, setUsers] = useState(starterUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [sent, setSent] = useState(false);
  const [menu, setMenu] = useState(null);

  const close = () => {
    setInviteOpen(false);
    setEmail("");
    setRole("Admin");
    setSent(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await api("/portals/manager/invitations", {
        method: "POST",
        body: JSON.stringify({ email, role: "admin" }),
      });
      const name = email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
      const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      setUsers((current) => [
        ...current,
        {
          id: result.invitation.id,
          name,
          email,
          initials,
          role: "Admin",
          status: "Pending",
          color: "pink",
        },
      ]);
      setSent(true);
    } catch (problem) {
      window.alert(problem.message);
    }
  };
  const changeRole = (id, nextRole) =>
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, role: nextRole } : user,
      ),
    );
  const removeUser = (id) => {
    setUsers((current) => current.filter((user) => user.id !== id));
    setMenu(null);
  };

  return (
    <>
      <div className="page-heading team-heading">
        <div>
          <span className="badge purple">
            <ShieldCheck size={12} /> PORTAL ACCESS
          </span>
          <h1>Users</h1>
          <p>Invite Vibfy members and control access to the Manager portal.</p>
        </div>
        <button className="primary-button" onClick={() => setInviteOpen(true)}>
          <UserPlus /> Invite user
        </button>
      </div>

      <div className="team-summary">
        <div>
          <span className="team-summary-icon purple">
            <Users />
          </span>
          <div>
            <small>Total users</small>
            <strong>{users.length}</strong>
          </div>
        </div>
        <div>
          <span className="team-summary-icon green">
            <ShieldCheck />
          </span>
          <div>
            <small>Administrators</small>
            <strong>
              {users.filter((user) => user.role.includes("Admin")).length}
            </strong>
          </div>
        </div>
        <div>
          <span className="team-summary-icon amber">
            <Clock3 />
          </span>
          <div>
            <small>Pending invites</small>
            <strong>
              {users.filter((user) => user.status === "Pending").length}
            </strong>
          </div>
        </div>
      </div>

      <section className="panel members-panel">
        <div className="section-header">
          <div>
            <h2>Manager portal users</h2>
            <p>People who can access Vibfy platform management.</p>
          </div>
        </div>
        <div className="members-list">
          <div className="member-row member-head">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Access</span>
            <span />
          </div>
          {users.map((user) => (
            <div className="member-row" key={user.id}>
              <div className="member-person">
                <span className={`member-avatar ${user.color}`}>
                  {user.initials}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <div>
                {user.role === "Super Admin" ? (
                  <span className="owner-role">
                    <Crown /> Super Admin
                  </span>
                ) : (
                  <div className="inline-select">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        changeRole(user.id, event.target.value)
                      }
                    >
                      <option>Admin</option>
                      <option>Viewer</option>
                    </select>
                    <ChevronDown />
                  </div>
                )}
              </div>
              <div>
                <span className={`member-status ${user.status.toLowerCase()}`}>
                  {user.status === "Active" ? <Check /> : <Clock3 />}
                  {user.status}
                </span>
              </div>
              <span className="access-copy">
                {user.role === "Super Admin"
                  ? "Full access"
                  : user.role === "Admin"
                    ? "Can manage"
                    : "View only"}
              </span>
              <div className="member-actions">
                {user.role !== "Super Admin" && (
                  <>
                    <button
                      aria-label="User actions"
                      onClick={() => setMenu(menu === user.id ? null : user.id)}
                    >
                      <MoreVertical />
                    </button>
                    {menu === user.id && (
                      <div className="member-menu">
                        <button onClick={() => removeUser(user.id)}>
                          <Trash2 /> Remove user
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="roles-help">
        <div className="roles-intro">
          <span>
            <ShieldCheck />
          </span>
          <div>
            <h2>Manager access roles</h2>
            <p>Give every user only the access they need.</p>
          </div>
        </div>
        <div className="role-help-card">
          <span className="role-glyph admin">
            <ShieldCheck />
          </span>
          <div>
            <h3>Admin</h3>
            <p>
              Can manage hosts, subscriptions, advertising, analytics and other
              Manager portal users.
            </p>
          </div>
        </div>
        <div className="role-help-card">
          <span className="role-glyph viewer">
            <Eye />
          </span>
          <div>
            <h3>Viewer</h3>
            <p>
              Can view Manager portal data and analytics, but cannot create,
              approve, edit or remove anything.
            </p>
          </div>
        </div>
      </section>

      {inviteOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && close()
          }
        >
          <form className="modal invite-modal" onSubmit={submit}>
            {sent ? (
              <div className="invite-success">
                <span>
                  <Mail />
                </span>
                <h2>Invitation sent</h2>
                <p>
                  An invitation was sent to <strong>{email}</strong>. Access
                  becomes active after they accept using their Vibfy account.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={close}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="modal-head">
                  <div>
                    <span className="badge purple">
                      <UserPlus size={12} /> NEW PORTAL USER
                    </span>
                    <h2>Invite a Vibfy member</h2>
                    <p>
                      Enter the email connected to their existing Vibfy account.
                    </p>
                  </div>
                  <button type="button" onClick={close}>
                    <X />
                  </button>
                </div>
                <label>
                  Vibfy account email
                  <div className="invite-email">
                    <Mail />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="member@vibfy.com"
                    />
                  </div>
                </label>
                <div className="invite-role-label">
                  Choose their portal role
                </div>
                <div className="invite-role-options">
                  {["Admin"].map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={role === option ? "active" : ""}
                      onClick={() => setRole(option)}
                    >
                      <span className={`role-glyph ${option.toLowerCase()}`}>
                        {option === "Admin" ? <ShieldCheck /> : <Eye />}
                      </span>
                      <div>
                        <strong>{option}</strong>
                        <small>
                          {option === "Admin"
                            ? "Can manage the Manager portal"
                            : "Can view portal information only"}
                        </small>
                      </div>
                      <i>{role === option && <Check />}</i>
                    </button>
                  ))}
                </div>
                <div className="permission-preview">
                  <strong>{role} permissions</strong>
                  {access[role].map((permission) => (
                    <span key={permission}>
                      <Check /> {permission}
                    </span>
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button className="primary-button">
                    <Mail /> Send invitation
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
