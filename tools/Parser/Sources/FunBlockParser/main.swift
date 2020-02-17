var src =
"""
// Type definitions
type List $T :: empty | cons $T (List $T)

// Initial state
init cons(1, cons(2, empty))

// Quicksort
decl sort :: List Int => List Int
rule sort(empty) => empty
rule sort(cons($x, $y)) => cat(filter_lt($x, $y), cons($x, sort(filter_gt($x, $y))))

// Filters
decl filter_lt :: List Int => List Int
rule filter_lt($x, empty) => empty
rule filter_lt($x, cons($y, $z)) => if(lt($y, $x), cons($y, filter_lt($z)), filter_lt($z))

decl filter_gt :: List Int => List Int
rule filter_gt($x, empty) => empty
rule filter_gt($x, cons($y, $z)) => if(gt($y, $x), cons($y, filter_gt($z)), filter_gt($z))

// Conditional expressions
decl if $T :: Bool -> $T -> $T => $T
rule if(true, $x, $y) => $x
rule if(false, $x, $y) => $y
"""

FunBlockParser.initialize()

let tokens = try tokenize(src)
let stmts = FunBlockParser.parse(tokens)
for stmt in stmts {
  print(stmt)
}
