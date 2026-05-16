"use client"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore()
  const [currency, setCurrency] = useState("MZN")
  const [name, setName] = useState("")

  const handleSave = () => {
    toast({ title: "Configurações salvas", variant: "success" })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize a sua experiência" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
          <div className="space-y-2">
            <Label>Moeda</Label>
            <Input value={currency} onChange={e => setCurrency(e.target.value)} className="max-w-[200px]" />
          </div>
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="max-w-[400px]" />
          </div>
          <Button onClick={handleSave} className="bg-[#0F172A] hover:bg-[#1E293B] text-white">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
