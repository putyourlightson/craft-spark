function ze(t) {
    return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}

function ue() {
    throw new Error("Cycle detected");
}

function Et() {
    throw new Error("Computed cannot have side-effects");
}

const _t = Symbol.for("preact-signals"), O = 1, B = 2, Y = 4, W = 8, J = 16,
    H = 32;

function fe() {
    G++;
}

function de() {
    if (G > 1) {
        G--;
        return;
    }
    let t, e = !1;
    for (; K !== void 0;) {
        let s = K;
        for (K = void 0, we++; s !== void 0;) {
            const n = s._nextBatchedEffect;
            if (s._nextBatchedEffect = void 0, s._flags &= ~B, !(s._flags & W) && Qe(s)) {
                try {
                    s._callback();
                }
                catch (r) {
                    e || (t = r, e = !0);
                }
            }
            s = n;
        }
    }
    if (we = 0, G--, e) {
        throw t;
    }
}

function St(t) {
    if (G > 0) {
        return t();
    }
    fe();
    try {
        return t();
    }
    finally {
        de();
    }
}

let _, K, G = 0, we = 0, le = 0;

function Ze(t) {
    if (_ === void 0) {
        return;
    }
    let e = t._node;
    if (e === void 0 || e._target !== _) {
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
    }
    if (e._version === -1) {
        return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = _._sources, e._nextSource = void 0, _._sources._nextSource = e, _._sources = e), e;
    }
}

function T(t) {
    this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}

T.prototype.brand = _t;
T.prototype._refresh = function() {
    return !0;
};
T.prototype._subscribe = function(t) {
    this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
T.prototype._unsubscribe = function(t) {
    if (this._targets !== void 0) {
        const e = t._prevTarget, s = t._nextTarget;
        e !== void 0 && (e._nextTarget = s, t._prevTarget = void 0), s !== void 0 && (s._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = s);
    }
};
T.prototype.subscribe = function(t) {
    const e = this;
    return nt(function() {
        const s = e.value, n = this._flags & H;
        this._flags &= ~H;
        try {
            t(s);
        }
        finally {
            this._flags |= n;
        }
    });
};
T.prototype.valueOf = function() {
    return this.value;
};
T.prototype.toString = function() {
    return this.value + "";
};
T.prototype.toJSON = function() {
    return this.value;
};
T.prototype.peek = function() {
    return this._value;
};
Object.defineProperty(T.prototype, "value", {
    get() {
        const t = Ze(this);
        return t !== void 0 && (t._version = this._version), this._value;
    },
    set(t) {
        if (_ instanceof R && Et(), t !== this._value) {
            we > 100 && ue(), this._value = t, this._version++, le++, fe();
            try {
                for (let e = this._targets; e !== void 0; e = e._nextTarget) {
                    e._target._notify();
                }
            }
            finally {
                de();
            }
        }
    }
});

function Xe(t) {
    return new T(t);
}

function Qe(t) {
    for (let e = t._sources; e !== void 0; e = e._nextSource) {
        if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version) {
            return !0;
        }
    }
    return !1;
}

function et(t) {
    for (let e = t._sources; e !== void 0; e = e._nextSource) {
        const s = e._source._node;
        if (s !== void 0 && (e._rollbackNode = s), e._source._node = e, e._version = -1, e._nextSource === void 0) {
            t._sources = e;
            break;
        }
    }
}

function tt(t) {
    let e = t._sources, s;
    for (; e !== void 0;) {
        const n = e._prevSource;
        e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : s = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
    }
    t._sources = s;
}

function R(t) {
    T.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = le - 1, this._flags = Y;
}

R.prototype = new T();
R.prototype._refresh = function() {
    if (this._flags &= ~B, this._flags & O) {
        return !1;
    }
    if ((this._flags & (Y | H)) === H || (this._flags &= ~Y, this._globalVersion === le)) {
        return !0;
    }
    if (this._globalVersion = le, this._flags |= O, this._version > 0 && !Qe(this)) {
        return this._flags &= ~O, !0;
    }
    const t = _;
    try {
        et(this), _ = this;
        const e = this._compute();
        (this._flags & J || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~J, this._version++);
    }
    catch (e) {
        this._value = e, this._flags |= J, this._version++;
    }
    return _ = t, tt(this), this._flags &= ~O, !0;
};
R.prototype._subscribe = function(t) {
    if (this._targets === void 0) {
        this._flags |= Y | H;
        for (let e = this._sources; e !== void 0; e = e._nextSource) {
            e._source._subscribe(e);
        }
    }
    T.prototype._subscribe.call(this, t);
};
R.prototype._unsubscribe = function(t) {
    if (this._targets !== void 0 && (T.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
        this._flags &= ~H;
        for (let e = this._sources; e !== void 0; e = e._nextSource) {
            e._source._unsubscribe(e);
        }
    }
};
R.prototype._notify = function() {
    if (!(this._flags & B)) {
        this._flags |= Y | B;
        for (let t = this._targets; t !== void 0; t = t._nextTarget) {
            t._target._notify();
        }
    }
};
R.prototype.peek = function() {
    if (this._refresh() || ue(), this._flags & J) {
        throw this._value;
    }
    return this._value;
};
Object.defineProperty(R.prototype, "value", {
    get() {
        this._flags & O && ue();
        const t = Ze(this);
        if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & J) {
            throw this._value;
        }
        return this._value;
    }
});

function Tt(t) {
    return new R(t);
}

function st(t) {
    const e = t._cleanup;
    if (t._cleanup = void 0, typeof e == "function") {
        fe();
        const s = _;
        _ = void 0;
        try {
            e();
        }
        catch (n) {
            throw t._flags &= ~O, t._flags |= W, Ne(t), n;
        }
        finally {
            _ = s, de();
        }
    }
}

function Ne(t) {
    for (let e = t._sources; e !== void 0; e = e._nextSource) {
        e._source._unsubscribe(e);
    }
    t._compute = void 0, t._sources = void 0, st(t);
}

function At(t) {
    if (_ !== this) {
        throw new Error("Out-of-order effect");
    }
    tt(this), _ = t, this._flags &= ~O, this._flags & W && Ne(this), de();
}

function X(t) {
    this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = H;
}

X.prototype._callback = function() {
    const t = this._start();
    try {
        if (this._flags & W || this._compute === void 0) {
            return;
        }
        const e = this._compute();
        typeof e == "function" && (this._cleanup = e);
    }
    finally {
        t();
    }
};
X.prototype._start = function() {
    this._flags & O && ue(), this._flags |= O, this._flags &= ~W, st(this), et(this), fe();
    const t = _;
    return _ = this, At.bind(this, t);
};
X.prototype._notify = function() {
    this._flags & B || (this._flags |= B, this._nextBatchedEffect = K, K = this);
};
X.prototype._dispose = function() {
    this._flags |= W, this._flags & O || Ne(this);
};

function nt(t) {
    const e = new X(t);
    try {
        e._callback();
    }
    catch (s) {
        throw e._dispose(), s;
    }
    return e._dispose.bind(e);
}

class rt {
    get value() {
        return Ee(this);
    }

    set value(e) {
        St(() => Nt(this, e));
    }

    peek() {
        return Ee(this, {peek: !0});
    }
}

const oe = (t) => Object.assign(
        new rt(),
        Object.entries(t).reduce(
            (e, [s, n]) => {
                if (["value", "peek"].some((r) => r === s)) {
                    throw new Error(`${s} is a reserved property name`);
                }
                return typeof n != "object" || n === null || Array.isArray(n) ? e[s] = Xe(n) : e[s] = oe(n), e;
            },
            {}
        )
    ), Nt = (t, e) => Object.keys(e).forEach((s) => t[s].value = e[s]),
    Ee = (t, {peek: e = !1} = {}) => Object.entries(t).reduce(
        (s, [n, r]) => (r instanceof T ? s[n] = e ? r.peek() : r.value : r instanceof rt && (s[n] = Ee(r, {peek: e})), s),
        {}
    );

function ot(t, e) {
    if (typeof e != "object" || Array.isArray(e) || !e) {
        return e;
    }
    if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function") {
        return e.toJSON();
    }
    let s = t;
    return typeof t != "object" && (s = {...e}), Object.keys(e).forEach((n) => {
        s.hasOwnProperty(n) || (s[n] = e[n]), e[n] === null ? delete s[n] : s[n] = ot(s[n], e[n]);
    }), s;
}

const q = "datastar-event", it = "[a-zA-Z_$]+", Lt = it + "[0-9a-zA-Z_$.]*";

function Le(t, e, s, n = !0) {
    const r = n ? Lt : it;
    return new RegExp(`(?<whole>\\${t}(?<${e}>${r})${s})`, "g");
}

const kt = {
    regexp: Le("$", "signal", "(?<method>\\([^\\)]*\\))?"),
    replacer: (t) => {
        const {signal: e, method: s} = t, n = "ctx.store()";
        if (!s?.length) {
            return `${n}.${e}.value`;
        }
        const r = e.split("."), o = r.pop(), i = r.join(".");
        return `${n}.${i}.value.${o}${s}`;
    }
}, Mt = {
    regexp: Le("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
    replacer: ({action: t, args: e}) => {
        const s = ["ctx"];
        e && s.push(...e.split(",").map((r) => r.trim()));
        const n = s.join(",");
        return `ctx.actions.${t}(${n})`;
    }
}, Pt = {
    regexp: Le("~", "ref", "", !1),
    replacer({ref: t}) {
        return `document.querySelector(ctx.store()._dsPlugins.refs.${t})`;
    }
}, $t = [Mt, kt, Pt], Ot = {
    prefix: "store",
    removeNewLines: !0,
    preprocessors: {
        pre: [
            {
                regexp: /(?<whole>.+)/g,
                replacer: (t) => {
                    const {whole: e} = t;
                    return `Object.assign({...ctx.store()}, ${e})`;
                }
            }
        ]
    },
    allowedModifiers: /* @__PURE__ */ new Set(["local", "session", "ifmissing"]),
    onLoad: (t) => {
        let e = "";
        const s = (l) => {
            const g = t.store(), c = JSON.stringify(g);
            c !== e && (window.localStorage.setItem(U, c), e = c);
        }, n = t.modifiers.has("local");
        if (n) {
            window.addEventListener(q, s);
            const l = window.localStorage.getItem(U) || "{}", g = JSON.parse(l);
            t.mergeStore(g);
        }
        const r = t.modifiers.has("session"), o = (l) => {
            const g = t.store(), c = JSON.stringify(g);
            window.sessionStorage.setItem(U, c);
        };
        if (r) {
            window.addEventListener(q, o);
            const l = window.sessionStorage.getItem(U) || "{}",
                g = JSON.parse(l);
            t.mergeStore(g);
        }
        const i = t.expressionFn(t),
            f = lt(t.store(), i, t.modifiers.has("ifmissing"));
        return t.mergeStore(f), delete t.el.dataset[t.rawKey], () => {
            n && window.removeEventListener(q, s), r && window.removeEventListener(q, o);
        };
    }
}, It = {
    prefix: "computed",
    mustNotEmptyKey: !0,
    onLoad: (t) => {
        const e = t.store();
        return e[t.key] = t.reactivity.computed(() => t.expressionFn(t)), () => {
            const s = t.store();
            delete s[t.key];
        };
    }
}, Rt = {
    prefix: "ref",
    mustHaveEmptyKey: !0,
    mustNotEmptyExpression: !0,
    bypassExpressionFunctionCreation: () => !0,
    onLoad: (t) => {
        t.upsertIfMissingFromStore("_dsPlugins.refs", {});
        const {el: e, expression: s} = t, r = {
            _dsPlugins: {
                refs: {
                    ...t.store()._dsPlugins.refs.value,
                    [s]: at(e)
                }
            }
        };
        return t.mergeStore(r), () => {
            const o = t.store(), i = {...o._dsPlugins.refs.value};
            delete i[s], o._dsPlugins.refs = i;
        };
    }
}, Ct = [Ot, It, Rt];

function at(t) {
    if (!t) {
        return "null";
    }
    if (typeof t == "string") {
        return t;
    }
    if (t instanceof Window) {
        return "Window";
    }
    if (t instanceof Document) {
        return "Document";
    }
    if (t.tagName === "BODY") {
        return "BODY";
    }
    const e = [];
    for (; t.parentElement && t.tagName !== "BODY";) {
        if (t.id) {
            e.unshift("#" + t.getAttribute("id"));
            break;
        }
        else {
            let s = 1, n = t;
            for (; n.previousElementSibling; n = n.previousElementSibling, s++) {
                ;
            }
            e.unshift(t.tagName + ":nth-child(" + s + ")");
        }
        t = t.parentElement;
    }
    return e.join(">");
}

function lt(t, e, s) {
    const n = {};
    if (!s) {
        Object.assign(n, e);
    }
    else {
        for (const r in e) {
            const o = t[r]?.value;
            o == null && (n[r] = e[r]);
        }
    }
    return n;
}

const U = "datastar", k = `${U}-`;

class Dt {
    constructor(e = {}, ...s) {
        if (this.plugins = [], this.store = oe({_dsPlugins: {}}), this.actions = {}, this.refs = {}, this.reactivity = {
            signal: Xe,
            computed: Tt,
            effect: nt
        }, this.parentID = "", this.missingIDNext = 0, this.removals = /* @__PURE__ */ new Map(), this.mergeRemovals = new Array(), this.actions = Object.assign(this.actions, e), s = [...Ct, ...s], !s.length) {
            throw new Error("No plugins provided");
        }
        const n = /* @__PURE__ */ new Set();
        for (const r of s) {
            if (r.requiredPluginPrefixes) {
                for (const o of r.requiredPluginPrefixes) {
                    if (!n.has(o)) {
                        throw new Error(`${r.prefix} requires ${o}`);
                    }
                }
            }
            this.plugins.push(r), n.add(r.prefix);
        }
    }

    run() {
        new MutationObserver((s, n) => {
            N("core", "dom", "mutation", document.body, document.body.outerHTML);
        }).observe(document.body, {
            attributes: !0,
            childList: !0,
            subtree: !0
        }), this.plugins.forEach((s) => {
            s.onGlobalInit && (s.onGlobalInit({
                actions: this.actions,
                reactivity: this.reactivity,
                mergeStore: this.mergeStore.bind(this),
                store: this.store
            }), N("core", "plugins", "registration", "BODY", `On prefix ${s.prefix}`));
        }), this.applyPlugins(document.body);
    }

    cleanupElementRemovals(e) {
        const s = this.removals.get(e);
        if (s) {
            for (const n of s.set) {
                n();
            }
            this.removals.delete(e);
        }
    }

    mergeStore(e) {
        this.mergeRemovals.forEach((n) => n()), this.mergeRemovals = this.mergeRemovals.slice(0);
        const s = ot(this.store.value, e);
        this.store = oe(s), this.mergeRemovals.push(
            this.reactivity.effect(() => {
                N("core", "store", "merged", "STORE", JSON.stringify(this.store.value));
            })
        );
    }

    removeFromStore(...e) {
        const s = {...this.store.value};
        for (const n of e) {
            const r = n.split(".");
            let o = r[0], i = s;
            for (let f = 1; f < r.length; f++) {
                const l = r[f];
                i[o] || (i[o] = {}), i = i[o], o = l;
            }
            delete i[o];
        }
        this.store = oe(s), this.applyPlugins(document.body);
    }

    upsertIfMissingFromStore(e, s) {
        const n = e.split(".");
        let r = this.store;
        for (let i = 0; i < n.length - 1; i++) {
            const f = n[i];
            r[f] || (r[f] = {}), r = r[f];
        }
        const o = n[n.length - 1];
        r[o] || (r[o] = this.reactivity.signal(s), N("core", "store", "upsert", e, s));
    }

    signalByName(e) {
        return this.store[e];
    }

    applyPlugins(e) {
        const s = /* @__PURE__ */ new Set();
        this.plugins.forEach((n, r) => {
            this.walkDownDOM(e, (o) => {
                r || this.cleanupElementRemovals(o);
                for (const i in o.dataset) {
                    const f = o.dataset[i] || "";
                    let l = f;
                    if (!i.startsWith(n.prefix)) {
                        continue;
                    }
                    if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), s.clear(), n.allowedTagRegexps) {
                        const a = o.tagName.toLowerCase();
                        if (![...n.allowedTagRegexps].some((w) => a.match(w))) {
                            throw new Error(
                                `'${o.tagName}' not allowed for '${i}', allowed ${[
                                    [...n.allowedTagRegexps].map((w) => `'${w}'`)
                                ].join(", ")}`
                            );
                        }
                    }
                    let g = i.slice(n.prefix.length), [c, ...d] = g.split(".");
                    if (n.mustHaveEmptyKey && c.length > 0) {
                        throw new Error(`'${i}' must have empty key`);
                    }
                    if (n.mustNotEmptyKey && c.length === 0) {
                        throw new Error(`'${i}' must have non-empty key`);
                    }
                    c.length && (c = c[0].toLowerCase() + c.slice(1));
                    const v = d.map((a) => {
                        const [b, ...w] = a.split("_");
                        return {label: b, args: w};
                    });
                    if (n.allowedModifiers) {
                        for (const a of v) {
                            if (!n.allowedModifiers.has(a.label)) {
                                throw new Error(`'${a.label}' is not allowed`);
                            }
                        }
                    }
                    const u = /* @__PURE__ */ new Map();
                    for (const a of v) {
                        u.set(a.label, a.args);
                    }
                    if (n.mustHaveEmptyExpression && l.length) {
                        throw new Error(`'${i}' must have empty expression`);
                    }
                    if (n.mustNotEmptyExpression && !l.length) {
                        throw new Error(`'${i}' must have non-empty expression`);
                    }
                    const E = /;|\n/;
                    n.removeNewLines && (l = l.split(`
`).map((a) => a.trim()).join(" "));
                    const y = [...n.preprocessors?.pre || [], ...$t, ...n.preprocessors?.post || []];
                    for (const a of y) {
                        if (s.has(a)) {
                            continue;
                        }
                        s.add(a);
                        const b = l.split(E), w = [];
                        b.forEach((m) => {
                            let S = m;
                            const P = [...S.matchAll(a.regexp)];
                            if (P.length) {
                                for (const C of P) {
                                    if (!C.groups) {
                                        continue;
                                    }
                                    const {groups: D} = C, {whole: V} = D;
                                    S = S.replace(V, a.replacer(D));
                                }
                            }
                            w.push(S);
                        }), l = w.join("; ");
                    }
                    const h = {
                        store: () => this.store,
                        mergeStore: this.mergeStore.bind(this),
                        upsertIfMissingFromStore: this.upsertIfMissingFromStore.bind(this),
                        removeFromStore: this.removeFromStore.bind(this),
                        applyPlugins: this.applyPlugins.bind(this),
                        cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
                        walkSignals: this.walkSignals.bind(this),
                        actions: this.actions,
                        reactivity: this.reactivity,
                        el: o,
                        rawKey: i,
                        key: c,
                        rawExpression: f,
                        expression: l,
                        expressionFn: () => {
                            throw new Error("Expression function not created");
                        },
                        modifiers: u,
                        sendDatastarEvent: N
                    };
                    if (!n.bypassExpressionFunctionCreation?.(h) && !n.mustHaveEmptyExpression && l.length) {
                        const a = l.split(E).map((m) => m.trim()).filter((m) => m.length);
                        a[a.length - 1] = `return ${a[a.length - 1]}`;
                        const b = a.map((m) => `  ${m}`).join(`;
`), w = `
try {
  const _datastarExpression = () => {
${b}
  }
  const _datastarReturnVal = _datastarExpression()
  ctx.sendDatastarEvent('core', 'attributes', 'expr_eval', ctx.el, '${i} equals ' + JSON.stringify(_datastarReturnVal))
  return _datastarReturnVal
} catch (e) {
 const msg = \`
Error evaluating Datastar expression:
${b.replaceAll("`", "\\`")}

Error: \${e.message}

Check if the expression is valid before raising an issue.
\`.trim()
 ctx.sendDatastarEvent('core', 'attributes', 'expr_eval_err', ctx.el, msg)
 console.error(msg)
 debugger
}
            `;
                        try {
                            const m = n.argumentNames || [],
                                S = new Function("ctx", ...m, w);
                            h.expressionFn = S;
                        }
                        catch (m) {
                            const S = new Error(`Error creating expression function for '${w}', error: ${m}`);
                            N("core", "attributes", "expr_construction_err", h.el, String(S)), console.error(S);
                            debugger;
                        }
                    }
                    const p = n.onLoad(h);
                    p && (this.removals.has(o) || this.removals.set(o, {id: o.id, set: /* @__PURE__ */ new Set()}), this.removals.get(o).set.add(p));
                }
            });
        });
    }

    walkSignalsStore(e, s) {
        const n = Object.keys(e);
        for (let r = 0; r < n.length; r++) {
            const o = n[r], i = e[o], f = i instanceof T,
                l = typeof i == "object" && Object.keys(i).length > 0;
            if (f) {
                s(o, i);
                continue;
            }
            l && this.walkSignalsStore(i, s);
        }
    }

    walkSignals(e) {
        this.walkSignalsStore(this.store, e);
    }

    walkDownDOM(e, s, n = 0) {
        if (!e) {
            return;
        }
        const r = ze(e);
        if (r) {
            for (s(r), n = 0, e = e.firstElementChild; e;) {
                this.walkDownDOM(e, s, n++), e = e.nextElementSibling;
            }
        }
    }
}

const ct = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, s) => (s ? "-" : "") + e.toLowerCase()),
    Ft = {
        prefix: "bind",
        mustNotEmptyKey: !0,
        mustNotEmptyExpression: !0,
        onLoad: (t) => t.reactivity.effect(async () => {
            const e = ct(t.key), s = t.expressionFn(t);
            let n;
            typeof s == "string" ? n = s : n = JSON.stringify(s), !n || n === "false" || n === "null" || n === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, n);
        })
    }, Ht = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,
    te = ["change", "input", "keydown"], Vt = {
        prefix: "model",
        mustHaveEmptyKey: !0,
        preprocessors: {
            post: [
                {
                    regexp: /(?<whole>.+)/g,
                    replacer: (t) => {
                        const {whole: e} = t;
                        return `ctx.store().${e}`;
                    }
                }
            ]
        },
        // bypassExpressionFunctionCreation: () => true,
        onLoad: (t) => {
            const {el: e, expression: s} = t, n = t.expressionFn(t),
                r = e.tagName.toLowerCase();
            if (s.startsWith("ctx.store().ctx.store()")) {
                throw new Error(`Model attribute on #${e.id} must have a signal name, you probably prefixed with $ by accident`);
            }
            const o = r.includes("input"), i = e.getAttribute("type"),
                f = r.includes("checkbox") || o && i === "checkbox",
                l = r.includes("select"),
                g = r.includes("radio") || o && i === "radio",
                c = o && i === "file", d = s.replaceAll("ctx.store().", "");
            g && (e.getAttribute("name")?.length || e.setAttribute("name", d));
            const v = () => {
                if (!n) {
                    throw new Error(`Signal ${d} not found`);
                }
                const p = "value" in e, a = n.value;
                if (f || g) {
                    const b = e;
                    f ? b.checked = a : g && (b.checked = `${a}` === b.value);
                }
                else if (!c) {
                    if (l) {
                        const b = e;
                        if (b.multiple) {
                            const w = n.value;
                            Array.from(b.options).forEach((m) => {
                                m?.disabled || (m.selected = w.includes(m.value));
                            });
                        }
                        else {
                            b.value = `${a}`;
                        }
                    }
                    else {
                        p ? e.value = `${a}` : e.setAttribute("value", `${a}`);
                    }
                }
            }, u = t.reactivity.effect(v), E = async () => {
                if (c) {
                    const b = [...e?.files || []], w = [], m = [], S = [];
                    await Promise.all(
                        b.map((V) => new Promise((Q) => {
                            const $ = new FileReader();
                            $.onload = () => {
                                if (typeof $.result != "string") {
                                    throw new Error(`Invalid result type: ${typeof $.result}`);
                                }
                                const j = $.result.match(Ht);
                                if (!j?.groups) {
                                    throw new Error(`Invalid data URI: ${$.result}`);
                                }
                                w.push(j.groups.contents), m.push(j.groups.mime), S.push(V.name);
                            }, $.onloadend = () => Q(void 0), $.readAsDataURL(V);
                        }))
                    ), n.value = w;
                    const P = t.store(), C = `${d}Mimes`, D = `${d}Names`;
                    C in P && (P[`${C}`].value = m), D in P && (P[`${D}`].value = S);
                    return;
                }
                const p = n.value, a = e || e;
                if (typeof p == "number") {
                    n.value = Number(a.value || a.getAttribute("value"));
                }
                else if (typeof p == "string") {
                    n.value = a.value || a.getAttribute("value") || "";
                }
                else if (typeof p == "boolean") {
                    f ? n.value = a.checked || a.getAttribute("checked") === "true" : n.value = !!(a.value || a.getAttribute("value"));
                }
                else if (!(typeof p > "u")) {
                    if (typeof p == "bigint") {
                        n.value = BigInt(a.value || a.getAttribute("value") || "0");
                    }
                    else if (Array.isArray(p)) {
                        if (l) {
                            const m = [...e.selectedOptions].map((S) => S.value);
                            n.value = m;
                        }
                        else {
                            n.value = JSON.parse(a.value).split(",");
                        }
                        console.log(a.value);
                    }
                    else {
                        throw console.log(typeof p), new Error(`Unsupported type ${typeof p} for signal ${d}`);
                    }
                }
            }, y = e.tagName.split("-");
            if (y.length > 1) {
                const p = y[0].toLowerCase();
                te.forEach((a) => {
                    te.push(`${p}-${a}`);
                });
            }
            return te.forEach((p) => e.addEventListener(p, E)), () => {
                u(), te.forEach((p) => e.removeEventListener(p, E));
            };
        }
    }, xt = {
        prefix: "text",
        mustHaveEmptyKey: !0,
        onLoad: (t) => {
            const {el: e, expressionFn: s} = t;
            if (!(e instanceof HTMLElement)) {
                throw new Error("Element is not HTMLElement");
            }
            return t.reactivity.effect(() => {
                const n = s(t);
                e.textContent = `${n}`;
            });
        }
    };
let $e = "";
const jt = /* @__PURE__ */ new Set(["window", "once", "passive", "capture", "debounce", "throttle", "remote", "outside"]),
    Ut = {
        prefix: "on",
        mustNotEmptyKey: !0,
        mustNotEmptyExpression: !0,
        argumentNames: ["evt"],
        onLoad: (t) => {
            const {el: e, key: s, expressionFn: n} = t;
            let r = t.el;
            t.modifiers.get("window") && (r = window);
            let o = (d) => {
                N("plugin", "event", s, r, "triggered"), n(t, d);
            };
            const i = t.modifiers.get("debounce");
            if (i) {
                const d = _e(i), v = se(i, "leading", !1),
                    u = se(i, "noTrail", !0);
                o = Jt(o, d, v, u);
            }
            const f = t.modifiers.get("throttle");
            if (f) {
                const d = _e(f), v = se(f, "noLead", !0),
                    u = se(f, "noTrail", !1);
                o = Kt(o, d, v, u);
            }
            const l = {
                capture: !0,
                passive: !1,
                once: !1
            };
            t.modifiers.has("capture") || (l.capture = !1), t.modifiers.has("passive") && (l.passive = !0), t.modifiers.has("once") && (l.once = !0), [...t.modifiers.keys()].filter((d) => !jt.has(d)).forEach((d) => {
                const v = t.modifiers.get(d) || [], u = o;
                o = () => {
                    const y = event, h = y[d];
                    let p;
                    if (typeof h == "function") {
                        p = h(...v);
                    }
                    else if (typeof h == "boolean") {
                        p = h;
                    }
                    else if (typeof h == "string") {
                        const a = h.toLowerCase().trim(),
                            b = v.join("").toLowerCase().trim();
                        p = a === b;
                    }
                    else {
                        const a = `Invalid value for ${d} modifier on ${s} on ${e}`;
                        console.error(a);
                        debugger;
                        throw new Error(a);
                    }
                    p && u(y);
                };
            });
            const c = ct(s).toLowerCase();
            switch (c) {
                case "load":
                    return o(), delete t.el.dataset.onLoad, () => {
                    };
                case "raf":
                    let d;
                    const v = () => {
                        o(), d = requestAnimationFrame(v);
                    };
                    return d = requestAnimationFrame(v), () => {
                        d && cancelAnimationFrame(d);
                    };
                case "store-change":
                    return t.reactivity.effect(() => {
                        let y = t.store().value;
                        t.modifiers.has("remote") && (y = he(y));
                        const h = JSON.stringify(y);
                        $e !== h && ($e = h, o());
                    });
                default:
                    if (t.modifiers.has("outside")) {
                        r = document;
                        const E = o;
                        let y = !1;
                        o = (p) => {
                            const a = p?.target;
                            if (!a) {
                                return;
                            }
                            const b = e.id === a.id;
                            b && y && (y = !1), !b && !y && (E(p), y = !0);
                        };
                    }
                    return r.addEventListener(c, o, l), () => {
                        r.removeEventListener(c, o);
                    };
            }
        }
    };

function he(t) {
    const e = {};
    for (const [s, n] of Object.entries(t)) {
        s.startsWith("_") || (typeof n == "object" && !Array.isArray(n) ? e[s] = he(n) : e[s] = n);
    }
    return e;
}

const Bt = {
    prefix: "class",
    mustHaveEmptyKey: !0,
    mustNotEmptyExpression: !0,
    onLoad: (t) => t.reactivity.effect(() => {
        const e = t.expressionFn(t);
        for (const [s, n] of Object.entries(e)) {
            n ? t.el.classList.add(s) : t.el.classList.remove(s);
        }
        return () => {
            t.el.classList.remove(...Object.keys(e));
        };
    })
}, Wt = [
    Ft,
    Vt,
    xt,
    Ut,
    Bt
], qt = {
    remote: async (t) => he(t.store().value)
};

function _e(t) {
    if (!t || t?.length === 0) {
        return 0;
    }
    for (const e of t) {
        if (e.endsWith("ms")) {
            return Number(e.replace("ms", ""));
        }
        if (e.endsWith("s")) {
            return Number(e.replace("s", "")) * 1e3;
        }
        try {
            return parseFloat(e);
        }
        catch {
        }
    }
    return 0;
}

function se(t, e, s = !1) {
    return t ? t.includes(e) || s : !1;
}

function Jt(t, e, s = !1, n = !0) {
    let r;
    const o = () => r && clearTimeout(r);
    return function(...f) {
        o(), s && !r && t(...f), r = setTimeout(() => {
            n && t(...f), o();
        }, e);
    };
}

function Kt(t, e, s = !0, n = !1) {
    let r = !1;
    return function(...i) {
        r || (s && t(...i), r = !0, setTimeout(() => {
            r = !1, n && t(...i);
        }, e));
    };
}

function Gt(t, {
    signal: e,
    headers: s,
    onopen: n,
    onmessage: r,
    onclose: o,
    onerror: i,
    openWhenHidden: f,
    ...l
}) {
    return new Promise((g, c) => {
        let d = 0;
        const v = {...s};
        v.accept || (v.accept = Se);
        let u;

        function E() {
            u.abort(), document.hidden || b();
        }

        f || document.addEventListener("visibilitychange", E);
        let y = Oe, h = 0;

        function p() {
            document.removeEventListener("visibilitychange", E), window.clearTimeout(h), u.abort();
        }

        e?.addEventListener("abort", () => {
            p(), g();
        });
        const a = n ?? Zt;

        async function b() {
            u = new AbortController();
            try {
                const w = await fetch(t, {
                    ...l,
                    headers: v,
                    signal: u.signal
                });
                await a(w), await Xt(
                    w.body,
                    Qt(
                        es(
                            (m) => {
                                m ? v[Ie] = m : delete v[Ie];
                            },
                            (m) => {
                                y = m;
                            },
                            r
                        )
                    )
                ), o?.(), p(), g();
            }
            catch (w) {
                if (!u.signal.aborted) {
                    try {
                        const m = i?.(w) ?? y;
                        window.clearTimeout(h), h = window.setTimeout(b, m), y *= 1.5, y = Math.min(y, Yt), d++, d >= zt ? (p(), c(new Error("Max retries hit, check your server or network connection."))) : console.error(`Error fetching event source, retrying in ${m}ms`);
                    }
                    catch (m) {
                        p(), c(m);
                    }
                }
            }
        }

        y = Oe, b();
    });
}

const Se = "text/event-stream", Oe = 100, Yt = 1e4, zt = 10,
    Ie = "last-event-id";

function Zt(t) {
    const e = t.headers.get("content-type");
    if (!e?.startsWith(Se)) {
        throw new Error(`Expected content-type to be ${Se}, Actual: ${e}`);
    }
}

async function Xt(t, e) {
    const s = t.getReader();
    for (; ;) {
        const n = await s.read();
        if (n.done) {
            break;
        }
        e(n.value);
    }
}

function Qt(t) {
    let e, s, n, r = !1;
    return function(i) {
        e === void 0 ? (e = i, s = 0, n = -1) : e = ts(e, i);
        const f = e.length;
        let l = 0;
        for (; s < f;) {
            r && (e[s] === 10 && (l = ++s), r = !1);
            let g = -1;
            for (; s < f && g === -1; ++s) {
                switch (e[s]) {
                    case 58:
                        n === -1 && (n = s - l);
                        break;
                    case 13:
                        r = !0;
                    case 10:
                        g = s;
                        break;
                }
            }
            if (g === -1) {
                break;
            }
            t(e.subarray(l, g), n), l = s, n = -1;
        }
        l === f ? e = void 0 : l !== 0 && (e = e.subarray(l), s -= l);
    };
}

function es(t, e, s) {
    let n = Re();
    const r = new TextDecoder();
    return function(i, f) {
        if (i.length === 0) {
            s?.(n), n = Re();
        }
        else if (f > 0) {
            const l = r.decode(i.subarray(0, f)),
                g = f + (i[f + 1] === 32 ? 2 : 1), c = r.decode(i.subarray(g));
            switch (l) {
                case "data":
                    n.data = n.data ? n.data + `
` + c : c;
                    break;
                case "event":
                    n.event = c;
                    break;
                case "id":
                    t(n.id = c);
                    break;
                case "retry":
                    const d = parseInt(c, 10);
                    isNaN(d) || e(n.retry = d);
                    break;
            }
        }
    };
}

function ts(t, e) {
    const s = new Uint8Array(t.length + e.length);
    return s.set(t), s.set(e, t.length), s;
}

function Re() {
    return {
        data: "",
        event: "",
        id: "",
        retry: void 0
    };
}

const ie = /* @__PURE__ */ new WeakSet();

function ss(t, e, s = {}) {
    t instanceof Document && (t = t.documentElement);
    let n;
    typeof e == "string" ? n = as(e) : n = e;
    const r = ls(n), o = rs(t, r, s);
    return ut(t, r, o);
}

function ut(t, e, s) {
    if (s.head.block) {
        const n = t.querySelector("head"), r = e.querySelector("head");
        if (n && r) {
            const o = dt(r, n, s);
            Promise.all(o).then(() => {
                ut(
                    t,
                    e,
                    Object.assign(s, {
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
    if (s.morphStyle === "innerHTML") {
        return ft(e, t, s), t.children;
    }
    if (s.morphStyle === "outerHTML" || s.morphStyle == null) {
        const n = us(e, t, s);
        if (!n) {
            throw new Error("Could not find best match");
        }
        const r = n?.previousSibling, o = n?.nextSibling, i = ae(t, n, s);
        return n ? cs(r, i, o) : [];
    }
    else {
        throw "Do not understand how to morph style " + s.morphStyle;
    }
}

function ae(t, e, s) {
    if (!(s.ignoreActive && t === document.activeElement)) {
        if (e == null) {
            if (s.callbacks.beforeNodeRemoved(t) === !1) {
                return;
            }
            t.remove(), s.callbacks.afterNodeRemoved(t);
            return;
        }
        else {
            if (ce(t, e)) {
                return s.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && s.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && s.head.style !== "morph" ? dt(e, t, s) : (ns(e, t), ft(e, t, s))), s.callbacks.afterNodeMorphed(t, e), t);
            }
            if (s.callbacks.beforeNodeRemoved(t) === !1 || s.callbacks.beforeNodeAdded(e) === !1) {
                return;
            }
            if (!t.parentElement) {
                throw new Error("oldNode has no parentElement");
            }
            return t.parentElement.replaceChild(e, t), s.callbacks.afterNodeAdded(e), s.callbacks.afterNodeRemoved(t), e;
        }
    }
}

function ft(t, e, s) {
    let n = t.firstChild, r = e.firstChild, o;
    for (; n;) {
        if (o = n, n = o.nextSibling, r == null) {
            if (s.callbacks.beforeNodeAdded(o) === !1) {
                return;
            }
            e.appendChild(o), s.callbacks.afterNodeAdded(o), x(s, o);
            continue;
        }
        if (ht(o, r, s)) {
            ae(r, o, s), r = r.nextSibling, x(s, o);
            continue;
        }
        let i = os(t, e, o, r, s);
        if (i) {
            r = Ce(r, i, s), ae(i, o, s), x(s, o);
            continue;
        }
        let f = is(t, o, r, s);
        if (f) {
            r = Ce(r, f, s), ae(f, o, s), x(s, o);
            continue;
        }
        if (s.callbacks.beforeNodeAdded(o) === !1) {
            return;
        }
        e.insertBefore(o, r), s.callbacks.afterNodeAdded(o), x(s, o);
    }
    for (; r !== null;) {
        let i = r;
        r = r.nextSibling, pt(i, s);
    }
}

function ns(t, e) {
    let s = t.nodeType;
    if (s === 1) {
        for (const n of t.attributes) {
            e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
        }
        for (const n of e.attributes) {
            t.hasAttribute(n.name) || e.removeAttribute(n.name);
        }
    }
    if ((s === Node.COMMENT_NODE || s === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file") {
        e.value = t.value || "", ne(t, e, "value"), ne(t, e, "checked"), ne(t, e, "disabled");
    }
    else if (t instanceof HTMLOptionElement) {
        ne(t, e, "selected");
    }
    else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
        const n = t.value, r = e.value;
        n !== r && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
    }
}

function ne(t, e, s) {
    const n = t.getAttribute(s), r = e.getAttribute(s);
    n !== r && (n ? e.setAttribute(s, n) : e.removeAttribute(s));
}

function dt(t, e, s) {
    const n = [], r = [], o = [], i = [], f = s.head.style,
        l = /* @__PURE__ */ new Map();
    for (const c of t.children) {
        l.set(c.outerHTML, c);
    }
    for (const c of e.children) {
        let d = l.has(c.outerHTML), v = s.head.shouldReAppend(c),
            u = s.head.shouldPreserve(c);
        d || u ? v ? r.push(c) : (l.delete(c.outerHTML), o.push(c)) : f === "append" ? v && (r.push(c), i.push(c)) : s.head.shouldRemove(c) !== !1 && r.push(c);
    }
    i.push(...l.values());
    const g = [];
    for (const c of i) {
        const d = document.createRange().createContextualFragment(c.outerHTML).firstChild;
        if (!d) {
            throw new Error("could not create new element from: " + c.outerHTML);
        }
        if (s.callbacks.beforeNodeAdded(d)) {
            if (d.hasAttribute("href") || d.hasAttribute("src")) {
                let v;
                const u = new Promise((E) => {
                    v = E;
                });
                d.addEventListener("load", function() {
                    v(void 0);
                }), g.push(u);
            }
            e.appendChild(d), s.callbacks.afterNodeAdded(d), n.push(d);
        }
    }
    for (const c of r) {
        s.callbacks.beforeNodeRemoved(c) !== !1 && (e.removeChild(c), s.callbacks.afterNodeRemoved(c));
    }
    return s.head.afterHeadMorphed(e, {
        added: n,
        kept: o,
        removed: r
    }), g;
}

function F() {
}

function rs(t, e, s) {
    return {
        target: t,
        newContent: e,
        config: s,
        morphStyle: s.morphStyle,
        ignoreActive: s.ignoreActive,
        idMap: ps(t, e),
        deadIds: /* @__PURE__ */ new Set(),
        callbacks: Object.assign(
            {
                beforeNodeAdded: F,
                afterNodeAdded: F,
                beforeNodeMorphed: F,
                afterNodeMorphed: F,
                beforeNodeRemoved: F,
                afterNodeRemoved: F
            },
            s.callbacks
        ),
        head: Object.assign(
            {
                style: "merge",
                shouldPreserve: (n) => n.getAttribute("im-preserve") === "true",
                shouldReAppend: (n) => n.getAttribute("im-re-append") === "true",
                shouldRemove: F,
                afterHeadMorphed: F
            },
            s.head
        )
    };
}

function ht(t, e, s) {
    return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : z(s, t, e) > 0 : !1;
}

function ce(t, e) {
    return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}

function Ce(t, e, s) {
    for (; t !== e;) {
        const n = t;
        if (t = t?.nextSibling, !n) {
            throw new Error("tempNode is null");
        }
        pt(n, s);
    }
    return x(s, e), e.nextSibling;
}

function os(t, e, s, n, r) {
    const o = z(r, s, e);
    let i = null;
    if (o > 0) {
        i = n;
        let f = 0;
        for (; i != null;) {
            if (ht(s, i, r)) {
                return i;
            }
            if (f += z(r, i, t), f > o) {
                return null;
            }
            i = i.nextSibling;
        }
    }
    return i;
}

function is(t, e, s, n) {
    let r = s, o = e.nextSibling, i = 0;
    for (; r && o;) {
        if (z(n, r, t) > 0) {
            return null;
        }
        if (ce(e, r)) {
            return r;
        }
        if (ce(o, r) && (i++, o = o.nextSibling, i >= 2)) {
            return null;
        }
        r = r.nextSibling;
    }
    return r;
}

const De = new DOMParser();

function as(t) {
    const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
    if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
        const s = De.parseFromString(t, "text/html");
        if (e.match(/<\/html>/)) {
            return ie.add(s), s;
        }
        {
            let n = s.firstChild;
            return n ? (ie.add(n), n) : null;
        }
    }
    else {
        const n = De.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
        if (!n) {
            throw new Error("content is null");
        }
        return ie.add(n), n;
    }
}

function ls(t) {
    if (t == null) {
        return document.createElement("div");
    }
    if (ie.has(t)) {
        return t;
    }
    if (t instanceof Node) {
        const e = document.createElement("div");
        return e.append(t), e;
    }
    else {
        const e = document.createElement("div");
        for (const s of [...t]) {
            e.append(s);
        }
        return e;
    }
}

function cs(t, e, s) {
    const n = [], r = [];
    for (; t;) {
        n.push(t), t = t.previousSibling;
    }
    for (; n.length > 0;) {
        const o = n.pop();
        r.push(o), e?.parentElement?.insertBefore(o, e);
    }
    for (r.push(e); s;) {
        n.push(s), r.push(s), s = s.nextSibling;
    }
    for (; n.length;) {
        e?.parentElement?.insertBefore(n.pop(), e.nextSibling);
    }
    return r;
}

function us(t, e, s) {
    let n = t.firstChild, r = n, o = 0;
    for (; n;) {
        let i = fs(n, e, s);
        i > o && (r = n, o = i), n = n.nextSibling;
    }
    return r;
}

function fs(t, e, s) {
    return ce(t, e) ? 0.5 + z(s, t, e) : 0;
}

function pt(t, e) {
    x(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}

function ds(t, e) {
    return !t.deadIds.has(e);
}

function hs(t, e, s) {
    return t.idMap.get(s)?.has(e) || !1;
}

function x(t, e) {
    const s = t.idMap.get(e);
    if (s) {
        for (const n of s) {
            t.deadIds.add(n);
        }
    }
}

function z(t, e, s) {
    const n = t.idMap.get(e);
    if (!n) {
        return 0;
    }
    let r = 0;
    for (const o of n) {
        ds(t, o) && hs(t, o, s) && ++r;
    }
    return r;
}

function Fe(t, e) {
    const s = t.parentElement, n = t.querySelectorAll("[id]");
    for (const r of n) {
        let o = r;
        for (; o !== s && o;) {
            let i = e.get(o);
            i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(r.id), o = o.parentElement;
        }
    }
}

function ps(t, e) {
    const s = /* @__PURE__ */ new Map();
    return Fe(t, s), Fe(e, s), s;
}

const ge = "display", He = "none", ve = "important", Ve = "duration",
    ms = "show", be = `${k}showing`, ye = `${k}hiding`,
    xe = `${k}show-transition-style`, gs = {
        prefix: ms,
        allowedModifiers: /* @__PURE__ */ new Set([ve, Ve]),
        onLoad: (t) => {
            const {el: e, modifiers: s, expressionFn: n, reactivity: r} = t,
                i = s.has(ve) ? ve : void 0;
            let f, l;
            const g = t.modifiers.get(Ve);
            if (g) {
                let c = document.getElementById(xe);
                if (!c) {
                    c = document.createElement("style"), c.id = xe, document.head.appendChild(c);
                    const v = _e(g) || "300";
                    c.innerHTML = `
          .${be} {
            visibility: visible;
            transition: opacity ${v}ms linear;
          }
          .${ye} {
            visibility: hidden;
            transition: visibility 0s ${v}ms, opacity ${v}ms linear;
          }
        `;
                }
                const d = (v) => (u) => {
                    u.target === e && (e.classList.remove(v), e.removeEventListener("transitionend", d(v)));
                };
                f = () => {
                    e.addEventListener("transitionend", d(be)), e.classList.add(be), requestAnimationFrame(() => {
                        e.style.setProperty("opacity", "1", i);
                    });
                }, l = () => {
                    e.addEventListener("transitionend", d(ye)), e.classList.add(ye), requestAnimationFrame(() => {
                        e.style.setProperty("opacity", "0", i);
                    });
                };
            }
            else {
                f = () => {
                    e.style.length === 1 && e.style.display === He ? e.style.removeProperty(ge) : e.style.setProperty(ge, "", i);
                }, l = () => {
                    e.style.setProperty(ge, He, i);
                };
            }
            return r.effect(async () => {
                !!await n(t) ? f() : l();
            });
        }
    }, vs = "intersects", je = "once", Ue = "half", Be = "full", bs = {
        prefix: vs,
        allowedModifiers: /* @__PURE__ */ new Set([je, Ue, Be]),
        mustHaveEmptyKey: !0,
        onLoad: (t) => {
            const {modifiers: e} = t, s = {threshold: 0};
            e.has(Be) ? s.threshold = 1 : e.has(Ue) && (s.threshold = 0.5);
            const n = new IntersectionObserver((r) => {
                r.forEach((o) => {
                    o.isIntersecting && (t.expressionFn(t), e.has(je) && (n.disconnect(), delete t.el.dataset[t.rawKey]));
                });
            }, s);
            return n.observe(t.el), () => n.disconnect();
        }
    }, We = "prepend", qe = "append",
    Je = new Error("Target element must have a parent if using prepend or append"),
    ys = {
        prefix: "teleport",
        allowedModifiers: /* @__PURE__ */ new Set([We, qe]),
        allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
        bypassExpressionFunctionCreation: () => !0,
        onLoad: (t) => {
            const {el: e, modifiers: s, expression: n} = t;
            if (!(e instanceof HTMLTemplateElement)) {
                throw new Error("el must be a template element");
            }
            const r = document.querySelector(n);
            if (!r) {
                throw new Error(`Target element not found: ${n}`);
            }
            if (!e.content) {
                throw new Error("Template element must have content");
            }
            const o = e.content.cloneNode(!0);
            if (ze(o)?.firstElementChild) {
                throw new Error("Empty template");
            }
            if (s.has(We)) {
                if (!r.parentNode) {
                    throw Je;
                }
                r.parentNode.insertBefore(o, r);
            }
            else if (s.has(qe)) {
                if (!r.parentNode) {
                    throw Je;
                }
                r.parentNode.insertBefore(o, r.nextSibling);
            }
            else {
                r.appendChild(o);
            }
        }
    }, ws = {
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
        onLoad: ({el: t, modifiers: e, rawKey: s}) => {
            t.tabIndex || t.setAttribute("tabindex", "0");
            const n = {
                behavior: "smooth",
                block: "center",
                inline: "center"
            };
            return e.has("smooth") && (n.behavior = "smooth"), e.has("instant") && (n.behavior = "instant"), e.has("auto") && (n.behavior = "auto"), e.has("hstart") && (n.inline = "start"), e.has("hcenter") && (n.inline = "center"), e.has("hend") && (n.inline = "end"), e.has("hnearest") && (n.inline = "nearest"), e.has("vstart") && (n.block = "start"), e.has("vcenter") && (n.block = "center"), e.has("vend") && (n.block = "end"), e.has("vnearest") && (n.block = "nearest"), vt(t, n, e.has("focus")), delete t.dataset[s], () => {
            };
        }
    }, mt = document, gt = !!mt.startViewTransition, Es = {
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
                const {el: e, expressionFn: s} = t;
                let n = s(t);
                if (!n) {
                    return;
                }
                const r = e.style;
                r.viewTransitionName = n;
            });
        }
    }, _s = [
        gs,
        bs,
        ys,
        ws,
        Es
    ], Ss = {
        scroll: async (t, e, s) => {
            const n = Object.assign(
                {behavior: "smooth", vertical: "center", horizontal: "center", shouldFocus: !0},
                s
            ), r = document.querySelector(e);
            vt(r, n);
        }
    };

function vt(t, e, s = !0) {
    if (!(t instanceof HTMLElement || t instanceof SVGElement)) {
        throw new Error("Element not found");
    }
    t.tabIndex || t.setAttribute("tabindex", "0"), t.scrollIntoView(e), s && t.focus();
}

const Ts = 500, As = !0, Ns = "morph", Ls = "Content-Type", ks = `${U}-request`,
    Ms = "application/json", Ps = "true", $s = `${k}fragment`,
    Os = `${k}signal`, Is = `${k}delete`, Rs = `${k}redirect`,
    Cs = `${k}console`, Z = `${k}indicator`, Te = `${Z}-loading`,
    Ke = `${k}settling`, re = `${k}swapping`, Ds = "self", Fs = "get",
    Hs = "post", Vs = "put", xs = "patch", js = "delete", I = {
        MorphElement: "morph",
        InnerElement: "inner",
        OuterElement: "outer",
        PrependElement: "prepend",
        AppendElement: "append",
        BeforeElement: "before",
        AfterElement: "after",
        UpsertAttributes: "upsert_attributes"
    }, Us = {
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
            const e = t.reactivity.computed(() => `${t.expressionFn(t)}`),
                s = t.store(), n = document.querySelectorAll(e.value);
            if (n.length === 0) {
                throw new Error("No indicator found");
            }
            return n.forEach((r) => {
                r.classList.add(Z);
            }), s._dsPlugins.fetch.indicatorElements[t.el.id] = t.reactivity.signal(n), () => {
                delete s._dsPlugins.fetch.indicatorElements[t.el.id];
            };
        })
    }, Bs = {
        prefix: "header",
        mustNotEmptyKey: !0,
        mustNotEmptyExpression: !0,
        preprocessors: {
            post: [
                {
                    regexp: /(?<whole>.+)/g,
                    replacer: (t) => {
                        const {whole: e} = t;
                        return `'${e}'`;
                    }
                }
            ]
        },
        onLoad: (t) => {
            t.upsertIfMissingFromStore("_dsPlugins.fetch.headers", {});
            const e = t.key.replace(/([a-z](?=[A-Z]))/g, "$1-").toUpperCase(),
                s = t.expressionFn(t);
            return t.store()._dsPlugins.fetch.headers[e] = s, () => {
                delete t.store()._dsPlugins.fetch.headers[e];
            };
        }
    }, Ws = [Us, Bs];

async function qs(t, e, s, n = !0) {
    const r = s.store();
    if (!e) {
        throw new Error(`No signal for ${t} on ${e}`);
    }
    let o = {...r.value};
    n && (o = he(o));
    const i = JSON.stringify(o), f = s.el;
    N(
        "plugin",
        "backend",
        "fetch_start",
        f,
        JSON.stringify({method: t, urlExpression: e, onlyRemote: n, storeJSON: i})
    );
    const l = r?._dsPlugins?.fetch?.indicatorElements ? r._dsPlugins.fetch.indicatorElements[f.id]?.value || [] : [],
        g = r?._dsPlugins.fetch?.indicatorsVisible;
    l?.forEach && l.forEach((u) => {
        if (!u || !g) {
            return;
        }
        const E = g.value.findIndex((y) => y ? u.isSameNode(y.el) : !1);
        if (E > -1) {
            const y = g.value[E], h = [...g.value];
            delete h[E], g.value = [
                ...h.filter((p) => !!p),
                {el: u, count: y.count + 1}
            ];
        }
        else {
            u.classList.remove(Z), u.classList.add(Te), g.value = [
                ...g.value,
                {
                    el: u,
                    count: 1
                }
            ];
        }
    });
    const c = new URL(e, window.location.origin);
    t = t.toUpperCase();
    const d = {
        method: t,
        headers: {
            [Ls]: Ms,
            [ks]: Ps
        },
        onmessage: (u) => {
            if (u.event) {
                if (!u.event.startsWith(k)) {
                    console.log(`Unknown event: ${u.event}`);
                    debugger;
                }
            }
            else {
                return;
            }
            switch (u.event) {
                case $s:
                    const E = u.data.trim().split(`
`), y = ["selector", "merge", "settle", "fragment", "vt"];
                    let h = "", p = Ns, a = Ts, b = As, w = !1, m = "", S = "";
                    for (let L = 0; L < E.length; L++) {
                        let A = E[L];
                        if (!A?.length) {
                            continue;
                        }
                        const M = A.split(" ", 1)[0];
                        if (y.includes(M) && M !== S) {
                            switch (S = M, A = A.slice(M.length + 1), S) {
                                case "selector":
                                    m = A;
                                    break;
                                case "merge":
                                    if (p = A, w = Object.values(I).includes(p), !w) {
                                        throw new Error(`Unknown merge option: ${p}`);
                                    }
                                    break;
                                case "settle":
                                    a = parseInt(A);
                                    break;
                                case "fragment":
                                    break;
                                case "vt":
                                    b = A === "true";
                                    break;
                                default:
                                    throw new Error("Unknown data type");
                            }
                        }
                        S === "fragment" && (h += A + `
`);
                    }
                    h?.length || (h = "<div></div>"), Js(s, m, p, h, a, b), N(
                        "plugin",
                        "backend",
                        "merge",
                        m,
                        JSON.stringify({fragment: h, settleTime: a, useViewTransition: b})
                    );
                    break;
                case Os:
                    let P = !1, C = "";
                    const D = u.data.trim().split(`
`);
                    for (let L = 0; L < D.length; L++) {
                        const A = D[L], [M, ...ee] = A.split(" "),
                            me = ee.join(" ");
                        switch (M) {
                            case "onlyIfMissing":
                                P = me.trim() === "true";
                                break;
                            case "store":
                                C += `${me}
`;
                                break;
                            default:
                                throw new Error(`Unknown signal type: ${M}`);
                        }
                    }
                    const V = ` return Object.assign({...ctx.store()}, ${C})`;
                    try {
                        const A = new Function("ctx", V)(s),
                            M = lt(s.store(), A, P);
                        s.mergeStore(M), s.applyPlugins(document.body);
                    }
                    catch (L) {
                        console.log(V), console.error(L);
                        debugger;
                    }
                    break;
                case Is:
                    const [Q, ...$] = u.data.trim().split(" ");
                    switch (Q) {
                        case "selector":
                            const L = $.join(" ");
                            document.querySelectorAll(L).forEach((ee) => ee.remove());
                            break;
                        case "paths":
                            const M = $.join(" ").split(" ");
                            s.removeFromStore(...M);
                            break;
                        default:
                            throw new Error(`Unknown delete prefix: ${Q}`);
                    }
                    break;
                case Rs:
                    const [j, ...yt] = u.data.trim().split(" ");
                    if (j !== "url") {
                        throw new Error(`Unknown redirect selector: ${j}`);
                    }
                    const Me = yt.join(" ");
                    N("plugin", "backend", "redirect", "WINDOW", Me), window.location.href = Me;
                    break;
                case Cs:
                    const [pe, ...wt] = u.data.trim().split(" "),
                        Pe = wt.join(" ");
                    switch (pe) {
                        case "debug":
                        case "error":
                        case "info":
                        case "group":
                        case "groupEnd":
                        case "log":
                        case "warn":
                            console[pe](Pe);
                            break;
                        default:
                            throw new Error(`Unknown console mode: '${pe}', message: '${Pe}'`);
                    }
            }
        },
        onerror: (u) => {
            console.error(u);
        },
        onclose: () => {
            try {
                const u = s.store(),
                    E = u?._dsPlugins?.fetch?.indicatorsVisible || [],
                    y = u?._dsPlugins?.fetch?.indicatorElements ? u._dsPlugins.fetch.indicatorElements[f.id]?.value || [] : [],
                    h = [];
                y?.forEach && y.forEach((p) => {
                    if (!p || !E) {
                        return;
                    }
                    const a = E.value,
                        b = a.findIndex((m) => m ? p.isSameNode(m.el) : !1),
                        w = a[b];
                    w && (w.count < 2 ? (h.push(
                        new Promise(
                            () => setTimeout(() => {
                                p.classList.remove(Te), p.classList.add(Z);
                            }, 300)
                        )
                    ), delete a[b]) : b > -1 && (a[b].count = a[b].count - 1), E.value = a.filter((m) => !!m));
                }), Promise.all(h);
            }
            catch (u) {
                console.error(u);
                debugger;
            }
            finally {
                N("plugin", "backend", "fetch_end", f, JSON.stringify({method: t, urlExpression: e}));
            }
        }
    };
    if (t === "GET") {
        const u = new URLSearchParams(c.search);
        u.append("datastar", i), c.search = u.toString();
    }
    else {
        d.body = i;
    }
    const v = r?._dsPlugins?.fetch?.headers || {};
    if (d.headers) {
        for (const [u, E] of Object.entries(v)) {
            u.startsWith("_") || (d.headers[u] = `${E}`);
        }
    }
    Gt(c, d);
}

const Ge = document.createElement("template");

function Js(t, e, s, n, r, o) {
    const {el: i} = t;
    Ge.innerHTML = n.trim(), [...Ge.content.children].forEach((l) => {
        if (!(l instanceof Element)) {
            throw new Error("No fragment found");
        }
        const g = (u) => {
            for (const E of u) {
                E.classList.add(re);
                const y = E.outerHTML;
                let h = E;
                switch (s) {
                    case I.MorphElement:
                        const a = ss(h, l, {
                            callbacks: {
                                beforeNodeRemoved: (w, m) => (t.cleanupElementRemovals(w), !0)
                            }
                        });
                        if (!a?.length) {
                            throw new Error("No morph result");
                        }
                        h = a[0];
                        break;
                    case I.InnerElement:
                        h.innerHTML = l.innerHTML;
                        break;
                    case I.OuterElement:
                        h.replaceWith(l);
                        break;
                    case I.PrependElement:
                        h.prepend(l);
                        break;
                    case I.AppendElement:
                        h.append(l);
                        break;
                    case I.BeforeElement:
                        h.before(l);
                        break;
                    case I.AfterElement:
                        h.after(l);
                        break;
                    case I.UpsertAttributes:
                        l.getAttributeNames().forEach((w) => {
                            const m = l.getAttribute(w);
                            h.setAttribute(w, m);
                        });
                        break;
                    default:
                        throw new Error(`Unknown merge type: ${s}`);
                }
                t.cleanupElementRemovals(h), h.classList.add(re), t.applyPlugins(document.body), setTimeout(() => {
                    E.classList.remove(re), h.classList.remove(re);
                }, r);
                const p = h.outerHTML;
                y !== p && (h.classList.add(Ke), setTimeout(() => {
                    h.classList.remove(Ke);
                }, r));
            }
        }, c = e === Ds;
        let d;
        if (c) {
            d = [i];
        }
        else {
            const u = e || `#${l.getAttribute("id")}`;
            if (d = document.querySelectorAll(u) || [], !d) {
                throw new Error(`No targets found for ${u}`);
            }
        }
        const v = [...d];
        if (!v.length) {
            throw new Error(`No targets found for ${e}`);
        }
        gt && o ? mt.startViewTransition(() => g(v)) : g(v);
    });
}

const Ks = [Fs, Hs, Vs, xs, js].reduce(
        (t, e) => (t[e] = (s, n, r) => {
            const o = ["true", !0, void 0].includes(r);
            qs(e, n, s, o);
        }, t),
        {
            isFetching: (t, e) => {
                const s = [...document.querySelectorAll(e)],
                    r = t.store()?._dsPlugins?.fetch.indicatorsVisible?.value || [];
                return s.length ? s.some((o) => r.filter((i) => !!i).some((i) => i.el.isSameNode(o) && i.count > 0)) : !1;
            }
        }
    ), Ye = "0.19.9", ke = (t, e, s, n, r, o) => (e - s) / (n - s) * (o - r) + r,
    Gs = (t, e, s, n, r, o) => Math.round(ke(t, e, s, n, r, o)),
    bt = (t, e, s, n, r, o) => Math.max(r, Math.min(o, ke(t, e, s, n, r, o))),
    Ys = (t, e, s, n, r, o) => Math.round(bt(t, e, s, n, r, o)), zs = {
        setAll: (t, e, s) => {
            const n = new RegExp(e);
            t.walkSignals((r, o) => n.test(r) && (o.value = s));
        },
        toggleAll: (t, e) => {
            const s = new RegExp(e);
            t.walkSignals((n, r) => s.test(n) && (r.value = !r.value));
        },
        clipboard: (t, e) => {
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not available");
            }
            navigator.clipboard.writeText(e);
        },
        fit: ke,
        fitInt: Gs,
        clampFit: bt,
        clampFitInt: Ys
    };

function Zs(t = {}, ...e) {
    const s = new Dt(t, ...e);
    return s.run(), s;
}

function Xs(t = {}, ...e) {
    const s = Object.assign(
        {},
        zs,
        qt,
        Ks,
        Ss,
        t
    ), n = [...Ws, ..._s, ...Wt, ...e];
    return Zs(s, ...n);
}

const Qs = {
    bubbles: !0,
    cancelable: !0,
    composed: !0
}, Ae = window, N = (t, e, s, n, r, o = Qs) => {
    Ae.dispatchEvent(
        new CustomEvent(
            q,
            Object.assign(
                {
                    detail: {
                        time: /* @__PURE__ */ new Date(),
                        category: t,
                        subcategory: e,
                        type: s,
                        target: at(n),
                        message: r
                    }
                },
                o
            )
        )
    );
};
Ae.ds || setTimeout(() => {
    N("core", "init", "start", document.body, `Datastar v${Ye} loading`);
    const t = performance.now();
    Ae.ds = Xs();
    const e = performance.now();
    N(
        "core",
        "init",
        "end",
        document.body,
        `Datastar v${Ye} loaded and attached to all DOM elements in ${(e - t).toFixed(2)}ms`
    );
    const s = document.createElement("style");
    s.innerHTML = `
.datastar-inspector-highlight {
 border: 2px solid blue;
}
`, document.head.appendChild(s), window.addEventListener("datastar-inspector-event", (n) => {
        if ("detail" in n && typeof n.detail == "object" && n.detail) {
            const {detail: r} = n;
            if ("script" in r && typeof r.script == "string") {
                try {
                    new Function(r.script)();
                }
                catch (o) {
                    console.error(o);
                }
            }
        }
    });
}, 0);
export {
    qt as AttributeActions,
    Wt as AttributePlugins,
    Ks as BackendActions,
    Ws as BackendPlugins,
    Ft as BindAttributePlugin,
    Bt as ClassPlugin,
    Ct as CorePlugins,
    $t as CorePreprocessors,
    k as DATASTAR_CLASS_PREFIX,
    U as DATASTAR_STR,
    Dt as Datastar,
    Ut as EventPlugin,
    Us as FetchIndicatorPlugin,
    Bs as HeadersPlugin,
    bs as IntersectionPlugin,
    ws as ScrollIntoViewPlugin,
    gs as ShowPlugin,
    ys as TeleportPlugin,
    xt as TextPlugin,
    Vt as TwoWayBindingModelPlugin,
    Es as ViewTransitionPlugin,
    Ss as VisibilityActions,
    _s as VisibilityPlugins,
    ot as apply,
    se as argsHas,
    _e as argsToMs,
    q as datastarEventName,
    mt as docWithViewTransitionAPI,
    at as elemToSelector,
    Js as mergeHTMLFragment,
    he as remoteSignals,
    Zs as runDatastarWith,
    Xs as runDatastarWithAllPlugins,
    N as sendDatastarEvent,
    lt as storeFromPossibleContents,
    gt as supportsViewTransitions,
    ze as toHTMLorSVGElement
};
