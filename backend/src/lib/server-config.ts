const DEFAULT_SERVER_PORT = 3000

export const resolvePort = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_SERVER_PORT
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
    return DEFAULT_SERVER_PORT
  }

  return parsed
}

export { DEFAULT_SERVER_PORT }
