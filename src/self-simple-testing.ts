import { expect } from 'chai';
import { unparseL31, parseL31, parseL31Exp } from '../src/L31-ast';
import { L31ToL3 } from '../src/q3';
import { makeOk, bind, isFailure } from '../shared/result';
import { parse as p } from "../shared/parser";


console.log(JSON.stringify(bind(p(`(class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))`),parseL31Exp), null, 2));