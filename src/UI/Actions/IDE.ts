import * as AST from 'FunBlocks/AST'
import { IDEMode } from 'FunBlocks/UI/Reducers'

export const ACTION_TYPES = {
  SET_MODE              : 'IDE.setMode',
  UPDATE_PROGRAM        : 'IDE.updateProgram',

  INSERT_RULE_CASE      : 'IDE.editMode.insertRuleCase',
  UPDATE_RULE_CASE      : 'IDE.editMode.updateRuleCase',
  REMOVE_RULE_CASE      : 'IDE.editMode.removeRuleCase',
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

export const updateProgram = (program: Program): PayloadAction<Program> => ({
  type: ACTION_TYPES.UPDATE_PROGRAM,
  payload: program,
})

// ----- Edit mode actions -----------------------------------------------------------------------

export const insertRuleCase = (rule: AST.RuleCaseDecl): PayloadAction<AST.RuleCaseDecl> => ({
  type: ACTION_TYPES.INSERT_RULE_CASE,
  payload: rule,
})

export const updateRuleCase = (
  ruleID: string,
  patch: { left?: Term, right?: Term
}): PayloadAction<{ ruleID: string, patch: { left?: Term, right?: Term } }> => ({
  type: ACTION_TYPES.UPDATE_RULE_CASE,
  payload: { ruleID, patch },
})

export const removeRuleCase = (ruleID: string): PayloadAction<string> => ({
  type: ACTION_TYPES.REMOVE_RULE_CASE,
  payload: ruleID,
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
