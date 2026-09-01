import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Workspace from '#models/workspace'

export default class WorkspaceMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workspaceId: number

  @column()
  declare userId: number

  @column()
  declare role: 'OWNER' | 'ADMIN' | 'MEMBER'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
