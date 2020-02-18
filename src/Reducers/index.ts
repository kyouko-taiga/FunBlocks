import { AnyAction, combineReducers } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/IDE'
import { BlockData, blockData } from './BlockData'
import { DebugContext, debugContext } from './Contexts/DebugContext'
import { EditContext, editContext } from './Contexts/EditContext'
import { RunContext, runContext } from './Contexts/RunContext'
import { DraggedData, draggedData } from './DraggedData'
import { program } from './Program'

/// An enumeration of the modes of the IDE.
export enum IDEMode { Edit, Debug, Run }

export type IDEContext = EditContext | DebugContext | RunContext

type IDEState = {
  mode: IDEMode,
  program: Program,
  context: IDEContext,
  blockData: BlockData,
  draggedData: DraggedData,
}

const contextReducers = {
  [IDEMode.Edit]  : editContext,
  [IDEMode.Debug] : debugContext,
  [IDEMode.Run]   : runContext,
}

const initialState: IDEState = {
  mode: IDEMode.Edit,
  program: program(undefined, { type: null }),
  context: editContext(undefined, { type: null }),
  blockData: blockData(undefined, { type: null }),
  draggedData: draggedData(undefined, { type: null }),
}

const ide = (state: IDEState = initialState, action: AnyAction): IDEState => {
  let newState = state

  switch (action.type) {
  case ACTION_TYPES.SET_MODE: {
    // Compute the context of the mode to which the IDE is about to transition.
    const newMode = action.payload as IDEMode
    const initialContext: IDEContext = newMode === IDEMode.Debug
      ? { history: [ state.program.initialState ], historyIndex: 0, selectedRuleID: null }
      : {}

    // Update the IDE's mode.
    newState = { ...state, mode: newMode, context: initialContext }
  }

  default:
    break
  }

  // Forward the action to the sub-reducers.
  const newRemainer = {
    program: program(newState.program, action),
    blockData: blockData(newState.blockData, action),
    draggedData: draggedData(newState.draggedData, action),

    // Notice that `state.context` must be cast as `any`, because the compiler cannot statically
    // guarantee that it has the same type as the reducer denoted by `contextReducers[state.mode]`.
    // A safer version would be to compute the context in a switch case for all possible modes, so
    // that the compiler may guarantee that it has the appropriate type.
    context: contextReducers[newState.mode](newState.context as any, action),
  }

  // Create a new state only if one of the sub-reducers produced a different object.
  const didChange = Object.keys(newRemainer).some((k) => (newRemainer as any)[k] !== (newState as any)[k])
  return didChange
    ? { ...newState, ...newRemainer }
    : newState
}

export default ide
