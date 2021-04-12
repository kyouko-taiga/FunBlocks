var src =
"""
// Type definitions
type List $T :: empty | cons $T (List $T)

// Initial state
init cons(1, cons(2, empty))

// Quicksort
rule sort :: List Int => List Int
case sort(empty) => empty
case sort(cons($x, $y)) => cat(filter_lt($x, $y), cons($x, sort(filter_gt($x, $y))))

// Filters
rule filter_lt :: Int -> List Int => List Int
case filter_lt($x, empty) => empty
case filter_lt($x, cons($y, $z)) => if(lt($y, $x), cons($y, filter_lt($z)), filter_lt($z))

rule filter_gt :: Int -> List Int => List Int
case filter_gt($x, empty) => empty
case filter_gt($x, cons($y, $z)) => if(gt($y, $x), cons($y, filter_gt($z)), filter_gt($z))

// Conditional expressions
rule if $T :: Bool -> $T -> $T => $T
case if(true, $x, $y) => $x
case if(false, $x, $y) => $y
"""

FunBlockParser.initialize()

let tokens = try tokenize(src)
let stmts = FunBlockParser.parse(tokens)
for stmt in stmts {
  print(stmt)
}
