import { Rule } from 'FunBlocks/AST/Terms'
import { IDEMode } from 'FunBlocks/Reducers'

export const ACTION_TYPES = {
  SET_MODE              : 'IDE.setMode',

  INSERT_RULE           : 'IDE.editMode.insertRule',
  UPDATE_RULE           : 'IDE.editMode.updateRule',
  UPDATE_INITIAL_STATE  : 'IDE.editMode.updateInitialState',

  PUSH_STATE            : 'IDE.debugMode.pushState',
  SELECT_RULE           : 'IDE.debugMode.selectRule',
  SET_HISTORY_INDEX     : 'IDE.debugMode.setHistoryIndex',
}

// ----- General actions --------------------------------------------------------------------------

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: ACTION_TYPES.PUSH_STATE,
  payload: state,
})

// ----- Edit mode actions -----------------------------------------------------------------------

export const insertRule = (rule: Rule): PayloadAction<Rule> => ({
  type: ACTION_TYPES.INSERT_RULE,
  payload: rule,
})

export const updateRule = (ruleID: string, patch: { left?: Term, right?: Term }) => ({
  type: ACTION_TYPES.UPDATE_RULE,
  payload: { ruleID, patch },
})

export const updateInitialState = (state: Term): PayloadAction<Term> => ({
  type: ACTION_TYPES.UPDATE_INITIAL_STATE,
  payload: state,
})

// ----- Debug mode actions -----------------------------------------------------------------------

export const selectRule = (ruleID: string): PayloadAction<string> => ({
  type: ACTION_TYPES.SELECT_RULE,
  payload: ruleID,
})

export const setHistoryIndex = (index: number): PayloadAction<number> => ({
  type: ACTION_TYPES.SET_HISTORY_INDEX,
  payload: index,
})

export const setMode = (mode: IDEMode): PayloadAction<IDEMode> => ({
  type: ACTION_TYPES.SET_MODE,
  payload: mode,
})
