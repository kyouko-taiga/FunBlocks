import { Action as ReduxAction } from 'redux'

export type Action<Meta=void> = ReduxAction<string> & { meta?: Meta }

export type PayloadAction<Payload, Meta=void> = Action<Meta> & { readonly payload: Payload }
