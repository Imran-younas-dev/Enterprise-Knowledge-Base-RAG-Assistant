import { Injectable } from '@nestjs/common'

/* import models */
import { sequelize } from '../../models'

/* import helpers */
import pingRedis from '../../helpers/ping-redis'
import translate from '../../helpers/translate'

@Injectable()
export class CheckService {
    async check() {
        const [database, redis] = await Promise.all([
            checkDatabase(),
            checkRedis(),
        ])

        const checks = {
            api: {
                status: 'ok',
                message: translate('messages', 'healthApiOk'),
            },
            database,
            redis,
        }

        const healthy = Object.values(checks).every(
            (item) => item.status === 'ok'
        )

        return {
            status: healthy ? 'ok' : 'degraded',
            checks,
        }
    }
}

async function checkDatabase() {
    try {
        await sequelize.authenticate()
        return {
            status: 'ok',
            message: translate('messages', 'healthDatabaseOk'),
        }
    } catch (_error) {
        return {
            status: 'down',
            message: translate('messages', 'healthDatabaseDown'),
        }
    }
}

async function checkRedis() {
    try {
        const ok = await pingRedis()
        if (!ok) {
            return {
                status: 'down',
                message: translate('messages', 'healthRedisDown'),
            }
        }
        return {
            status: 'ok',
            message: translate('messages', 'healthRedisOk'),
        }
    } catch (_error) {
        return {
            status: 'down',
            message: translate('messages', 'healthRedisDown'),
        }
    }
}
