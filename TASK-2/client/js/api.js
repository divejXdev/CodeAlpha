const API_URL = localStorage.getItem("apiUrl") || "https://social-media-e7om.onrender.com/api",
  SERVER_URL = API_URL.replace(/\/api$/, "");
const token = () => localStorage.getItem("token"),
  currentUser = () => JSON.parse(localStorage.getItem("user") || "null"),
  imageUrl = (x) => (x ? SERVER_URL + x : "");
const escapeHtml = (x = "") =>
  String(x).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
const ago = (x) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(x)) / 1000));
  return s < 60
    ? s + "s ago"
    : s < 3600
      ? Math.floor(s / 60) + "m ago"
      : s < 86400
        ? Math.floor(s / 3600) + "h ago"
        : new Date(x).toLocaleDateString();
};
async function request(p, o = {}) {
  const h = {
    ...(o.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(o.headers || {}),
  };
  if (token()) h.Authorization = "Bearer " + token();
  const r = await fetch(API_URL + p, { ...o, headers: h }),
    d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.message || "Something went wrong.");
  return d;
}
function requireAuth() {
  if (!token()) location = "login.html";
}
function avatar(u, size = "") {
  return u.profilePicture
    ? `<img class="avatar ${size}" src="${imageUrl(u.profilePicture)}" alt="">`
    : `<span class="avatar ${size}">${escapeHtml((u.fullName || u.username).charAt(0).toUpperCase())}</span>`;
}
function logout() {
  localStorage.clear();
  location = "login.html";
}
