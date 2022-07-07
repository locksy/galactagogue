! function(t, e) { "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.gyroGradient = e() }(this, function() { "use strict"; var t = function(t) { return "number" == typeof t },
        e = function(t) { return "string" == typeof t },
        n = function() {}; if ("undefined" != typeof window && void 0 !== window.document && "DeviceOrientationEvent" in window) { var i = Math.PI / 180,
            a = { orientationInitial: null, orientation: { alpha: null, beta: null, gamma: null }, viewport: { width: window.innerWidth, height: window.innerHeight }, origin: { x: 0, y: 0, z: 300 }, patterns: { noise: function(t, e) { var n = document.createElement("canvas");
                        n.width = t, n.height = e; for (var i = n.getContext("2d"), a = 0; a < t; a++)
                            for (var r = 0; r < e; r++) i.fillStyle = "rgba(0, 0, 0, " + Math.random() + ")", i.fillRect(a, r, 1, 1); return n }(64 * window.devicePixelRatio, 64 * window.devicePixelRatio) }, drawers: [] };
        n = function(t, e) { return ("string" == typeof t ? Array.from(document.querySelectorAll(t)) : Array.isArray(t) ? t : [t]).map(function(t) { return a.drawers.push(r(t, e)) }) }; var r = function(t, e) { void 0 === e && (e = {}); var n = o(t, e),
                    i = { read: function() { n.dirty && (function() { n.styles = getComputedStyle(t); var e = c(n);
                                i.write = function(t, n) { e(t, n) } }(), n.dirty = !1) }, write: function() {} }; return i },
            o = function(e, n) { var i = n.gradient;
                void 0 === i && (i = {}); var a = n.pattern;
                void 0 === a && (a = {}); var r = d(i.colors || [
                        ["#fff", 1],
                        [.5, "#fff", 0]
                    ]),
                    o = { x: i.flip && i.flip.x ? -1 : 1, y: i.flip && i.flip.y ? -1 : 1 },
                    c = t(a.opacity) ? a.opacity : .25; return { type: n.type || "background", dirty: !0, styles: null, element: e, gradient: { type: i.type || "radial", flip: o, angle: i.angle || null, steps: r, scalar: i.scalar || { x: 1, y: 1 } }, pattern: { type: a.type || "none", data: a.type ? l(a.type, c).toDataURL() : null, opacity: c, size: { width: 64, height: 64 } } } },
            l = function(t, e) { var n = a.patterns[t]; if (!n) return null; var i = document.createElement("canvas");
                i.width = n.width, i.height = n.height; var r = i.getContext("2d"); return r.fillStyle = "rgba(0, 0, 0, " + (1 - e) + ")", r.fillRect(0, 0, i.width, i.height), r.drawImage(n, 0, 0), i },
            d = function(n) { return n.map(function(t) { return e(t) ? [t] : t }).map(function(n) { return { color: e(n[0]) ? n[0] : n[1], opacity: t(n[n.length - 1]) ? n[n.length - 1] : null, stop: t(n[0]) ? n[0] : null } }).map(function(t, e, n) { return Object.assign({}, t, { opacity: null === t.opacity ? 1 : t.opacity, stop: null === t.stop ? e * (1 / (n.length - 1)) : t.stop }) }).map(function(t) { return Object.assign({}, t, { colorRGBA: p(t.color, t.opacity) }) }) },
            c = function(t) { var e = t.type,
                    n = t.element,
                    i = t.styles,
                    a = t.pattern,
                    r = t.gradient;
                n.style.position = "static" === i.position ? "relative" : i.position; var o = document.createElement("span");
                o.className = "gradient--wrapper"; var l = "position:absolute;pointer-events:none;user-select:none;background-attachment:fixed;",
                    d = document.createElement("span"),
                    c = d.style; if ("border" === e) { var p = parseFloat(i.borderTopWidth),
                        u = parseFloat(i.borderLeftWidth),
                        s = parseFloat(i.borderRightWidth),
                        f = parseFloat(i.borderBottomWidth),
                        h = parseFloat(i.borderTopLeftRadius),
                        m = i.backgroundColor;
                    l += "border-radius:" + h + "px;\n            left:" + -u + "px;\n            top:" + -p + "px;\n            right:" + -s + "px;\n            bottom:" + -f + "px;"; var g = document.createElement("div");
                    g.style.cssText = "position:absolute;border-radius:" + (h - u) + "px;background-color: " + m + " \n            left:" + u + "px;\n            top:" + p + "px;\n            right:" + s + "px;\n            bottom:" + f + "px;", d.appendChild(g) } else "background" === e ? l += "left:0;top:0;width:100%;height:100%;border-radius:" + parseFloat(i.borderTopLeftRadius) + "px;" : "text" === e && (d.innerHTML = n.innerHTML, l += "color:transparent;background-clip:text;-webkit-background-clip:text;-moz-background-clip:text;"); if (a.data) { var y = "url(" + a.data + ") 0 0 / " + a.size.width + "px " + a.size.height + "px;";
                    l += "mask: " + y + "; -moz-mask: " + y + "; -webkit-mask: " + y + ";" } if (c.cssText = l, o.appendChild(d), n.insertAdjacentElement("afterbegin", o), "linear" === r.type) return function(t, e) { var n = t * r.flip.x + e * r.flip.y / 2,
                        i = r.steps.map(function(t) { return t.colorRGBA + " " + 100 * (n + t.stop) + "%" }).join(", ");
                    c.backgroundImage = "linear-gradient(" + r.angle + ", " + i + ")" }; var v = r.steps.map(function(t) { return t.colorRGBA + " " + 100 * t.stop + "%" }).join(", "); return function(t, e) { c.backgroundImage = "radial-gradient(100vmax 100vmax at " + 100 * (.5 + t * r.flip.x * r.scalar.x) + "% " + 100 * (.5 + e * r.flip.y * r.scalar.y) + "%, " + v + ")" } },
            p = function(t, e) { return "rgba" + u(t).slice(3, -1) + ", " + e + ")" },
            u = function(t) { if (/rgb\(/.test(t)) return t; var e = document.createElement("div");
                e.style.cssText = "display:none;color:" + t, document.body.appendChild(e); var n = getComputedStyle(e).color; return e.parentNode.removeChild(e), n },
            s = function(t) { return t * i },
            f = function() {! function() { if (a.orientationInitial) { var t = a.orientation,
                            e = a.orientationInitial,
                            n = a.origin,
                            i = a.viewport,
                            r = t.alpha - e.alpha,
                            o = t.beta - e.beta,
                            l = t.gamma - e.gamma,
                            d = n.x,
                            c = n.y,
                            p = n.z;
                        d = d * Math.cos(s(r)) - c * Math.sin(s(r)), c = (c = c * Math.cos(s(r)) + d * Math.sin(s(r))) * Math.cos(s(o)) - p * Math.sin(s(o)), p = (p = p * Math.cos(s(o)) + c * Math.sin(s(o))) * Math.cos(s(l)) - d * Math.sin(s(l)), d = d * Math.cos(s(l)) + p * Math.sin(s(l)); var u = i.width / i.height,
                            f = d / (300 * u),
                            h = c / (300 / u);
                        a.drawers.forEach(function(t) { return t.read() }), a.drawers.forEach(function(t) { return t.write(f, h) }) } }(), requestAnimationFrame(f) };
        document.addEventListener("visibilitychange", function(t) { a.orientationInitial = null }), window.addEventListener("deviceorientation", function(t) { null !== t.alpha && (a.orientation.alpha = t.alpha, a.orientation.beta = t.beta, a.orientation.gamma = t.gamma, null === a.orientationInitial && (a.orientationInitial = { alpha: t.alpha, beta: t.beta, gamma: t.gamma }, f())) }) } return n });
//# sourceMappingURL=gyro-gradient.umd.js.map