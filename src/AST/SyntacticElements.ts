export interface AST{

  // description(): String ;
}
/////////////////////////////////////////////////////


export class TypeDecl implements AST {

  public readonly name: string;
  public readonly parameters: Array<TypeVarRef>;
  public readonly cases: Array<TypeCons>;

  public constructor(args: { name: string, parameters?: Array<TypeVarRef>, cases: Array<TypeCons> }) {
    this.name = args.name;
    this.parameters = args.parameters;
    this.cases = args.cases;
  }

  // public description(): String {
  //   let result = "type \(name)"
  //   if (!!this.parameters) {
  //     result += " " + this.parameters.map( e => e.description()).join(" ")
  //   }
  //   result += " :: " + this.cases.map( e => e.description()).join(" | ")
  //   return result
  // }

}


export class InitStateDecl implements AST{
  public readonly state: Expression ;

  public constructor(args: { state: Expression }) {
      this.state = args.state;
    }

  // public description(): String {
  //   return "init " + this.state;
  // }
}


export class RuleDecl implements AST{
  public readonly name : String;
  public readonly arguments : Array<TypeRef>;

  public readonly left : TypeSign;
  public readonly right : TypeSign;

  public constructor(args: { name : String, arguments : Array<TypeRef> , left : TypeSign, right : TypeSign}) {
    this.name = args.name;
    this.arguments = args.arguments;
    this.left = args.left;
    this.right = args.right;
  }

  // public description(): String {
  //   let tail = " :: " + this.left + " => "+ this.right;
  //   return this.arguments.length>0
  //     ? "decl "+ this.name + tail
  //     : "decl "+ this.name + "(" + this.arguments.map(e => e.description() ).join(" ") + ")" + tail
  // }

}

export class RuleDef implements AST{
  public readonly left : Expression;
  public readonly right : Term;
  
  public constructor(args: { left: Expression, right : Term }) {
      this.left = args.left;
      this.right = args.right;
    }
}

export class TypeCons implements AST{
  public readonly label : String;
  public readonly arguments : Array<TypeRef>;
  

  public constructor(args: { label : String, arguments : Array<TypeRef> }) {
    this.label = args.label;
    this.arguments = args.arguments;
  }

  // public description(): String {
  //   let tail = " :: " + this.left + " => "+ this.right;
  //   return this.arguments.length>0
  //     ? "decl "+ this.name + tail
  //     : "decl "+ this.name + "(" + this.arguments.map(e => e.description() ).join(" ") + ")" + tail
  // }

}

export class TypeSign implements AST{}


export class ArrowTypeSign implements TypeSign{
  public readonly left: TypeSign;
  public readonly right: TypeSign;

   public constructor(args: { left: TypeSign, right: TypeSign}) {
    this.left = args.left;
    this.right = args.right;
  }

}
 

export class TypeRef  implements TypeSign{}

export class TypeDeclRef implements TypeRef {

  public readonly name: string;

  public arguments: Array<TypeRef>

  public constructor(args: { name: string, arguments: Array<TypeRef>}) {
    this.name = args.name;
    this.arguments = args.arguments ;
  }
  
}

export class TypeVarRef implements TypeRef {
  public readonly name: string;

  public constructor(args: { name: string}) {
    this.name = args.name;
  }
}


export class Term implements AST{}


export class Expression implements Term{

  public readonly label: string;

  public subterms: Array<Term>

  public constructor(args: { label: string, subterms: Array<Term> }) {
    this.label = args.label;
    this.subterms = args.subterms;
  }

}


export class VarRef implements Term{

  public readonly name: string;

   public constructor(args: { name: string}) {
    this.name = args.name;
  }

}

////////////////////////////////

