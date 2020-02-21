import { AnyAction, combineReducers } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'
import { BlockData, blockData } from './BlockData'
import { DebugContext, debugContext } from './Contexts/DebugContext'
import { EditContext, editContext } from './Contexts/EditContext'
import { RunContext, runContext } from './Contexts/RunContext'
import { DraggedData, draggedData } from './DraggedData'
import { program } from './Program'

/// An enumeration of the workspaces of the IDE.
export enum IDEWorkspace { Edit, Debug, Run }

/// An enumeration of the IDE's input mode.
export enum InputMode { Visual, Textual }

export type IDEContext = EditContext | DebugContext | RunContext

type IDEState = {
  activeWorkspace: IDEWorkspace,
  context: IDEContext,
  inputMode: InputMode,
  blockData: BlockData,
  draggedData: DraggedData,
  program: Program,
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
  }

  case ACTION_TYPES.CHANGE_INPUT_MODE:
    return { ...state, inputMode: action.payload }

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