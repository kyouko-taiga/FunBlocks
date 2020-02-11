import { AnyAction } from 'redux'

import {
  PUSH_STATE,
  SELECT_RULE,
  SET_HISTORY_INDEX,
  SET_MODE,
} from 'FunBlocks/Actions/IDE'
import { Term } from 'FunBlocks/AST/Terms'

/// An enumeration of the modes of the IDE.
export enum IDEMode {
  Edit,
  Debug,
  Run,
}

export type EditContext = { }

export type DebugContext = {
  history: Array<Term>,
  historyIndex: number,
  selectedRuleID: string,
}

export type RunContext = { }

export type IDEContext = EditContext | DebugContext | RunContext

type IDEState = {
  mode: IDEMode,
  context: IDEContext
}

const init: IDEState = {
  mode: IDEMode.Debug,
  context: {
    history: [] as Array<Term>,
    historyIndex: -1,
    selectedRuleID: null as string,
  },
}

const interpreter = (state: IDEState = init, action: AnyAction): IDEState => {
  switch (action.type) {
  case PUSH_STATE:
    if (state.mode === IDEMode.Debug) {
      // Keep the history up to the current index and append the new state.
      const { history, historyIndex, ...rest } = state.context as DebugContext
      const newContext = {
        ...rest,
        history: history.slice(0, historyIndex + 1).concat([ action.payload ]),
        historyIndex: historyIndex + 1,
      }
      return {
        ...state,
        context: newContext,
      }
    }

  case SELECT_RULE:
    if (state.mode === IDEMode.Debug) {
      const context = state.context as DebugContext
      return {
        ...state,
        context: { ...context, selectedRuleID: action.payload },
      }
    }

  case SET_HISTORY_INDEX:
    if (state.mode === IDEMode.Debug) {
      const context = state.context as DebugContext
      return {
        ...state,
        context: { ...context, historyIndex: action.payload },
      }
    }

  case SET_MODE:
    switch (action.payload) {
    case state.mode:
      // The IDE is already in the requested mode.
      return state

    case IDEMode.Edit:
      return state

    case IDEMode.Debug:
      return state

    case IDEMode.Run:
      console.error('TODO')
      return state
    }

  default:
    return state
  }

  throw new Error(`unexpected action '${action.type} in state '${state.mode}'`)
}

export default interpreter
