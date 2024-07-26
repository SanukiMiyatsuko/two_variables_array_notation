import { Hyouki, strT, ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, less_than } from "../intersection";

export class Buchholzs_Psi_Function implements Hyouki {
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
function dom(s: T): ZT | PT {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        return dom(s.add[s.add.length - 1]);
    } else { // t.type === "psi"
        const domb = dom(s.arg);
        if (domb.type === "zero") {
            const doma = dom(s.sub);
            if (doma.type === "zero" || equal(doma, ONE)) return s;
            return doma;
        } else if (equal(domb, ONE)) {
            return OMEGA;
        } else {
            if (less_than(domb, s)) return domb;
            return OMEGA;
        }
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
                const doma = dom(s.sub);
                if (doma.type === "zero" || equal(doma, ONE)) return t;
                return psi(fund(a, t), b);
            } else if (equal(domb, ONE)) {
                if (!bp) bp = psi(a, fund(b, Z));
                if (equal(dom(t), ONE)) {
                    return plus(fund(s, fund(t, Z)), psi(a, fund(b, Z)));
                } else {
                    return Z;
                }
            } else {
                if (less_than(domb, s)) {
                    return psi(a, fund(b, t));
                } else {
                    const c = domb.sub;
                    if (!bp) bp = psi(fund(c, Z), fund(b, Z));
                    if (equal(dom(t), ONE)) {
                        const p = fund(s, fund(t, Z));
                        if (p.type !== "psi") throw Error("pの型がpsiではない");
                        const gamma = p.arg;
                        return psi(a, fund(b, psi(fund(c, Z), gamma)));
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