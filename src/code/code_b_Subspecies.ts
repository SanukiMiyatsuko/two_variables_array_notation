import { ZT, PT, T, Z, ONE, OMEGA, equal, psi, plus, sanitize_plus_term, term_to_string, abbrviate, Options } from "../intersection";
import { Hyouki, strT } from "../junction";

const strHead = "亜";
export class Subspecies_Function implements Hyouki {
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
                return OMEGA;
            }
        } else {
            return OMEGA;
        }
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
            } else if (equal(domsub, OMEGA)) {
                return psi(fund(sub, t), arg);
            } else {
                if (domsub.type != "psi") throw Error("なんでだよ");
                const c = domsub.sub;
                if (equal(dom(t), ONE)) {
                    const p = fund(s, fund(t, Z));
                    if (p.type != "psi") throw Error("なんでだよ");
                    const gamma = p.sub;
                    return psi(fund(sub, psi(fund(c, Z), gamma)), arg);
                } else {
                    return psi(fund(sub, psi(fund(c, Z), Z)), arg);
                }
            }
        } else if (equal(domarg, ONE)) {
            if (equal(dom(t), ONE)) {
                return plus(fund(s, fund(t, Z)), psi(sub, fund(arg, Z)));
            } else {
                return Z;
            }
        } else if (equal(domarg, OMEGA)) {
            return psi(sub, fund(arg, t));
        } else {
            if (domarg.type != "psi") throw Error("なんでだよ");
            const c = domarg.sub;
            if (equal(dom(t), ONE)) {
                const p = fund(s, fund(t, Z));
                if (p.type != "psi") throw Error("なんでだよ");
                const gamma = p.arg;
                return psi(sub, fund(arg, psi(fund(c, Z), gamma)));
            } else {
                return psi(sub, fund(arg, psi(fund(c, Z), Z)));
            }
        }
    }
}