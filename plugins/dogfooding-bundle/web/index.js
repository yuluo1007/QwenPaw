const P = window.QwenPaw;
if (!P?.host?.React || !P?.host?.antd)
  throw new Error("window.QwenPaw.host not found");
const { React: n, antd: B, antdIcons: _ } = P.host, { Card: v, Button: T, Alert: f, Typography: j, Descriptions: h } = B, { LoginOutlined: J, CopyOutlined: q, CheckCircleOutlined: Q } = _, { Text: C } = j, O = "http://118.178.173.134:8081", $ = "qwenpaw-proxy-v1.0", D = "qwenpaw_auth_token", k = "dogfooding-bundle";
console.info(`[${k}] frontend runtime detected`);
function x(e, t) {
  if (!e || typeof e != "object" || e === null)
    return t;
  const o = e, { detail: r } = o;
  return typeof r == "string" ? r : Array.isArray(r) ? r.map((s) => s && typeof s == "object" && "msg" in s ? String(s.msg) : JSON.stringify(s)).filter(Boolean).join("; ") || t : typeof o.message == "string" ? o.message : t;
}
async function F(e) {
  const t = `${O.replace(/\/$/, "")}/v1/integration/sso/init`, o = await fetch(t, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Integration-Client-Secret": $
    },
    body: JSON.stringify({ redirectUri: e })
  }), r = await o.text();
  let a = null;
  if (r)
    try {
      a = JSON.parse(r);
    } catch {
      a = null;
    }
  if (!o.ok) {
    const p = r || `HTTP ${o.status}`;
    throw new Error(x(a, p));
  }
  const i = (a && typeof a == "object" ? a : {}).loginUrl?.trim();
  if (!i)
    throw new Error("SSO init 未返回 loginUrl");
  return i;
}
async function H(e, t) {
  const o = `${O.replace(/\/$/, "")}/v1/integration/sso/token`, r = await fetch(o, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Integration-Client-Secret": $
    },
    body: JSON.stringify({ code: e, state: t })
  }), a = await r.text();
  let s = null;
  if (a)
    try {
      s = JSON.parse(a);
    } catch {
      s = null;
    }
  if (!r.ok) {
    const i = a || `HTTP ${r.status}`;
    throw new Error(x(s, i));
  }
  return s && typeof s == "object" ? s : {};
}
function W() {
  const e = new URL(window.location.href);
  return e.searchParams.delete("code"), e.searchParams.delete("state"), e.toString();
}
function z() {
  const { search: e, hash: t } = window.location;
  if (e && e.length > 1)
    return new URLSearchParams(e);
  const o = t.indexOf("?");
  return o !== -1 ? new URLSearchParams(t.slice(o + 1)) : null;
}
function G() {
  const e = z();
  if (!e) return null;
  const t = e.get("code")?.trim() ?? "", o = e.get("state")?.trim() ?? "";
  return !t || !o ? null : { code: t, state: o };
}
function M() {
  const e = new URL(window.location.href);
  let t = !1;
  (e.searchParams.has("code") || e.searchParams.has("state")) && (e.searchParams.delete("code"), e.searchParams.delete("state"), t = !0);
  const o = e.hash, r = o.indexOf("?");
  if (r !== -1) {
    const i = new URLSearchParams(o.slice(r + 1));
    if (i.has("code") || i.has("state")) {
      i.delete("code"), i.delete("state");
      const p = o.slice(0, r), l = i.toString();
      e.hash = l ? `${p}?${l}` : p, t = !0;
    }
  }
  if (!t) return;
  const a = e.searchParams.toString(), s = a ? `?${a}` : "";
  window.history.replaceState(
    {},
    "",
    `${e.origin}${e.pathname}${s}${e.hash}`
  );
}
function X() {
  const e = {
    "Content-Type": "application/json"
  };
  try {
    const t = localStorage.getItem(D);
    t && (e.Authorization = `Bearer ${t}`);
  } catch {
  }
  return e;
}
async function Y(e) {
  const t = new URL("/api/dogfooding-account/", window.location.origin).href, o = await fetch(t, {
    method: "POST",
    headers: X(),
    body: JSON.stringify({ user_account: e })
  }), r = await o.text();
  let a = null;
  if (r)
    try {
      a = JSON.parse(r);
    } catch {
      a = null;
    }
  if (!o.ok) {
    const i = r || `HTTP ${o.status}`;
    throw new Error(x(a, i));
  }
  const s = a;
  if (!s || typeof s.ok != "boolean" || s.ok !== !0 || typeof s.path != "string")
    throw new Error("保存接口返回格式异常（期望 { ok: true, path: string }）");
  return s;
}
function E(e) {
  return e == null || e === "" ? "—" : String(e);
}
function V(e) {
  const t = e.trim();
  if (!t) return "";
  if (t.length <= 11) return `${t.slice(0, 4)}****`;
  const o = t.startsWith("sk-as-") ? 10 : 6, r = 4, a = "*".repeat(
    Math.min(12, Math.max(4, t.length - o - r))
  );
  return `${t.slice(0, o)}${a}${t.slice(-r)}`;
}
function Z() {
  const [e, t] = n.useState(!1), [o, r] = n.useState(""), [a, s] = n.useState(!1), [i, p] = n.useState(""), [l, L] = n.useState(
    null
  ), [g, w] = n.useState(
    null
  ), [b, S] = n.useState(!1);
  n.useEffect(() => {
    S(!1);
  }, [l?.proxyApiKey]);
  const R = async () => {
    const c = l?.proxyApiKey?.trim();
    if (c)
      try {
        await navigator.clipboard.writeText(c), S(!0);
      } catch {
        S(!1);
      }
  };
  n.useEffect(() => {
    const c = G();
    if (!c) return;
    const d = `dogfooding_sso:${c.state}`;
    try {
      const u = sessionStorage.getItem(d);
      if (u === "done" || u === "pending") return;
      sessionStorage.setItem(d, "pending");
    } catch {
    }
    let m = !1;
    return (async () => {
      s(!0), p("");
      try {
        const u = await H(
          c.code,
          c.state
        );
        if (m) return;
        M();
        const N = u.proxyApiKey?.trim() ?? "", K = u.name ?? null, I = u.account ?? null;
        L({
          name: K,
          account: I,
          proxyApiKey: N || null
        });
        const A = I?.trim();
        if (A)
          try {
            const y = await Y(A);
            w({ kind: "success", path: y.path });
          } catch (y) {
            w({
              kind: "error",
              message: y instanceof Error ? y.message : "调用本机保存工号接口失败"
            });
          }
        else
          w({
            kind: "skipped",
            reason: "SSO 返回中无工号，已跳过写入本机 dogfooding 用户文件"
          });
        try {
          sessionStorage.setItem(d, "done");
        } catch {
        }
      } catch (u) {
        try {
          sessionStorage.removeItem(d);
        } catch {
        }
        m || p(
          u instanceof Error ? u.message : "SSO token 交换失败"
        );
      } finally {
        m || s(!1);
      }
    })(), () => {
      m = !0;
      try {
        sessionStorage.getItem(d) === "pending" && sessionStorage.removeItem(d);
      } catch {
      }
    };
  }, []);
  const U = async () => {
    t(!0), r("");
    try {
      const c = W(), d = await F(c);
      window.location.assign(d);
    } catch (c) {
      r(
        c instanceof Error ? c.message : "发起集团账号登录失败"
      );
    } finally {
      t(!1);
    }
  };
  return /* @__PURE__ */ n.createElement("div", { style: { padding: 24, maxWidth: 820, margin: "0 auto" } }, /* @__PURE__ */ n.createElement(v, null, /* @__PURE__ */ n.createElement(
    T,
    {
      type: "primary",
      style: { marginTop: 0, marginBottom: 12 },
      loading: e,
      onClick: U
    },
    "阿里集团账号登录"
  ), o ? /* @__PURE__ */ n.createElement(
    f,
    {
      style: { marginBottom: 12 },
      type: "error",
      message: o
    }
  ) : null, a ? /* @__PURE__ */ n.createElement(
    f,
    {
      style: { marginBottom: 12 },
      type: "info",
      message: "正在使用登录回调参数换取 API 密钥…"
    }
  ) : null, i ? /* @__PURE__ */ n.createElement(
    f,
    {
      style: { marginBottom: 12 },
      type: "error",
      message: i
    }
  ) : null, l ? /* @__PURE__ */ n.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ n.createElement(h, { bordered: !0, size: "small", column: 1 }, /* @__PURE__ */ n.createElement(h.Item, { label: "API 密钥" }, l?.proxyApiKey ? /* @__PURE__ */ n.createElement(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
      }
    },
    /* @__PURE__ */ n.createElement(C, { code: !0, title: "完整密钥请使用右侧复制" }, V(l.proxyApiKey)),
    /* @__PURE__ */ n.createElement(
      T,
      {
        type: "text",
        size: "small",
        "aria-label": b ? "已复制 API 密钥" : "复制 API 密钥",
        icon: b ? /* @__PURE__ */ n.createElement(Q, { style: { color: "#52c41a" } }) : /* @__PURE__ */ n.createElement(q, null),
        onClick: R
      }
    )
  ) : E(l?.proxyApiKey)), /* @__PURE__ */ n.createElement(h.Item, { label: "花名/姓名" }, E(l?.name)), /* @__PURE__ */ n.createElement(h.Item, { label: "工号" }, E(l?.account))), g?.kind === "success" ? /* @__PURE__ */ n.createElement(
    f,
    {
      type: "success",
      showIcon: !0,
      style: { marginBottom: 12 },
      message: "已写入本机 dogfooding 用户文件",
      description: /* @__PURE__ */ n.createElement(C, { code: !0, copyable: !0 }, g.path)
    }
  ) : null, g?.kind === "skipped" ? /* @__PURE__ */ n.createElement(
    f,
    {
      type: "warning",
      showIcon: !0,
      style: { marginBottom: 12 },
      message: g.reason
    }
  ) : null, g?.kind === "error" ? /* @__PURE__ */ n.createElement(
    f,
    {
      type: "error",
      showIcon: !0,
      style: { marginBottom: 12 },
      message: "保存工号到本机失败",
      description: g.message
    }
  ) : null) : null));
}
class ee {
  constructor() {
    this.id = k;
  }
  setup() {
    if (typeof window.QwenPaw.registerRoutes != "function") {
      console.error(`[${k}] registerRoutes is not available`);
      return;
    }
    window.QwenPaw.registerRoutes?.(this.id, [
      {
        path: "/join-dogfooding",
        component: Z,
        label: "Join dogfooding plan",
        icon: /* @__PURE__ */ n.createElement(J, { size: 14 }),
        priority: 1
      }
    ]);
  }
}
new ee().setup();
