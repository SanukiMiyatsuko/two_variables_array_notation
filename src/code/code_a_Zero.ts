import { Hyouki, strT, ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term } from "../intersection";

export class Zero_Function implements Hyouki {
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
    } else { // t.type === "psi"
        if (equal(s, ONE)) return ONE;
        return OMEGA;
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
                if (doma.type === "zero") {
                    return Z;
                } else if (equal(doma, ONE)) {
                    if (!bp) bp = psi(fund(a, Z), Z);
                    if (equal(dom(t), ONE)) return psi(fund(a, Z), fund(s, fund(t, Z)));
                    return Z;
                } else {
                    return psi(fund(a, t), b);
                }
            } else if (equal(domb, ONE)) {
                if (!bp) bp = psi(a, fund(b, Z));
                if (equal(dom(t), ONE)) return plus(fund(s, fund(t, Z)), psi(a, fund(b, Z)));
                return Z;
            } else {
                return psi(a, fund(b, t));
            }
        }
    }

    return ({
        fund: fund(a, b),
        gammat: bp,
    });
}