import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import stringHelpers from '@adonisjs/core/helpers/string'
import User from '#models/user'
import Workspace from '#models/workspace'
import { registerValidator, loginValidator } from '#validators/auth'

export default class AuthController {
  /**
   * Helper to create a URL-friendly unique slug
   */
  private generateSlug(name: string): string {
    const baseSlug = stringHelpers.slug(name, { lower: true })
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    return `${baseSlug}-${randomSuffix}`
  }

  /**
   * Register a new user with an atomic default workspace
   */
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const result = await db.transaction(async (trx) => {
      // 1. Create User
      const user = new User()
      user.fullName = payload.fullName
      user.email = payload.email
      user.password = payload.password
      user.useTransaction(trx)
      await user.save()

      // 2. Prepare Workspace Name & Unique Slug
      const rawWorkspaceName = payload.workspaceName || `${payload.fullName}'s Workspace`
      const slug = this.generateSlug(rawWorkspaceName)

      // 3. Create Workspace
      const workspace = new Workspace()
      workspace.name = rawWorkspaceName
      workspace.slug = slug
      workspace.ownerId = user.id
      workspace.useTransaction(trx)
      await workspace.save()

      // 4. Attach User to Workspace as OWNER in pivot table
      await workspace.related('members').attach({
        [user.id]: { role: 'OWNER' },
      }, trx)

      // 5. Create Access Token for immediate authentication
      const token = await User.accessTokens.create(user)

      return { user, workspace, token }
    })

    return response.created({
      message: 'User registered successfully',
      data: {
        user: result.user,
        workspace: result.workspace,
        token: result.token.value!.release(),
      },
    })
  }

  /**
   * Login user & generate access token
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    // Verify credentials
    const user = await User.verifyCredentials(email, password)

    // Fetch user's workspaces
    await user.load('workspaces')

    // Create Access Token
    const token = await User.accessTokens.create(user)

    return response.ok({
      message: 'Login successful',
      data: {
        user,
        token: token.value!.release(),
      },
    })
  }
}
