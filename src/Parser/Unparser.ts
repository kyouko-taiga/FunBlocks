export function unparse(program: Program): string {
  let source = ''

  // Unparse the program's initial state.
  if (!!program.initialState) {
    source += `init ${program.initialState.description}`
    source += '\n'
    if (program.ruleCases.length > 0) {
      source += '\n'
    }
  }

  // Unparse the program's rule case declarations.
  for (let ruleCase of program.ruleCases) {
    source += `case ${ruleCase.left.description} => ${ruleCase.right.description}`
    source += '\n'
  }

  return source
}
