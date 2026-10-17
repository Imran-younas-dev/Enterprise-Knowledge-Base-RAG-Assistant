import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    Default,
    ForeignKey,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'

import AbstractModel from './AbstractModel'
import User from './User'

@Table({
    tableName: 'documents',
    timestamps: true,
    underscored: true,
})
export default class Document extends AbstractModel {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    ownerId

    @BelongsTo(() => User)
    owner

    @AllowNull(false)
    @Column(DataType.STRING)
    title

    @AllowNull(false)
    @Column(DataType.STRING)
    originalFilename

    @AllowNull(false)
    @Column(DataType.STRING)
    mimeType

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    fileSizeBytes

    @AllowNull(false)
    @Column(DataType.STRING)
    storageKey

    @AllowNull(false)
    @Column(DataType.STRING(64))
    contentHash

    @AllowNull(false)
    @Default('queued')
    @Column(
        DataType.ENUM(
            'queued',
            'processing',
            'ready',
            'failed',
            'deleting',
            'deleted'
        )
    )
    status

    @AllowNull(true)
    @Column(DataType.STRING)
    errorSummary
}
