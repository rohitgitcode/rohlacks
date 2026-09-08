import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, manyToMany, beforeSave } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { errors } from '@adonisjs/auth'
import Workspace from '#models/workspace'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // User's many-to-many relationship with workspaces
  @manyToMany(() => Workspace, {
    pivotTable: 'workspace_members',
    pivotColumns: ['role'],
    pivotTimestamps: true,
  })
  declare workspaces: ManyToMany<typeof Workspace>

  // Access tokens provider for AdonisJS v6 auth
  static accessTokens = DbAccessTokensProvider.forModel(User)

  /**
   * Automatically hash password before saving to the database
   */
  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  /**
   * Verify user credentials for email/password authentication
   */
  static async verifyCredentials(email: string, password: string) {
    const user = await this.findBy('email', email)
    if (!user) {
      throw new errors.E_INVALID_CREDENTIALS('Invalid email or password')
    }

    let verified = false
    try {
      verified = await hash.verify(user.password, password)
    } catch {
      // In case an earlier entry had a plain text password, verify and upgrade to hash
      if (user.password === password) {
        user.password = await hash.make(password)
        await user.save()
        verified = true
      }
    }

    if (!verified) {
      throw new errors.E_INVALID_CREDENTIALS('Invalid email or password')
    }

    return user
  }
}
