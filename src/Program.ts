import { TopLevelDecl, TranslationUnitDecl } from 'FunBlocks/AST/DeclNodes'
import { Diagnostic } from 'FunBlocks/AST/Diagnostic'

/// A singleton that represents the program being presented in the IDE.
///
/// This object contains the translation units loaded by the IDE. As it lives independently from
/// Redux' store, the program's AST is not tightly coupled to the UI and can be freely mutated.
/// Instead, Redux' store should be synchronized "on demand" by dispatching `SYNC_UI`.
const program = {

  /// The translation units of the program.
  units: {
    main: {
      decls: [] as Array<TopLevelDecl>,
      diagnostics: [] as Array<Diagnostic>,
    } as TranslationUnitDecl,
  } as { [index: string]: TranslationUnitDecl },

}

// Seals the program and its main translation unit, preventing new properties from being added to
// it and marking all existing properties as non-configurable.
Object.seal(program)
Object.seal(program.units.main)

export { program }
