export type ZT = { readonly type: "zero" };
export type AT = { readonly type: "plus", readonly add: PT[] };
export type PT = { readonly type: "psi", readonly sub: T, readonly arg: T };
export type T = ZT | AT | PT;

export const Z: ZT = { type: "zero" };
export const ONE: PT = { type: "psi", sub: Z, arg: Z };
export const OMEGA: PT = { type: "psi", sub: Z, arg: ONE };
export const LOMEGA: PT = { type: "psi", sub: ONE, arg: Z };

// オブジェクトの相等判定
export function equal(s: T, t: T): boolean {
    if (s.type === "zero") {
        return t.type === "zero";
    } else if (s.type === "plus") {
        if (t.type !== "plus") return false;
        if (t.add.length !== s.add.length) return false;
        for (let i = 0; i < t.add.length; i++) {
            if (!equal(s.add[i], t.add[i])) return false;
        }
        return true;
    } else {
        if (t.type !== "psi") return false;
        return equal(s.sub, t.sub) && equal(s.arg, t.arg);
    }
}

export function psi(sub: T, arg: T): PT {
    return { type: "psi", sub: sub, arg: arg };
}

// a+b を適切に整形して返す
export function plus(a: T, b: T): T {
    if (a.type === "zero") {
        return b;
    } else if (a.type === "plus") {
        if (b.type === "zero") {
            return a;
        } else if (b.type === "plus") {
            return { type: "plus", add: a.add.concat(b.add) };
        } else {
            return { type: "plus", add: [...a.add, b] };
        }
    } else {
        if (b.type === "zero") {
            return a;
        } else if (b.type === "plus") {
            return { type: "plus", add: [a, ...b.add] };
        } else {
            return { type: "plus", add: [a, b] };
        }
    }
}

// 要素が1個の配列は潰してから返す
export function sanitize_plus_term(add: PT[]): PT | AT {
    if (add.length === 1) {
        return add[0];
    } else {
        return { type: "plus", add: add };
    }
}

// s < t を判定
export function less_than(s: T, t: T): boolean {
    if (s.type === "zero") {
        return t.type !== "zero";
    } else if (s.type === "psi") {
        if (t.type === "zero") {
            return false;
        } else if (t.type === "psi") {
            return less_than(s.sub, t.sub) ||
                (equal(s.sub, t.sub) && less_than(s.arg, t.arg));
        } else {
            return equal(s, t.add[0]) || less_than(s, t.add[0]);
        }
    } else {
        if (t.type === "zero") {
            return false;
        } else if (t.type === "psi") {
            return less_than(s.add[0], t)
        } else {
            const s2 = sanitize_plus_term(s.add.slice(1));
            const t2 = sanitize_plus_term(t.add.slice(1));
            return less_than(s.add[0], t.add[0]) ||
                (equal(s.add[0], t.add[0]) && less_than(s2, t2));
        }
    }
}

// ===========================================
export type strT = {
    term: T;
    gamma: T | null;
}

export interface Hyouki {
    fund(a: T, b: T): strT;
    dom(a: T): strT;
}

export type Options = {
    checkOnOffo: boolean;
    checkOnOffO: boolean;
    checkOnOffA: boolean;
    checkOnOffB: boolean;
    checkOnOffC: boolean;
    checkOnOffp: boolean;
    checkOnOffT: boolean;
};

// オブジェクトから文字列へ
function term_to_string(t: T, options: Options, strHead: string): string {
    if (options.checkOnOffp) strHead = "ψ";
    if (t.type === "zero") {
        return "0";
    } else if (t.type === "psi") {
        if (!(options.checkOnOffC && t.sub.type === "zero")) {
            if (options.checkOnOffA) {
                if (options.checkOnOffB || options.checkOnOffT)
                    return strHead + "_{" + term_to_string(t.sub, options, strHead) + "}(" + term_to_string(t.arg, options, strHead) + ")";
                if (t.sub.type === "zero") {
                    return strHead + "_0(" + term_to_string(t.arg, options, strHead) + ")";
                } else if (t.sub.type === "plus") {
                    if (t.sub.add.every((x) => equal(x, ONE)))
                        return strHead + "_" + term_to_string(t.sub, options, strHead) + "(" + term_to_string(t.arg, options, strHead) + ")";
                    return strHead + "_{" + term_to_string(t.sub, options, strHead) + "}(" + term_to_string(t.arg, options, strHead) + ")";
                } else {
                    if (equal(t.sub, ONE) || (options.checkOnOffo && equal(t.sub, OMEGA)) || (options.checkOnOffO && equal(t.sub, LOMEGA)))
                        return strHead + "_" + term_to_string(t.sub, options, strHead) + "(" + term_to_string(t.arg, options, strHead) + ")";
                    return strHead + "_{" + term_to_string(t.sub, options, strHead) + "}(" + term_to_string(t.arg, options, strHead) + ")";
                }
            }
            return strHead + "(" + term_to_string(t.sub, options, strHead) + "," + term_to_string(t.arg, options, strHead) + ")";
        }
        return strHead + "(" + term_to_string(t.arg, options, strHead) + ")";
    } else {
        return t.add.map((x) => term_to_string(x, options, strHead)).join("+");
    }
}

function to_TeX(str: string, options: Options, strHead: string): string {
    if (options.checkOnOffp || strHead === "ψ") {
        str = str.replace(RegExp("ψ", "g"), "\\psi");
    } else {
        str = str.replace(RegExp(strHead, "g"), "\\textrm{" + strHead + "}");
    }
    str = str.replace(/ω/g, "\\omega");
    str = str.replace(/Ω/g, "\\Omega");
    return str;
}

function abbrviate(str: string, options: Options, strHead: string): string {
    if (options.checkOnOffp) strHead = "ψ";
    str = str.replace(RegExp(strHead + "\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "_\\{0\\}\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "_0\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "\\(0,0\\)", "g"), "1");
    if (options.checkOnOffo) {
        str = str.replace(RegExp(strHead + "\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "_0\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "\\(0,1\\)", "g"), "ω");
    }
    if (options.checkOnOffO) {
        str = str.replace(RegExp(strHead + "_\\{1\\}\\(0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "_1\\(0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "\\(1,0\\)", "g"), "Ω");
    }
    if (options.checkOnOffT) str = to_TeX(str, options, strHead);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const numterm = str.match(/1(\+1)+/);
        if (!numterm) break;
        const matches = numterm[0].match(/1/g);
        if (!matches) throw Error("そんなことある？");
        const count = matches.length;
        str = str.replace(numterm[0], count.toString());
    }
    return str;
}

export function termToString(t: T, options: Options, strHead: string): string {
    return abbrviate(term_to_string(t, options, strHead), options, strHead);
}

export function term_to_string_gamma(t: T, options: Options, strHead: string): string {
    if (options.checkOnOffp) strHead = "ψ";
    if (t.type === "zero") {
        return "0";
    } else if (t.type === "psi") {
        let str = strHead;
        if (options.checkOnOffT) {
            str = `\\textrm{${strHead}}`;
            if (strHead === "ψ") {
                str = `\\psi`;
            }
        }
        if (!(options.checkOnOffC && t.sub.type === "zero")) {
            if (options.checkOnOffA) {
                if (options.checkOnOffB || options.checkOnOffT) {
                    if (t.sub.type === "zero") {
                        return str + "_{0}(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                    } else if (t.sub.type === "plus") {
                        return str + "_{" + stringAbbrviate(t.sub, options, strHead) + "}(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                    } else {
                        return str + "_{" + matchAndReplaceOmegas(t.sub, options, strHead) + "}(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                    }
                }
                if (t.sub.type === "zero") {
                    return str + "_0(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                } else if (t.sub.type === "plus") {
                    if (t.sub.add.every(x => equal(x, ONE)))
                        return str + "_" + t.sub.add.length + "(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                    return str + "_{" + stringAbbrviate(t.sub, options, strHead) + "}(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                } else {
                    if (equal(t.sub, ONE) || (options.checkOnOffo && equal(t.sub, OMEGA)) || (options.checkOnOffO && equal(t.sub, LOMEGA)))
                        return str + "_" + matchAndReplaceOmegas(t.sub, options, strHead) + "(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                    return str + "_{" + matchAndReplaceOmegas(t.sub, options, strHead) + "}(" + term_to_string_gamma(t.arg, options, strHead) + ")";
                }
            }
            if (t.sub.type === "zero") {
                return str + "(0," + term_to_string_gamma(t.arg, options, strHead) + ")";
            }  else if (t.sub.type === "plus") {
                return str + "(" + stringAbbrviate(t.sub, options, strHead) + "," + term_to_string_gamma(t.arg, options, strHead) + ")";
            } else {
                return str + "(" + matchAndReplaceOmegas(t.sub, options, strHead) + "," + term_to_string_gamma(t.arg, options, strHead) + ")";
            }
        }
        return str + "(" + term_to_string_gamma(t.arg, options, strHead) + ")";
    } else {
        return t.add.map((x) => term_to_string_gamma(x, options, strHead)).join("+");
    }
}

function matchAndReplaceOmegas(s: PT, options: Options, strHead: string): string {
    if (equal(s, ONE)) return `1`;
    if (options.checkOnOffo && equal(s, OMEGA)) return options.checkOnOffT ? `\\omega` : `ω`;
    if (options.checkOnOffO && equal(s, LOMEGA)) return options.checkOnOffT ? `\\Omega` : `Ω`;
    return term_to_string_gamma(s, options, strHead);
}

function stringAbbrviate(s: AT, options: Options, strHead: string): string {
    let str = s.add.map(x => matchAndReplaceOmegas(x, options, strHead)).join("+");
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const numterm = str.match(/1(\+1)+/);
        if (!numterm) break;
        const matches = numterm[0].match(/1/g);
        if (!matches) throw Error("そんなことある？");
        const count = matches.length;
        str = str.replace(numterm[0], count.toString());
    }
    return str;
}