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
function dom(s: T): ZT | PT {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        return dom(s.add[s.add.length - 1]);
    } else {
        const domb = dom(s.arg);
        if (domb.type === "zero") {
            const doma = dom(s.sub);
            if (doma.type === "zero" || equal(doma, ONE)) {
                return s;
            }
            return OMEGA;
        } else if (equal(domb, ONE)) {
            return OMEGA;
        } else {
            const domd = dom(domb.arg);
            if (equal(domd, Z)) {
                if (less_than(s, domb)) return OMEGA;
                return s;
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
                        const gamma = p.sub;
                        return psi(fund(a, psi(fund(c, Z), gamma)), b);
                    } else {
                        return psi(fund(a, psi(fund(c, Z), Z)), b);
                    }
                } else {
                    const e = domd.sub;
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const gamma = p.sub;
                        return psi(fund(a, psi(fund(e, Z), gamma)), b);
                    } else {
                        return psi(fund(a, psi(fund(e, Z), Z)), b);
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