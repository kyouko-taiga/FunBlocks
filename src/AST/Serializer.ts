import { RuleCaseDecl } from './DeclNodes'
import { Expr, VarRef } from './TermNodes'

/// Serializes a program to a string.
export function serialize(program: Program): string {
  const tree = {
    initialState: program.initialState.treeized,
    ruleCases: program.ruleCases.map((rule: RuleCaseDecl) => ({
      _objectType: 'Rule',
      id: rule.id,
      left: rule.left.treeized,
      right: rule.right.treeized,
    }))
  }

  return JSON.stringify(tree)
}

/// Deserializes a program from a string.
export function deserialize(input: string): Program {
  // Parse the input as an AST.
  const tree = JSON.parse(input)
  if (!tree) { throw new Error(`corrupted input`) }

  // Build the initial state.
  const initialState = tree.initialState && makeTerm(tree.initialState)

  // Build the rule cases.
  const rulesData = tree.ruleCases || []
  const ruleCases = rulesData.map((subtree: Dictionary) => new RuleCaseDecl({
    id: subtree.id,
    left: subtree.left && makeTerm(subtree.left),
    right: subtree.right && makeTerm(subtree.right),
  }))

  return { initialState, ruleCases }
}

// MARK: Parsing helper functions.

type TermArgs = ExprArgs | VarArgs

type ExprArgs = {
  _objectType: string,
  id: string,
  label: string,
  subterms: Array<TermArgs>,
}

type VarArgs = {
  _objectType: string,
  id: string,
  label: string,
}

function makeTerm(args: TermArgs): Term {
  if (args._objectType === 'Expr') {
    const exprArgs = args as ExprArgs
    return new Expr({
      id: exprArgs.id,
      label: exprArgs.label,
      subterms: exprArgs.subterms.map(makeTerm),
    })
  } else if (args._objectType === 'VarRef') {
    const varArgs = args as VarArgs
    return new VarRef({
      id: varArgs.id,
      label: varArgs.label,
    })
  } else {
    throw new Error(`unexpected object type ${args._objectType}`)
  }
}
