import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'
import * as AST from 'FunBlocks/AST'
import * as funview from 'FunBlocks/FUNVIEW'

export type DebugContext = {
  history: Array<Term>,
  historyIndex: number,
  selectedRuleID: string,
}

export const debugContext = (state: DebugContext, action: AnyAction): DebugContext => {
  switch (action.type) {
  case ACTION_TYPES.PUSH_STATE: {
    // Keep the history up to the current index and append the new state.
    const { history, historyIndex, ...rest } = state
    let canvas = new funview.DrawingCanvas
    canvas.clearCanvas()
    let drawing = new funview.DrawnState
    drawing.explore(action.payload as AST.Expr)

    return {
      ...rest,
      history: history.slice(0, historyIndex + 1).concat([ action.payload ]),
      historyIndex: historyIndex + 1,
    }
  }

  case ACTION_TYPES.SELECT_RULE:
    return { ...state, selectedRuleID: action.payload }

  case ACTION_TYPES.SET_HISTORY_INDEX: {
    let canvas = new funview.DrawingCanvas
    canvas.clearCanvas()
    let drawing = new funview.DrawnState
    drawing.explore(state.history[action.payload] as AST.Expr)
    return { ...state, historyIndex: action.payload }
  }

  default:
    return state
  }
}
