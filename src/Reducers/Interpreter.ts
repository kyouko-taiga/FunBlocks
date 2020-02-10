import { AnyAction } from 'redux'

import { PUSH_STATE, SELECT_RULE, SET_HISTORY_INDEX } from 'FunBlocks/Actions/Interpreter'
import { Term } from 'FunBlocks/AST/Terms'

/// An enumeration of the modes of the interpreter.
export enum InterpreterMode {
  Editing = 0,
  Debugging = 1,
  Running = 2,
}

export type EditingContext = { }

export type DebuggingContext = {
  history: Array<Term>,
  historyIndex: number,
  selectedRuleID: string,
}

export type RunningContext = { }

export type InterpreterContext = EditingContext | DebuggingContext | RunningContext

export type InterpreterState = {
  mode: InterpreterMode,
  context: InterpreterContext
}

const init: InterpreterState = {
  mode: InterpreterMode.Debugging,
  context: {
    history: [] as Array<Term>,
    historyIndex: -1,
    selectedRuleID: null as string,
  },
}

const interpreter = (state: InterpreterState = init, action: AnyAction): InterpreterState => {
  switch (action.type) {
  case PUSH_STATE:
    if (state.mode == InterpreterMode.Debugging) {
      // Keep the history up to the current index and append the new state.
      const { history, historyIndex, ...rest } = state.context as DebuggingContext
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
    if (state.mode == InterpreterMode.Debugging) {
      const context = state.context as DebuggingContext
      return {
        ...state,
        context: { ...context, selectedRuleID: action.payload },
      }
    }

  case SET_HISTORY_INDEX:
  if (state.mode == InterpreterMode.Debugging) {
    const context = state.context as DebuggingContext
    return {
      ...state,
      context: { ...context, historyIndex: action.payload },
    }
  }

  default:
    return state
  }

  throw new Error(`unexpected action '${action.type} in state '${state.mode}'`)
}

export default interpreter
