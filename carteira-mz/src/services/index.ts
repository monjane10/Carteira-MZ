import * as _accounts from "./supabase/accounts"
import * as _categories from "./supabase/categories"
import * as _transactions from "./supabase/transactions"
import * as _transfers from "./supabase/transfers"
import * as _loans from "./supabase/loans"
import * as _goals from "./supabase/goals"
import * as _budgets from "./supabase/budgets"
import * as _notifications from "./supabase/notifications"
import * as _dashboard from "./supabase/dashboard"
import * as _admin from "./supabase/admin"

export const accounts = _accounts
export const categories = _categories
export const transactions = _transactions
export const transfers = _transfers
export const loans = _loans
export const goals = _goals
export const budgets = _budgets
export const notifications = _notifications
export const dashboard = _dashboard
export const admin = _admin

export { supabase } from "./supabase/client"
export { logger } from "./supabase/logger"
export type { AdminStats, AdminUser } from "./supabase/admin"
