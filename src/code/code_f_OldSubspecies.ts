import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "亞";
export class Old_Subspecies_Function implements Hyouki {
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
            if (equal(domsub, Z) || equal(domsub, ONE)) {
                return t;
            } else {
                return domsub;
            }
        } else {
            return OMEGA;
        }
    }
}

// x[y]
function fund(x: T, y: T): T {
    if (x.type == "zero") {
        return Z;
    } else if (x.type == "plus") {
        const lastfund = fund(x.add[x.add.length - 1], y);
        const remains = sanitize_plus_term(x.add.slice(0, x.add.length - 1));
        return plus(remains, lastfund);
    } else {
        const sub = x.sub;
        const arg = x.arg;
        const domsub = dom(sub);
        const domarg = dom(arg);
        if (equal(domarg, Z)) {
            if (equal(domsub, Z)) {
                return Z;
            } else if (equal(domsub, ONE)) {
                return y;
            } else {
                return psi(fund(sub, y), arg);
            }
        } else if (equal(domarg, ONE)) {
            if (equal(dom(y), ONE)) {
                return plus(fund(x, fund(y, Z)), psi(sub, fund(arg, Z)));
            } else {
                return Z;
            }
        } else if (equal(domarg, OMEGA)) {
            return psi(sub, fund(arg, y));
        } else {
            if (domarg.type != "psi") throw Error("なんでだよ");
            const c = domarg.sub;
            if (equal(dom(y), ONE)) {
                const p = fund(x, fund(y, Z));
                if (p.type != "psi") throw Error("なんでだよ");
                const gamma = p.arg;
                return psi(sub, fund(arg, psi(fund(c, Z), gamma)));
            } else {
                return psi(sub, fund(arg, psi(fund(c, Z), Z)));
            }
        }
    }
}