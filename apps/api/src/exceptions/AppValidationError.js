export default class AppValidationError extends Error {
    constructor(message, code = 422, errors = undefined) {
        super(message)
        this.name = 'AppValidationError'
        this.code = code
        this.errors = errors
    }
}
