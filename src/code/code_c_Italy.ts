import { Hyouki, strT, ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term } from "../intersection";

export class Italy_Function implements Hyouki {
    fund(a: T, b: T): strT {
        const result = fundAndGamma(a, b);
        return ({
            term: result.fund,
            gamma: result.gammat,
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
            } else {
                return OMEGA;
            }
        } else if (equal(domb, ONE)) {
            return OMEGA;
        } else {
            const domd = dom(domb.arg);
            if (equal(domd, Z)) return s;
            return OMEGA;
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

function fundAndGamma(a: T, b: T) {
    let bp: T | null = null;
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
                } else if (equal(doma, OMEGA)) {
                    return psi(fund(a, t), b);
                } else {
                    const c = doma.sub;
                    const domd = dom(doma.arg);
                    if (domd.type === "zero") {
                        if (!bp) bp = psi(fund(c, Z), fund(a, Z));
                        if (equal(dom(t), ONE)) {
                            const p = fund(s, fund(t, Z));
                            if (p.type !== "psi") throw Error("なんでだよ");
                            const gamma = p.sub;
                            return psi(fund(a, psi(fund(c, Z), gamma)), b);
                        } else {
                            return psi(fund(a, Z), b);
                        }
                    } else {
                        const e = domd.sub;
                        if (!bp) bp = replace(find(fund(a, Z), c), fund(e, Z));
                        if (equal(dom(t), ONE)) {
                            const p = fund(s, fund(t, Z));
                            if (p.type !== "psi") throw Error("なんでだよ");
                            const gamma = p.sub;
                            return psi(fund(a, replace(find(gamma, c), fund(e, Z))), b);
                        } else {
                            return psi(fund(a, Z), b);
                        }
                    }
                }
            } else if (equal(domb, ONE)) {
                if (!bp) bp = psi(a, fund(b, Z));
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
                    return psi(a, fund(b, t));
                } else {
                    const c = domb.sub;
                    const e = domd.sub;
                    if (!bp) bp = replace(find(fund(b, Z), c), fund(e, Z));
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const gamma = p.arg;
                        return psi(a, fund(b, replace(find(gamma, c), fund(e, Z))));
                    } else {
                        return psi(a, fund(b, Z));
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