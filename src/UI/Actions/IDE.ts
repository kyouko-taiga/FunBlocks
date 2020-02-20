import * as AST from 'FunBlocks/AST'
import { IDEWorkspace } from 'FunBlocks/UI/Reducers'

export const ACTION_TYPES = {
  SET_ACTIVE_WORKSPACE  : 'IDE.setActiveWorkspace',
  UPDATE_PROGRAM        : 'IDE.updateProgram',

  INSERT_RULE_CASE      : 'IDE.insertRuleCase',
  UPDATE_RULE_CASE      : 'IDE.updateRuleCase',
  REMOVE_RULE_CASE      : 'IDE.removeRuleCase',
  UPDATE_INITIAL_STATE  : 'IDE.updateInitialState',

  PUSH_STATE            : 'IDE.debugMode.pushState',
  SELECT_RULE           : 'IDE.debugMode.selectRule',
  SET_HISTORY_INDEX     : 'IDE.debugMode.setHistoryIndex',
}

// ----- General actions --------------------------------------------------------------------------

export const setActiveWorkspace = (mode: IDEWorkspace): PayloadAction<IDEWorkspace> => ({
  type: ACTION_TYPES.SET_ACTIVE_WORKSPACE,
  payload: mode,
})

export const updateProgram = (program: Program): PayloadAction<Program> => ({
  type: ACTION_TYPES.UPDATE_PROGRAM,
  payload: program,
})

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

// ----- Actions specific to the debug worspace ---------------------------------------------------

export const selectRule = (ruleID: string): PayloadAction<string> => ({
  type: ACTION_TYPES.SELECT_RULE,
  payload: ruleID,
})

export const setHistoryIndex = (index: number): PayloadAction<number> => ({
  type: ACTION_TYPES.SET_HISTORY_INDEX,
  payload: index,
})

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: ACTION_TYPES.PUSH_STATE,
  payload: state,
})
