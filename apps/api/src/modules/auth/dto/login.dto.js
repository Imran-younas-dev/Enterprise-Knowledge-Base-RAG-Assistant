import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/* import helpers */
import createValidationMessage from '../../../helpers/create-validation-message'

export class LoginDto {
    @MaxLength(254, createValidationMessage({ key: 'maxLength' }))
    @IsEmail({ require_tld: false }, createValidationMessage({ key: 'email' }))
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    email

    @MaxLength(72, createValidationMessage({ key: 'maxLength' }))
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    password
}
