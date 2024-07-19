import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options, less_than } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "茸";
export class Side_Mushroom_Function implements Hyouki {
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
    if (t.type == "zero") {
        return Z;
    } else if (t.type == "plus") {
        return dom(t.add[t.add.length - 1]);
    } else {
        const domsub = dom(t.sub);
        const domarg = dom(t.arg);
        if (equal(domarg, Z)) {
            if (equal(domsub, Z) || equal(domsub, ONE)) return t;
            return domsub;
        } else if (equal(domarg, ONE)) {
            return OMEGA;
        } else {
            if (less_than(domarg, t)) return domarg;
            if (domarg.type != "psi") throw Error("そうはならんやろ");
            const domargarg = dom(domarg.arg);
            if (less_than(domargarg, domarg)) {
                if (equal(domarg.sub, plus(t.sub, ONE))) return t;
                return OMEGA;
            } else {
                return OMEGA;
            }
        }
    }
}

// find_parent(t)
function find_parent(s: T, t: T): T {
    if (s.type == "zero") {
        return Z;
    } else if (s.type == "plus") {
        const sub = s.add[0].sub;
        const remnant = sanitize_plus_term(s.add.slice(1));
        if (sub == t) return s;
        return find_parent(remnant, t);
    } else {
        const sub = s.sub;
        const arg = s.arg;
        if (equal(sub, t)) return s;
        return find_parent(arg, t);
    }
}

// x[y]
function fund(s: T, t: T): T {
    if (s.type == "zero") {
        return Z;
    } else if (s.type == "plus") {
        const lastfund = fund(s.add[s.add.length - 1], t);
        const remains = sanitize_plus_term(s.add.slice(0, s.add.length - 1));
        return plus(remains, lastfund);
    } else {
        const sub = s.sub;
        const arg = s.arg;
        const domsub = dom(sub);
        const domarg = dom(arg);
        if (equal(domarg, Z)) {
            if (equal(domsub, Z)) {
                return Z;
            } else if (equal(domsub, ONE)) {
                return t;
            } else {
                return psi(fund(sub, t), Z);
            }
        } else if (equal(domarg, ONE)) {
            if (less_than(t, OMEGA) && equal(dom(t), ONE)) {
                return plus(fund(s, fund(t, Z)), psi(sub, fund(arg, Z)));
            } else {
                return Z;
            }
        } else {
            if (less_than(domarg, s)) {
                return psi(sub, fund(arg, t));
            } else {
                if (domarg.type != "psi") throw Error("なんでだよ");
                const domargarg = dom(domarg.arg);
                if (domargarg.type == "zero") {
                    const c = domarg.sub;
                    if (equal(c, plus(sub, ONE))) return psi(sub, fund(arg, t));
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type != "psi") throw Error("なんでだよ");
                        const gamma = p.arg;
                        return psi(sub, fund(arg, psi(fund(c, Z), gamma)));
                    } else {
                        return psi(sub, fund(arg, psi(fund(c, Z), Z)));
                    }
                } else {
                    const e = domargarg.sub;
                    if (equal(e, plus(sub, ONE))) {
                        if (equal(dom(t), ONE)) {
                            const p = fund(s, fund(t, Z));
                            if (p.type != "psi") throw Error("なんでだよ");
                            const gamma = p.arg;
                            return psi(sub, fund(arg, find_parent(gamma, sub)));
                        } else {
                            return psi(sub, fund(arg, Z));
                        }
                    } else {
                        if (equal(dom(t), ONE)) {
                            const p = fund(s, fund(t, Z));
                            if (p.type != "psi") throw Error("なんでだよ");
                            const gamma = p.arg;
                            return psi(sub, fund(arg, psi(fund(e, Z), gamma)));
                        } else {
                            return psi(sub, fund(arg, psi(fund(e, Z), Z)));
                        }
                    }
                }
            }
        }
    }
}