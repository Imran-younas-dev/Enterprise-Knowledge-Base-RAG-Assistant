import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator'

/* import helpers */
import createValidationMessage from '../../../helpers/create-validation-message'

export class RegisterDto {
    @MaxLength(254, createValidationMessage({ key: 'maxLength' }))
    @IsEmail({}, createValidationMessage({ key: 'email' }))
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    email

    @MaxLength(72, createValidationMessage({ key: 'maxLength' }))
    @MinLength(8, createValidationMessage({ key: 'minLength' }))
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    password
}
