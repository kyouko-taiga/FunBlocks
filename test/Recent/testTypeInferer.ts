import * as AST from 'FunBlocks/AST'
import { parse } from 'FunBlocks/Parser/Parser'
import { recordTypes, TypeInfo } from 'FunBlocks/Parser/TypeInferer'
import { findCycles } from 'FunBlocks/Parser/CycleDetector'

const stringifyTypeRef = (type: AST.TypeRef): string =>{
  let ret : string = '';

  if(type instanceof AST.TypeDeclRef){

    ret += ` (${type.name}`;

    for (let arg of type.arguments){
      const argString = stringifyTypeRef(arg);
      ret += `${argString} `;
    }
    ret += `)`;
  } else if(type instanceof AST.TypeVarRef){
    const typeName = type.label;
    ret += ` \$${typeName}`;
  }
  //
  // else if (type == null){
  //   console.log(type);
  // }
  return ret;
}

const stringifyRuleCaseTypes = (label : string, types : Array<AST.TypeRef>) : string => {

    let ret : string = `${label} ::`;
    for(let i=0 ; i<types.length; ++i){
      if( i == (types.length-1)){
        ret += ' =>';
      }else if (i>0){
        ret += ' ->';
      }
      ret += stringifyTypeRef(types[i]);
    }
    return ret;
}


describe("TypeInferer", () =>{
  test("ajoute to list, no rule references", () => {

    // const programInput = `
    // type List $T :: empty | cons $T (List $T)
    //
    // case ajoute($x, cons($y, $tail)) => cons($y, ajoute($x, $tail))`;

    // const programInput = `
    // type List $T :: empty | cons $T (List $T)
    //
    // case ajoute($x, cons($y, $tail)) => empty`;

    const programInput = `
    type List $T :: empty | cons $T (List $T)
    rule ajoute $T :: $T -> List $T => List $T
    case ajoute($x, cons($y, $tail)) => cons($y, $tail)`;

    const inputAST = parse(programInput);
    const typeInfo : TypeInfo = recordTypes(inputAST);
    const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;

    const actual = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
    console.log(actual);
    const expected = 'ajoute ($A) (List $B)(List $C)';
// ajoute $T0 $B (List $T2 )
    //const ruleCaseDecl = inputAST.decls[1] as AST.RuleCaseDecl;

    //console.log(ruleCaseDecl.left);
  });



// test("ajoute to list, no rule reference", () => {
//
//   const programInput = `
//   type List $T :: empty | cons $T (List $T)
//   case ajoute($x, empty) => cons($x, empty))`;
//
//   const inputAST = parse(programInput);
//   const typeInfo : TypeInfo = recordTypes(inputAST);
//   const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;
//
//   const actual = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
//   console.log(actual);
//   const expected = 'ajoute :: $T0 -> (List $T0 ) => (List $T0 )';
//
// });
//
//   test("ajoute to list, with rule reference", () => {
//
//     const programInput = `
//     type List $T :: empty | cons $T (List $T)
//     case ajoute($x, cons($y, $tail)) => cons($y, ajoute($x, $tail))`;
//
//     const inputAST = parse(programInput);
//     const typeInfo : TypeInfo = recordTypes(inputAST);
//     const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;
//
//     const actual = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
//     console.log(actual);
//     const expected = 'ajoute :: $T0 -> (List $T0 ) => (List $T0 )';
//
//   });
//
//   test("ajoute to list, with two rule cases", () => {
//
//     const programInput = `
//     type List $T :: empty | cons $T (List $T)
//     case ajoute($x, cons($y, $tail)) => cons($y, ajoute($x, $tail))
//     case ajoute($x, empty) => cons($x, empty)`;
//
//     const inputAST = parse(programInput);
//
//     const typeInfo : TypeInfo = recordTypes(inputAST);
//     const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;
//
//     const actual = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
//     console.log(actual);
//     const expected = 'ajoute :: $T4 -> (List $T4 ) => (List $T4 )';
//     // assertTrue(actual == expected);
//
//   });

  test("rule reference as top term", () => {

    const programInput = `
    type List $T :: empty | cons $T (List $T)
    case ajoute($x, cons($y, $tail)) => sth($y, cons($x, $tail))
    case sth($x, cons($y, $tail)) => $tail`;

    const inputAST = parse(programInput);

    const typeInfo : TypeInfo = recordTypes(inputAST);
    const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;

    const ajoute = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
    const sth = stringifyRuleCaseTypes('sth', typeInformation['sth']);
    console.log(ajoute);
    console.log(sth);
    const expected = 'ajoute ($A) (List $B)(List $C)';

  });


    test("rule references with cycle", () => {

      const programInput = `
      type List $T :: empty | cons $T (List $T)
      case ajoute($x, cons($y, $tail)) => sth($y, cons($x, $tail))
      case ajoute($x, empty) => cons($x, empty)
      case sth($x, cons($y, $tail)) => ajoute($y, empty)`;

      const inputAST = parse(programInput);

      const typeInfo : TypeInfo = recordTypes(inputAST);
      const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;

      const ajoute = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
      const sth = stringifyRuleCaseTypes('sth', typeInformation['sth']);
      console.log(ajoute);
      console.log(sth);
      const expected = 'ajoute ($A) (List $B)(List $C)';

    });

    test("rule references with type undefined", () => {

      const programInput = `
      type List $T :: empty | cons $T (List $T)
      case ajoute($x, cons($y, $tail)) => sth($y, cons($x))
      case ajoute($x, empty) => cons($x, empty)
      case sth($x, cons($y, $tail)) => ajoute($y, empty)`;

      const inputAST = parse(programInput);

      const typeInfo : TypeInfo = recordTypes(inputAST);
      const typeInformation : Dictionary<Array<AST.TypeRef>> = typeInfo.ruleTypes;

      const ajoute = stringifyRuleCaseTypes('ajoute', typeInformation['ajoute']);
      const sth = stringifyRuleCaseTypes('sth', typeInformation['sth']);
      console.log(ajoute);
      console.log(sth);
      const expected = 'ajoute ($A) (List $B)(List $C)';

    });


  // test("Cycle detector", () => {
  //   // create a graph
  //   const graph : Map<string, Array<string>> = new Map<string, Array<string>>();
  //
  //
  //   graph.set("B", ["A", "F"]);
  //   graph.set("F", ["A"]);
  //   graph.set("E", ["B"]);
  //   graph.set("C", ["E", "D"]);
  //   graph.set("A", ["E"]);
  //   graph.set("D", ["C"]);
  //
  //   const cycles : Set<Set<string>> = findCycles<string>(graph);
  //   // for(let c of cycles){
  //   //   console.log(c);
  //   // }
  // });

});
