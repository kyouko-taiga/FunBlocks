import * as AST from 'FunBlocks/AST'
import { Token, TokenKind } from 'FunBlocks/Parser/Token'
import { parse } from 'FunBlocks/Parser/Parser'
import { element } from 'prop-types';
// import { Expr, InitStateDecl, Node, Term } from 'FunBlocks/AST';

expect.extend({
  toEqualTerm(received: AST.Expr, other: AST.Expr) {
    // ignore subterms, they will be externally tested
    
    const pass : boolean = 
    (received.constructor.name === other.constructor.name  &&
      received.label === other.label &&
      received.range === other.range &&
      (received instanceof AST.Expr && received.subterms.length === other.subterms.length ) &&
      received.type === other.type) ? true : false;

    if (pass) {
      return {
        message: () =>
          ``,
        pass: true,
      };
    } else {
      return {
        message: () =>
          ``,
        pass: false,
      };
    }
  },
  toEqualInit(received: AST.InitStateDecl, other: AST.InitStateDecl) {
    // ignore state, it will be externally tested
    const pass : boolean = 
    (received.constructor.name === other.constructor.name  &&
      received.range === other.range ||
      this.toEqualTerm(received.state, other.state).pass) ? true : false;

    if (pass) {
      return {
        message: () =>
          ``,
        pass: true,
      };
    } else {
      return {
        message: () =>
          ``,
        pass: false,
      };
    }
  }
});

function serialize(x : AST.Node, indent: string = ''): string {
  
  let strForm : string = `${indent}{ range :  ${JSON.stringify(x.range)}`;

  if( x instanceof AST.Term){
    strForm += `\n${indent} ,label :  ${JSON.stringify(x.label)}`;
    // strForm += `\n${indent} ,parent :  ${JSON.stringify(x.parent?.range)}`;
    strForm += `\n${indent} ,type :  ${JSON.stringify(x.type)}`;
  }
  if( x instanceof AST.Expr){
    strForm += `\n${indent} ,subterms :`;
    x.subterms.forEach(element =>
      strForm += `\n${indent} ${serialize(element, indent+'\t')}`
    );
  } 
  if( x instanceof AST.InitStateDecl){
    strForm += (x.state) ? `\n${indent} ,state:\n${indent} ${serialize(x.state, indent)}` : '';
  }
  // if( x instanceof AST.TypeDecl){
  //   strForm += (x.state) ? `\n${indent} ,state:\n${indent} ${serialize(x.state, indent)}` : '';
  // }
  strForm += `\n${indent}},`;
  return strForm;
}




describe("Parser", () => {
  test("should return a given set of top-level declarations", () => {

    const programInput = `
    init cons(1, cons(2, empty)) ;

    type List $T :: empty | cons $T (List $T) ; `;

    
    // cons(1, cons(2, empty
    const rootExpression: AST.Expr = new AST.Expr({
      range: {
        lowerBound: { line: 2, column: 10, offset: 10 },
        upperBound: { line: 2, column: 31, offset: 31 }
      },
      label: 'cons',
      type: null,
      subterms : []
    });

  // 1
  const rootSub1: AST.Expr = new AST.Expr({
    range: {
      lowerBound: { line: 2, column: 15, offset: 15 },
      upperBound: { line: 2, column: 16, offset: 16 }
    },
    label: '1',
    type: null,
    subterms : []
  });


  // cons(2, empty
  const rootSubCons: AST.Expr = new AST.Expr({
    range: {
      lowerBound: { line: 2, column: 18, offset: 18 },
      upperBound: { line: 2, column: 31, offset: 31 }
    },
    label: 'cons',
    type: null,
    subterms : []
  });
  rootExpression.subterms = [rootSub1, rootSubCons];
  
  // 2
  const consSub2: AST.Expr = new AST.Expr({
    range: {
      lowerBound: { line: 2, column: 23, offset: 23 },
      upperBound: { line: 2, column: 24, offset: 24 }
    },
    label: '2',
    type: null,
    subterms : []
  });

  // empty
  const consSubEmpty: AST.Expr = new AST.Expr({
    range: {
      lowerBound: { line: 2, column: 26, offset: 26 },
      upperBound: { line: 2, column: 31, offset: 31 }
    },
    label: 'empty',
    type: null,
    subterms : []
  });
  rootSubCons.subterms = [consSub2, consSubEmpty];
    

  const InitStateDecl =  new AST.InitStateDecl({ 
    range: {
      lowerBound: { line: 2, column: 5, offset: 5 },
      upperBound: { line: 2, column: 35, offset: 35 }
    }
    , state: rootExpression 
  });

  const actual = parse(programInput);
  const init = actual.decls[0] as AST.InitStateDecl
  const type0 = actual.decls[1] as AST.TypeDecl;
  
  expect(serialize(init)).toEqual(serialize(InitStateDecl));


  });
});