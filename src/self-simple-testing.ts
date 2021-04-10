import { expect } from 'chai';
import { unparseL31, parseL31, parseL31Exp } from '../src/L31-ast';
import { L31ToL3 } from '../src/q3';
import { makeOk, bind, isFailure } from '../shared/result';
import { parse as p } from "../shared/parser";


//console.log(JSON.stringify(bind(p(`(define par (class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b))))))`),parseL31Exp), null, 2));

console.log(JSON.stringify(bind(parseL31(`(L31 (define pair (class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))) (let ((p12 (pair 1 2)) (p34 (pair 3 4))) (if (> (p12 'first) (p34 'second)) #t #f)))`), x=>makeOk(unparseL31(x))), null, 2));