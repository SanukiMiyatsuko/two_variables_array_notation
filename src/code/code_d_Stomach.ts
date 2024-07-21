import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options, less_than } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "胃"
export class Stomach_Function implements Hyouki {
    fund(a: T, b: T, options: Options): strT {
        const result = fund(a, b);
        return ({
            str: abbrviate(term_to_string(result, options, strHead), options, strHead),
            term: result
        });
    }

    dom(a: T, options: Options): strT {
        const result = dom(a);
        return ({
            str: abbrviate(term_to_string(result, options, strHead), options, strHead),
            term: result
        });
    }
}

// dom(t)
function dom(t: T): ZT | PT {
    if (t.type === "zero") {
        return Z;
    } else if (t.type === "plus") {
        return dom(t.add[t.add.length - 1]);
    } else {
        const domb = dom(t.arg);
        if (domb.type === "zero") {
            const doma = dom(t.sub);
            if (doma.type === "zero" || equal(doma, ONE)) {
                return t;
            }
            return OMEGA;
        } else if (equal(domb, ONE)) {
            return OMEGA;
        } else {
            const domd = dom(domb.arg);
            if (equal(domd, Z)) {
                if (less_than(t, domb)) return OMEGA;
                return t;
            }
            return OMEGA;
        }
    }
}

// x[y]
function fund(s: T, t: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const lastfund = fund(s.add[s.add.length - 1], t);
        const remains = sanitize_plus_term(s.add.slice(0, s.add.length - 1));
        return plus(remains, lastfund);
    } else {
        const a = s.sub;
        const b = s.arg;
        const domb = dom(b);
        if (domb.type === "zero") {
            const doma = dom(a);
            if (doma.type === "zero" || equal(doma, ONE)) {
                return t;
            } else if (equal(a, OMEGA)) {
                return psi(fund(a, t), b);
            } else {
                const domd = dom(doma.arg);
                if (domd.type === "zero") {
                    const c = doma.sub;
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const gamma = p.arg;
                        return psi(a, fund(b, psi(fund(c, Z), gamma)));
                    } else {
                        return psi(a, fund(b, psi(fund(c, Z), Z)));
                    }
                } else {
                    const e = domd.sub;
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const gamma = p.arg;
                        return psi(a, fund(b, psi(fund(e, Z), gamma)));
                    } else {
                        return psi(a, fund(b, psi(fund(e, Z), Z)));
                    }
                }
            }
        } else if (equal(domb, ONE)) {
            if (equal(dom(t), ONE)) {
                return plus(fund(s, fund(t, Z)), psi(a, fund(b, Z)));
            } else {
                return Z;
            }
        } else if (equal(domb, OMEGA)) {
            return psi(a, fund(b, t));
        } else {
            const domd = dom(domb.arg);
            if (domd.type === "zero") {
                if (less_than(s, domb)) {
                    const c = domb.sub;
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const gamma = p.arg;
                        return psi(a, fund(b, psi(fund(c, Z), gamma)));
                    } else {
                        return psi(a, fund(b, psi(fund(c, Z), Z)));
                    }
                }
                return psi(a, fund(b, t));
            } else {
                const e = domd.sub;
                if (equal(dom(t), ONE)) {
                    const p = fund(s, fund(t, Z));
                    if (p.type !== "psi") throw Error("なんでだよ");
                    const gamma = p.arg;
                    return psi(a, fund(b, psi(fund(e, Z), gamma)));
                } else {
                    return psi(a, fund(b, psi(fund(e, Z), Z)));
                }
            }
        }
    }
}