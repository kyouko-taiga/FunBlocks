import * as AST from 'FunBlocks/AST'
import { tokenize } from './Lexer'
import { Token, TokenKind } from './Token'
import { findCycles } from 'FunBlocks/Parser/CycleDetector'

export {};


export class Namespace {

  public _typeIndex = 0;

  public newSymbolicType(): AST.TypeVarRef {
    const name : string = 'T'+ this._typeIndex;
    const type : AST.TypeVarRef = new AST.TypeVarRef({
      label: name
    });
    this._typeIndex++;
    return type;
  }
}


export class TypeInfo {

  // this allows detecting cycles in dependencies of untyped rules
  public ruleReferenceDependencies : Map<string, Array<string>> = new Map<string, Array<string>> ();
  // Store TypeDecl entries
  public typeDeclArray: Array<AST.TypeDecl> = [];
  // terms to their type
  public termToType : Dictionary<AST.TypeRef> =  {};
  // variable references to their type
  public varToType : Dictionary<AST.TypeRef> = {};
  // variable types to their equal variable types (a.k.a assignment of types)
  public typeVarToType : Dictionary<AST.TypeRef> = {};
  // stores which rules was typed initially in the program (the rest were inferred)
  public typedRules : Set<string> = new Set<string>();
  public ruleNames : Set<string> = new Set<string>();
  // stores term ids that are references to rules found in cases
  public ruleReferences : Set<AST.Expr> = new Set<AST.Expr>();
  // final types of rules
  public ruleTypes: Dictionary<Array<AST.TypeRef>> = {};
  // aggregates the types of rule cases
  public casesTypes: Map<AST.RuleCaseDecl, Array<AST.TypeRef>> = new Map<AST.RuleCaseDecl, Array<AST.TypeRef>>();
  // stores the cases of a rule
  public ruleCases: Dictionary<Array<AST.RuleCaseDecl>> = {};
  // stores all cases of an untyped rule and a flag whether or not they are
  public untypedRuleCases: Dictionary<Set<AST.RuleCaseDecl>> = {};

  public cases: Array<AST.RuleCaseDecl> = [];

  public globalNS : Namespace = new Namespace();

}

// Creates a deep copy of an object
// TODO: this is a slow fix, create a quicker solution
// function deep<T extends object>(source: T): T {
//  return JSON.parse(JSON.stringify(source)) as T;
// }

const deep = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof AST.TypeVarRef) {
    return new AST.TypeVarRef({
      label : (target as AST.TypeVarRef).label
    }) as any;
  }

  else if (target instanceof AST.TypeDeclRef) {
    let args : Array<AST.TypeRef> = deep<Array<AST.TypeRef>>((target as AST.TypeDeclRef).arguments);

    return new AST.TypeDeclRef({
      name : (target as AST.TypeDeclRef).name,
      args : args
    }) as any;
  }
  else if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deep<any>(n)) as any;
  }
  else if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = deep<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};


const DEBUG : number = 1;



/**
 * Records types found in AST.
 * @param input The output of parsing, i.e. an array of declarations
 * @return      A dictionary that maps declaration labels to an array of possible
 *              (inferred or ) type declarations
 */
export const recordTypes = (input: AST.TranslationUnitDecl): TypeInfo => {

  // create a new type info object
  const typeInfo : TypeInfo = new TypeInfo();

  // collect all typeDecl entries.
  // This is for optimization, so that we only iterate over these declarations
  // when we try to match terms to types.
  for(let i = 0; i < input.decls.length; ++i){

    if(input.decls[i] instanceof AST.TypeDecl){
      typeInfo.typeDeclArray.push(input.decls[i] as AST.TypeDecl);
    }

    // if this is a rule declaration
    else if(input.decls[i] instanceof AST.RuleDecl){
      const ruleDecl : AST.RuleDecl = input.decls[i] as AST.RuleDecl;
      typeInfo.typedRules.add(ruleDecl.name.toString());
      // typeInfo.ruleNames.add(ruleDecl.name.toString());

      typeInfo.ruleTypes[ruleDecl.name.toString()] = flattenArrowType(ruleDecl.signature);
    }
    else if(input.decls[i] instanceof AST.RuleCaseDecl){
      // add this to array of cases
      typeInfo.cases.push(input.decls[i] as AST.RuleCaseDecl);
      // add the name of the rule to ruleNames set
      if((input.decls[i] as AST.RuleCaseDecl).left instanceof AST.Expr){
        const ruleName = (((input.decls[i] as AST.RuleCaseDecl).left) as AST.Expr).label;
        typeInfo.ruleNames.add(ruleName);

        if(typeInfo.ruleCases[ruleName] == null){
          typeInfo.ruleCases[ruleName] = [];
        }
        typeInfo.ruleCases[ruleName].push(input.decls[i] as AST.RuleCaseDecl);
      }
    }
  }

  //collect all rule type declarations

  // iterate over RuleCaseDecl and check or infer their types
  // TODO: take into account all rule cases. For now, it keeps only the last case of each rule.
  for(let ruleCase of typeInfo.cases){

    if(! (ruleCase.left instanceof AST.Expr) ){
      const line : number = ruleCase.range.lowerBound.line;
      console.log('Unnamed rule case was found at line ${line}.');
      continue;
    }

    // this is for knowing if all cases of rules have been visited when inferring for untyped rules
    if(!typeInfo.typedRules.has(ruleCase.left.label)){

      if(typeInfo.untypedRuleCases[ruleCase.left.label] == null){
        typeInfo.untypedRuleCases[ruleCase.left.label] = new Set<AST.RuleCaseDecl>();
      }
      typeInfo.untypedRuleCases[ruleCase.left.label].add(ruleCase);
    }

    // store the types found for the case
    typeInfo.casesTypes.set(ruleCase, typeOfCase(ruleCase, typeInfo));


  }

  // basically, we should first infer types of untyped rules, so that their types are known
  // before checking types of typed rules (otherwise, rule references to untyped rules will be of unknown type)

  // detect cycles in rule references to untyped rules and set symbolic types to those rules (at the return type)
  // this is because circular dependencies will not anyway allow us to infer the return types of these rules.

  const cycles : Set<Set<string>> = findCycles<string>(typeInfo.ruleReferenceDependencies);
  const cycleRules = new Set<string>();
  for(let cycle of cycles){

    for(let member of cycle){
      // set the return type of these rules to newType
      //typeInfo.ruleTypes[member][typeInfo.ruleTypes[member].length-1] = newType;
      cycleRules.add(member);
    }
  }

  // in order not to have unknown types of rule references, we need to find the right order of checking rules
  // (i.e. from independent to dependent)
  const orderedRules = new Array<string>();
  let unorderedSet = new Set<string>(Array.from(typeInfo.ruleNames));

  while(unorderedSet.size > 0){

    const newUnorderedSet = new Set<string>();

    for (let rule of unorderedSet){
      let independent : boolean = true;

      if(typeInfo.ruleReferenceDependencies.has(rule)){
        // for each dependency
        for(let dependency of typeInfo.ruleReferenceDependencies.get(rule)){
          // if the antecedent rule is not in a circular dependency AND it is not yet ordered, skip rule for now
          if( !cycleRules.has(dependency) && unorderedSet.has(dependency) ){
            independent = false;
            break;
          }
        }
      }

      if(independent){
        orderedRules.push(rule);
      } else {
        newUnorderedSet.add(rule);
      }
    }
    unorderedSet = newUnorderedSet;
  }


  for(let ruleName of orderedRules){

    for(let caseDecl of typeInfo.ruleCases[ruleName]){

      const caseTypes : Array<AST.TypeRef> = typeInfo.casesTypes.get(caseDecl);

      if(typeInfo.ruleTypes[ruleName] != null && typeInfo.ruleTypes[ruleName].length != caseTypes.length){
        console.log(`Rule case at ${nodeDiagnostic(caseDecl)} has a different number of arguments than the one expected.`);
        continue;
      }

      const caseTypeAssignments = new Map<AST.TypeRef, AST.TypeRef>();
      const ruleTypeAssignments = new Map<AST.TypeRef, AST.TypeRef>();

      const leftTerm = caseDecl.left as AST.Expr;
      const argTypes = new Array<AST.TypeRef>(caseTypes.length);

      for(let i = 0; i<caseTypes.length; i++){

        // if this caseType is undefined (and since it is not possible to have a
        // top level reference to an untyped rule, then there was a type mismatch in this term)
        if( isUndefined(caseTypes[i]) ){

          // find the term corresponding to i
          let term : AST.Expr = null
          if(i == (caseTypes.length -1) ) {
            term = caseDecl.right as AST.Expr;
          } else{
            term = leftTerm.subterms[i] as AST.Expr;
          }

          const ruleReferenceName : string = term.label;
          // if term is a rule reference
          if( typeInfo.ruleReferences.has(term) ){

            // if it is a reference to rule involved in a cycle,
            // assume the ANY type with no binding (i.e. new symbolic value)
            let type : AST.TypeRef;

            if(cycleRules.has(ruleReferenceName)){
              type = typeInfo.globalNS.newSymbolicType();
            }
            else {

              const lastIndex = typeInfo.ruleTypes[ruleReferenceName].length - 1;
              // set the retrieved type equal to the rule's return type
              type = deep<AST.TypeRef>(typeInfo.ruleTypes[ruleReferenceName][lastIndex]);

              // rename variables of the type to actual types of the case
              const refTypeAssignments = new Map<AST.TypeRef, AST.TypeRef>();
              // match all subterms to type arguments
              for(let i in term.subterms){
                const subtermType = getCurrentTypeOfTypeRef(typeInfo.termToType[term.subterms[i].id], typeInfo);

                if(matchToSupertype(subtermType,
                  typeInfo.ruleTypes[ruleReferenceName][i], refTypeAssignments) == false){

                  // diagnose error
                  console.log(`Rule reference at ${nodeDiagnostic(term)} does not match rule's type.`);
                  continue;
                }

              }

              type = renameType(type, refTypeAssignments, typeInfo.globalNS);

              // since we checked the types of this rule reference exclude them from subsequent checking
              typeInfo.ruleReferences.delete(term);
            }

            // add type to termToType
            typeInfo.termToType[term.id] = type;
            // add type to caseTypes
            caseTypes[i] = type;
          }
          // if it is not a rule reference,
          // then a type error was found in the caseType
          else {
            // set this type to undefined
            argTypes[i] = caseTypes[i];
            continue;
          }

        }

        // if rule is untyped, infer its type
        if( ! typeInfo.typedRules.has(ruleName) ){
          argTypes[i] = findCommonSuperType(caseTypes[i], argTypes[i], caseTypeAssignments, ruleTypeAssignments, typeInfo);
        }
        // if rule is typed, match it to declared type
        else {
          if(matchToSupertype(caseTypes[i], typeInfo.ruleTypes[ruleName][i], caseTypeAssignments) == false){

            // diagnose error
            console.log(`Item ${i} in case at ${nodeDiagnostic(caseDecl)} of rule ${ruleName} does not match rule's declared type.`);
            continue;
          }
        }
      }

      if( ! typeInfo.typedRules.has(ruleName) ){
        typeInfo.ruleTypes[ruleName] = argTypes;
      }

    }

  }


  // Check rule references
  const ruleReferences : Set<AST.Expr> = typeInfo.ruleReferences;
  // for all terms that are rule references
  for(let term of ruleReferences){
    const ruleTypes = typeInfo.ruleTypes[term.label];

    // check the length of subterms of term expression
    if(term.subterms.length != ruleTypes.length -1){
      // diagnose error
      console.log(`Reference of rule ${term.label} found in ${nodeDiagnostic(term)} does not match rule's arguments length.`);
      continue;
    }

    const caseTypes = new Array<AST.TypeRef>(ruleTypes.length);
    for(let j in term.subterms){
      caseTypes[j] = getCurrentTypeOfTypeRef(typeInfo.termToType[term.subterms[j].id], typeInfo);
    }
    caseTypes[caseTypes.length-1] = getCurrentTypeOfTypeRef(typeInfo.termToType[term.id], typeInfo);

    const typeAssignments = new Map<AST.TypeRef, AST.TypeRef>();
    for(let j in caseTypes){
      if(matchToSupertype(caseTypes[j], typeInfo.ruleTypes[term.label][j], typeAssignments) == false){

        // diagnose error
        console.log(`Rule reference at ${nodeDiagnostic(term)} or its subterms does not match the declared type of rule.`);
        continue;
      }
    }

  }

  return typeInfo;
}




const isUndefined = (type : AST.TypeRef) : boolean => {
  // return (type instanceof AST.TypeVarRef && (type as AST.TypeVarRef).label == 'undefined' ) ? true : false ;
  return (type == null) ? true : false ;
}

const setUndefined = (type : AST.TypeRef) : AST.TypeRef => {
  // return new AST.TypeVarRef({ label : 'undefined' });
  return null;
}


const flattenArrowType = (typeSign: AST.TypeSign, array?: Array<AST.TypeRef> ): Array<AST.TypeRef> => {
  // the first time that it is called has to init the array
  if(array == null){
    array = new Array<AST.TypeRef>();
  }
  // if typeSign is a type reference, push it to array and return;
  if( ! (typeSign instanceof AST.ArrowTypeSign) ){
      array.push(typeSign);
      return  array;
  }
  // else, call the function for left and right parts
  flattenArrowType((<AST.ArrowTypeSign> typeSign).left, array );
  flattenArrowType((<AST.ArrowTypeSign> typeSign).right, array);

  return array;
}

// return the wider type
const matchToSupertype = (caseType: AST.TypeRef, ruleType: AST.TypeRef, typeAssignments: Map<AST.TypeRef, AST.TypeRef>): boolean =>{

  if( ruleType instanceof AST.TypeDeclRef ){
    if(caseType instanceof AST.TypeVarRef){
      // they don't match
      return false;
    } else if( caseType instanceof AST.TypeDeclRef ){
      // check if types are equal
      if( typesEqual(caseType, ruleType) ){
        return true;
      } else {
        const caseTypeDecl : AST.TypeDeclRef = caseType as AST.TypeDeclRef;
        const ruleTypeDecl : AST.TypeDeclRef = ruleType as AST.TypeDeclRef;

        if(caseTypeDecl.name != ruleTypeDecl.name || caseTypeDecl.arguments.length != ruleTypeDecl.arguments.length){
          return false;
        }

        for (let i in ruleTypeDecl.arguments){
          if( !matchToSupertype(caseTypeDecl.arguments[i], ruleTypeDecl.arguments[i], typeAssignments)){
            return false;
          }
        }
        return true;
      }
    }

  }
  // if rule type is a type variable, get its assigned type for this case
  else {

    // check if there are symbols for both types
    const renamedRuleType = typeAssignments.get(ruleType);

    if(renamedRuleType != null){
      return typesEqual(caseType, renamedRuleType);
    } else {
      // set the new type as supertype of any the other types that has no assigned supertype
      if(typeAssignments.get(caseType) == null){
        typeAssignments.set(ruleType, caseType);
      }

      return true;
    }

  }

}


const findCommonSuperType = (caseType: AST.TypeRef, ruleType: AST.TypeRef,
  caseTypeAssignments: Map<AST.TypeRef,AST.TypeRef>, ruleTypeAssignments: Map<AST.TypeRef,AST.TypeRef>, typeInfo: TypeInfo): AST.TypeRef =>{

  if( ruleType == null) {
    return deep<AST.TypeRef>(caseType);
  }

  // check if types are equal
  if(typesEqual(caseType, ruleType)){
    return ruleType;
  }

  // check if there are symbols for both types
  const renamedCaseType = caseTypeAssignments.get(caseType);
  const renamedRuleType = ruleTypeAssignments.get(ruleType);

  if ( renamedCaseType!=null && renamedRuleType != null ){

    if(typesEqual(renamedCaseType, renamedRuleType)){
      return renamedRuleType;
    } else {
      return (renamedCaseType > renamedRuleType) ? renamedCaseType : renamedRuleType ;
    }
  }

  // if there are no symbols for both types AND those types are TypeDeclRef,
  // try to match them by giving symbols to type arguments
  // e.g. (Cars, Colors) => T1 , or (Cars, List Cars) => T2
  if (caseType instanceof AST.TypeDeclRef && ruleType instanceof AST.TypeDeclRef) {

    const ruleTypeCast = <AST.TypeDeclRef> ruleType;
    const caseTypeCast = <AST.TypeDeclRef> caseType;

    if(  ruleTypeCast.name == caseTypeCast.name
      && ruleTypeCast.arguments.length == caseTypeCast.arguments.length){

        const argTypes = new Array<AST.TypeRef>(ruleTypeCast.arguments.length);

        for(let i in caseTypeCast.arguments){
          argTypes[i] = findCommonSuperType(caseTypeCast.arguments[i],
            ruleTypeCast.arguments[i], caseTypeAssignments, ruleTypeAssignments, typeInfo);
        }

        return new AST.TypeDeclRef({
          name : ruleTypeCast.name,
          args : argTypes
        });
    }
  }

  // if there are no symbols for both types AND (are not both TypeDeclRef OR
  // did not match using symbols on type arguments )
  const newType = typeInfo.globalNS.newSymbolicType();
  // super(T1) = newType, super(T2) = newType
  // set the new type as supertype of any the other types that has no assigned supertype
  if(caseTypeAssignments.get(caseType) == null){
    caseTypeAssignments.set(caseType, newType);
  }
  if(ruleTypeAssignments.get(ruleType) == null){
    ruleTypeAssignments.set(ruleType, newType);
  }

  return newType;
}


const renameType = (type : AST.TypeRef, typeAssignments: Map<AST.TypeRef, AST.TypeRef>, namespace: Namespace) :AST.TypeRef =>{
  if(typeAssignments.has(type)){
    return typeAssignments.get(type);
  }

  if(type instanceof AST.TypeDeclRef){
    for( let i in (type as AST.TypeDeclRef).arguments){
      let typeArg = (type as AST.TypeDeclRef).arguments[i];
      (type as AST.TypeDeclRef).arguments[i] = renameType(typeArg, typeAssignments, namespace);
    }
  }

  return type;

}

const typesEqual = (type1 : AST.TypeRef, type2 : AST.TypeRef) : boolean => {

  if(type1 instanceof AST.TypeVarRef && type2 instanceof AST.TypeVarRef){
    return (type1 as AST.TypeVarRef).label == (type2 as AST.TypeVarRef).label;
  }
  else if(type1 instanceof AST.TypeDeclRef && type2 instanceof AST.TypeDeclRef){
    const typeDecl1 = type1 as AST.TypeDeclRef;
    const typeDecl2 = type2 as AST.TypeDeclRef;

    if( typeDecl1.name != typeDecl2.name || typeDecl1.arguments.length != typeDecl1.arguments.length ){
      return false;
    }

    for(let i in typeDecl1.arguments){
      if(! typesEqual(typeDecl1.arguments[i], typeDecl2.arguments[i]) ){
        return false;
      }
    }

    return true;
  }

  return false;
}


/**
 * Checks or Infers the type of a ruleCaseDecl statement.
 * @param ruleCase The ruleCaseDecl whose type should be inferred
 * @param array The array of all typeDecl statements in the program
 * @return
 */
const typeOfCase = (ruleCase: AST.RuleCaseDecl, typeInfo: TypeInfo ): Array<AST.TypeRef> =>{

  // An array for storing the types of the parameters and the return of the rule case,
  // in the order they appear
  let typesList : Array<AST.TypeRef> = [];

  const left : AST.Expr = ruleCase.left as AST.Expr;
  const right : AST.Term = ruleCase.right;

  // reset the types of variables
  typeInfo.varToType = {};

  // check if the rule is typed, to pass the types for check
  const expectedTypes : Array<AST.TypeRef> = (ruleCase.id in typeInfo.typedRules) ?
          typeInfo.ruleTypes[ruleCase.id] : null;

  if(expectedTypes != null && left.subterms.length != expectedTypes.length - 1) {// -1 is to exempt the return type
      console.log('The number of parameters of the rule case is not correct.')
  }

  // for all the subterms of the expression (which are the parameters of the rule)
  for(let i in left.subterms){
    const expectedType = (expectedTypes == null) ? null : expectedTypes[i];
    // infer the type of the subterm
    const returnedType = matchTerm(left.subterms[i], ruleCase, expectedType, typeInfo);
    // save the mapping of the term to the inferred type
    typesList.push(returnedType);
  }


  const expectedType = (expectedTypes == null) ? null : expectedTypes[expectedTypes.length-1];
  // infer the type of the right term of the rule case (which is the return of the rule)
  const returnedType = matchTerm(right, ruleCase, expectedType, typeInfo);
  // save the mapping of the term to the inferred type
  typesList.push(returnedType);

  // for each type inferred for the rule's input and output
  for(let i in typesList){
    // if the inferred type was null, i.e. the type 'any'
    if(typesList[i]==null){
        // // assign undefined as the type of the term
        // typesList[i]= new AST.TypeVarRef({
        //   // TODO: make sure this letter does not collide with an explicit typeVarRef
        //   label: 'undefined'
        // });
    } else{
      typesList[i] = getCurrentTypeOfTypeRef(typesList[i], typeInfo);
    }
  }

  return typesList;
}


const renameTypeVar = (arg: AST.TypeRef, typeInfo: TypeInfo, renameDict: Dictionary<AST.TypeRef>) : Optional<AST.TypeRef> => {
  //console.log((<AST.TypeVarRef> arg).label + " " + (arg instanceof AST.TypeVarRef) + " " + (arg instanceof AST.Expr) );
  if(arg instanceof AST.TypeVarRef && (<AST.TypeVarRef> arg).label in renameDict){
    // TODO: the same instance of TypeVarRef is assigned to all types (I assume it's ok)
    return renameDict[(<AST.TypeVarRef> arg).label];
    console.log(arg);
  }
   else if(arg instanceof AST.TypeDeclRef){
    const subargs : Array<AST.TypeRef> = (<AST.TypeDeclRef> arg).arguments
    for (let i in subargs ){
      const newType = renameTypeVar(subargs[i], typeInfo, renameDict);
      if (newType!=null){
        subargs[i] = newType;
      }
    }
  }
  return null;
}


const typeRefFromDecl = (decl : AST.TypeDecl, typeInfo : TypeInfo, renameDict : Dictionary<AST.TypeVarRef> ) : AST.TypeRef => {
  //const name : string = decl.name;
   const args : Array<AST.TypeRef> = [];

  // create globally named type variables and
  const parameters : Array<AST.TypeVarRef> = decl.parameters;

  parameters.forEach( (param: AST.TypeVarRef) => {
     const symbolicType : AST.TypeVarRef = typeInfo.globalNS.newSymbolicType();

     // TODO: change this, this is a hack to make it run
     renameDict[param.label] = symbolicType
     // renameDict[param.label] = symbolicType;
     args.push(symbolicType);
  });

  return new AST.TypeDeclRef({
    name: decl.name,
    args: args
  });

}

// return the wider type
const matchToSupertype2 = (type1Arg : AST.TypeRef, type2Arg : AST.TypeRef, typeInfo: TypeInfo, returnNewType1 : boolean = false) : AST.TypeRef =>{
  const type1 = getCurrentTypeOfTypeVar(type1Arg, typeInfo);
  const type2 = getCurrentTypeOfTypeVar(type2Arg, typeInfo);

  if(type2 instanceof AST.TypeVarRef){
    // do nothing
  }
  // if the term type is variable, it has to be degraded to type2
  else if(type1 instanceof AST.TypeVarRef && type2 instanceof AST.TypeDeclRef){
    assignType(type1, type2, typeInfo);
  }
  // if both are type declarations
  else {
    const typeDecl1 : AST.TypeDeclRef = type1 as AST.TypeDeclRef;
    const typeDecl2 : AST.TypeDeclRef = type2 as AST.TypeDeclRef;
    if(typeDecl1.name != typeDecl1.name || typeDecl1.arguments.length != typeDecl2.arguments.length){
      return null;
    }
    for (let i in typeDecl2.arguments){
      if(matchToSupertype2(typeDecl1.arguments[i], typeDecl2.arguments[i], typeInfo) == null){
        return null;
      }

    }

  }

  return (returnNewType1) ? type1 : type2 ;
}


/**
 * This function is called to infer the type of Expr terms.
 * @param term The Expr term whose type should be inferred
 * @param typeDeclArray The array of all typeDecl statements in the program
 * @param typeRef The type of the term's parent expression
 * @return Optionally, the inferred type, if one could be found.
 */
const matchExpr = (term: AST.Expr, caseDecl: AST.RuleCaseDecl, typeRef: AST.TypeRef, typeInfo: TypeInfo) : Optional<AST.TypeRef> => {

  let argTypes : Array<AST.TypeRef> = null;
  let foundType : AST.TypeRef = null;
  const isRuleReference : boolean = typeInfo.ruleNames.has(term.label) ? true : false ;

  // if the term is a rule reference
  if( isRuleReference ){
    // add it to rule references
    typeInfo.ruleReferences.add(term);
  }


  // if the term is a rule reference and it's top level term in the case (i.e. only then typeRef == null)
  if( isRuleReference && typeRef == null){
      // fill argTypes
      argTypes = new Array<AST.TypeRef>(term.subterms.length);
      for(let i in term.subterms){
        argTypes[i] = null;
      }

      // if term refers to an untyped rule
      if(!typeInfo.typedRules.has(term.label)){
        const dependentRuleName : string = (<AST.Expr> caseDecl.left).label;
        if( typeInfo.ruleReferenceDependencies.get(dependentRuleName) == null ){
          typeInfo.ruleReferenceDependencies.set(dependentRuleName,new Array<string>());
        }
        typeInfo.ruleReferenceDependencies.get(dependentRuleName).push(term.label);
      }

  }

  else{

    for(let decl of typeInfo.typeDeclArray){

      // if expression is bound to a type, skip type declarations with different names
      if(typeRef!=null && typeRef instanceof AST.TypeDeclRef
        && (typeRef as AST.TypeDeclRef).name != (decl as AST.TypeDecl).name ){
        continue;
      }

      // try to match the expression term to one of the type constructors
      // TODO: only the first matched constructor is kept
      for(let cons of (decl as AST.TypeDecl).cases){
        let constructor : AST.TypeConsDecl = cons;

        // skip constructors whose label does not match the expression's label and arity
        if( (! isRuleReference && term.label != constructor.label ) || term.subterms.length != constructor.args.length ){
          continue;
        }

        // at this point, this is a matching constructor, so it has to match subterms
        let renameDict : Dictionary<AST.TypeVarRef> = {};

        // if it has no subterms, e.g. empty, and it was already assigned a type
        if(term.subterms.length == 0 && typeInfo.varToType[term.label] != null){
          // consider the already assigned type
          foundType = typeInfo.varToType[term.label];
        } else {

          // create a new Type reference and a renameDictionary with local to global names for type arguments
          foundType = typeRefFromDecl(decl, typeInfo, renameDict);

          // create an array of types to check at the subterms
          argTypes = deep<Array<AST.TypeRef>>(cons.args);
          // rename any variables present in the types of children, based on the map
          for(let i in argTypes) {
            const newType : AST.TypeRef = renameTypeVar(argTypes[i], typeInfo, renameDict);
            if(newType != null){
              argTypes[i] = newType;
            }

          }
        }

        // if term is bound to a type declaration, unify types,
        // i.e. so that type arguments of typeDecl are associated those of typeRef
        // e.g. typeRef = List Cars , foundType = List $T0 => then $T0 = Cars
        if(typeRef!=null ){
            unifyTypes(typeRef, foundType, typeInfo);
        }
       break;

      }
      break;

    }

  }

  // try to match each child to its type argument
  for(let i in argTypes ) {

    const subtermType : AST.TypeRef = matchTerm(term.subterms[i], caseDecl, argTypes[i], typeInfo);

    if (isUndefined(subtermType) &&  term.subterms[i] instanceof AST.Expr &&
      typeInfo.ruleReferences.has(term.subterms[i] as AST.Expr) ){
        // do nothing, subterm's type is pending
    } else if (isUndefined(subtermType)){
      console.log(`Term at ${nodeDiagnostic(term)} is of type undefined, since its subterm ${(i+1)} did not match the expected type.`);
      foundType = setUndefined(term);
    }
  }


  // assign to the term the foundType
  typeInfo.termToType[term.id] = foundType;

  // if expression has no subterms, set its type to varToType dictionary
  if(term.subterms.length == 0 && typeInfo.varToType[term.label] == null) {
    typeInfo.varToType[term.label] = foundType;
  }

  return foundType;

}

const nodeDiagnostic = (node : AST.Node) : string => {
  return `(line:${node.range.lowerBound.line}, column:${node.range.lowerBound.column})`;
}

// assume that types have their current values
const assignType = (leftType: AST.TypeVarRef, rightType : AST.TypeRef, typeInfo: TypeInfo) => {

    // if the two types are variables
    if(rightType instanceof AST.TypeVarRef && leftType.label == (rightType as AST.TypeVarRef).label){
      return ;
    }

    const label = (<AST.TypeVarRef> leftType).label;
    typeInfo.typeVarToType[label] = rightType;

}

const getCurrentTypeOfTypeRef = (type: AST.TypeRef, typeInfo: TypeInfo) : AST.TypeRef =>{
  if(type == null){
    return null;
  }

  if(type instanceof AST.TypeVarRef){
    return getCurrentTypeOfTypeVar(type, typeInfo);
  } else if(type instanceof AST.TypeDeclRef){

    // update values on all subterms
    const subterms : Array<AST.TypeRef> = (type as AST.TypeDeclRef).arguments;
    for(let i in subterms ){
      const current = getCurrentTypeOfTypeRef(subterms[i], typeInfo);

      if(current != null && current != subterms[i]){
        subterms[i] = current;
      }
    }
    return type;
  }
  return null;
}

const getCurrentTypeOfTypeVar = (type: AST.TypeRef, typeInfo: TypeInfo) : AST.TypeRef =>{

  let current :  AST.TypeRef = type;
  while(true){
    // if current is a non-variableType
    if(current instanceof AST.TypeDeclRef){
      break;
    } else {
      // if current has a descendant type
      if ((<AST.TypeVarRef> current).label in typeInfo.typeVarToType){
        current = typeInfo.typeVarToType[(<AST.TypeVarRef> current).label];

      }
      // if current has no descendand type
      else{
        break;
      }
    }
  }
  return current;
}

// assume that typeVar is a current type variable
const containsTypeVar = (type: AST.TypeRef, typeVar: AST.TypeVarRef, typeInfo: TypeInfo) : boolean =>{
//   throw new Error(
//   'Invalid string passed into `makeHttpRequest`. Expected a valid URL.'
// )
  if(type instanceof AST.TypeVarRef){

    const currType :  AST.TypeVarRef = getCurrentTypeOfTypeVar(type, typeInfo) as AST.TypeVarRef;


    if( currType.label == typeVar.label){
      return true;
    } else{
      return false;
    }
  }else {
    // if type is a TypeDeclRef
    //for each argument of the type declaration
    for( let typeArg of (<AST.TypeDeclRef> type).arguments ){
      // check that it does not contain (or is equal to) the variable type.
      if( containsTypeVar(typeArg, typeVar, typeInfo) ){
        return true;
      }
    }
  }
  return false;

}

// assume that all type variables have their current values
const unifyVarTypeAndDeclType = (declType: AST.TypeRef, varType: AST.TypeVarRef, typeInfo: TypeInfo) : Optional<AST.TypeRef> => {
  // if variable type is bounded in the context of type1, then types are not unifiable
  if(containsTypeVar(declType, varType, typeInfo)){
    return null;
  }
  // else, assign the type declaration to the variable type
  assignType(varType, declType, typeInfo);

  return declType;
}

const unifyTypes = (type1Arg: AST.TypeRef, type2Arg: AST.TypeRef, typeInfo: TypeInfo ) : Optional<AST.TypeRef> => {

  // skip everything if some type is null;
  if(type1Arg == null && type2Arg == null){
    return null;
  }else if(type1Arg == null){
    return type2Arg;
  }else if(type2Arg == null){
    return type1Arg;
  }
  // get current types
  // TODO: make sure that types of rules are also have been added to the typeInfo object
  const type1 : AST.TypeRef = getCurrentTypeOfTypeVar(type1Arg, typeInfo);
  const type2 : AST.TypeRef = getCurrentTypeOfTypeVar(type2Arg, typeInfo);

  // if one of the types is non-variable AND the other is variable, then unify by keeping the non-variable
  if( type1 instanceof AST.TypeDeclRef && type2 instanceof AST.TypeVarRef){
      return unifyVarTypeAndDeclType(type1, type2, typeInfo);
  }
  else if(type1 instanceof AST.TypeVarRef && type2 instanceof AST.TypeDeclRef){
    return unifyVarTypeAndDeclType(type2, type1, typeInfo);
  }
  // if both types are variable, then unify by keeping type2
  else if(type1 instanceof AST.TypeVarRef && type2 instanceof AST.TypeVarRef){
    assignType(type2, type1, typeInfo);

    return type2;

  }
  // if both types are non-variable, unify their arguments
  else if(type1 instanceof AST.TypeDeclRef && type2 instanceof AST.TypeDeclRef){

    // if(type1.name != type2.name || type1.arguments.length != type2.arguments.length){
    //   return null;
    // }

    if(type1.name != type2.name || type1.arguments.length != type2.arguments.length){

      return null;
    }

    for( let i in type1.arguments ){
      if (unifyTypes(type1.arguments[i], type2.arguments[i], typeInfo) == null ){
        return null;
      }
    }

    // it doesn't matter which one we keep, as they will be equal;
    //assignType(type1, term1, type2, typeInfo);
    return type2;
  }// else will not be reachable for now (no other type combination)
  else {
    return null;
  }

}


// Matches a variable reference (term) to a type (typeRef).
const matchVarRef = (term: AST.Term, typeRef: AST.TypeRef, typeInfo: TypeInfo) : Optional<AST.TypeRef> => {

  const typeInScope : AST.TypeRef = typeInfo.varToType[(<AST.VarRef> term).label];
  let foundType : AST.TypeRef = null;

  if(typeInScope == null && typeRef == null){
    foundType = typeInfo.globalNS.newSymbolicType();
  } else {
    foundType = unifyTypes(typeInScope, typeRef, typeInfo);
  }
  
  if(typeInScope == null){
    typeInfo.varToType[(<AST.VarRef> term).label] = foundType;
  }

  typeInfo.termToType[term.id] = foundType;

  return foundType;

}


// Checks if the term can be matched to a type.
// If term is a variable reference, in which case it is assigned a type reference (if it is in place of a type argument) or any type (otherwise)
// If the term is an expression, then try to match it with some type constructor(s).
const matchTerm = (term: AST.Term, caseDecl: AST.RuleCaseDecl, typeRef: AST.TypeRef, typeInfo: TypeInfo) : Optional<AST.TypeRef> => {

  if(term instanceof AST.Expr){
    return matchExpr(term, caseDecl, typeRef, typeInfo);
  }else if(term instanceof AST.VarRef){
    return matchVarRef(term, typeRef, typeInfo);
  }

  return null;
}
