
enum VisitedStatus {
  Not_visited,
  In_stack,
  Done,
}

/// Finds sets of nodes that form cycles and are closed under union
export const findCycles = <V> ( graph: Map<V, Array<V>>, vertices : Set<V> = null ): Set<Set<V>> => {

  let stack : Array<V> = [];
  let cycles : Set<Set<V>> = new Set<Set<V>>();

  if(vertices == null){

    vertices = new Set<V>();

    for( let from of graph.keys()){
      vertices.add(from);
      for( let node of graph.get(from)){
        vertices.add(node);
      }
    }
  }


  // create visited Set
  const visited : Map<V, VisitedStatus> = new Map<V, VisitedStatus>();
  for( let v of vertices){
    visited.set(v, VisitedStatus.Not_visited);
  }

  // for each vertex
  for( let vertex of vertices){
    // that is not visited
    if( visited.get(vertex) == VisitedStatus.Not_visited ){
      // clear the stack
      stack = [];
      // visit the vertex
      visitVertex<V>(vertex, graph, stack, visited, cycles);
    }
  }

  return cycles;
}

const visitVertex = <V> (v : V, graph: Map<V, Array<V>>, stack: Array<V> , visited: Map<V, VisitedStatus>, cycles : Set<Set<V>> )  => {
  // add vertex to stack
  stack.push(v);
  // set its status to in_stack
  visited.set(v, VisitedStatus.In_stack);
  // begin DFS traversal
  processDFS<V>(graph, stack, visited, cycles);
}

const processDFS = <V>(graph: Map<V, Array<V>>, stack: Array<V> , visited: Map<V, VisitedStatus>, cycles : Set<Set<V>> ) => {

  const stackTop = stack[stack.length -1];

  // for each vertex directly accessible from the current top of the stack
  if(graph.has(stackTop)){
    for(let vertex of graph.get(stackTop)){
      // if the vertex is in the stack
      if(visited.get(vertex) == VisitedStatus.In_stack){
        // a cycle was found
        addCycle<V>(stack, vertex, cycles);
      }
      // else if the vertex is unexplored
      else if(visited.get(vertex) == VisitedStatus.Not_visited ){
        // visit the vertex
        visitVertex<V>(vertex, graph, stack, visited, cycles);
      }
      else if( visited.get(vertex) == VisitedStatus.Done ){
        // if some cycle of the vertex has some In_stack vertex, add stackTop to that cycle
        for( let cycle of cycles){
          if(!cycle.has(vertex)){
            continue;
          }
          for(let member of cycle){
            if(visited.get(member) == VisitedStatus.In_stack){
              cycle.add(stackTop);
              break;
            }
          }
        }
      }
    }
  }
  // set the current top of the stack as visited
  visited.set( stackTop, VisitedStatus.Done);
  // remove the top of the stack
  stack.pop();
}

const addCycle = <V> ( stack: Array<V> , v: V, cycles : Set<Set<V>> ) => {

  //const stack2 = new Array<V>();
  const cycle = new Set<V>();
  cycle.add(v);

  let i = stack.length-1;

  // while the top of stack2 is not v (i.e. the backwards vertex)
  while(stack[i] != v){
    // add to stack2 the top of the stack
    cycle.add( stack[i]);
    // remove the top of the stack
    i--;
  }
  cycles.add(cycle);

}
