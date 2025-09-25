const i = {
  nextUnitOfWork: null,
  wipRoot: null,
  currentRoot: null,
  deletions: [],
  currentFiber: null,
  hookQueues: /* @__PURE__ */ new Map(),
  pendingEffects: []
};
globalThis.globalState = i;
function T(e, t, o) {
  if (o) {
    for (let [n, r] of Object.entries(o))
      if (n !== "children" && n.startsWith("on") && w(n)) {
        const s = n.slice(2).toLowerCase();
        e.removeEventListener(s, r);
      }
  }
  for (let [n, r] of Object.entries(t))
    if (n !== "children")
      if (typeof r == "boolean")
        r ? e.setAttribute(n, "") : e.removeAttribute(n);
      else if (n.startsWith("on")) {
        const s = n.slice(2).toLowerCase();
        e.addEventListener(s, r);
      } else n === "nodeValue" && e.nodeType == Node.TEXT_NODE ? e.nodeValue = r : n == "ref" ? typeof r == "function" ? r(e) : r && typeof r == "object" && "current" in r && (r.current = e) : typeof r != "boolean" && (n == "className" ? e.setAttribute("class", String(r)) : n == "style" && typeof r == "object" ? e.setAttribute("style", b(r)) : e.setAttribute(n, String(r)));
}
function R(e) {
  return e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
const F = /* @__PURE__ */ new Set([
  "zIndex",
  "opacity",
  "fontWeight",
  "lineHeight",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "animationIterationCount"
]);
function C(e, t) {
  return typeof t == "number" ? F.has(e) ? t.toString() : `${t}px` : t;
}
function b(e) {
  return e ? Object.entries(e).map(([t, o]) => {
    const n = R(t), r = C(t, o);
    return `${n}: ${r}`;
  }).join("; ") : "";
}
function w(e) {
  return e.startsWith("on") && e.length > 2;
}
function D(e) {
  return e.type == "TEXT_NODE";
}
const N = function(e) {
  let t = !1;
  for (; !t && i.nextUnitOfWork; )
    i.nextUnitOfWork = L(i.nextUnitOfWork), t = e.timeRemaining() < 1;
  if (!i.nextUnitOfWork && i.wipRoot) {
    _();
    for (const {
      fn: o,
      dependencies: n,
      fiber: r,
      hookIndex: s
    } of i.pendingEffects) {
      const u = o();
      if (typeof u == "function") {
        const c = r.hooks[s];
        c && (c.cleanUp = u);
      }
    }
    i.pendingEffects = [];
  }
  requestIdleCallback(N);
};
function L(e) {
  return e ? (e.type instanceof Function ? M(e) : $(e), e.child ? e.child : U(e)) : null;
}
function U(e) {
  let t = e;
  for (; t; ) {
    if (t.sibling)
      return t.sibling;
    t = t.parent;
  }
  return null;
}
function A(e) {
  const t = D(e) ? document.createTextNode(e.props.nodeValue) : document.createElement(e.type);
  return t.nodeType == Node.ELEMENT_NODE && T(t, e.props), t;
}
const W = (e, t) => {
  var r, s, u, c;
  if ((r = e == null ? void 0 : e.props) != null && r.key) return e.props.key;
  const o = (e == null ? void 0 : e.type) || "text", n = ((s = e == null ? void 0 : e.props) == null ? void 0 : s.htmlFor) || ((u = e == null ? void 0 : e.props) == null ? void 0 : u.name) || ((c = e == null ? void 0 : e.props) == null ? void 0 : c.id) || `${o}_${t}`;
  return `${o}:${n}`;
};
function v(e, t) {
  var h, p, m;
  let o = null;
  const n = /* @__PURE__ */ new Map(), r = [];
  let s = (h = t.alternate) == null ? void 0 : h.child, u = 0;
  for (; s; ) {
    const a = W(s, u);
    n.set(a, s), r.push(s), s = s.sibling, u++;
  }
  const c = /* @__PURE__ */ new Set();
  for (let a = 0; a < e.length; a++) {
    const f = e[a], O = ((p = f == null ? void 0 : f.props) == null ? void 0 : p.key) ?? `__index_${a}`;
    let d = n.get(O);
    if (!d && r[a] && !c.has(r[a])) {
      const x = r[a];
      x.type === (f == null ? void 0 : f.type) && (d = x);
    }
    const S = !!(d && f && d.type === f.type);
    let g = null;
    if (S && d) {
      c.add(d);
      const x = d.type === "TEXT_NODE" ? { nodeValue: (m = f.props) == null ? void 0 : m.nodeValue } : f.props;
      g = {
        type: d.type,
        props: x,
        dom: d.dom,
        parent: t,
        alternate: d,
        effectTag: "UPDATE",
        hookIndex: d.hookIndex,
        // ✅ Preserve hookIndex
        hooks: [...d.hooks || []]
        // ✅ Deep copy hooks
      };
    } else f && (g = {
      type: f.type || "TEXT_NODE",
      props: f.props || { nodeValue: String(f) },
      dom: null,
      parent: t,
      alternate: null,
      effectTag: "PLACEMENT",
      hookIndex: 0,
      hooks: []
    });
    a === 0 ? t.child = g : o && g && (o.sibling = g), g && (o = g);
  }
  for (const a of r)
    c.has(a) || (a.effectTag = "DELETION", i.deletions.push(a));
}
function q(e, t) {
  i.wipRoot = {
    dom: t,
    type: "ROOT",
    props: {
      children: [e]
    },
    alternate: i.currentRoot,
    hookIndex: 0,
    hooks: []
  }, i.nextUnitOfWork = i.wipRoot;
}
function _() {
  var o;
  const e = document.activeElement, t = e ? {
    element: e,
    selectionStart: e.selectionStart,
    selectionEnd: e.selectionEnd
  } : null;
  i.deletions.forEach(E), E((o = i.wipRoot) == null ? void 0 : o.child), t && document.contains(t.element) && (t.element.focus(), (t.element instanceof HTMLInputElement || t.element instanceof HTMLTextAreaElement) && t.selectionStart !== null && t.selectionEnd !== null && t.element.setSelectionRange(
    t.selectionStart,
    t.selectionEnd
  )), i.currentRoot = i.wipRoot, i.wipRoot = null;
}
function V(e) {
  let t = e.sibling;
  for (; t; ) {
    if (t.dom && t.effectTag !== "DELETION")
      return t.dom;
    if (t.child && t.effectTag !== "DELETION") {
      const o = y(t.child);
      if (o)
        return o;
    }
    t = t.sibling;
  }
  return null;
}
function y(e) {
  return e.dom && e.effectTag !== "DELETION" ? e.dom : e.child && e.effectTag !== "DELETION" ? y(e.child) : e.sibling ? y(e.sibling) : null;
}
function E(e) {
  var n, r;
  if (!e) return;
  e.hookIndex = 0;
  let t = e.parent;
  for (; t && !t.dom; )
    t = t.parent;
  const o = t == null ? void 0 : t.dom;
  if (o && ((n = e.parent) == null ? void 0 : n.effectTag) != "DELETION" && e.effectTag === "PLACEMENT" && e.dom != null && e.type !== "frag") {
    const s = V(e);
    s && o.contains(s) ? o.insertBefore(e.dom, s) : o.appendChild(e.dom);
  } else e.effectTag === "UPDATE" && e.dom ? j(
    e.dom,
    ((r = e.alternate) == null ? void 0 : r.props) || {},
    e.props
  ) : e.effectTag === "DELETION" && k(e, o);
  e.child && e.effectTag !== "DELETION" && E(e.child), e.sibling && E(e.sibling);
}
function k(e, t) {
  var o;
  e && (e.dom ? t.contains(e.dom) && t.removeChild(e.dom) : k(e.child, t), ((o = e.parent) == null ? void 0 : o.type) === "frag" && e.sibling && k(e.sibling, t));
}
function j(e, t, o) {
  for (const n in t)
    if (!(n in o)) {
      if (n == "children") continue;
      w(n) || e.removeAttribute(n);
    }
  e.nodeType === Node.ELEMENT_NODE && T(e, o, t), e.nodeType === Node.TEXT_NODE && (e.nodeValue = o.nodeValue);
}
function M(e) {
  if (!e.type || typeof e.type != "function")
    throw new Error("Fiber type is not a function component");
  e.hooks ?? (e.hooks = []), i.currentFiber = e;
  const t = [e.type(e.props)].filter(
    (o) => o != null
  );
  v(t, e);
}
function $(e) {
  var o;
  e.dom || (e.dom = e.type !== "frag" ? A(e) : (o = e.parent) == null ? void 0 : o.dom);
  const t = Array.isArray(e.props.children) ? e.props.children.filter(
    (n) => n != null && n !== void 0
  ) : e.props.children && typeof e.props.children == "object" ? [e.props.children] : [];
  v(t, e);
}
function X(e, t, ...o) {
  const n = {
    children: o.length > 0 ? o.flat(1 / 0).map((r) => typeof r != "object" ? {
      type: "TEXT_NODE",
      props: { nodeValue: r !== !1 ? r : "" }
    } : r) : void 0,
    ...t || {}
  };
  return {
    type: e,
    props: n
  };
}
const H = (e) => ({
  type: "frag",
  props: e
});
function I(e) {
  var c, h;
  if (!i.currentFiber)
    throw new Error("Not in a function Component!");
  const t = i.currentFiber, o = t.hookIndex, n = (h = (c = t.alternate) == null ? void 0 : c.hooks) == null ? void 0 : h[o];
  let r = n ? n.state : typeof e == "function" ? e() : e;
  n != null && n.queue && (n.queue.forEach((p) => {
    r = p(r);
  }), n.queue = []);
  const s = n || {
    tag: "STATE",
    state: r,
    queue: []
  };
  s.state = r;
  const u = (p) => {
    const m = typeof p == "function" ? p : () => p;
    s && s.queue && s.queue.push(m), !i.nextUnitOfWork && i.currentRoot && (i.wipRoot = {
      type: i.currentRoot.type,
      dom: i.currentRoot.dom,
      props: i.currentRoot.props,
      alternate: i.currentRoot,
      hooks: [],
      hookIndex: 0
    }, i.nextUnitOfWork = i.wipRoot, i.deletions = []);
  };
  return t.hooks[o] = s, t.hookIndex++, [s.state, u];
}
function P(e, t) {
  var u, c, h, p;
  if (!i.currentFiber)
    throw new Error("Not in a function Component!");
  const o = i.currentFiber, n = (c = (u = o.alternate) == null ? void 0 : u.hooks) == null ? void 0 : c[o.hookIndex], r = {
    tag: "EFFECT",
    setUp: n ? n.setUp : e,
    dependencies: n ? n.dependencies : [],
    cleanUp: n ? n.cleanUp : void 0
  };
  (n == null || t == null || ((h = r == null ? void 0 : r.dependencies) == null ? void 0 : h.some((m, a) => !Object.is(m, t[a]))) || t.length != ((p = r == null ? void 0 : r.dependencies) == null ? void 0 : p.length)) && (n != null && n.cleanUp && n.cleanUp(), i.pendingEffects.push({
    fn: e,
    dependencies: t,
    fiber: o,
    hookIndex: o.hookIndex
  })), r.dependencies = t || [], o.hooks[o.hookIndex] = r, o.hookIndex++;
}
function Y(e) {
  var r, s;
  if (!i.currentFiber)
    throw new Error("Not in a function Component!");
  const t = i.currentFiber, o = (s = (r = t.alternate) == null ? void 0 : r.hooks) == null ? void 0 : s[t.hookIndex];
  let n;
  return o && o.value ? n = o : n = {
    tag: "REF",
    value: { current: e }
  }, t.hooks[t.hookIndex] = n, t.hookIndex++, n.value;
}
function z() {
  const [e, t] = I(null);
  return t;
}
const l = {
  createElement: X,
  render: q,
  Fragment: H,
  useState: I,
  useRender: z,
  useEffect: P,
  useRef: Y,
  workLoop: N
};
function B({
  path: e,
  Component: t,
  ...o
}) {
  const n = new URL(window.location.href), r = e.split("/");
  return n.pathname.split("/").every(
    (u, c) => {
      var h, p;
      return u.toLowerCase() == ((h = r[c]) == null ? void 0 : h.toLowerCase()) || ((p = r[c]) == null ? void 0 : p.startsWith(":"));
    }
  ) ? /* @__PURE__ */ l.createElement(t, { ...o }) : null;
}
function G({ to: e, children: t, ...o }) {
  const n = l.useRender(), r = (s) => {
    s.preventDefault(), window.history.pushState({}, "", e), n(null);
  };
  return /* @__PURE__ */ l.createElement("a", { ...o, href: e, onClick: r }, t);
}
const K = () => /* @__PURE__ */ l.createElement("div", { className: "bg-[#141517] overflow-hidden w-full min-h-screen relative" }, /* @__PURE__ */ l.createElement("div", { className: "absolute top-[300px] left-[-540px] w-[1275px] h-[1198px]" }, /* @__PURE__ */ l.createElement("div", { className: "top-[298px] left-[375px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] absolute blur-[153px]" }), /* @__PURE__ */ l.createElement("div", { className: "top-0 left-0 w-[700px] h-[700px] bg-[#dda15e] rounded-[350px] absolute blur-[153px]" })), /* @__PURE__ */ l.createElement("main", { className: "relative z-10 flex flex-col min-h-screen" }, /* @__PURE__ */ l.createElement("section", { className: "flex-1 flex flex-col justify-center px-[153px] pt-[120px]" }, /* @__PURE__ */ l.createElement("div", { className: "font-questrial font-normal text-[#ffffff80] text-xl tracking-[0] leading-10 whitespace-nowrap mb-[50px]" }, "Master The Game With Just One Swing"), /* @__PURE__ */ l.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" }, /* @__PURE__ */ l.createElement("div", { className: "space-y-[120px]" }, /* @__PURE__ */ l.createElement("h1", { className: "max-w-[686px] font-questrial font-normal text-white text-4xl lg:text-5xl tracking-[0] leading-[60px] lg:leading-[87px]" }, "One Swing To Rule The Table ", /* @__PURE__ */ l.createElement("br", null), "a Power Move To Conquer Every Rally."), /* @__PURE__ */ l.createElement("div", { className: "w-[217px] relative" }, /* @__PURE__ */ l.createElement(G, { to: "/login" }, /* @__PURE__ */ l.createElement(
  "button",
  {
    type: "button",
    class: "py-2.5 px-12 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
  },
  "Get Started"
)))), " ", /* @__PURE__ */ l.createElement("div", { className: "pt-[80px] lg:pt-[200px] lg:pl-[100px]" }, /* @__PURE__ */ l.createElement("p", { className: "max-w-[444px] font-questrial font-normal text-white text-base tracking-[0] leading-[35px]" }, "Step Up, Take Aim, And Unleash Your Winning Swing. Every Shot Is Your Chance To Dominate The Table, Outplay Your Rivals, And Claim Victory In Style.")))), /* @__PURE__ */ l.createElement("footer", { className: "flex justify-between items-end px-[153px] pb-[40px] mt-auto" }, /* @__PURE__ */ l.createElement("div", { className: "font-questrial font-normal text-[#f9f9f980] text-[10px] tracking-[0] leading-[15px]" }, "© 2025 — Built with passion by Ibnoukhalkane"), /* @__PURE__ */ l.createElement("div", { className: "w-[100px] h-10 relative" }, /* @__PURE__ */ l.createElement("div", { className: "absolute top-0 left-0 font-questrial font-normal text-[#f9f9f9] text-sm tracking-[0] leading-10 whitespace-nowrap" }, "Start Ping Pong"))))), J = () => /* @__PURE__ */ l.createElement("div", { className: "" }, /* @__PURE__ */ l.createElement("main", null, /* @__PURE__ */ l.createElement(B, { path: "/", Component: K })));
requestIdleCallback(l.workLoop);
const Q = document.querySelector("#app");
l.render(l.createElement(J, null), Q);
