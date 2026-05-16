type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG"

const PREFIX: Record<LogLevel, string> = {
  INFO: "[INFO]",
  WARN: "[WARN]",
  ERROR: "[ERROR]",
  DEBUG: "[DEBUG]",
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const ts = new Date().toISOString()
  const prefix = PREFIX[level]
  const metaStr = meta ? " " + JSON.stringify(meta) : ""
  const line = prefix + " " + ts + " -- " + message + metaStr

  switch (level) {
    case "ERROR": console.error(line); break
    case "WARN":  console.warn(line);  break
    case "DEBUG": console.debug(line); break
    default:      console.log(line)
  }
}

export const logger = {
  info:    (msg: string, m?: Record<string, unknown>) => log("INFO", msg, m),
  warn:    (msg: string, m?: Record<string, unknown>) => log("WARN", msg, m),
  error:   (msg: string, m?: Record<string, unknown>) => log("ERROR", msg, m),
  debug:   (msg: string, m?: Record<string, unknown>) => log("DEBUG", msg, m),
}
