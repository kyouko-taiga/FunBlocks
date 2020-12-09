import * as AST from 'FunBlocks/AST'
import { parse } from 'FunBlocks/Parser/Parser'
import { recordTypes } from 'FunBlocks/Parser/TypeInferer'

const stringifyTypeRef = (type: AST.TypeRef): string =>{
  let ret : string = ' (';

  if(type instanceof AST.TypeDeclRef){

    ret += `${type.name}`;

    for (let arg of type.arguments){
      const argString = stringifyTypeRef(arg);
      ret += ` ${argString}`;
    }
  }if(type instanceof AST.TypeVarRef){
    const typeName = type.label;
    ret += ` \$${typeName}`;
  }
  ret += ")";
  return ret;
}

const stringifyRuleCaseTypes = (label : string, types : Array<AST.TypeRef>) : string => {

    let ret : string = label;
    for(let type of types){
      ret += stringifyTypeRef(type);
    }
    return ret;
}

describe("TypeInferer", () =>{
  test("should return correct types", () => {

    const programInput = `
    type List $T :: empty | cons $T (List $T)

    case ajoute($x, cons($y, $tail)) => cons($y, ajoute($x, $tail))`;


    // const rootExpression: AST.Expr = new AST.Expr({
    //   range: {
    //     lowerBound: { line: 2, column: 10, offset: 10 },
    //     upperBound: { line: 2, column: 31, offset: 31 }
    //   },
    //   label: 'cons',
    //   type: null,
    //   subterms : []
    // });
    //
    // const RuleCaseDecl =  new AST.RuleCaseDecl({
    //   range: {
    //     lowerBound: { line: 2, column: 5, offset: 5 },
    //     upperBound: { line: 2, column: 35, offset: 35 }
    //   }
    // });

    const inputAST = parse(programInput);
    const typeInformation : Dictionary<Array<AST.TypeRef>> = recordTypes(inputAST);

    const ruleCases = Object.keys(typeInformation);
    for(let ruleCase of ruleCases){
      const types = typeInformation[ruleCase];
      const actual = stringifyRuleCaseTypes(ruleCase, types);
      console.log(actual);

    }

    const actual0 = stringifyRuleCaseTypes(ruleCases[0], typeInformation[ruleCases[0]]);
    const expected0 = 'ajoute ($A) (List $T) (List $T)';

    //const ruleCaseDecl = inputAST.decls[1] as AST.RuleCaseDecl;

    //console.log(ruleCaseDecl.left);
  });


});
