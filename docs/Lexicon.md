# Lexicon

## Abstract Syntax Tree (AST)

An Abstract Syntax Tree (AST) is a tree representation of a program.
This data structure is widely used in compilers as an intermediate representation.

In the context of FunBlocks, while the relationships between topologically nested syntactic constructions (e.g. a subterm in an expression) do form a tree, an AST node may feature additional information in the form of links onto other nodes, resulting in a graph rather than a tree.

## Diagnostic

A diagnostic is a message resulting from the detection of any kind of issue during the analysis of a FunBlocks program.

## Semantic Analysis (Sema)

Semantic analysis is a compilation step that consists of assigning a meaning to an AST.
In the context of FunBlocks, this mostly relates to type checking.
