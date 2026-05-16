import { logger } from "./logger"

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly entity: string,
    public readonly operation: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = "ServiceError"
  }
}

export class NotFoundError extends ServiceError {
  constructor(entity: string, id: string) {
    super(entity + " nao encontrado(a): " + id, entity, "findById")
    this.name = "NotFoundError"
  }
}

export class ValidationError extends ServiceError {
  constructor(entity: string, detail: string) {
    super("Erro de validacao em " + entity + ": " + detail, entity, "validate")
    this.name = "ValidationError"
  }
}

export function handleError(
  entity: string,
  operation: string,
  error: unknown,
): never {
  if (error instanceof ServiceError) throw error

  const msg = error instanceof Error ? error.message : String(error)
  logger.error("Service failed", { entity, operation, error: msg })
  throw new ServiceError("Erro ao " + operation + " " + entity, entity, operation, error)
}
