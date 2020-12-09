import * as AST from 'FunBlocks/AST'
import { tokenize } from './Lexer'
import { Token, TokenKind } from './Token'

export {};


const DEBUG : number = 1;

/**
 * Records types found in AST.
 * @param input The output of parsing, i.e. an array of declarations
 * @return      A dictionary that maps declaration labels to an array of possible
 *              (inferred or ) type declarations
 */
export const recordTypes = (input: AST.TranslationUnitDecl): Dictionary<Array<AST.TypeRef>> => {

  // An array for keeping the indexes of all TypeDecl entries
  const typeDeclArray: Array<AST.TypeDecl> = [];
  // A dictionary for keeping the inferred type(s) of nodes
  const nodeToInfType: Dictionary<AST.TypeDecl> = {};
  const caseTypes: Dictionary<Array<AST.TypeRef>> = {};

  // collect all typeDecl entries.
  // This is for optimization, so that we only iterate over these declarations
  // when we try to match terms to types.
  for(let i = 0; i < input.decls.length; ++i){
    if(input.decls[i] instanceof AST.TypeDecl){
      typeDeclArray.push(input.decls[i] as AST.TypeDecl);
    }
  }

  // iterate over RuleCaseDecl and infer their types
  // TODO: take into account all rule cases. For now, it keeps only the last case of each rule.
  for(let i = 0; i < input.decls.length; ++i){
    if(input.decls[i] instanceof AST.RuleCaseDecl){
      const ruleCase : AST.RuleCaseDecl = <AST.RuleCaseDecl> input.decls[i];
      const types : Array<AST.TypeRef> = typeOfCase(ruleCase, typeDeclArray, nodeToInfType);

      if(ruleCase.left instanceof AST.Expr){
        const label = (ruleCase.left as AST.Expr).label;
        caseTypes[label] = types;
      }else{
        const line : number = ruleCase.range.lowerBound.line;
        console.log('Unnamed rule case was found at line ${line}.');
      }

    }
  }

  return caseTypes;
}

/**
 * Infers the type of a ruleCaseDecl statement.
 * @param ruleCase The ruleCaseDecl whose type should be inferred
 * @param array The array of all typeDecl statements in the program
 * @param termTypes A dictionary from term labels to their inferred types
 * @return
 */
const typeOfCase = (ruleCase: AST.RuleCaseDecl, array: Array<AST.TypeDecl>, termTypes: Dictionary<AST.TypeRef>): Array<AST.TypeRef> =>{

  // An array for storing the types of the parameters and the return of the rule case,
  // in the order they appear
  let typesList : Array<AST.TypeRef> = [];
  const letters = "ABCDEFGH";

  const left : AST.Term = ruleCase.left;
  const right : AST.Term = ruleCase.right;

  // if the left part of the rule case is an expression
  if(left instanceof AST.Expr){
    // for all the subterms of the expression (which are the parameters of the rule)
    for(let i in left.subterms){
      // infer the type of the subterm
      const returnedType = matchTerm(left.subterms[i], array, null, termTypes);
      // save the mapping of the term to the inferred type
      typesList.push(returnedType);
    }
  }
  // if the left part of the rule case is a variable (not sure that this would make sense)
  // TODO: check if this case is allowed
  else if (left instanceof AST.VarRef){
    typesList.push(null);
  }

  // infer the type of the right term of the rule case (which is the return of the rule)
  const returnedType = matchTerm(right, array, null, termTypes);
  // save the mapping of the term to the inferred type
  typesList.push(returnedType);

  // for each type inferred for the rule's input and output
  for(let i in typesList){
    // if the inferred type was null, i.e. the type 'any'
    if(typesList[i]==null){
        // create a new typeVarRef with a random letter
        const newType = new AST.TypeVarRef({
          // TODO: make sure this letter does not collide with an explicit typeVarRef
          label: letters[i]
        })
        // assign the cretaed typeVarRef as the type of the term
        typesList[i]=newType;
    }
  }

  return typesList;
}


/**
 * This function is called to infer the type of Expr terms.
 * @param term The Expr term whose type should be inferred
 * @param typeDeclArray The array of all typeDecl statements in the program
 * @param typeRef The type of the term's parent expression
 * @param termTypes A dictionary from term labels to their inferred types
 * @return Optionally, the inferred type, if one could be found.
 */
const matchExpr = (term: AST.Expr, typeDeclArray: Array<AST.TypeDecl>, typeRef: AST.TypeRef, termTypes: Dictionary<AST.TypeRef>) : Optional<AST.TypeRef> => {

  // if this expression is type bounded (i.e., it is part of a bigger expression, whose type is being matched)
  // and type reference is variable, then it can match any term
  if(typeRef!=null && typeRef instanceof AST.TypeVarRef){
    // TODO: what about bounded TypeVarRef
      termTypes[term.id] = typeRef;
      return typeRef;
  }

  // if type reference is not null and has a complex type (e.g. List $T), check that it actually matches the expression
  // of if there is no type reference (i.e. expression is unbounded), check against all possible type constructors
  for(let decl of typeDeclArray){

    // skip type declarations with different names
    if(typeRef!=null && typeRef instanceof AST.TypeDeclRef && (typeRef as AST.TypeDeclRef).name != (decl as AST.TypeDecl).name ){
      continue;
    }

    // try to match the expression term to one of the type constructors
    // TODO: only the first matched constructor is kept
    for(let cons of (decl as AST.TypeDecl).cases){
      let constructor : AST.TypeConsDecl = cons;

      // skip constructors whose label does not match the expression's label
      if( term.label != constructor.label){
        continue;
      }

      let returnedType : AST.TypeRef = null;
      // for each subterm of the Expr
      for(let i=0; i<term.subterms.length; ++i){
        const subterm = term.subterms[i];
        // try to match the subterm with the constructor's type argument at the subterm's position 
        returnedType = matchTerm(subterm, typeDeclArray, constructor.args[i], termTypes);

        if (DEBUG == 1) {
          console.log(term.label +' '+constructor.label +' ');
          if(returnedType != null && returnedType instanceof AST.TypeVarRef){
            console.log((<AST.TypeVarRef> returnedType).label);
          }else if(returnedType != null && returnedType instanceof AST.TypeDeclRef){
            console.log((<AST.TypeDeclRef> returnedType).name);
          }
        }

        // if the returned type is null (i.e., the matching didn't succeed), go to next constructor
        if(returnedType == null){
          break;
        }
      }
      // if the expression was matched to the constructor
      if(returnedType != null){
        termTypes[term.id] = decl;
        return returnedType;
      }
    }

  }

  // if no constructor matched this bounded expression, then the bigger (ancestor) expression does not match the assumed type
  return null;

}

const matchVarRef = (term: AST.Term, typeRef: AST.TypeRef, termTypes: Dictionary<AST.TypeRef>) : Optional<AST.TypeRef> => {

  // if the variable reference is found within an expression with a possibly matching type reference
  if(typeRef != null){
    termTypes[term.id] = typeRef;
  }
  return typeRef;
}

// Checks if the term can be matched to a type.
// If term is a variable reference, in which case it is assigned a type reference (if it is in place of a type argument) or any type (otherwise)
// If the term is an expression, then try to match it with some type constructor(s).
const matchTerm = (term: AST.Term, array: Array<AST.TypeDecl>, typeRef: AST.TypeRef, termTypes: Dictionary<AST.TypeRef>) : Optional<AST.TypeRef> => {

  if(term instanceof AST.Expr){
    return matchExpr(term, array, typeRef, termTypes);
    termTypes[term.id] = typeRef;
  }else if(term instanceof AST.VarRef){
    return matchVarRef(term, typeRef, termTypes);
  }

  return null;

}
