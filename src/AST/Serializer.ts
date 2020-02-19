import { Rule } from './Terms'

/// Serializes a program to a string.
export function serialize(program: Program): string {
  const tree = {
    initialState: program.initialState.treeized,
    rules: program.rules.map((rule: Rule) => ({
      _objectType: 'Rule',
      id: rule.id,
      left: rule.left.treeized,
      right: rule.right.treeized,
    }))
  }

  return JSON.stringify(tree)
}
