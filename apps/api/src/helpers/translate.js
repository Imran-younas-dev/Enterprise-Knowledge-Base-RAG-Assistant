import errors from '../lang/en/errors'
import messages from '../lang/en/messages'
import validations from '../lang/en/validations'

const tables = { errors, messages, validations }

export default function translate(type, key, replacements = {}) {
    const table = tables[type] || {}
    const template = table[key] || key

    return Object.keys(replacements).reduce((text, name) => {
        return text.replace(`{${name}}`, String(replacements[name]))
    }, template)
}
