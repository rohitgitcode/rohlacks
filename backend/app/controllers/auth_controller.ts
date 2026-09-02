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

    // 1. Atomically create User, Workspace, and Pivot entry
    const { user, workspace } = await db.transaction(async (trx) => {
      const newUser = new User()
      newUser.fullName = payload.fullName
      newUser.email = payload.email
      newUser.password = payload.password
      newUser.useTransaction(trx)
      await newUser.save()

      const rawWorkspaceName = payload.workspaceName || `${payload.fullName}'s Workspace`
      const slug = this.generateSlug(rawWorkspaceName)

      const newWorkspace = new Workspace()
      newWorkspace.name = rawWorkspaceName
      newWorkspace.slug = slug
      newWorkspace.ownerId = newUser.id
      newWorkspace.useTransaction(trx)
      await newWorkspace.save()

      await newWorkspace.related('members').attach(
        {
          [newUser.id]: { role: 'OWNER' },
        },
        trx
      )

      return { user: newUser, workspace: newWorkspace }
    })

    // 2. Create Access Token after successful transaction
    const token = await User.accessTokens.create(user)

    return response.created({
      message: 'User registered successfully',
      data: {
        user,
        workspace,
        token: token.value!.release(),
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

  /**
   * Get current authenticated user details with workspaces
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('workspaces')

    return response.ok({
      message: 'Profile fetched successfully',
      data: { user },
    })
  }
}
