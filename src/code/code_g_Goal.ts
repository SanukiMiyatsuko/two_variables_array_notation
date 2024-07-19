import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options, less_than } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "G";
export class Goal_Function implements Hyouki {
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
    } else { // t.type === "psi"
        const b = t.arg;
        const domb = dom(b);
        if (domb.type === "zero") {
            const doma = dom(t.sub);
            if (doma.type === "zero" || equal(doma, ONE)) {
                return t;
            } else {
                return doma;
            }
        } else if (equal(domb, ONE)) {
            return OMEGA;
        } else if (equal(domb, OMEGA)) {
            return OMEGA;
        } else {
            const d = domb.arg;
            const domd = dom(d);
            if (domd.type === "zero") {
                return t;
            } else {
                if (less_than(b, d)) {
                    return OMEGA;
                } else {
                    return domb;
                }
            }
        }
    }
}

// find(s, t)
function find(s: T, t: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const sub = s.add[0].sub;
        const remnant = sanitize_plus_term(s.add.slice(1));
        if (equal(sub, t)) return s;
        return find(remnant, t);
    } else {
        return s;
    }
}

// replace(s, t)
function replace(s: T, t: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const a = s.add[0];
        const b = sanitize_plus_term(s.add.slice(1));
        return plus(replace(a, t), replace(b, t));
    } else {
        return psi(t, s.arg);
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
            if (equal(doma, Z) || equal(doma, ONE)) {
                return t;
            } else {
                return psi(fund(a, t), b);
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
            const d = domb.arg;
            const domd = dom(d);
            if (domd.type === "zero" || less_than(d, b) || equal(d, b)) {
                return psi(a, fund(b, t));
            } else {
                const e = domd.sub;
                if (b.type === "plus") {
                    const g = b.add[b.add.length - 1].sub;
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("bの型がplusのときのpの型がpsiではない");
                        const gamma = p.arg;
                        return psi(a, fund(b, replace(find(gamma, g), fund(e, Z))));
                    } else {
                        return psi(a, fund(b, Z));
                    }
                } else {
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("bの型がpsiのときのpの型がpsiではない");
                        const gamma = p.arg;
                        return psi(a, fund(b, replace(gamma, fund(e, Z))));
                    } else {
                        return psi(a, fund(b, Z));
                    }
                }
            }
        }
    }
}