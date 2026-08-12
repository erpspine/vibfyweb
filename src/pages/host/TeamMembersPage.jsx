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
import { useEffect, useState } from "react";
import { api } from "../../api";
import Swal from "sweetalert2";
import EventLoading from "../../components/EventLoading";

const initialMembers = [
  {
    id: 1,
    name: "Rafiki Garden",
    email: "hello@rafikigarden.co.ke",
    initials: "RG",
    role: "Owner",
    status: "Active",
    color: "purple",
  },
  {
    id: 2,
    name: "Amina Kamau",
    email: "amina@vibfy.com",
    initials: "AK",
    role: "Admin",
    status: "Active",
    color: "green",
  },
  {
    id: 3,
    name: "Brian Otieno",
    email: "brian@vibfy.com",
    initials: "BO",
    role: "Viewer",
    status: "Active",
    color: "cyan",
  },
  {
    id: 4,
    name: "Njeri Mwangi",
    email: "njeri@vibfy.com",
    initials: "NM",
    role: "Viewer",
    status: "Pending",
    color: "amber",
  },
];

const permissions = {
  Admin: [
    "Create and edit events",
    "Manage venues and media",
    "View performance insights",
    "Invite and manage members",
  ],
  Viewer: [
    "View events and venues",
    "View media library",
    "View performance insights",
    "Cannot make changes",
  ],
};

export default function TeamMembersPage() {
  const [members, setMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [sent, setSent] = useState(false);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeam = () =>
    api("/host/team")
      .then((result) => {
        const active = result.members.map((item) => ({
          id: item.id,
          name: item.user.name,
          email: item.user.email,
          initials: item.user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          role:
            item.role === "owner"
              ? "Owner"
              : item.role === "admin"
                ? "Admin"
                : "Viewer",
          status: "Active",
          color:
            item.role === "owner"
              ? "purple"
              : item.role === "admin"
                ? "green"
                : "cyan",
        }));
        const pending = result.invitations.map((item) => ({
          id: item.id,
          name: item.invitee.name,
          email: item.invitee.email,
          initials: item.invitee.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          role: item.role === "admin" ? "Admin" : "Viewer",
          status: "Pending",
          color: "amber",
        }));
        setMembers([...active, ...pending]);
      })
      .catch((problem) => setError(problem.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadTeam();
  }, []);

  const invite = async (event) => {
    event.preventDefault();
    try {
      const result = await api("/portals/host/invitations", {
        method: "POST",
        body: JSON.stringify({
          email,
          role: role === "Viewer" ? "user" : role.toLowerCase(),
        }),
      });
      await loadTeam();
      setSent(true);
    } catch (problem) {
      setError(problem.message);
    }
  };

  const closeInvite = () => {
    setInviteOpen(false);
    setEmail("");
    setRole("Admin");
    setSent(false);
  };
  const updateRole = async (id, nextRole) => {
    setError("");
    try {
      await api(`/host/team/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole === "Admin" ? "admin" : "user" }),
      });
      setMembers((items) =>
        items.map((item) =>
          item.id === id ? { ...item, role: nextRole } : item,
        ),
      );
    } catch (problem) {
      setError(problem.message);
    }
  };
  const remove = async (member) => {
    setMenu(null);
    const confirmation = await Swal.fire({
      title:
        member.status === "Pending"
          ? "Revoke invitation?"
          : "Remove team member?",
      text: `${member.name} will no longer have pending or active access to this workspace.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText:
        member.status === "Pending" ? "Revoke invite" : "Remove member",
      confirmButtonColor: "#dc4965",
      background: "#17131b",
      color: "#f7f4fb",
    });
    if (!confirmation.isConfirmed) return;
    try {
      await api(
        member.status === "Pending"
          ? `/host/team/invitations/${member.id}`
          : `/host/team/${member.id}`,
        { method: "DELETE" },
      );
      setMembers((items) => items.filter((item) => item.id !== member.id));
    } catch (problem) {
      setError(problem.message);
    }
  };

  if (loading) return <EventLoading label="Loading your team…" />;

  return (
    <>
      <div className="page-heading team-heading">
        <div>
          <span className="badge purple">
            <Users size={12} /> HOST TEAM
          </span>
          <h1>Team members</h1>
          <p>Invite people you trust to help manage your Vibfy page.</p>
        </div>
        <button className="primary-button" onClick={() => setInviteOpen(true)}>
          <UserPlus /> Invite member
        </button>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <div className="team-summary">
        <div>
          <span className="team-summary-icon purple">
            <Users />
          </span>
          <div>
            <small>Total members</small>
            <strong>{members.length}</strong>
          </div>
        </div>
        <div>
          <span className="team-summary-icon green">
            <ShieldCheck />
          </span>
          <div>
            <small>Administrators</small>
            <strong>
              {
                members.filter((m) => m.role === "Admin" || m.role === "Owner")
                  .length
              }
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
              {members.filter((m) => m.status === "Pending").length}
            </strong>
          </div>
        </div>
      </div>

      <section className="panel members-panel">
        <div className="section-header">
          <div>
            <h2>People with access</h2>
            <p>Manage roles and access to Rafiki Garden.</p>
          </div>
        </div>
        <div className="members-list">
          <div className="member-row member-head">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Access</span>
            <span />
          </div>
          {members.map((member) => (
            <div className="member-row" key={member.id}>
              <div className="member-person">
                <span className={`member-avatar ${member.color}`}>
                  {member.initials}
                </span>
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                </div>
              </div>
              <div>
                {member.role === "Owner" ? (
                  <span className="owner-role">
                    <Crown /> Owner
                  </span>
                ) : (
                  <div className="inline-select">
                    <select
                      value={member.role}
                      onChange={(e) => updateRole(member.id, e.target.value)}
                    >
                      <option>Admin</option>
                      <option>Viewer</option>
                    </select>
                    <ChevronDown />
                  </div>
                )}
              </div>
              <div>
                <span
                  className={`member-status ${member.status.toLowerCase()}`}
                >
                  {member.status === "Active" ? <Check /> : <Clock3 />}
                  {member.status}
                </span>
              </div>
              <span className="access-copy">
                {member.role === "Owner"
                  ? "Full access"
                  : member.role === "Admin"
                    ? "Can manage"
                    : "View only"}
              </span>
              <div className="member-actions">
                {member.role !== "Owner" && (
                  <>
                    <button
                      aria-label="Member actions"
                      onClick={() =>
                        setMenu(menu === member.id ? null : member.id)
                      }
                    >
                      <MoreVertical />
                    </button>
                    {menu === member.id && (
                      <div className="member-menu">
                        <button onClick={() => remove(member)}>
                          <Trash2 /> Remove member
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
            <h2>Understand team roles</h2>
            <p>
              Choose the right level of access for every member of your team.
            </p>
          </div>
        </div>
        <div className="role-help-card">
          <span className="role-glyph admin">
            <ShieldCheck />
          </span>
          <div>
            <h3>Admin</h3>
            <p>
              Can create and edit events, manage venues and media, see insights,
              and manage other team members.
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
              Can see your page, events, media and insights, but cannot create,
              edit or delete anything.
            </p>
          </div>
        </div>
      </section>

      {inviteOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeInvite()}
        >
          <form className="modal invite-modal" onSubmit={invite}>
            {sent ? (
              <div className="invite-success">
                <span>
                  <Mail />
                </span>
                <h2>Invitation sent</h2>
                <p>
                  We sent an invitation to <strong>{email}</strong>. They’ll
                  appear as active after accepting it with their Vibfy account.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={closeInvite}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="modal-head">
                  <div>
                    <span className="badge purple">
                      <UserPlus size={12} /> NEW MEMBER
                    </span>
                    <h2>Invite a team member</h2>
                    <p>They must use an email connected to a Vibfy account.</p>
                  </div>
                  <button type="button" onClick={closeInvite}>
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                    />
                  </div>
                </label>
                <div className="invite-role-label">Choose their role</div>
                <div className="invite-role-options">
                  {["Admin", "Viewer"].map((option) => (
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
                            ? "Can manage the page and team"
                            : "Can view the page and insights"}
                        </small>
                      </div>
                      <i>{role === option && <Check />}</i>
                    </button>
                  ))}
                </div>
                <div className="permission-preview">
                  <strong>{role} permissions</strong>
                  {permissions[role].map((permission) => (
                    <span key={permission}>
                      <Check /> {permission}
                    </span>
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeInvite}
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
