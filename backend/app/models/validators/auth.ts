import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(100),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail() //lowercase 
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(64),
    workspaceName: vine.string().trim().minLength(2).maxLength(100).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string(),
  })
)



