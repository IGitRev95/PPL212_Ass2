import { is, isEmpty, map } from 'ramda';
import { AtomicExp, CExp, Exp, isAppExp, isAtomicExp, isBoolExp, isCExp, isDefineExp, isExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isVarRef, PrimOp, Program } from '../imp/L3-ast';
import { Result, makeFailure, mapResult, makeOk, bind, safe2, safe3 } from '../shared/result';


export const l2PrimOpToPython=(atom:PrimOp):Result<string>=>
(atom.op==="=" || atom.op==="eq?")? makeOk("==") : 
(atom.op==="number?")? makeOk("(lambda x : (type(x) == int or type(x) == float))"):
(atom.op==="boolean?")? makeOk("(lambda x : (type(x) == bool))") :
makeOk(atom.op);

const isPriFixOp = (x: string): boolean =>
    !(["+", "-", "*", "/", ">", "<", "==", "and", "or"].includes(x));

const isTypeCheckOp = (x: string):boolean =>
["number?","boolean?"].includes(x);

export const l2AtomicToPython=(atom:AtomicExp): Result<string>=>
isNumExp(atom)? makeOk(`${atom.val}`) :
isBoolExp(atom)? makeOk((atom.val)? 'true':'false') :
isPrimOp(atom)? l2PrimOpToPython(atom):
isVarRef(atom)? makeOk(atom.var):
makeFailure(`Error in func: l2AtomicToPython : Unknown AtomicExp ${atom}`);

export const l2CExpToPython= (cexp:CExp): Result<string>=>
isAtomicExp(cexp)? l2AtomicToPython(cexp) :
isAppExp(cexp)? (isPrimOp(cexp.rator) && !isTypeCheckOp(cexp.rator.op))? safe2((rator: string, rands: string[]) => makeOk((isPriFixOp(rator))? ("(" + rator + " " + rands.join(" ")+")" ) : "("+rands.join(" "+rator+" ")+")" ))
                                                                            (l2CExpToPython(cexp.rator), mapResult(l2CExpToPython, cexp.rands)):
                                                                          safe2((rator: string, rands: string[])=>makeOk((isEmpty(cexp.rands))? "("+rator+")" :rator + "("+rands.join(",")+")")) //isEmpty perpose ((f)) instead of (f)()
                                                                            (l2CExpToPython(cexp.rator), mapResult(l2CExpToPython, cexp.rands)):
isIfExp(cexp)? safe3((test:string, then:string, alt:string) => makeOk("("+then +" if " + test +" else " + alt+")"))
                        (l2CExpToPython(cexp.test),l2CExpToPython(cexp.then),l2CExpToPython(cexp.alt)):
isProcExp(cexp)? bind(mapResult(l2CExpToPython,cexp.body),(body:string[])=>makeOk("(lambda "+map(arg=> arg.var,cexp.args).join(",")+" : "+body+")")):
makeFailure(`Error in func: l2CExpToPython : Unknown CExp ${cexp}`);
 
export const l2ExpToPython= (exp:Exp): Result<string> =>
isDefineExp(exp)? bind(l2CExpToPython(exp.val), v=>makeOk(`${exp.var.var} = ${v}`)) :
                  isCExp(exp)? l2CExpToPython(exp) :
                               makeFailure(`Error in func: l2ExpToPython : Unknown Exp ${exp}`);

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
isProgram(exp)? bind((mapResult(l2ExpToPython,exp.exps)),(exps:string[])=>makeOk(exps.join('\n'))):
                isExp(exp)? l2ExpToPython(exp) :
                            makeFailure(`Error in func: l2ToPython : Unknown Exp | Program ${exp}`);

