export default class AppValidationError extends Error {
    constructor(message, code = 422) {
        super(message)
        this.name = 'AppValidationError'
        this.code = code
    }
}
