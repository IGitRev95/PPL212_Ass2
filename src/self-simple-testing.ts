import { expect } from 'chai';
import { unparseL31, parseL31, parseL31Exp, isClassExp } from '../src/L31-ast';
import { class2proc, L31ToL3 } from '../src/q3';
import { makeOk, bind, isFailure, isOk } from '../shared/result';
import { parse as p } from "../shared/parser";



//console.log(JSON.stringify(bind(p(`(lambda(x) 5)`),parseL31Exp), null, 2));
const x = bind(p(`(class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))`), parseL31Exp);
console.log(`x: ${JSON.stringify(x, null, 2)}`);
console.log(``);
isOk(x)? isClassExp(x.value)? console.log(JSON.stringify(class2proc(x.value), null, 2)) : console.log("no2") : console.log("no1");
//console.log(bind(unparseL31(x),)


//console.log(JSON.stringify(bind(parseL31(`(L31 (define pair (class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))) (let ((p12 (pair 1 2)) (p34 (pair 3 4))) (if (> (p12 'first) (p34 'second)) #t #f)))`), x=>makeOk(unparseL31(x))), null, 2));

//expect(bind(bind(bind(p(`(class (a b) ((first (lambda () a)) (second (lambda () b)))))`),parseL31Exp),class2proc), x=>makeOk(unparseL31(x)))).to.deep.equal(makeOk(`(lambda(a b) (lambda(msg) (if (eq? msg 'first) ((lambda () a)) (if (eq? msg 'second)) ((lambda () b)) #f ))))`))


//console.log(JSON.stringify(bind(p(`(define b 1) (define c 2) (define pair(class (a b)((first (lambda () a))(second (lambda () b))(f (lambda () (+ a b c)))))(define p34 (pair 3 4))((lambda (c) (p34 ‘f))5)`),parseL31Exp), null, 2));