# FunBlocks

FunBlocks is a web-based, educational programming environment to learn the basics of programming.
Programs are built by composing different blocks together to represent data and behavior.
The environment also features a translator to go from a visual program to its textual form, and vice-versa.

Unlike most other visual programming environment aimed at education, FunBlocks adopts a [functional paradigm](https://en.wikipedia.org/wiki/Functional_programming).
Hence, it is better suited to define and manipulate data structures.

## Philosophy

FunBlocks is born from the observation that most educational environments aimed at introducing programming are based on an [imperative paradigm](https://en.wikipedia.org/wiki/Imperative_programming).
In this paradigm, a program is defined as a sequence of instructions that the computer should execute in order.
The evolution of a program is represented by a *state*, which each instruction may modify.
While many programming languages adopt this approach, it comes with several subtleties that can be challenging to understand without the proper background.
The following three problems are the most prevalent:

1. The *state* of the program is an abstract notion that is not visible in its syntax.
  Hence, one has to build a mental model of the program's execution to understand how the state interacts with each instruction.
2. Modifying the state requires the use of assignment statements, whose semantics can vary a lot from one language to the other, especially in the presence of aliasing.
  This hinders one's ability to form correct assumptions about the precise meaning of an instruction.
3. The imperative paradigm lacks mechanisms to elegantly describe control flow and therefore assumes the existence of some "built-in" control structures, whose semantics must be defined ad-hoc.

Block-based educational programming environments usually address the first issue by using the program to manipulate a graphical environment (e.g. a 2D world in which a character should be moved from one location to another), using some predefined functions to control the environment.
Unfortunately, this approach is generally ill-suited to study data structures because they severely restrict the ability to manipulate them directly.
For instance, providing a predefined function (textual or visual) `moveForward` to move a character on a 2D space completely elides all questions related to the representation of this space or coordinates therein.

In contrast, FunBlocks relies on a simpler yet equally expressive alternative, often referred to as the [functional paradigm](https://en.wikipedia.org/wiki/Functional_programming).
In this paradigm, a program is expressed in the form of functions that are composed to form more complex expressions.
Unlike the sub-routines (a.k.a. procedures) of an imperative program, the functions of a (pure) functional program do correspond to the mathematical definition of a function (i.e. a relation between the function's domain and codomain).
It follows that the functional paradigm is much closer to the notions of algebra taught in primary and secondary school, allowing computation to be expressed in terms of simple transformations.

In FunBlocks, blocks can represent atomic data, expressions or variables, just as elementary algebra relies on constants (typically numbers), mathematical expressions and indeterminates.
Computation is expressed by the means of rewriting rules which define valid ways to transform a block into another.
For instance, the following rule describes how to compute the distance between two points:

```funblocks
dist(point($x1, $y1), point($x2, $y2)) => sqrt(add(sub($x1, $x2), sub($y1, $y2)))
```
