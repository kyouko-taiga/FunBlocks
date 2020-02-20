import { string, whitespace, regexp, newline, eof, anyChar, fail } from "parjs"
import {
  between,
  manySepBy,
  thenq,
  later,
  many,
  map,
  stringify,
  then,
  qthen,
  or,
  maybe,
  manyTill,
  recover
} from "parjs/combinators"

import * as AST from 'FunBlocks/AST'

let alphanumeric = regexp(new RegExp("[a-zA-Z0-9_]"));

let terminator = newline().pipe(
  or(string(";")),
  or(eof()),
  between(whitespace())
);
// console.log(terminator.parse(" ; "))

let alphaSequence = alphanumeric.pipe(
  then(alphanumeric.pipe(many())),
  stringify(),
  thenq(whitespace().pipe(maybe()))
);

let identifier = alphaSequence;

let variable = string("$").pipe(
  qthen(identifier),
  map(str => new AST.VarRef({ label: str }))
);

let typeVarRef = variable.pipe(
  map(e => new AST.TypeVarRef({ label: e.label }))
);

let typeParamList = typeVarRef.pipe(manySepBy(whitespace()));

let typeDeclRef = later<AST.TypeDeclRef>();
let typeArg = later<AST.TypeRef>();
let typeArgList = later<AST.TypeRef[]>();

let typeRef = typeDeclRef.pipe(
  or(typeVarRef)
  , map(e => e as AST.TypeRef )
);

typeArg.init(
  typeRef.pipe(
    between("(", ")")
    ,or(typeRef)
  )
);


typeArgList.init(
  typeArg.pipe(
    then(typeArg.pipe(
      manySepBy(whitespace())
    ))
    , map(arr => new Array(arr[0]).concat(arr[1]) )
  )
);

let typeCons =  identifier.pipe(
    then(
      typeArgList.pipe(
        between(whitespace()),
        maybe()
      )
    ),
    thenq(whitespace()),
    // create a typeArg[]
    map(arr => new AST.TypeConsDecl({ label: arr[0], arguments: arr[1] }))
  );

let term = later<Term>();

let termList = term.pipe(
  between(whitespace()),
  manySepBy(","),
  map(arr => arr as Term[])
);

let expression = identifier.pipe(
  then(
    termList.pipe(
      between("(", ")"),
      maybe()
    )
  ),
  thenq(whitespace()),
  map(arr => new AST.Expr({ label: arr[0], subterms: arr[1] }))
);

term.init(
  expression.pipe(
    or(variable),
    map(term => term as Term)
  )
);

let initStateDecl = string("init").pipe(
  qthen(expression.pipe(between(whitespace()))),
  thenq(terminator),
  map(expr => new AST.InitStateDecl({ state: expr }))
);

let parenthExpression = expression.pipe(
  between(whitespace())
  , between("(",")")
);

let parenthTerm = term.pipe(
  between(whitespace())
  , between("(",")")
);

let ruleCaseDecl = string("rule").pipe(
  qthen(expression.pipe(or(parenthExpression), between(whitespace())))
  , then(
    string("=>").pipe(
      between(whitespace()),
      qthen(term.pipe(or(parenthTerm)))
    )
  )
  , thenq(whitespace())
  , thenq(terminator)
  , map(arr => new AST.RuleCaseDecl({ left: arr[0], right: arr[1] }))
);


let typeSign = later();

let parenthTypeSign = typeSign.pipe(between(whitespace()), between("(",")"));


let enumTypeTail = string("|").pipe(
  qthen(typeCons.pipe(between(whitespace()), manySepBy("|")))
);


let enumTypeBody = typeCons.pipe(
  then(enumTypeTail.pipe(maybe()))
  , between(whitespace())
  , map( arr =>  new Array(arr[0]).concat(arr[1]) )
);


typeDeclRef.init(
  identifier.pipe(
    then(
      typeArgList.pipe(
        between(whitespace()),
        maybe()
      )
    ),
    thenq(whitespace()),
    map(arr => new AST.TypeDeclRef({ name: arr[0], arguments: arr[1] }))
  )

);


let right = typeSign.pipe(or(parenthTypeSign), map(e => e as AST.TypeSign))

let left = typeRef.pipe(or(parenthTypeSign), map(e => e as AST.TypeSign))

 let arrowTypeSign = left.pipe(
  then(string("->").pipe(
    between(whitespace())
    ,recover(
      failure => { return {kind: "Soft", reason: "custom soft failure"} }
    )
    , qthen(right)
    , thenq(whitespace())
  ))
  , map(
    arr => new AST.ArrowTypeSign({ left: arr[0], right: arr[1] })
  )
);

typeSign.init(
  arrowTypeSign.pipe(
    recover(
      failure => {
        if(failure.kind === "Hard" && failure.reason === 'custom soft failure'){
          return {kind: "Soft", reason: "custom soft failure 2"}
        }
      }
    )
    , or(typeRef)
  , map(e=> e as AST.TypeSign))
);


let ruleDeclBody = typeSign.pipe(
  or(parenthTypeSign)
  , thenq(string("=>").pipe(
    between(whitespace())
    )
  )
  , then(typeSign)
  , map(
    arr => arr as AST.TypeSign[] )
);

let ruleDecl = string("decl").pipe(
  qthen(identifier.pipe(between(whitespace())))
  , then(typeParamList)
  , thenq(string("::").pipe(between(whitespace())))
  , then(ruleDeclBody.pipe(between(whitespace())))
  , thenq(terminator)
  , map(
    arr =>
      new AST.RuleDecl({
        name: arr[0][0],
        arguments: arr[0][1],
        left: arr[1][0],
        right: arr[1][1]
      })
  )
);

let typeDecl = string("type").pipe(
  qthen(identifier.pipe(between(whitespace()))),
  then(typeParamList.pipe(maybe())),
  thenq(string("::").pipe(between(whitespace()))),
  then(enumTypeBody.pipe(between(whitespace()))),
  thenq(terminator),
  map(
    arr => new AST.TypeDecl({ name: arr[0][0], parameters: arr[0][1], cases : arr[1] })
  )
);

let topLevelStmt = typeDecl.pipe(
  or(initStateDecl),
  or(ruleDecl),
  or(ruleCaseDecl),
  between(whitespace())
);


let program = topLevelStmt.pipe(many());

let programInput = `
init cons(1, cons(2, empty)) ;

type List $T :: empty | cons $T (List $T) ;

decl sort :: List Int => List Int ;
rule sort(empty) => empty ;
rule sort(cons($x, $y)) => cat(filter_lt($x, $y), cons($x, sort(filter_gt($x, $y))));

decl filter_lt :: Int -> List Int => List Int ;
rule filter_lt($x, empty) => empty ;
rule filter_lt($x, cons($y, $z)) => if(lt($y, $x), cons($y, filter_lt($z)), filter_lt($z)) ;

decl filter_gt :: Int -> List Int => List Int ;
rule filter_gt($x, empty) => empty ;
rule filter_gt($x, cons($y, $z)) => if(gt($y, $x), cons($y, filter_gt($z)), filter_gt($z)) ;

decl if $T :: Bool -> $T -> $T => $T ;

rule if(true, $x, $y) => $x ;
rule if(false, $x, $y) => $y ;
`;

console.log(" program 1)", program.parse(programInput));
