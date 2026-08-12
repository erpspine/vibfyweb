import {
  Image,
  MoreHorizontal,
  Pencil,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Badge, PageHeading } from "../../components/ui";
import EventLoading from "../../components/EventLoading";
import { api, apiUrl } from "../../api";

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(null);
  const inputRef = useRef(null);
  const backendUrl = apiUrl.replace(/\/api\/v1$/, "");

  const load = () =>
    api("/host/media")
      .then((result) => setAssets(result.media))
      .catch((problem) => setError(problem.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const upload = async (files) => {
    const selected = [...files].filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (!selected.length) {
      setError("Choose an image or short video to upload.");
      return;
    }
    setUploading(true);
    setError("");
    const body = new FormData();
    selected.slice(0, 12).forEach((file) => body.append("files[]", file));
    try {
      const result = await api("/host/media", { method: "POST", body });
      setAssets((current) => [...result.media, ...current]);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setUploading(false);
    }
  };

  const updateAsset = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api(`/host/media/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.get("name"),
          category: form.get("category"),
        }),
      });
      setAssets((current) =>
        current.map((asset) =>
          asset.id === editing.id ? result.media : asset,
        ),
      );
      setEditing(null);
    } catch (problem) {
      setError(problem.message);
    }
  };

  const remove = async (asset) => {
    setMenu(null);
    const confirmation = await Swal.fire({
      title: "Delete this media?",
      text: `${asset.name} will be permanently removed from the library.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete media",
      confirmButtonColor: "#dc4965",
      background: "#17131b",
      color: "#f7f4fb",
    });
    if (!confirmation.isConfirmed) return;
    try {
      await api(`/host/media/${asset.id}`, { method: "DELETE" });
      setAssets((current) => current.filter((item) => item.id !== asset.id));
    } catch (problem) {
      setError(problem.message);
    }
  };

  return (
    <>
      <PageHeading
        badge={
          <Badge tone="pink">
            <Image size={13} /> {assets.length} assets
          </Badge>
        }
        title="Media library"
        description="Manage photos and videos used on your venue profiles and event listings."
      >
        <button
          className="primary-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud /> {uploading ? "Uploading…" : "Upload media"}
        </button>
      </PageHeading>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        className="media-file-input"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
        onChange={(event) => {
          upload(event.target.files);
          event.target.value = "";
        }}
      />
      {loading ? (
        <EventLoading label="Loading your media…" />
      ) : (
        <>
          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              upload(event.dataTransfer.files);
            }}
          >
            <span>
              <UploadCloud />
            </span>
            <h3>
              {uploading
                ? "Uploading your media…"
                : "Drop photos or short videos here"}
            </h3>
            <p>JPG, PNG, WebP, MP4, MOV or WebM · up to 20 MB each</p>
            <button
              className="secondary-button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Browse files
            </button>
          </div>
          {assets.length === 0 ? (
            <section className="panel venue-empty">
              <Image />
              <h2>Your library is empty</h2>
              <p>Upload media to use it across venues and events.</p>
            </section>
          ) : (
            <div className="media-grid">
              {assets.map((asset) => (
                <figure key={asset.id}>
                  {asset.media_type === "video" ? (
                    <video
                      src={`${backendUrl}${asset.url}`}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img src={`${backendUrl}${asset.url}`} alt={asset.name} />
                  )}
                  <figcaption>
                    <div>
                      <strong>{asset.name}</strong>
                      <span>
                        {asset.category} ·{" "}
                        {(asset.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <div className="media-actions">
                      <button
                        onClick={() =>
                          setMenu(menu === asset.id ? null : asset.id)
                        }
                      >
                        <MoreHorizontal />
                      </button>
                      {menu === asset.id && (
                        <div className="media-action-menu">
                          <button
                            onClick={() => {
                              setEditing(asset);
                              setMenu(null);
                            }}
                          >
                            <Pencil /> Edit details
                          </button>
                          <button
                            className="delete"
                            onClick={() => remove(asset)}
                          >
                            <Trash2 /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      )}
      {editing && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditing(null)
          }
        >
          <form className="modal media-edit-modal" onSubmit={updateAsset}>
            <div className="modal-head">
              <div>
                <Badge tone="pink">
                  {editing.media_type === "video" ? (
                    <Video size={12} />
                  ) : (
                    <Image size={12} />
                  )}{" "}
                  EDIT MEDIA
                </Badge>
                <h2>Media details</h2>
                <p>Use a clear name and category so your team can find it.</p>
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>
            <label>
              Asset name
              <input name="name" required defaultValue={editing.name} />
            </label>
            <label>
              Category
              <select name="category" required defaultValue={editing.category}>
                <option value="general">General</option>
                <option value="venue">Venue</option>
                <option value="event">Event</option>
                <option value="featured">Featured</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="primary-button">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
