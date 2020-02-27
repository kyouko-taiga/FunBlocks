import { SourceRange } from './SourceRange'

/// The interface of an AST node.
export interface NodeInterface {

  /// The range in the textual representation of the program that represents this node.
  readonly range: Optional<SourceRange>

}

/// An AST node.
export abstract class Node implements NodeInterface {

  public readonly range: Optional<SourceRange>

  protected constructor(range?: Optional<SourceRange>) {
    this.range = range || null
  }

}

/// An observable AST node.
export abstract class ObservableNode extends Node {

  /// The observers subscribed to this node.
  private observers: Array<(node: Node) => void>

  protected constructor(range?: Optional<SourceRange>) {
    super(range)
  }

  public subscribe(observer: ((node: Node) => void)) {
    this.observers.push(observer)
  }

  public unsubscribe(observer: ((node: Node) => void)) {
    this.observers = this.observers.filter((obs) => observer !== obs)
  }

  protected notify() {
    this.observers.forEach((obs) => obs(this))
  }

}
