export const ACTION_TYPES = {
  CLEAR_BLOCKDATA       : 'BlockData.clear',
  UPDATE_BLOCKDATA      : 'BlockData.update',
}

export const clearBlockData = (key: string): PayloadAction<string> => ({
  type: ACTION_TYPES.CLEAR_BLOCKDATA,
  payload: key,
})

export const updateBlockData = (
  key: string,
  data: Dictionary
): PayloadAction<{ key: string, data: Dictionary }> => ({
  type: ACTION_TYPES.UPDATE_BLOCKDATA,
  payload: { key, data },
})
