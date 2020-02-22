# Parsing FunBlocks' textual form

In order to support a hybrid environment (visual+textual), FunBlocks needs to embed a parser for its textual form.
This parser will be used to process the user's input when the IDE is in textual mode, and produce an AST compatible with that produced by the visual editor.
That way, we should be able leverage the same code to perform static analysis (e.g. type inference), regardless of the input mode.

## Requirements

The parser has the following requirements:
* It should produce sensible error messages to help the user debug their code (i.e. better than `unexpected character 'xxx'`).
  This rules out any parser generator library that does not provide a strong support for custom, contextual error messages.
* It should be reasonably fast so that it can invoked as often as the user changes their code.
  Fortunately, FunBlocks' grammar is relatively simple and we do not expect FunBlocks programs to be particularly long.
  Hence an efficient implementation of a LL(k) parser might satisfy this requirement.
* The parser's output should be usable by the text editor library we use, in particular to provide syntax highlighting and locate error messages.

## Implementation options

We review here some of the implementation options that have been considered so far:
* [parjs](https://parjs.netlify.com) is a parser combinator library, similar in design to Hashell's [Parsec](https://wiki.haskell.org/Parsec).
  This option should be a very good fit for prototyping.
  There is also a support for custom low-level logic, which could be leveraged to produce rich error messages.
* [tree-sitter](https://github.com/tree-sitter/tree-sitter) is an incremental parsing system, written in C but compilable in Wasm.
  It has been developed specifically for the purpose of being used in programming tools (e.g. for syntax coloring).
  Unfortunately, support for sensible error messages is currently lacking (see [this thread](https://github.com/tree-sitter/tree-sitter/issues/255)).
* A last option is to handwrite the parser from scratch.
Since FunBlocks' grammar is relatively simple, this should be a reasonable effort.
  However, such an option may impact the grammar's flexibility, as production rules would be hardcoded, and hinder maintainability, as future developers won't have access to other usage examples.
