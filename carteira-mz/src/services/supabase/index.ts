import { supabase } from "@/lib/supabase"
import type { Account, Category, Transaction, Transfer, Loan, Goal, Budget } from "@/types"

// ============================================================
// AUTH
// ============================================================

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ============================================================
// ACCOUNTS
// ============================================================

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*, financial_institutions(*)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*, financial_institutions(*)")
    .eq("id", id)
    .single()
  if (error) return null
  return data
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const { data: result, error } = await supabase
    .from("accounts")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  const { data: result, error } = await supabase
    .from("accounts")
    .update(data)
    .eq("id", id)
    .select()
    .single()
  if (error) return null
  return result
}

export async function deleteAccount(id: string): Promise<boolean> {
  const { error } = await supabase.from("accounts").delete().eq("id", id)
  return !error
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const user = (await supabase.auth.getUser()).data.user
  const query = supabase
    .from("categories")
    .select("*")
    .order("name")

  if (user) {
    query.or(`user_id.eq.${user.id},user_id.is.null`)
  } else {
    query.is("user_id", null)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const { data: result, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, account:accounts(*), category:categories(*)")
    .order("transaction_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createTransaction(data: Partial<Transaction>): Promise<Transaction> {
  const { data: result, error } = await supabase
    .from("transactions")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// TRANSFERS
// ============================================================

export async function getTransfers(): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*, from_account:accounts!from_account_id(*), to_account:accounts!to_account_id(*)")
    .order("transfer_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createTransfer(data: Partial<Transfer>): Promise<Transfer> {
  const { data: result, error } = await supabase
    .from("transfers")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// LOANS
// ============================================================

export async function getLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*, account:accounts(*)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createLoan(data: Partial<Loan>): Promise<Loan> {
  const { data: result, error } = await supabase
    .from("loans")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// GOALS
// ============================================================

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*, account:accounts(*)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createGoal(data: Partial<Goal>): Promise<Goal> {
  const { data: result, error } = await supabase
    .from("goals")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// BUDGETS
// ============================================================

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createBudget(data: Partial<Budget>): Promise<Budget> {
  const { data: result, error } = await supabase
    .from("budgets")
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}
