import { AnyAction, combineReducers } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'
import { blockData } from './BlockData'
import { debugContext } from './Contexts/DebugContext'
import { editContext } from './Contexts/EditContext'
import { runContext } from './Contexts/RunContext'
import { draggedData } from './DraggedData'
import { program } from './Program'
import * as AST from 'FunBlocks/AST'
import * as funview from 'FunBlocks/FUNVIEW'

/// An enumeration of the workspaces of the IDE.
export enum IDEWorkspace { Edit, Debug, Run }

/// An enumeration of the IDE's input mode.
export enum InputMode { Visual, Textual }

export type IDEContext = ReturnType<typeof editContext>
                       | ReturnType<typeof debugContext>
                       | ReturnType<typeof runContext>

type IDEState = {
  activeWorkspace: IDEWorkspace,
  context: IDEContext,
  inputMode: InputMode,
  blockData: ReturnType<typeof blockData>,
  draggedData: ReturnType<typeof draggedData>,
  program: ReturnType<typeof program>,
}

const contextReducers = {
  [IDEWorkspace.Edit]: editContext,
  [IDEWorkspace.Debug]: debugContext,
  [IDEWorkspace.Run]: runContext,
}

const initialState: IDEState = {
  activeWorkspace: IDEWorkspace.Edit,
  context: editContext(undefined, { type: null }),
  inputMode: InputMode.Visual,
  blockData: blockData(undefined, { type: null }),
  draggedData: draggedData(undefined, { type: null }),
  program: program(undefined, { type: null }),
}

const ide = (state: IDEState = initialState, action: AnyAction): IDEState => {
  let newState = state

  switch (action.type) {
  case ACTION_TYPES.CHANGE_ACTIVE_WORKSPACE: {
    // Compute the context of the workspace to which the IDE is about to transition.
    const newWorkspace = action.payload as IDEWorkspace
    let initialContext: Dictionary = {}
    switch (newWorkspace) {
    case IDEWorkspace.Debug:
      let canvas = new funview.DrawingCanvas
      canvas.clearCanvas()
      
      let Root = newState.program.initialState as AST.Expr
      let couleur1 = new AST.Expr({label: 'Bleu'})
      let couleur2 = new AST.Expr({label: 'Rouge'})
      let couleur3 = new AST.Expr({label: 'Jaune'})
      let couleur4 = new AST.Expr({label: 'Vert'})

      let forme1 = new AST.Expr({label: 'Carre'})
      let forme2 = new AST.Expr({label: 'Rond'})
      let forme3 = new AST.Expr({label: 'Triangle'})

      let Shape1 = new AST.Expr({label: 'Shape', subterms: [forme1, couleur1]})
      let Shape2 = new AST.Expr({label: 'Shape', subterms: [forme2, couleur2]})
      let Shape3 = new AST.Expr({label: 'Shape', subterms: [forme3, couleur3]})
      let Shape4 = new AST.Expr({label: 'empty', subterms: [forme1, couleur4]})

      let func1 = new AST.Expr({label: 'cons', subterms: [Shape1, Shape2]})
      let func2 = new AST.Expr({label: 'cons', subterms: [Shape3, Shape4]})

      //let Root = new AST.Expr({label: 'cons', subterms: [func1, func2]})


      let drawing = new funview.DrawnState
      drawing.explore(Root)
      initialContext = { selectedRuleID: null }
      if (state.program.initialState !== null) {
        initialContext.history = [state.program.initialState]
        initialContext.historyIndex = 0
      } else {
        initialContext.history = []
        initialContext.historyIndex = -1
      }
      break

    default:
      break
    }

    // Update the IDE's workspace.
    newState = { ...state, activeWorkspace: newWorkspace, context: initialContext }
    break
  }

  case ACTION_TYPES.CHANGE_INPUT_MODE:
    newState = { ...state, inputMode: action.payload }
    break

  default:
    break
  }

  // Forward the action to the sub-reducers.
  const newRemainer = {
    program: program(newState.program, action),
    blockData: blockData(newState.blockData, action),
    draggedData: draggedData(newState.draggedData, action),

    // Notice that `state.context` must be cast as `any`, as the compiler can't guarantee that it
    // has the same type as the reducer corresponding to the active workspace. A safer version
    // would be to compute the context in a switch case for all possible workspaces, so that the
    // compiler may guarantee that it has the appropriate type.
    context: contextReducers[newState.activeWorkspace](newState.context as any, action),
  }

  // Create a new state only if one of the sub-reducers produced a different object.
  const didChange = Object.keys(newRemainer).some((k) => (newRemainer as any)[k] !== (newState as any)[k])
  return didChange
    ? { ...newState, ...newRemainer }
    : newState
}

export default ide
