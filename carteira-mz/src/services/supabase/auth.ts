import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"

const ENTITY = "auth"

export async function signUp(email: string, password: string, fullName: string) {
  try {
    logger.info("Signing up", { email })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  } catch (e) {
    return handleError(ENTITY, "registar", e)
  }
}

export async function signIn(email: string, password: string) {
  try {
    logger.info("Signing in", { email })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  } catch (e) {
    return handleError(ENTITY, "autenticar", e)
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    logger.info("Signed out")
  } catch (e) {
    return handleError(ENTITY, "sair", e)
  }
}

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (e) {
    return handleError(ENTITY, "obter sessao", e)
  }
}
