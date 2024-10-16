function Ze(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function le() {
  throw new Error("Cycle detected");
}
function yt() {
  throw new Error("Computed cannot have side-effects");
}
const wt = Symbol.for("preact-signals"), $ = 1, U = 2, Y = 4, W = 8, J = 16, H = 32;
function ce() {
  K++;
}
function ue() {
  if (K > 1) {
    K--;
    return;
  }
  let t, e = !1;
  for (; G !== void 0; ) {
    let n = G;
    for (G = void 0, ye++; n !== void 0; ) {
      const s = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~U, !(n._flags & W) && et(n))
        try {
          n._callback();
        } catch (r) {
          e || (t = r, e = !0);
        }
      n = s;
    }
  }
  if (ye = 0, K--, e)
    throw t;
}
function Et(t) {
  if (K > 0)
    return t();
  ce();
  try {
    return t();
  } finally {
    ue();
  }
}
let _, G, K = 0, ye = 0, ie = 0;
function Xe(t) {
  if (_ === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== _)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: _._sources,
      _nextSource: void 0,
      _target: _,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, _._sources !== void 0 && (_._sources._nextSource = e), _._sources = e, t._node = e, _._flags & H && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = _._sources, e._nextSource = void 0, _._sources._nextSource = e, _._sources = e), e;
}
function S(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
S.prototype.brand = wt;
S.prototype._refresh = function() {
  return !0;
};
S.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
S.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, n = t._nextTarget;
    e !== void 0 && (e._nextTarget = n, t._prevTarget = void 0), n !== void 0 && (n._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = n);
  }
};
S.prototype.subscribe = function(t) {
  const e = this;
  return rt(function() {
    const n = e.value, s = this._flags & H;
    this._flags &= ~H;
    try {
      t(n);
    } finally {
      this._flags |= s;
    }
  });
};
S.prototype.valueOf = function() {
  return this.value;
};
S.prototype.toString = function() {
  return this.value + "";
};
S.prototype.toJSON = function() {
  return this.value;
};
S.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(S.prototype, "value", {
  get() {
    const t = Xe(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (_ instanceof I && yt(), t !== this._value) {
      ye > 100 && le(), this._value = t, this._version++, ie++, ce();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ue();
      }
    }
  }
});
function Qe(t) {
  return new S(t);
}
function et(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function tt(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function nt(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const s = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), s !== void 0 && (s._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = s)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = s;
  }
  t._sources = n;
}
function I(t) {
  S.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = ie - 1, this._flags = Y;
}
I.prototype = new S();
I.prototype._refresh = function() {
  if (this._flags &= ~U, this._flags & $)
    return !1;
  if ((this._flags & (Y | H)) === H || (this._flags &= ~Y, this._globalVersion === ie))
    return !0;
  if (this._globalVersion = ie, this._flags |= $, this._version > 0 && !et(this))
    return this._flags &= ~$, !0;
  const t = _;
  try {
    tt(this), _ = this;
    const e = this._compute();
    (this._flags & J || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~J, this._version++);
  } catch (e) {
    this._value = e, this._flags |= J, this._version++;
  }
  return _ = t, nt(this), this._flags &= ~$, !0;
};
I.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= Y | H;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  S.prototype._subscribe.call(this, t);
};
I.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (S.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~H;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
I.prototype._notify = function() {
  if (!(this._flags & U)) {
    this._flags |= Y | U;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
I.prototype.peek = function() {
  if (this._refresh() || le(), this._flags & J)
    throw this._value;
  return this._value;
};
Object.defineProperty(I.prototype, "value", {
  get() {
    this._flags & $ && le();
    const t = Xe(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & J)
      throw this._value;
    return this._value;
  }
});
function _t(t) {
  return new I(t);
}
function st(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    ce();
    const n = _;
    _ = void 0;
    try {
      e();
    } catch (s) {
      throw t._flags &= ~$, t._flags |= W, Ne(t), s;
    } finally {
      _ = n, ue();
    }
  }
}
function Ne(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, st(t);
}
function St(t) {
  if (_ !== this)
    throw new Error("Out-of-order effect");
  nt(this), _ = t, this._flags &= ~$, this._flags & W && Ne(this), ue();
}
function X(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = H;
}
X.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & W || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
X.prototype._start = function() {
  this._flags & $ && le(), this._flags |= $, this._flags &= ~W, st(this), tt(this), ce();
  const t = _;
  return _ = this, St.bind(this, t);
};
X.prototype._notify = function() {
  this._flags & U || (this._flags |= U, this._nextBatchedEffect = G, G = this);
};
X.prototype._dispose = function() {
  this._flags |= W, this._flags & $ || Ne(this);
};
function rt(t) {
  const e = new X(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class ot {
  get value() {
    return Ee(this);
  }
  set value(e) {
    Et(() => Tt(this, e));
  }
  peek() {
    return Ee(this, { peek: !0 });
  }
}
const we = (t) => Object.assign(
  new ot(),
  Object.entries(t).reduce(
    (e, [n, s]) => {
      if (["value", "peek"].some((r) => r === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof s != "object" || s === null || Array.isArray(s) ? e[n] = Qe(s) : e[n] = we(s), e;
    },
    {}
  )
), Tt = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), Ee = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [s, r]) => (r instanceof S ? n[s] = e ? r.peek() : r.value : r instanceof ot && (n[s] = Ee(r, { peek: e })), n),
  {}
);
function it(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((s) => {
    n.hasOwnProperty(s) || (n[s] = e[s]), e[s] === null ? delete n[s] : n[s] = it(n[s], e[s]);
  }), n;
}
const q = "datastar-event", At = "[a-zA-Z_$]+[0-9a-zA-Z_$.]*";
function ke(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${At})${n})`, "g");
}
const Nt = {
  regexp: ke("$", "signal", "(?<method>\\([^\\)]*\\))?"),
  replacer: (t) => {
    const { signal: e, method: n } = t, s = "ctx.store()";
    if (!n?.length)
      return `${s}.${e}.value`;
    const r = e.split("."), o = r.pop(), i = r.join(".");
    return `${s}.${i}.value.${o}${n}`;
  }
}, kt = {
  regexp: ke("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((r) => r.trim()));
    const s = n.join(",");
    return `ctx.actions.${t}(${s})`;
  }
}, Lt = {
  regexp: ke("~", "ref", ""),
  replacer({ ref: t }) {
    return `document.querySelector(ctx.store()._dsPlugins.refs.${t})`;
  }
}, Mt = [kt, Nt, Lt], $t = {
  prefix: "store",
  removeNewLines: !0,
  preprocessors: {
    pre: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `Object.assign({...ctx.store()}, ${e})`;
        }
      }
    ]
  },
  allowedModifiers: /* @__PURE__ */ new Set(["local", "session", "ifmissing"]),
  onLoad: (t) => {
    let e = "";
    const n = (c) => {
      const p = t.store(), l = JSON.stringify(p);
      l !== e && (window.localStorage.setItem(B, l), e = l);
    }, s = t.modifiers.has("local");
    if (s) {
      window.addEventListener(q, n);
      const c = window.localStorage.getItem(B) || "{}", p = JSON.parse(c);
      t.mergeStore(p);
    }
    const r = t.modifiers.has("session"), o = (c) => {
      const p = t.store(), l = JSON.stringify(p);
      window.sessionStorage.setItem(B, l);
    };
    if (r) {
      window.addEventListener(q, o);
      const c = window.sessionStorage.getItem(B) || "{}", p = JSON.parse(c);
      t.mergeStore(p);
    }
    const i = t.expressionFn(t), d = lt(t.store(), i, t.modifiers.has("ifmissing"));
    return t.mergeStore(d), delete t.el.dataset[t.rawKey], () => {
      s && window.removeEventListener(q, n), r && window.removeEventListener(q, o);
    };
  }
}, Pt = {
  prefix: "ref",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    t.upsertIfMissingFromStore("_dsPlugins.refs", {});
    const { el: e, expression: n } = t, r = {
      _dsPlugins: {
        refs: {
          ...t.store()._dsPlugins.refs.value,
          [n]: at(e)
        }
      }
    };
    return t.mergeStore(r), () => {
      const o = t.store(), i = { ...o._dsPlugins.refs.value };
      delete i[n], o._dsPlugins.refs = i;
    };
  }
}, Ot = [$t, Pt];
function at(t) {
  if (!t)
    return "null";
  if (typeof t == "string")
    return t;
  if (t instanceof Window)
    return "Window";
  if (t instanceof Document)
    return "Document";
  if (t.tagName === "BODY")
    return "BODY";
  const e = [];
  for (; t.parentElement && t.tagName !== "BODY"; ) {
    if (t.id) {
      e.unshift("#" + t.getAttribute("id"));
      break;
    } else {
      let n = 1, s = t;
      for (; s.previousElementSibling; s = s.previousElementSibling, n++)
        ;
      e.unshift(t.tagName + ":nth-child(" + n + ")");
    }
    t = t.parentElement;
  }
  return e.join(">");
}
function lt(t, e, n) {
  const s = {};
  if (!n)
    Object.assign(s, e);
  else
    for (const r in e) {
      const o = t[r]?.value;
      o == null && (s[r] = e[r]);
    }
  return s;
}
const B = "datastar", L = `${B}-`;
class It {
  constructor(e = {}, ...n) {
    if (this.plugins = [], this.store = we({ _dsPlugins: {} }), this.actions = {}, this.refs = {}, this.reactivity = {
      signal: Qe,
      computed: _t,
      effect: rt
    }, this.parentID = "", this.missingIDNext = 0, this.removals = /* @__PURE__ */ new Map(), this.mergeRemovals = new Array(), this.actions = Object.assign(this.actions, e), n = [...Ot, ...n], !n.length)
      throw new Error("No plugins provided");
    const s = /* @__PURE__ */ new Set();
    for (const r of n) {
      if (r.requiredPluginPrefixes) {
        for (const o of r.requiredPluginPrefixes)
          if (!s.has(o))
            throw new Error(`${r.prefix} requires ${o}`);
      }
      this.plugins.push(r), s.add(r.prefix);
    }
  }
  run() {
    new MutationObserver((n, s) => {
      N("core", "dom", "mutation", document.body, document.body.outerHTML);
    }).observe(document.body, { attributes: !0, childList: !0, subtree: !0 }), this.plugins.forEach((n) => {
      n.onGlobalInit && (n.onGlobalInit({
        actions: this.actions,
        reactivity: this.reactivity,
        mergeStore: this.mergeStore.bind(this),
        store: this.store
      }), N("core", "plugins", "registration", "BODY", `On prefix ${n.prefix}`));
    }), this.applyPlugins(document.body);
  }
  cleanupElementRemovals(e) {
    const n = this.removals.get(e);
    if (n) {
      for (const s of n.set)
        s();
      this.removals.delete(e);
    }
  }
  mergeStore(e) {
    this.mergeRemovals.forEach((s) => s()), this.mergeRemovals = this.mergeRemovals.slice(0);
    const n = it(this.store.value, e);
    this.store = we(n), this.mergeRemovals.push(
      this.reactivity.effect(() => {
        N("core", "store", "merged", "STORE", JSON.stringify(this.store.value));
      })
    );
  }
  upsertIfMissingFromStore(e, n) {
    const s = e.split(".");
    let r = this.store;
    for (let i = 0; i < s.length - 1; i++) {
      const d = s[i];
      r[d] || (r[d] = {}), r = r[d];
    }
    const o = s[s.length - 1];
    r[o] || (r[o] = this.reactivity.signal(n), N("core", "store", "upsert", e, n));
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const n = /* @__PURE__ */ new Set();
    this.plugins.forEach((s, r) => {
      this.walkDownDOM(e, (o) => {
        r || this.cleanupElementRemovals(o);
        for (const i in o.dataset) {
          const d = o.dataset[i] || "";
          let c = d;
          if (!i.startsWith(s.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), n.clear(), s.allowedTagRegexps) {
            const u = o.tagName.toLowerCase();
            if (![...s.allowedTagRegexps].some((b) => u.match(b)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...s.allowedTagRegexps].map((b) => `'${b}'`)
                ].join(", ")}`
              );
          }
          let p = i.slice(s.prefix.length), [l, ...f] = p.split(".");
          if (s.mustHaveEmptyKey && l.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (s.mustNotEmptyKey && l.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          l.length && (l = l[0].toLowerCase() + l.slice(1));
          const a = f.map((u) => {
            const [v, ...b] = u.split("_");
            return { label: v, args: b };
          });
          if (s.allowedModifiers) {
            for (const u of a)
              if (!s.allowedModifiers.has(u.label))
                throw new Error(`'${u.label}' is not allowed`);
          }
          const m = /* @__PURE__ */ new Map();
          for (const u of a)
            m.set(u.label, u.args);
          if (s.mustHaveEmptyExpression && c.length)
            throw new Error(`'${i}' must have empty expression`);
          if (s.mustNotEmptyExpression && !c.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const w = /;|\n/;
          s.removeNewLines && (c = c.split(`
`).map((u) => u.trim()).join(" "));
          const g = [...s.preprocessors?.pre || [], ...Mt, ...s.preprocessors?.post || []];
          for (const u of g) {
            if (n.has(u))
              continue;
            n.add(u);
            const v = c.split(w), b = [];
            v.forEach((y) => {
              let T = y;
              const R = [...T.matchAll(u.regexp)];
              if (R.length)
                for (const M of R) {
                  if (!M.groups)
                    continue;
                  const { groups: C } = M, { whole: F } = C;
                  T = T.replace(F, u.replacer(C));
                }
              b.push(T);
            }), c = b.join("; ");
          }
          const h = {
            store: () => this.store,
            mergeStore: this.mergeStore.bind(this),
            upsertIfMissingFromStore: this.upsertIfMissingFromStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: this.actions,
            reactivity: this.reactivity,
            el: o,
            rawKey: i,
            key: l,
            rawExpression: d,
            expression: c,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: m,
            sendDatastarEvent: N
          };
          if (!s.bypassExpressionFunctionCreation?.(h) && !s.mustHaveEmptyExpression && c.length) {
            const u = c.split(w).map((y) => y.trim()).filter((y) => y.length);
            u[u.length - 1] = `return ${u[u.length - 1]}`;
            const v = u.map((y) => `  ${y}`).join(`;
`), b = `
try {
  const _datastarExpression = () => {
${v}
  }
  const _datastarReturnVal = _datastarExpression()
  ctx.sendDatastarEvent('core', 'attributes', 'expr_eval', ctx.el, '${i} equals ' + JSON.stringify(_datastarReturnVal))
  return _datastarReturnVal
} catch (e) {
 const msg = \`
Error evaluating Datastar expression:
${v.replaceAll("`", "\\`")}

Error: \${e.message}

Check if the expression is valid before raising an issue.
\`.trim()
 ctx.sendDatastarEvent('core', 'attributes', 'expr_eval_err', ctx.el, msg)
 console.error(msg)
 debugger
}
            `;
            try {
              const y = s.argumentNames || [], T = new Function("ctx", ...y, b);
              h.expressionFn = T;
            } catch (y) {
              const T = new Error(`Error creating expression function for '${b}', error: ${y}`);
              N("core", "attributes", "expr_construction_err", h.el, String(T)), console.error(T);
              debugger;
            }
          }
          const E = s.onLoad(h);
          E && (this.removals.has(o) || this.removals.set(o, { id: o.id, set: /* @__PURE__ */ new Set() }), this.removals.get(o).set.add(E));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const s = Object.keys(e);
    for (let r = 0; r < s.length; r++) {
      const o = s[r], i = e[o], d = i instanceof S, c = typeof i == "object" && Object.keys(i).length > 0;
      if (d) {
        n(o, i);
        continue;
      }
      c && this.walkSignalsStore(i, n);
    }
  }
  walkSignals(e) {
    this.walkSignalsStore(this.store, e);
  }
  walkDownDOM(e, n, s = 0) {
    if (!e)
      return;
    const r = Ze(e);
    if (r)
      for (n(r), s = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, s++), e = e.nextElementSibling;
  }
}
const ct = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), Rt = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(async () => {
    const e = ct(t.key), n = t.expressionFn(t);
    let s;
    typeof n == "string" ? s = n : s = JSON.stringify(n), !s || s === "false" || s === "null" || s === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, s);
  })
}, Ct = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, ee = ["change", "input", "keydown"], Dt = {
  prefix: "model",
  mustHaveEmptyKey: !0,
  preprocessors: {
    post: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `ctx.store().${e}`;
        }
      }
    ]
  },
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox", "radio"]),
  // bypassExpressionFunctionCreation: () => true,
  onLoad: (t) => {
    const { el: e, expression: n } = t, s = t.expressionFn(t), r = e.tagName.toLowerCase();
    if (n.startsWith("ctx.store().ctx.store()"))
      throw new Error(`Model attribute on #${e.id} must have a signal name, you probably prefixed with $ by accident`);
    const o = r.includes("input"), i = r.includes("select"), d = r.includes("textarea"), c = e.getAttribute("type"), p = r.includes("checkbox") || o && c === "checkbox", l = r.includes("radio") || o && c === "radio", f = o && c === "file";
    if (!o && !i && !d && !p && !l)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const a = n.replaceAll("ctx.store().", "");
    l && (e.getAttribute("name")?.length || e.setAttribute("name", a));
    const m = () => {
      if (!s)
        throw new Error(`Signal ${a} not found`);
      const u = "value" in e, v = s.value;
      if (p || l) {
        const b = e;
        p ? b.checked = v : l && (b.checked = `${v}` === b.value);
      } else
        f || (u ? e.value = `${v}` : e.setAttribute("value", `${v}`));
    }, w = t.reactivity.effect(m), g = async () => {
      if (f) {
        const b = [...e?.files || []], y = [], T = [], R = [];
        await Promise.all(
          b.map((Q) => new Promise((de) => {
            const D = new FileReader();
            D.onload = () => {
              if (typeof D.result != "string")
                throw new Error(`Invalid result type: ${typeof D.result}`);
              const j = D.result.match(Ct);
              if (!j?.groups)
                throw new Error(`Invalid data URI: ${D.result}`);
              y.push(j.groups.contents), T.push(j.groups.mime), R.push(Q.name);
            }, D.onloadend = () => de(void 0), D.readAsDataURL(Q);
          }))
        ), s.value = y;
        const M = t.store(), C = `${a}Mimes`, F = `${a}Names`;
        C in M && (M[`${C}`].value = T), F in M && (M[`${F}`].value = R);
        return;
      }
      const u = s.value, v = e;
      if (typeof u == "number")
        s.value = Number(v.value);
      else if (typeof u == "string")
        s.value = v.value;
      else if (typeof u == "boolean")
        p ? s.value = v.checked : s.value = !!v.value;
      else if (!(typeof u > "u"))
        if (typeof u == "bigint")
          s.value = BigInt(v.value);
        else
          throw console.log(typeof u), new Error("Unsupported type");
    }, h = e.tagName.split("-");
    if (h.length > 1) {
      const u = h[0].toLowerCase();
      ee.forEach((v) => {
        ee.push(`${u}-${v}`);
      });
    }
    return ee.forEach((u) => e.addEventListener(u, g)), () => {
      w(), ee.forEach((u) => e.removeEventListener(u, g));
    };
  }
}, xt = {
  prefix: "text",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { el: e, expressionFn: n } = t;
    if (!(e instanceof HTMLElement))
      throw new Error("Element is not HTMLElement");
    return t.reactivity.effect(() => {
      const s = n(t);
      e.textContent = `${s}`;
    });
  }
};
let Oe = "";
const Ht = /* @__PURE__ */ new Set(["window", "once", "passive", "capture", "debounce", "throttle", "remote", "outside"]), Ft = {
  prefix: "on",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  argumentNames: ["evt"],
  onLoad: (t) => {
    const { el: e, key: n, expressionFn: s } = t;
    let r = t.el;
    t.modifiers.get("window") && (r = window);
    let o = (f) => {
      N("plugin", "event", n, r, "triggered"), s(t, f);
    };
    const i = t.modifiers.get("debounce");
    if (i) {
      const f = _e(i), a = te(i, "leading", !1), m = te(i, "noTrail", !0);
      o = Bt(o, f, a, m);
    }
    const d = t.modifiers.get("throttle");
    if (d) {
      const f = _e(d), a = te(d, "noLead", !0), m = te(d, "noTrail", !1);
      o = Ut(o, f, a, m);
    }
    const c = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (c.capture = !1), t.modifiers.has("passive") && (c.passive = !0), t.modifiers.has("once") && (c.once = !0), [...t.modifiers.keys()].filter((f) => !Ht.has(f)).forEach((f) => {
      const a = t.modifiers.get(f) || [], m = o;
      o = () => {
        const g = event, h = g[f];
        let E;
        if (typeof h == "function")
          E = h(...a);
        else if (typeof h == "boolean")
          E = h;
        else if (typeof h == "string") {
          const u = h.toLowerCase().trim(), v = a.join("").toLowerCase().trim();
          E = u === v;
        } else {
          const u = `Invalid value for ${f} modifier on ${n} on ${e}`;
          console.error(u);
          debugger;
          throw new Error(u);
        }
        E && m(g);
      };
    });
    const l = ct(n).toLowerCase();
    switch (l) {
      case "load":
        return o(), delete t.el.dataset.onLoad, () => {
        };
      case "raf":
        let f;
        const a = () => {
          o(), f = requestAnimationFrame(a);
        };
        return f = requestAnimationFrame(a), () => {
          f && cancelAnimationFrame(f);
        };
      case "store-change":
        return t.reactivity.effect(() => {
          let g = t.store().value;
          t.modifiers.has("remote") && (g = fe(g));
          const h = JSON.stringify(g);
          Oe !== h && (Oe = h, o());
        });
      default:
        if (t.modifiers.has("outside")) {
          r = document;
          const w = o;
          let g = !1;
          o = (E) => {
            const u = E?.target;
            if (!u)
              return;
            const v = e.id === u.id;
            v && g && (g = !1), !v && !g && (w(E), g = !0);
          };
        }
        return r.addEventListener(l, o, c), () => {
          r.removeEventListener(l, o);
        };
    }
  }
};
function fe(t) {
  const e = {};
  for (const [n, s] of Object.entries(t))
    n.startsWith("_") || (typeof s == "object" && !Array.isArray(s) ? e[n] = fe(s) : e[n] = s);
  return e;
}
const Vt = [
  Rt,
  Dt,
  xt,
  Ft
], jt = {
  remote: async (t) => fe(t.store().value)
};
function _e(t) {
  if (!t || t?.length === 0)
    return 0;
  for (const e of t) {
    if (e.endsWith("ms"))
      return Number(e.replace("ms", ""));
    if (e.endsWith("s"))
      return Number(e.replace("s", "")) * 1e3;
    try {
      return parseFloat(e);
    } catch {
    }
  }
  return 0;
}
function te(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function Bt(t, e, n = !1, s = !0) {
  let r;
  const o = () => r && clearTimeout(r);
  return function(...d) {
    o(), n && !r && t(...d), r = setTimeout(() => {
      s && t(...d), o();
    }, e);
  };
}
function Ut(t, e, n = !0, s = !1) {
  let r = !1;
  return function(...i) {
    r || (n && t(...i), r = !0, setTimeout(() => {
      r = !1, s && t(...i);
    }, e));
  };
}
function Wt(t, {
  signal: e,
  headers: n,
  onopen: s,
  onmessage: r,
  onclose: o,
  onerror: i,
  openWhenHidden: d,
  ...c
}) {
  return new Promise((p, l) => {
    let f = 0;
    const a = { ...n };
    a.accept || (a.accept = Se);
    let m;
    function w() {
      m.abort(), document.hidden || v();
    }
    d || document.addEventListener("visibilitychange", w);
    let g = Ie, h = 0;
    function E() {
      document.removeEventListener("visibilitychange", w), window.clearTimeout(h), m.abort();
    }
    e?.addEventListener("abort", () => {
      E(), p();
    });
    const u = s ?? Gt;
    async function v() {
      m = new AbortController();
      try {
        const b = await fetch(t, {
          ...c,
          headers: a,
          signal: m.signal
        });
        await u(b), await Kt(
          b.body,
          Yt(
            zt(
              (y) => {
                y ? a[Re] = y : delete a[Re];
              },
              (y) => {
                g = y;
              },
              r
            )
          )
        ), o?.(), E(), p();
      } catch (b) {
        if (!m.signal.aborted)
          try {
            const y = i?.(b) ?? g;
            window.clearTimeout(h), h = window.setTimeout(v, y), g *= 1.5, g = Math.min(g, qt), f++, f >= Jt ? (E(), l(new Error("Max retries hit, check your server or network connection."))) : console.error(`Error fetching event source, retrying in ${y}ms`);
          } catch (y) {
            E(), l(y);
          }
      }
    }
    g = Ie, v();
  });
}
const Se = "text/event-stream", Ie = 100, qt = 1e4, Jt = 10, Re = "last-event-id";
function Gt(t) {
  const e = t.headers.get("content-type");
  if (!e?.startsWith(Se))
    throw new Error(`Expected content-type to be ${Se}, Actual: ${e}`);
}
async function Kt(t, e) {
  const n = t.getReader();
  for (; ; ) {
    const s = await n.read();
    if (s.done)
      break;
    e(s.value);
  }
}
function Yt(t) {
  let e, n, s, r = !1;
  return function(i) {
    e === void 0 ? (e = i, n = 0, s = -1) : e = Zt(e, i);
    const d = e.length;
    let c = 0;
    for (; n < d; ) {
      r && (e[n] === 10 && (c = ++n), r = !1);
      let p = -1;
      for (; n < d && p === -1; ++n)
        switch (e[n]) {
          case 58:
            s === -1 && (s = n - c);
            break;
          case 13:
            r = !0;
          case 10:
            p = n;
            break;
        }
      if (p === -1)
        break;
      t(e.subarray(c, p), s), c = n, s = -1;
    }
    c === d ? e = void 0 : c !== 0 && (e = e.subarray(c), n -= c);
  };
}
function zt(t, e, n) {
  let s = Ce();
  const r = new TextDecoder();
  return function(i, d) {
    if (i.length === 0)
      n?.(s), s = Ce();
    else if (d > 0) {
      const c = r.decode(i.subarray(0, d)), p = d + (i[d + 1] === 32 ? 2 : 1), l = r.decode(i.subarray(p));
      switch (c) {
        case "data":
          s.data = s.data ? s.data + `
` + l : l;
          break;
        case "event":
          s.event = l;
          break;
        case "id":
          t(s.id = l);
          break;
        case "retry":
          const f = parseInt(l, 10);
          isNaN(f) || e(s.retry = f);
          break;
      }
    }
  };
}
function Zt(t, e) {
  const n = new Uint8Array(t.length + e.length);
  return n.set(t), n.set(e, t.length), n;
}
function Ce() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const re = /* @__PURE__ */ new WeakSet();
function Xt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let s;
  typeof e == "string" ? s = sn(e) : s = e;
  const r = rn(s), o = en(t, r, n);
  return ut(t, r, o);
}
function ut(t, e, n) {
  if (n.head.block) {
    const s = t.querySelector("head"), r = e.querySelector("head");
    if (s && r) {
      const o = dt(r, s, n);
      Promise.all(o).then(() => {
        ut(
          t,
          e,
          Object.assign(n, {
            head: {
              block: !1,
              ignore: !0
            }
          })
        );
      });
      return;
    }
  }
  if (n.morphStyle === "innerHTML")
    return ft(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const s = an(e, t, n);
    if (!s)
      throw new Error("Could not find best match");
    const r = s?.previousSibling, o = s?.nextSibling, i = oe(t, s, n);
    return s ? on(r, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function oe(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (ae(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? dt(e, t, n) : (Qt(e, t), ft(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function ft(t, e, n) {
  let s = t.firstChild, r = e.firstChild, o;
  for (; s; ) {
    if (o = s, s = o.nextSibling, r == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), V(n, o);
      continue;
    }
    if (ht(o, r, n)) {
      oe(r, o, n), r = r.nextSibling, V(n, o);
      continue;
    }
    let i = tn(t, e, o, r, n);
    if (i) {
      r = De(r, i, n), oe(i, o, n), V(n, o);
      continue;
    }
    let d = nn(t, o, r, n);
    if (d) {
      r = De(r, d, n), oe(d, o, n), V(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, r), n.callbacks.afterNodeAdded(o), V(n, o);
  }
  for (; r !== null; ) {
    let i = r;
    r = r.nextSibling, pt(i, n);
  }
}
function Qt(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const s of t.attributes)
      e.getAttribute(s.name) !== s.value && e.setAttribute(s.name, s.value);
    for (const s of e.attributes)
      t.hasAttribute(s.name) || e.removeAttribute(s.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", ne(t, e, "value"), ne(t, e, "checked"), ne(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    ne(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const s = t.value, r = e.value;
    s !== r && (e.value = s), e.firstChild && e.firstChild.nodeValue !== s && (e.firstChild.nodeValue = s);
  }
}
function ne(t, e, n) {
  const s = t.getAttribute(n), r = e.getAttribute(n);
  s !== r && (s ? e.setAttribute(n, s) : e.removeAttribute(n));
}
function dt(t, e, n) {
  const s = [], r = [], o = [], i = [], d = n.head.style, c = /* @__PURE__ */ new Map();
  for (const l of t.children)
    c.set(l.outerHTML, l);
  for (const l of e.children) {
    let f = c.has(l.outerHTML), a = n.head.shouldReAppend(l), m = n.head.shouldPreserve(l);
    f || m ? a ? r.push(l) : (c.delete(l.outerHTML), o.push(l)) : d === "append" ? a && (r.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && r.push(l);
  }
  i.push(...c.values());
  const p = [];
  for (const l of i) {
    const f = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!f)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (n.callbacks.beforeNodeAdded(f)) {
      if (f.hasAttribute("href") || f.hasAttribute("src")) {
        let a;
        const m = new Promise((w) => {
          a = w;
        });
        f.addEventListener("load", function() {
          a(void 0);
        }), p.push(m);
      }
      e.appendChild(f), n.callbacks.afterNodeAdded(f), s.push(f);
    }
  }
  for (const l of r)
    n.callbacks.beforeNodeRemoved(l) !== !1 && (e.removeChild(l), n.callbacks.afterNodeRemoved(l));
  return n.head.afterHeadMorphed(e, {
    added: s,
    kept: o,
    removed: r
  }), p;
}
function x() {
}
function en(t, e, n) {
  return {
    target: t,
    newContent: e,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: fn(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: x,
        afterNodeAdded: x,
        beforeNodeMorphed: x,
        afterNodeMorphed: x,
        beforeNodeRemoved: x,
        afterNodeRemoved: x
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (s) => s.getAttribute("im-preserve") === "true",
        shouldReAppend: (s) => s.getAttribute("im-re-append") === "true",
        shouldRemove: x,
        afterHeadMorphed: x
      },
      n.head
    )
  };
}
function ht(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : z(n, t, e) > 0 : !1;
}
function ae(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function De(t, e, n) {
  for (; t !== e; ) {
    const s = t;
    if (t = t?.nextSibling, !s)
      throw new Error("tempNode is null");
    pt(s, n);
  }
  return V(n, e), e.nextSibling;
}
function tn(t, e, n, s, r) {
  const o = z(r, n, e);
  let i = null;
  if (o > 0) {
    i = s;
    let d = 0;
    for (; i != null; ) {
      if (ht(n, i, r))
        return i;
      if (d += z(r, i, t), d > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function nn(t, e, n, s) {
  let r = n, o = e.nextSibling, i = 0;
  for (; r && o; ) {
    if (z(s, r, t) > 0)
      return null;
    if (ae(e, r))
      return r;
    if (ae(o, r) && (i++, o = o.nextSibling, i >= 2))
      return null;
    r = r.nextSibling;
  }
  return r;
}
const xe = new DOMParser();
function sn(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = xe.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return re.add(n), n;
    {
      let s = n.firstChild;
      return s ? (re.add(s), s) : null;
    }
  } else {
    const s = xe.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!s)
      throw new Error("content is null");
    return re.add(s), s;
  }
}
function rn(t) {
  if (t == null)
    return document.createElement("div");
  if (re.has(t))
    return t;
  if (t instanceof Node) {
    const e = document.createElement("div");
    return e.append(t), e;
  } else {
    const e = document.createElement("div");
    for (const n of [...t])
      e.append(n);
    return e;
  }
}
function on(t, e, n) {
  const s = [], r = [];
  for (; t; )
    s.push(t), t = t.previousSibling;
  for (; s.length > 0; ) {
    const o = s.pop();
    r.push(o), e?.parentElement?.insertBefore(o, e);
  }
  for (r.push(e); n; )
    s.push(n), r.push(n), n = n.nextSibling;
  for (; s.length; )
    e?.parentElement?.insertBefore(s.pop(), e.nextSibling);
  return r;
}
function an(t, e, n) {
  let s = t.firstChild, r = s, o = 0;
  for (; s; ) {
    let i = ln(s, e, n);
    i > o && (r = s, o = i), s = s.nextSibling;
  }
  return r;
}
function ln(t, e, n) {
  return ae(t, e) ? 0.5 + z(n, t, e) : 0;
}
function pt(t, e) {
  V(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function cn(t, e) {
  return !t.deadIds.has(e);
}
function un(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function V(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const s of n)
      t.deadIds.add(s);
}
function z(t, e, n) {
  const s = t.idMap.get(e);
  if (!s)
    return 0;
  let r = 0;
  for (const o of s)
    cn(t, o) && un(t, o, n) && ++r;
  return r;
}
function He(t, e) {
  const n = t.parentElement, s = t.querySelectorAll("[id]");
  for (const r of s) {
    let o = r;
    for (; o !== n && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(r.id), o = o.parentElement;
    }
  }
}
function fn(t, e) {
  const n = /* @__PURE__ */ new Map();
  return He(t, n), He(e, n), n;
}
const me = "display", Fe = "none", ge = "important", Ve = "duration", dn = "show", ve = `${L}showing`, be = `${L}hiding`, je = `${L}show-transition-style`, hn = {
  prefix: dn,
  allowedModifiers: /* @__PURE__ */ new Set([ge, Ve]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: s, reactivity: r } = t, i = n.has(ge) ? ge : void 0;
    let d, c;
    const p = t.modifiers.get(Ve);
    if (p) {
      let l = document.getElementById(je);
      if (!l) {
        l = document.createElement("style"), l.id = je, document.head.appendChild(l);
        const a = _e(p) || "300";
        l.innerHTML = `
          .${ve} {
            visibility: visible;
            transition: opacity ${a}ms linear;
          }
          .${be} {
            visibility: hidden;
            transition: visibility 0s ${a}ms, opacity ${a}ms linear;
          }
        `;
      }
      const f = (a) => (m) => {
        m.target === e && (e.classList.remove(a), e.removeEventListener("transitionend", f(a)));
      };
      d = () => {
        e.addEventListener("transitionend", f(ve)), e.classList.add(ve), requestAnimationFrame(() => {
          e.style.setProperty("opacity", "1", i);
        });
      }, c = () => {
        e.addEventListener("transitionend", f(be)), e.classList.add(be), requestAnimationFrame(() => {
          e.style.setProperty("opacity", "0", i);
        });
      };
    } else
      d = () => {
        e.style.length === 1 && e.style.display === Fe ? e.style.removeProperty(me) : e.style.setProperty(me, "", i);
      }, c = () => {
        e.style.setProperty(me, Fe, i);
      };
    return r.effect(async () => {
      !!await s(t) ? d() : c();
    });
  }
}, pn = "intersects", Be = "once", Ue = "half", We = "full", mn = {
  prefix: pn,
  allowedModifiers: /* @__PURE__ */ new Set([Be, Ue, We]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(We) ? n.threshold = 1 : e.has(Ue) && (n.threshold = 0.5);
    const s = new IntersectionObserver((r) => {
      r.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Be) && (s.disconnect(), delete t.el.dataset[t.rawKey]));
      });
    }, n);
    return s.observe(t.el), () => s.disconnect();
  }
}, qe = "prepend", Je = "append", Ge = new Error("Target element must have a parent if using prepend or append"), gn = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([qe, Je]),
  allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, modifiers: n, expression: s } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error("el must be a template element");
    const r = document.querySelector(s);
    if (!r)
      throw new Error(`Target element not found: ${s}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const o = e.content.cloneNode(!0);
    if (Ze(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(qe)) {
      if (!r.parentNode)
        throw Ge;
      r.parentNode.insertBefore(o, r);
    } else if (n.has(Je)) {
      if (!r.parentNode)
        throw Ge;
      r.parentNode.insertBefore(o, r.nextSibling);
    } else
      r.appendChild(o);
  }
}, vn = {
  prefix: "scrollIntoView",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set([
    "smooth",
    "instant",
    "auto",
    "hstart",
    "hcenter",
    "hend",
    "hnearest",
    "vstart",
    "vcenter",
    "vend",
    "vnearest",
    "focus"
  ]),
  onLoad: ({ el: t, modifiers: e, rawKey: n }) => {
    t.tabIndex || t.setAttribute("tabindex", "0");
    const s = {
      behavior: "smooth",
      block: "center",
      inline: "center"
    };
    return e.has("smooth") && (s.behavior = "smooth"), e.has("instant") && (s.behavior = "instant"), e.has("auto") && (s.behavior = "auto"), e.has("hstart") && (s.inline = "start"), e.has("hcenter") && (s.inline = "center"), e.has("hend") && (s.inline = "end"), e.has("hnearest") && (s.inline = "nearest"), e.has("vstart") && (s.block = "start"), e.has("vcenter") && (s.block = "center"), e.has("vend") && (s.block = "end"), e.has("vnearest") && (s.block = "nearest"), vt(t, s, e.has("focus")), delete t.dataset[n], () => {
    };
  }
}, mt = document, gt = !!mt.startViewTransition, bn = {
  prefix: "viewTransition",
  onGlobalInit() {
    let t = !1;
    if (document.head.childNodes.forEach((e) => {
      e instanceof HTMLMetaElement && e.name === "view-transition" && (t = !0);
    }), !t) {
      const e = document.createElement("meta");
      e.name = "view-transition", e.content = "same-origin", document.head.appendChild(e);
    }
  },
  onLoad: (t) => {
    if (!gt) {
      console.error("Browser does not support view transitions");
      return;
    }
    return t.reactivity.effect(() => {
      const { el: e, expressionFn: n } = t;
      let s = n(t);
      if (!s)
        return;
      const r = e.style;
      r.viewTransitionName = s;
    });
  }
}, yn = [
  hn,
  mn,
  gn,
  vn,
  bn
], wn = {
  scroll: async (t, e, n) => {
    const s = Object.assign(
      { behavior: "smooth", vertical: "center", horizontal: "center", shouldFocus: !0 },
      n
    ), r = document.querySelector(e);
    vt(r, s);
  }
};
function vt(t, e, n = !0) {
  if (!(t instanceof HTMLElement || t instanceof SVGElement))
    throw new Error("Element not found");
  t.tabIndex || t.setAttribute("tabindex", "0"), t.scrollIntoView(e), n && t.focus();
}
const En = "Content-Type", _n = `${B}-request`, Sn = "application/json", Tn = "true", An = `${L}fragment`, Nn = `${L}signal`, kn = `${L}delete`, Ln = `${L}redirect`, Mn = `${L}console`, Z = `${L}indicator`, Te = `${Z}-loading`, Ke = `${L}settling`, se = `${L}swapping`, $n = "self", Pn = "get", On = "post", In = "put", Rn = "patch", Cn = "delete", O = {
  MorphElement: "morph",
  InnerElement: "inner",
  OuterElement: "outer",
  PrependElement: "prepend",
  AppendElement: "append",
  BeforeElement: "before",
  AfterElement: "after",
  UpsertAttributes: "upsert_attributes"
}, Dn = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${Z}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${Te} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`, document.head.appendChild(t);
  },
  onLoad: (t) => t.reactivity.effect(() => {
    t.upsertIfMissingFromStore("_dsPlugins.fetch.indicatorElements", {}), t.upsertIfMissingFromStore("_dsPlugins.fetch.indicatorsVisible", []);
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`), n = t.store(), s = document.querySelectorAll(e.value);
    if (s.length === 0)
      throw new Error("No indicator found");
    return s.forEach((r) => {
      r.classList.add(Z);
    }), n._dsPlugins.fetch.indicatorElements[t.el.id] = t.reactivity.signal(s), () => {
      delete n._dsPlugins.fetch.indicatorElements[t.el.id];
    };
  })
}, xn = [Dn];
async function Hn(t, e, n, s = !0) {
  const r = n.store();
  if (!e)
    throw new Error(`No signal for ${t} on ${e}`);
  let o = { ...r.value };
  s && (o = fe(o));
  const i = JSON.stringify(o), d = n.el;
  N(
    "plugin",
    "backend",
    "fetch_start",
    d,
    JSON.stringify({ method: t, urlExpression: e, onlyRemote: s, storeJSON: i })
  );
  const c = r?._dsPlugins?.fetch?.indicatorElements ? r._dsPlugins.fetch.indicatorElements[d.id]?.value || [] : [], p = r?._dsPlugins.fetch?.indicatorsVisible;
  c?.forEach && c.forEach((a) => {
    if (!a || !p)
      return;
    const m = p.value.findIndex((w) => w ? a.isSameNode(w.el) : !1);
    if (m > -1) {
      const w = p.value[m], g = [...p.value];
      delete g[m], p.value = [
        ...g.filter((h) => !!h),
        { el: a, count: w.count + 1 }
      ];
    } else
      a.classList.remove(Z), a.classList.add(Te), p.value = [...p.value, { el: a, count: 1 }];
  });
  const l = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const f = {
    method: t,
    headers: {
      [En]: Sn,
      [_n]: Tn
    },
    onmessage: (a) => {
      if (a.event) {
        if (!a.event.startsWith(L)) {
          console.log(`Unknown event: ${a.event}`);
          debugger;
        }
      } else
        return;
      switch (a.event) {
        case An:
          const m = a.data.trim().split(`
`), w = ["selector", "merge", "settle", "fragment", "vt"];
          let g = "", h = "morph", E = !1, u = "", v = 500, b = !0, y = "";
          for (let k = 0; k < m.length; k++) {
            let A = m[k];
            if (!A?.length)
              continue;
            const P = A.split(" ", 1)[0];
            if (w.includes(P) && P !== y)
              switch (y = P, A = A.slice(P.length + 1), y) {
                case "selector":
                  u = A;
                  break;
                case "merge":
                  if (h = A, E = Object.values(O).includes(h), !E)
                    throw new Error(`Unknown merge option: ${h}`);
                  break;
                case "settle":
                  v = parseInt(A);
                  break;
                case "fragment":
                  break;
                case "vt":
                  b = A === "true";
                  break;
                default:
                  throw new Error("Unknown data type");
              }
            y === "fragment" && (g += A + `
`);
          }
          g?.length || (g = "<div></div>"), Fn(n, u, h, g, v, b), N(
            "plugin",
            "backend",
            "merge",
            u,
            JSON.stringify({ fragment: g, settleTime: v, useViewTransition: b })
          );
          break;
        case Nn:
          let T = !1, R = "";
          const M = a.data.trim().split(`
`);
          for (let k = 0; k < M.length; k++) {
            const A = M[k], [P, ...Pe] = A.split(" ", 1), pe = Pe.join(" ");
            switch (P) {
              case "onlyIfMissing":
                T = pe.trim() === "true";
                break;
              case "store":
                R += `${pe}
`;
                break;
              default:
                throw new Error(`Unknown signal type: ${P}`);
            }
          }
          const C = ` return Object.assign({...ctx.store()}, ${R})`;
          try {
            const A = new Function("ctx", C)(n), P = lt(n.store(), A, T);
            n.mergeStore(P), n.applyPlugins(document.body);
          } catch (k) {
            console.log(C), console.error(k);
            debugger;
          }
          break;
        case kn:
          const [F, ...Q] = a.data.trim().split(" ");
          if (F !== "selector")
            throw new Error(`Unknown delete prefix: ${F}`);
          const de = Q.join(" ");
          document.querySelectorAll(de).forEach((k) => k.remove());
          break;
        case Ln:
          const [j, Me] = a.data.trim();
          if (j !== "selector")
            throw new Error(`Unknown redirect selector: ${j}`);
          N("plugin", "backend", "redirect", "WINDOW", Me), window.location.href = Me;
          break;
        case Mn:
          const [he, $e] = a.data.trim();
          switch (he) {
            case "log":
            case "warn":
            case "info":
            case "debug":
            case "group":
            case "groupEnd":
              console[he]($e);
              break;
            default:
              throw new Error(`Unknown console mode: '${he}', message: '${$e}'`);
          }
      }
    },
    onerror: (a) => {
      console.error(a);
    },
    onclose: () => {
      try {
        const a = n.store(), m = a?._dsPlugins?.fetch?.indicatorsVisible || [], w = a?._dsPlugins?.fetch?.indicatorElements ? a._dsPlugins.fetch.indicatorElements[d.id]?.value || [] : [], g = [];
        w?.forEach && w.forEach((h) => {
          if (!h || !m)
            return;
          const E = m.value, u = E.findIndex((b) => b ? h.isSameNode(b.el) : !1), v = E[u];
          v && (v.count < 2 ? (g.push(
            new Promise(
              () => setTimeout(() => {
                h.classList.remove(Te), h.classList.add(Z);
              }, 300)
            )
          ), delete E[u]) : u > -1 && (E[u].count = E[u].count - 1), m.value = E.filter((b) => !!b));
        }), Promise.all(g);
      } catch (a) {
        console.error(a);
        debugger;
      } finally {
        N("plugin", "backend", "fetch_end", d, JSON.stringify({ method: t, urlExpression: e }));
      }
    }
  };
  if (t === "GET") {
    const a = new URLSearchParams(l.search);
    a.append("datastar", i), l.search = a.toString();
  } else
    f.body = i;
  Wt(l, f);
}
const Ye = document.createElement("template");
function Fn(t, e, n, s, r, o) {
  const { el: i } = t;
  Ye.innerHTML = s.trim(), [...Ye.content.children].forEach((c) => {
    if (!(c instanceof Element))
      throw new Error("No fragment found");
    const p = (m) => {
      for (const w of m) {
        w.classList.add(se);
        const g = w.outerHTML;
        let h = w;
        switch (n) {
          case O.MorphElement:
            const u = Xt(h, c, {
              callbacks: {
                beforeNodeRemoved: (b, y) => (t.cleanupElementRemovals(b), !0)
              }
            });
            if (!u?.length)
              throw new Error("No morph result");
            h = u[0];
            break;
          case O.InnerElement:
            h.innerHTML = c.innerHTML;
            break;
          case O.OuterElement:
            h.replaceWith(c);
            break;
          case O.PrependElement:
            h.prepend(c);
            break;
          case O.AppendElement:
            h.append(c);
            break;
          case O.BeforeElement:
            h.before(c);
            break;
          case O.AfterElement:
            h.after(c);
            break;
          case O.UpsertAttributes:
            c.getAttributeNames().forEach((b) => {
              const y = c.getAttribute(b);
              h.setAttribute(b, y);
            });
            break;
          default:
            throw new Error(`Unknown merge type: ${n}`);
        }
        t.cleanupElementRemovals(h), h.classList.add(se), t.applyPlugins(document.body), setTimeout(() => {
          w.classList.remove(se), h.classList.remove(se);
        }, r);
        const E = h.outerHTML;
        g !== E && (h.classList.add(Ke), setTimeout(() => {
          h.classList.remove(Ke);
        }, r));
      }
    }, l = e === $n;
    let f;
    if (l)
      f = [i];
    else {
      const m = e || `#${c.getAttribute("id")}`;
      if (f = document.querySelectorAll(m) || [], !f)
        throw new Error(`No targets found for ${m}`);
    }
    const a = [...f];
    if (!a.length)
      throw new Error(`No targets found for ${e}`);
    gt && o ? mt.startViewTransition(() => p(a)) : p(a);
  });
}
const Vn = [Pn, On, In, Rn, Cn].reduce(
  (t, e) => (t[e] = (n, s, r) => {
    const o = ["true", !0, void 0].includes(r);
    Hn(e, s, n, o);
  }, t),
  {
    isFetching: (t, e) => {
      const n = [...document.querySelectorAll(e)], r = t.store()?._dsPlugins?.fetch.indicatorsVisible?.value || [];
      return n.length ? n.some((o) => r.filter((i) => !!i).some((i) => i.el.isSameNode(o) && i.count > 0)) : !1;
    }
  }
), ze = "0.18.13", Le = (t, e, n, s, r, o) => (e - n) / (s - n) * (o - r) + r, jn = (t, e, n, s, r, o) => Math.round(Le(t, e, n, s, r, o)), bt = (t, e, n, s, r, o) => Math.max(r, Math.min(o, Le(t, e, n, s, r, o))), Bn = (t, e, n, s, r, o) => Math.round(bt(t, e, n, s, r, o)), Un = {
  setAll: (t, e, n) => {
    const s = new RegExp(e);
    t.walkSignals((r, o) => s.test(r) && (o.value = n));
  },
  toggleAll: (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((s, r) => n.test(s) && (r.value = !r.value));
  },
  clipboard: (t, e) => {
    if (!navigator.clipboard)
      throw new Error("Clipboard API not available");
    navigator.clipboard.writeText(e);
  },
  fit: Le,
  fitInt: jn,
  clampFit: bt,
  clampFitInt: Bn
};
function Wn(t = {}, ...e) {
  const n = new It(t, ...e);
  return n.run(), n;
}
function qn(t = {}, ...e) {
  const n = Object.assign(
    {},
    Un,
    jt,
    Vn,
    wn,
    t
  ), s = [...xn, ...yn, ...Vt, ...e];
  return Wn(n, ...s);
}
const Jn = {
  bubbles: !0,
  cancelable: !0,
  composed: !0
}, Ae = window, N = (t, e, n, s, r, o = Jn) => {
  Ae.dispatchEvent(
    new CustomEvent(
      q,
      Object.assign(
        {
          detail: {
            time: /* @__PURE__ */ new Date(),
            category: t,
            subcategory: e,
            type: n,
            target: at(s),
            message: r
          }
        },
        o
      )
    )
  );
};
Ae.ds || setTimeout(() => {
  N("core", "init", "start", document.body, `Datastar v${ze} loading`);
  const t = performance.now();
  Ae.ds = qn();
  const e = performance.now();
  N(
    "core",
    "init",
    "end",
    document.body,
    `Datastar v${ze} loaded and attached to all DOM elements in ${(e - t).toFixed(2)}ms`
  );
  const n = document.createElement("style");
  n.innerHTML = `
.datastar-inspector-highlight {
 border: 2px solid blue;
}
`, document.head.appendChild(n), window.addEventListener("datastar-inspector-event", (s) => {
    if ("detail" in s && typeof s.detail == "object" && s.detail) {
      const { detail: r } = s;
      if ("script" in r && typeof r.script == "string")
        try {
          new Function(r.script)();
        } catch (o) {
          console.error(o);
        }
    }
  });
}, 0);
export {
  jt as AttributeActions,
  Vt as AttributePlugins,
  Vn as BackendActions,
  xn as BackendPlugins,
  Rt as BindAttributePlugin,
  Ot as CorePlugins,
  Mt as CorePreprocessors,
  L as DATASTAR_CLASS_PREFIX,
  B as DATASTAR_STR,
  It as Datastar,
  Ft as EventPlugin,
  Dn as FetchIndicatorPlugin,
  mn as IntersectionPlugin,
  vn as ScrollIntoViewPlugin,
  hn as ShowPlugin,
  gn as TeleportPlugin,
  xt as TextPlugin,
  Dt as TwoWayBindingModelPlugin,
  bn as ViewTransitionPlugin,
  wn as VisibilityActions,
  yn as VisibilityPlugins,
  it as apply,
  te as argsHas,
  _e as argsToMs,
  q as datastarEventName,
  mt as docWithViewTransitionAPI,
  at as elemToSelector,
  Fn as mergeHTMLFragment,
  fe as remoteSignals,
  Wn as runDatastarWith,
  qn as runDatastarWithAllPlugins,
  N as sendDatastarEvent,
  lt as storeFromPossibleContents,
  gt as supportsViewTransitions,
  Ze as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
