import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image as ImageIcon, Send, X, Plus, Globe, Users } from "lucide-react";
import toast from "react-hot-toast";
import { createPost } from "../app/slices/postSlice";

export default function CreatePost({ onPostCreated }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
  };

  const removeImage = (idx) => {
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.error("Write something or add an image");
      return;
    }

    const fd = new FormData();
    fd.append("content", content);
    fd.append("visibility", visibility);
    images.forEach((f) => fd.append("images", f));

    setSubmitting(true);
    try {
      const created = await dispatch(createPost(fd)).unwrap();
      setContent("");
      setImages([]);
      toast.success("Posted!");
      onPostCreated?.(created);
    } catch (err) {
      toast.error(err || "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-primary/5">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: user?.avatar?.url
              ? `url(${user.avatar.url}) center/cover`
              : "var(--gradient-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
          }}
        >
          {!user?.avatar?.url && user?.name?.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          {!showComposer ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowComposer(true)}
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-secondary)",
                }}
              >
                <Plus size={16} /> Add a post…
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={16} /> Add media
              </span>
            </button>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with your network…"
                rows={4}
                disabled={submitting}
                className="w-full resize-y rounded-[14px] border border-white/10 bg-white/[0.03] text-text-primary p-3 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
              />

              {images.length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {images.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt=""
                          className="w-[92px] h-[92px] object-cover rounded-[10px] border border-white/10 group-hover:border-primary/30 transition-colors"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full border border-white/10 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-danger hover:border-danger transition-colors hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    <ImageIcon size={16} /> Add media
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPickImages}
                      disabled={submitting}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowComposer(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--text-muted)",
                      fontSize: 12,
                    }}
                  >
                    {visibility === "public" ? (
                      <Globe size={14} />
                    ) : (
                      <Users size={14} />
                    )}
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      disabled={submitting}
                      style={{
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        padding: "6px 10px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                      className="shadow-sm hover:border-primary/50 transition-colors"
                    >
                      <option
                        value="public"
                        className="bg-[#0f172a] text-white"
                      >
                        Public
                      </option>
                      <option
                        value="connections"
                        className="bg-[#0f172a] text-white"
                      >
                        Connections
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                  >
                    <Send size={16} /> {submitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
