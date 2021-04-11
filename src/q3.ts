import { makeProcExp, ClassExp, ProcExp,  Exp, Program, makeVarDecl, IfExp, BoolExp, Binding, makeIfExp, makeBoolExp, makeAppExp, makePrimOp, makeVarRef, makeLitExp, makeProgram, isBoolExp, isNumExp, isPrimOp, isVarRef, isIfExp, isAppExp, CExp, isStrExp, isProcExp, isLetExp, makeLetExp, makeBinding, isLitExp, isClassExp, LetExp, isCExp, isExp, DefineExp, makeDefineExp } from "./L31-ast";
import { Result, makeFailure, makeOk, mapResult, bind, safe2, safe3 } from "../shared/result";
import { isEmpty, map, zipWith } from "ramda";
import { allT, first, rest, second } from "../shared/list";
import { makeSymbolSExp } from "../imp/L3-value";

/*
Purpose: Transform the methods(: Binding[]) of ClassExp to IfExp tree
Signature: methodsToIfExpTree(methodArray)
Type: [Binding[] => IfExp | BoolExp]
*/
const methodsToIfExpTree = (methodArray: Binding[]): IfExp | BoolExp =>
// if there are more methods?
(!isEmpty(methodArray)) ? makeIfExp( //making IfExp for compering given method name and it's name
                                    makeAppExp( makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp(makeSymbolSExp(first(methodArray).var.var))]),
                                    makeAppExp(first(methodArray).val,[]), // appling the method
                                    methodsToIfExpTree(rest(methodArray)) // build the remaining method tree
                                    ) : makeBoolExp(false) // end of ifExpTree 

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(exp)
Type: [ClassExp => ProcExp]
*/
export const class2proc = (exp: ClassExp): ProcExp =>  
    makeProcExp(exp.fields, // class fields are the root procedure arguments
                [makeProcExp([makeVarDecl("msg")], // sub-procedure for method by name activation
                             [methodsToIfExpTree(exp.methods)])])

/*
Purpose: special handeling with applying the recursive rewriting on LetExp
Signature: rewriteAllClassExpHandleLet(lExp)
Type: [LetExp => Result<LetExp>]
*/
const rewriteAllClassExpHandleLet = (lExp: LetExp): Result<LetExp> => { //extracting the Let ingredients for recursive applying rewriteAllClassExp
    const methods_names = map(b => b.var.var, lExp.bindings);
    const rewrited_Methods_Bodys_Results = mapResult(binding => rewriteAllClassExp(binding.val), lExp.bindings);
    const reBindings_Result = bind(rewrited_Methods_Bodys_Results, (vals: CExp[]) => makeOk(zipWith(makeBinding, methods_names, vals)));
    return safe2((bindings: Binding[], body: CExp[]) => makeOk(makeLetExp(bindings, body)))
        (reBindings_Result, mapResult(rewriteAllClassExp, lExp.body));
}
                             
/*
Purpose: Transform ClassExp to ProcExp recursivly off all AST
Signature: rewriteAllClassExp(e)
Type: [CExp => Result<Exp>]
*/
const rewriteAllClassExp = (e: CExp): Result<CExp> =>
isNumExp(e) ? makeOk(e) :
isBoolExp(e) ? makeOk(e):
isStrExp(e) ? makeOk(e) :
isPrimOp(e) ? makeOk(e) :
isVarRef(e) ? makeOk(e) :
isAppExp(e) ? safe2((rator: CExp, rands: CExp[])=>makeOk(makeAppExp(rator,rands))) (rewriteAllClassExp(e.rator), mapResult(rewriteAllClassExp, e.rands)) :
isIfExp(e) ? safe3((test: CExp,then: CExp,alt: CExp)=>makeOk(makeIfExp(test,then,alt)))
                        (rewriteAllClassExp(e.test),
                         rewriteAllClassExp(e.then),
                         rewriteAllClassExp(e.alt)) :
isProcExp(e) ? bind(mapResult(rewriteAllClassExp,e.body), (body: CExp[])=>makeOk(makeProcExp(e.args,body))) :
isLetExp(e) ? rewriteAllClassExpHandleLet(e) :
isLitExp(e)? makeOk(e) :
isClassExp(e) ? rewriteAllClassExp(class2proc(e)) :
makeFailure(`Unexpected CExp ${e}`)

/*
Purpose: special handeling with applying the recursive rewriting on DefineExp
Signature: rewriteAllClassExpHandleDefine(e)
Type: [DefineExp => Result<DefineExp>]
*/
const rewriteAllClassExpHandleDefine = (e: DefineExp): Result<DefineExp> =>
    bind(rewriteAllClassExp(e.val), (value: CExp) => makeOk(makeDefineExp(e.var, value)));

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
isExp(exp)? 
            isCExp(exp) ? rewriteAllClassExp(exp) : 
                          rewriteAllClassExpHandleDefine(exp)
            : bind( mapResult( e=>L31ToL3(e), exp.exps), (exps: (Exp | Program)[]) => allT(isExp,exps) ? makeOk(makeProgram(exps)) :
                                                                                      makeFailure(`Meta-Programing Detected (ProgramExp inside a ProgramExp)`));