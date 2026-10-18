import { SetMetadata } from '@nestjs/common'

export const VALIDATE_REQUEST_KEY = 'validateRequest'

export const ValidateRequest = (...dtos) =>
    SetMetadata(VALIDATE_REQUEST_KEY, dtos)
