import { Dependencies, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { getMetadataStorage, validate } from 'class-validator'

/* import decorators */
import { VALIDATE_REQUEST_KEY } from '../decorators/validate-request.decorators'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

const UNVALIDATED_KEYS = new Set([
    'page',
    'limit',
    'order',
    'orderBy',
    'attributes',
])

@Injectable()
@Dependencies(Reflector)
export class ValidateRequestGuard {
    constructor(reflector) {
        this.reflector = reflector
    }

    async canActivate(context) {
        const dtos =
            this.reflector.get(VALIDATE_REQUEST_KEY, context.getHandler()) || []

        if (!dtos.length) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const sources = {
            body: asRecord(request.body),
            params: asRecord(request.params),
            query: asRecord(request.query),
        }
        const errors = []

        for (const Dto of dtos) {
            const dto = assignDto(new Dto(), propertyNames(Dto), sources)
            errors.push(...(await validate(dto)))
            if (!errors.length) {
                writeBack(request, sources, dto, propertyNames(Dto))
            }
        }

        if (errors.length) {
            const formatted = formatErrors(errors)
            const message = formatted.length
                ? formatted[0].messages[0]
                : 'Validation failed'
            throw new AppValidationError(message, 422, formatted)
        }

        return true
    }
}

function asRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {}
    }
    return value
}

function propertyNames(Dto) {
    const metadatas = getMetadataStorage().getTargetValidationMetadatas(
        Dto,
        '',
        true,
        false
    )

    return [
        ...new Set(
            metadatas
                .map((item) => item.propertyName)
                .filter((name) => name && !UNVALIDATED_KEYS.has(name))
        ),
    ]
}

function assignDto(dto, names, sources) {
    for (const name of names) {
        const source = sourceFor(sources, name)
        if (source) {
            dto[name] = normalizeValue(name, source[name])
        }
    }
    return dto
}

function normalizeValue(name, value) {
    if (name === 'email' && typeof value === 'string') {
        return value.trim()
    }
    return value
}

function writeBack(request, sources, dto, names) {
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(sources.body, name)) {
            request.body[name] = dto[name]
        } else if (Object.prototype.hasOwnProperty.call(sources.params, name)) {
            request.params[name] = dto[name]
        } else if (Object.prototype.hasOwnProperty.call(sources.query, name)) {
            request.query[name] = dto[name]
        }
    }
}

function sourceFor(sources, name) {
    if (Object.prototype.hasOwnProperty.call(sources.body, name)) {
        return sources.body
    }
    if (Object.prototype.hasOwnProperty.call(sources.params, name)) {
        return sources.params
    }
    if (Object.prototype.hasOwnProperty.call(sources.query, name)) {
        return sources.query
    }
    return null
}

function formatErrors(errors, parent = '') {
    return errors.flatMap((error) => {
        const field = parent ? `${parent}.${error.property}` : error.property
        const messages = error.constraints
            ? Object.values(error.constraints)
            : []
        const own = messages.length ? [{ field, messages }] : []
        const children = error.children?.length
            ? formatErrors(error.children, field)
            : []
        return [...own, ...children]
    })
}
