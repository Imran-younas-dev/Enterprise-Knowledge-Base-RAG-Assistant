import { SetMetadata } from '@nestjs/common'

export const CHECK_SCOPE_KEY = 'checkScope'

export const CheckScope = (scopes) => SetMetadata(CHECK_SCOPE_KEY, scopes)
