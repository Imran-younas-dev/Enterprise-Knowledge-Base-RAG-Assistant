import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

/* import config */
import limits from '../../../config/limits'

/* import helpers */
import createValidationMessage from '../../../helpers/create-validation-message'

export class AskDto {
    @MaxLength(
        limits.maxQuestionLength,
        createValidationMessage({ key: 'maxLength' })
    )
    @IsString(createValidationMessage({ key: 'string' }))
    @IsNotEmpty(createValidationMessage({ key: 'required' }))
    question

    @IsOptional()
    @IsIn(['web', 'deep', 'thinking'], createValidationMessage({ key: 'mode' }))
    mode
}
