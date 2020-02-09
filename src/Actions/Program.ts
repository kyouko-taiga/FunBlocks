import { PayloadAction } from 'FunBlocks/Actions/Types'
import { Rule } from 'FunBlocks/AST/Terms'

export const INSERT_RULE = 'Program.insertRule'

export const insertRule = (rule: Rule): PayloadAction<Rule> => ({
  type: INSERT_RULE,
  payload: rule,
})
