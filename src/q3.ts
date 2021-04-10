import { makeProcExp, ClassExp, ProcExp,  Exp, Program, makeVarDecl, IfExp, BoolExp, Binding, makeIfExp, makeBoolExp, makeAppExp, makePrimOp, makeVarRef, makeLitExp } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { isEmpty } from "ramda";
import { first, rest } from "../shared/list";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
const methodsToIfExpTree = (methodArray: Binding[]): IfExp | BoolExp =>
// if there are more methods?
(!isEmpty(methodArray)) ? makeIfExp( //making IfExp for compering given method name and it's name
                                    makeAppExp( makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp(first(methodArray).var.var)]),
                                    first(methodArray).val, // appling the method
                                    methodsToIfExpTree(rest(methodArray)) // build the remaining method tree
                                    ) : makeBoolExp(false) // end of ifExpTree 

export const class2proc = (exp: ClassExp): ProcExp =>  
    makeProcExp(exp.fields, // class fields are the root procedure arguments
                [makeProcExp([makeVarDecl("msg")], // sub-procedure for method by name activation
                             [methodsToIfExpTree(exp.methods)])])




/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
makeOk(makeBoolExp(true))    
//makeFailure("TODO");
