import { Term } from 'FunBlocks/AST/TermNodes'
import { DraggedDataProps } from 'FunBlocks/UI/Utils/DraggedDataConnector'

export interface TermViewProps {

  /// The term to represent graphically.
  term: Term

  /// Indicates whether the view and its subviews are collapsible.
  collapsible?: boolean

  /// Indicates whether the view and its subviews are editable.
  ///
  /// Setting this flag will make this block react to the user interactions that can trigger its
  /// modification. This include drag and drop events originating from the program editor's toolbox
  /// (for additions) and drag events originating from a subterm (for deletions).
  editable?: boolean

  /// A callback that is called whenever a rendered term or subterm is clicked.
  onClick?(term: Term): void

}

export type TermViewRootProps = DraggedDataProps & TermViewProps

export interface TermViewRootState {

  /// The optional term in which a drop placeholder should be rendered on compatible drag events.
  dropPlaceholderContainer: Optional<Term>

  /// The index of the subterm of `dropPlaceholderContainer` before which the drop placeholder
  /// should be rendered compatible drag events.
  dropPlaceholderIndexInContainer: number

  /// The most nested term currently hovered by the mouse.
  hoveredTerm: Optional<Term>

}

interface TermViewRootStateUpdateFunctions {

  /// Updates the most nested hovered term.
  updateHoveredTerm(term: Optional<Term>): void

}

export type TermViewContainerProps =
  TermViewRootProps & TermViewRootState & TermViewRootStateUpdateFunctions

interface ExprViewOwnProps {

  /// The expression's label.
  label: string

  /// The expression's subterms.
  subterms: Array<Term>

  /// The view's color scheme.
  colorScheme: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  }

  /// A callback to handle clicks on the view.
  onViewClick(e: React.MouseEvent<HTMLDivElement>): void

  /// A callback to handle mouse hovering events on the view.
  onMouseOver(e: React.MouseEvent<HTMLDivElement>): void

  /// A callback to handle mouse leaving events on the view.
  onMouseLeave(e: React.MouseEvent<HTMLDivElement>): void

  /// A callback to handle changes of the view's label.
  onLabelChange(e: React.ChangeEvent<HTMLInputElement>): void

}

export type ExprViewProps = Omit<TermViewContainerProps & ExprViewOwnProps, 'term'>
