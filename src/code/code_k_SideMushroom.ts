import { Hyouki, strT, ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, less_than } from "../intersection";

export class Side_Mushroom_Function implements Hyouki {
    fund(a: T, b: T): strT {
        const result = fundAndGamma(a, b);
        return ({
            term: result.fund,
            gamma: result.gammat ? result.gammat : null,
        });
    }

    dom(a: T): strT {
        const result = dom(a);
        return ({
            term: result,
            gamma: null,
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

function fundAndGamma(a: T, b: T) {
    let bp: T | null = null;
    // x[y]
    function fund(s: T, t: T): T {
        if (s.type == "zero") {
            return Z;
        } else if (s.type == "plus") {
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
                } else {
                    return psi(fund(a, t), Z);
                }
            } else if (equal(domb, ONE)) {
                if (!bp) bp = psi(a, fund(b, Z));
                if (less_than(t, OMEGA) && equal(dom(t), ONE)) {
                    return plus(fund(s, fund(t, Z)), psi(a, fund(b, Z)));
                } else {
                    return Z;
                }
            } else {
                if (less_than(domb, s)) {
                    return psi(a, fund(b, t));
                } else {
                    const domd = dom(domb.arg);
                    if (domd.type == "zero") {
                        const c = domb.sub;
                        if (equal(c, plus(a, ONE))) {
                            return psi(a, fund(b, t));
                        } else {
                            if (!bp) bp = psi(fund(c, Z), fund(b, Z));
                            if (equal(dom(t), ONE)) {
                                const p = fund(s, fund(t, Z));
                                if (p.type != "psi") throw Error("なんでだよ");
                                const gamma = p.arg;
                                return psi(a, fund(b, psi(fund(c, Z), gamma)));
                            } else {
                                return psi(a, fund(b, Z));
                            }
                        }
                    } else {
                        const e = domd.sub;
                        if (equal(e, plus(a, ONE))) {
                            if (!bp) bp = find_parent(fund(b, Z), a);
                            if (equal(dom(t), ONE)) {
                                const p = fund(s, fund(t, Z));
                                if (p.type != "psi") throw Error("なんでだよ");
                                const gamma = p.arg;
                                return psi(a, fund(b, find_parent(gamma, a)));
                            } else {
                                return psi(a, fund(b, Z));
                            }
                        } else {
                            if (!bp) bp = psi(fund(e, Z), fund(b, Z));
                            if (equal(dom(t), ONE)) {
                                const p = fund(s, fund(t, Z));
                                if (p.type != "psi") throw Error("なんでだよ");
                                const gamma = p.arg;
                                return psi(a, fund(b, psi(fund(e, Z), gamma)));
                            } else {
                                return psi(a, fund(b, Z));
                            }
                        }
                    }
                }
            }
        }
    }

    return ({
        fund: fund(a, b),
        gammat: bp,
    });
}