/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    auth: {
      register: typeof routes['auth.auth.register']
      login: typeof routes['auth.auth.login']
      me: typeof routes['auth.auth.me']
    }
    accessTokens: {
      destroy: typeof routes['auth.access_tokens.destroy']
    }
  }
  account: {
    profile: {
      show: typeof routes['account.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['account.access_tokens.destroy']
    }
  }
}
