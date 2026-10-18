import {
    AllowNull,
    Column,
    DataType,
    Default,
    PrimaryKey,
    Table,
    Unique,
} from 'sequelize-typescript'

import AbstractModel from './AbstractModel'

@Table({
    tableName: 'users',
    timestamps: true,
    underscored: true,
    defaultScope: {
        attributes: { exclude: ['passwordHash'] },
    },
})
export default class User extends AbstractModel {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    email

    @AllowNull(false)
    @Column(DataType.STRING)
    passwordHash
}
