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
import Document from './Document'

@Table({
    tableName: 'document_chunks',
    timestamps: true,
    underscored: true,
})
export default class DocumentChunk extends AbstractModel {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id

    @ForeignKey(() => Document)
    @AllowNull(false)
    @Column(DataType.UUID)
    documentId

    @BelongsTo(() => Document)
    document

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    chunkIndex

    @AllowNull(false)
    @Column(DataType.TEXT)
    content

    @AllowNull(true)
    @Column(DataType.INTEGER.UNSIGNED)
    pageNumber

    @AllowNull(true)
    @Column(DataType.STRING)
    sectionTitle

    @AllowNull(false)
    @Column(DataType.JSON)
    metadata
}
