import translate from './translate'

export default function createValidationMessage({ key }) {
    return {
        message: (args) =>
            translate('validations', key, {
                field: args.property,
                min: args.constraints && args.constraints[0],
                max: args.constraints && args.constraints[0],
            }),
    }
}
