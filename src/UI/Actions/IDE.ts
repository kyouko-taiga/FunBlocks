import * as AST from 'FunBlocks/AST'
import { IDEWorkspace, InputMode } from 'FunBlocks/UI/Reducers'

export const ACTION_TYPES = {
  CHANGE_ACTIVE_WORKSPACE: 'IDE.changeActiveWorkspace',
  CHANGE_INPUT_MODE: 'IDE.changeInputMode',
  UPDATE_PROGRAM: 'IDE.updateProgram',
  UPDATE_PROGRAM_SOURCE: 'IDE.updateProgramSource',
  REBUILD_AST: 'IDE.rebuildAST',
  INSERT_RULE_CASE: 'IDE.insertRuleCase',
  UPDATE_RULE_CASE: 'IDE.updateRuleCase',
  REMOVE_RULE_CASE: 'IDE.removeRuleCase',
  UPDATE_INITIAL_STATE: 'IDE.updateInitialState',

  PUSH_STATE: 'IDE.debugMode.pushState',
  SELECT_RULE: 'IDE.debugMode.selectRuleCase',
  SET_HISTORY_INDEX: 'IDE.debugMode.setHistoryIndex',
}

// ----- General actions --------------------------------------------------------------------------

export const changeActiveWorkspace = (workspace: IDEWorkspace): PayloadAction<IDEWorkspace> => ({
  type: ACTION_TYPES.CHANGE_ACTIVE_WORKSPACE,
  payload: workspace,
})

export const changeInputMode = (mode: InputMode): PayloadAction<InputMode> => ({
  type: ACTION_TYPES.CHANGE_INPUT_MODE,
  payload: mode,
})

export const updateProgram = (program: Program): PayloadAction<Program> => ({
  type: ACTION_TYPES.UPDATE_PROGRAM,
  payload: program,
})

export const updateProgramSource = (source: string): PayloadAction<string> => ({
  type: ACTION_TYPES.UPDATE_PROGRAM_SOURCE,
  payload: source,
})

export const rebuildAST = (): Action => ({
  type: ACTION_TYPES.REBUILD_AST,
})

export const insertRuleCase = (rule: AST.RuleCaseDecl): PayloadAction<AST.RuleCaseDecl> => ({
  type: ACTION_TYPES.INSERT_RULE_CASE,
  payload: rule,
})

export const updateRuleCase = (
  ruleCaseID: string,
  patch: { left?: Term, right?: Term
}): PayloadAction<{ ruleCaseID: string, patch: { left?: Term, right?: Term } }> => ({
  type: ACTION_TYPES.UPDATE_RULE_CASE,
  payload: { ruleCaseID, patch },
})

export const removeRuleCase = (ruleCaseID: string): PayloadAction<string> => ({
  type: ACTION_TYPES.REMOVE_RULE_CASE,
  payload: ruleCaseID,
})

export const updateInitialState = (state: Term): PayloadAction<Term> => ({
  type: ACTION_TYPES.UPDATE_INITIAL_STATE,
  payload: state,
})

// ----- Actions specific to the debug worspace ---------------------------------------------------

export const selectRuleCase = (ruleCaseID: string): PayloadAction<string> => ({
  type: ACTION_TYPES.SELECT_RULE,
  payload: ruleCaseID,
})

export const setHistoryIndex = (index: number): PayloadAction<number> => ({
  type: ACTION_TYPES.SET_HISTORY_INDEX,
  payload: index,
})

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: ACTION_TYPES.PUSH_STATE,
  payload: state,
})
