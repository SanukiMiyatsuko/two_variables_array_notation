import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "〇";
export class Zero_Function implements Hyouki {
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
    } else { // t.type === "psi"
        if (equal(s, ONE)) return ONE;
        return OMEGA;
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
            const doma = dom(s.sub);
            if (doma.type === "zero") return Z;
            if (equal(doma, ONE)) {
                if (equal(t, Z)) return Z;
                return psi(fund(a, Z), fund(s, fund(t, Z)));
            }
            return psi(fund(a, t), b);
        } else if (equal(domb, ONE)) {
            if (equal(dom(t), ONE)) {
                return plus(fund(s, fund(t, Z)), psi(a, fund(b, Z)));
            } else {
                return Z;
            }
        } else {
            return psi(a, fund(b, t));
        }
    }
}