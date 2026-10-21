import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

/* import helpers */
import createValidationMessage from '../../../helpers/create-validation-message'

export class SearchDto {
    @MaxLength(2000, createValidationMessage({ key: 'maxLength' }))
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    question

    @IsOptional()
    @IsIn(['web', 'deep', 'thinking'], createValidationMessage({ key: 'mode' }))
    mode
}
