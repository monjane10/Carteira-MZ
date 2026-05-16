const logoMap: Record<string, string> = {
  BCI: "/BCI.png",
  BIM: "/BIM.png",
  "M-Pesa": "/mpesa.png",
  "e-Mola": "/emola.png",
  "Millennium BIM": "/BIM.png",
  ABSA: "/absa.png",
  "Standard Bank": "/standard-Bank.png",
  "mKesh": "/mkesh.png",
}

export function getAccountLogo(name: string): string | null {
  return logoMap[name] ?? null
}
