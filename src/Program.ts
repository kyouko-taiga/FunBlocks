import { TopLevelDecl, TranslationUnitDecl } from 'FunBlocks/AST/DeclNodes'
import { Diagnostic } from 'FunBlocks/AST/Diagnostic'

import { InitStateDecl } from 'FunBlocks/AST/DeclNodes'
import { Expr } from 'FunBlocks/AST/TermNodes'

/// A singleton that represents the program being presented in the IDE.
///
/// A FunBlocks program is a forest of multiple ASTs representing its translation units. These are
/// relatively complex data structures, made of the different class instances representing the AST
/// nodes and their annotations. Some of these annotations are links to other AST nodes, meaning
/// that a fully annotated program is in fact a graph.
///
/// Such a data structure does not fit particularly well Redux' model, which favors flat state
/// representations. Furthermore, because the graph is not acyclic, mutations on one node may have
/// side effects on other nodes (e.g. parent/child relationships) which would bloat reducers with
/// a lot of code to keep the whole structure consistent. This would also mean that all mutations
/// should be performed by dispatching actions, which split the logic in multiple reducers and
/// hinder usability in outside of the UI-related code (e.g. calling `term.removeFromParent()` is
/// arguably simpler to use than `store.dispatch(TermActions.removeFromParent(term.id))`.
///
/// Therefore we choose another approach to store and interact with the program. We keep it as a
/// hierarchical data structure, stored outside of Redux, and use the observer pattern to bind
/// React components to node mutations. This way, the data structure can manipulated freely,
/// without the need to dispatch actions.
const program = {

  /// The translation units of the program.
  units: {
    Main: new TranslationUnitDecl({
      decls: [new InitStateDecl({
        state: new Expr({ label: 'Foo', subterms: [ new Expr({ label: 'Bar' }) ] })
      })],
    }),
  },

}

// Seals the program and its main translation unit, preventing new properties from being added to
// it and marking all existing properties as non-configurable.
Object.seal(program)
Object.seal(program.units)
Object.seal(program.units.Main)

if (process.env.NODE_ENV === 'development') {
  const fb: Dictionary = (window as any).FunBlocks || {}
  fb.program = program;
  (window as any).fb = fb
}

export { program }
