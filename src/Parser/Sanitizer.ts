import * as AST from 'FunBlocks/AST'

/// Performs a number of sanity checks on the given translation unit, adding diagnostics to the
/// latter for any issue detected.
export const sanitize = (unit: AST.TranslationUnitDecl): void => {

  // Make sure there is at most one initial state declaration.
  let hasInitStateDecl = false
  for (const decl of unit.decls) {
    if ((decl instanceof AST.InitStateDecl) && hasInitStateDecl) {
      unit.diagnostics.push({
        message: 'duplicate initial state declaration',
        range: decl.range
      })
    } else {
      hasInitStateDecl = true
    }
  }

  // TODO: initial state declarations shall not contain any variable.

}
