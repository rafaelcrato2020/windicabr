"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function SyncUsersPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    message: string
    details?: string[]
    error?: string
  } | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const handleSyncUsers = async () => {
    setLoading(true)
    setResults(null)
    const details: string[] = []

    try {
      // 1. Verificar se a tabela profiles existe
      const { error: checkError } = await supabase.from("profiles").select("count").limit(1)

      if (checkError && checkError.message.includes("does not exist")) {
        details.push("A tabela 'profiles' não existe. Criando tabela...")

        // 2. Criar a tabela profiles se não existir
        try {
          const { error: createError } = await supabase.rpc("exec_sql", {
            sql_query: `
             CREATE TABLE IF NOT EXISTS public.profiles (
               id UUID PRIMARY KEY REFERENCES auth.users(id),
               name TEXT,
               email TEXT,
               avatar_url TEXT,
               created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
               updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
               balance DECIMAL(15, 2) DEFAULT 0,
               investments DECIMAL(15, 2) DEFAULT 0,
               referral_code TEXT,
               referred_by TEXT,
               is_active BOOLEAN DEFAULT true
             )
           `,
          })

          if (createError) {
            throw new Error(`Erro ao criar tabela profiles: ${createError.message}`)
          }

          details.push("Tabela 'profiles' criada com sucesso.")
        } catch (createErr: any) {
          details.push(`Falha ao criar tabela: ${createErr.message}`)
          throw createErr
        }
      } else {
        details.push("Tabela 'profiles' já existe.")
      }

      // 3. Buscar todos os usuários da autenticação
      details.push("Buscando usuários da autenticação...")

      // Primeiro, tentar usar a API admin (requer permissões)
      let authUsers: any[] = []
      try {
        const { data: adminUsers, error: adminError } = await supabase.auth.admin.listUsers()

        if (!adminError && adminUsers && adminUsers.users) {
          authUsers = adminUsers.users
          details.push(`Encontrados ${authUsers.length} usuários via API admin.`)
        } else {
          details.push("Não foi possível acessar a API admin. Tentando método alternativo...")

          // Método alternativo: buscar usuários via função RPC personalizada
          // Nota: Isso requer uma função RPC configurada no Supabase
          try {
            const { data: rpcUsers, error: rpcError } = await supabase.rpc("get_all_users")

            if (!rpcError && rpcUsers) {
              authUsers = rpcUsers
              details.push(`Encontrados ${authUsers.length} usuários via RPC.`)
            } else {
              details.push("Não foi possível buscar usuários via RPC.")

              // Último recurso: buscar usuários da tabela auth.users diretamente
              // Isso requer permissões elevadas
              const { data: directUsers, error: directError } = await supabase.from("auth.users").select("*")

              if (!directError && directUsers) {
                authUsers = directUsers
                details.push(`Encontrados ${authUsers.length} usuários via acesso direto.`)
              } else {
                details.push("Não foi possível acessar usuários diretamente.")
                throw new Error("Não foi possível acessar a lista de usuários por nenhum método.")
              }
            }
          } catch (rpcErr: any) {
            details.push(`Erro ao buscar usuários via RPC: ${rpcErr.message}`)
          }
        }
      } catch (adminErr: any) {
        details.push(`Erro ao buscar usuários via API admin: ${adminErr.message}`)
      }

      // Se não conseguimos obter usuários por nenhum método, criar um formulário manual
      if (authUsers.length === 0) {
        details.push("Não foi possível obter a lista de usuários automaticamente.")
        details.push("Por favor, use o formulário abaixo para adicionar usuários manualmente.")

        setResults({
          success: false,
          message: "Não foi possível sincronizar usuários automaticamente.",
          details,
          error: "Acesso à lista de usuários negado.",
        })
        setLoading(false)
        return
      }

      // 4. Buscar perfis existentes
      const { data: existingProfiles, error: profilesError } = await supabase.from("profiles").select("id")

      if (profilesError) {
        throw new Error(`Erro ao buscar perfis existentes: ${profilesError.message}`)
      }

      const existingProfileIds = new Set((existingProfiles || []).map((p) => p.id))
      details.push(`Encontrados ${existingProfileIds.size} perfis existentes.`)

      // 5. Sincronizar usuários que não têm perfil
      let syncCount = 0
      let errorCount = 0

      for (const user of authUsers) {
        if (!existingProfileIds.has(user.id)) {
          // Criar perfil para este usuário
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
            created_at: user.created_at || new Date().toISOString(),
            is_active: true,
          })

          if (insertError) {
            details.push(`Erro ao criar perfil para ${user.email}: ${insertError.message}`)
            errorCount++
          } else {
            syncCount++
          }
        }
      }

      details.push(`Sincronizados ${syncCount} novos perfis. Erros: ${errorCount}`)

      // 6. Criar trigger para sincronização automática futura
      try {
        const { error: triggerError } = await supabase.rpc("exec_sql", {
          sql_query: `
           -- Função para criar perfil automaticamente
           CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
           RETURNS TRIGGER AS $$
           BEGIN
             INSERT INTO public.profiles (id, email, name, created_at)
             VALUES (
               NEW.id,
               NEW.email,
               COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Usuário'),
               NEW.created_at
             );
             RETURN NEW;
           END;
           $$ LANGUAGE plpgsql SECURITY DEFINER;

           -- Remover o trigger se já existir
           DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

           -- Criar o trigger
           CREATE TRIGGER create_profile_trigger
           AFTER INSERT ON auth.users
           FOR EACH ROW
           EXECUTE FUNCTION public.create_profile_for_new_user();
         `,
        })

        if (triggerError) {
          details.push(`Aviso: Não foi possível criar o trigger automático: ${triggerError.message}`)
        } else {
          details.push("Trigger de sincronização automática criado com sucesso.")
        }
      } catch (triggerErr: any) {
        details.push(`Aviso: Erro ao criar trigger: ${triggerErr.message}`)
      }

      setResults({
        success: true,
        message: "Sincronização de usuários concluída com sucesso!",
        details,
      })

      toast({
        title: "Sucesso",
        description: `Sincronizados ${syncCount} usuários com a tabela de perfis.`,
        variant: "default",
      })
    } catch (err: any) {
      console.error("Erro na sincronização:", err)
      setResults({
        success: false,
        message: "Erro ao sincronizar usuários",
        details,
        error: err.message,
      })

      toast({
        title: "Erro",
        description: `Falha na sincronização: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Formulário para adicionar usuário manualmente
  const [manualEmail, setManualEmail] = useState("")
  const [manualName, setManualName] = useState("")
  const [manualId, setManualId] = useState("")
  const [addingUser, setAddingUser] = useState(false)

  const handleAddUserManually = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingUser(true)

    try {
      if (!manualId) {
        throw new Error("ID do usuário é obrigatório")
      }

      const { error } = await supabase.from("profiles").insert({
        id: manualId,
        email: manualEmail,
        name: manualName || manualEmail.split("@")[0] || "Usuário",
        created_at: new Date().toISOString(),
        is_active: true,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Usuário adicionado manualmente com sucesso",
        variant: "default",
      })

      // Limpar formulário
      setManualEmail("")
      setManualName("")
      setManualId("")
    } catch (err: any) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar usuário: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setAddingUser(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sincronizar Usuários</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Sincronização de Usuários</h2>
        <p className="text-gray-300 mb-6">
          Esta ferramenta sincroniza os usuários cadastrados com a tabela de perfis, garantindo que todos os usuários
          apareçam no painel administrativo.
        </p>

        {results && (
          <div
            className={`${
              results.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"
            } border rounded-md p-4 mb-6`}
          >
            <h3 className={`font-bold ${results.success ? "text-green-400" : "text-red-400"}`}>{results.message}</h3>

            {results.error && <p className="text-red-400 mt-2">{results.error}</p>}

            {results.details && results.details.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-300 mb-2">Detalhes:</h4>
                <ul className="text-sm space-y-1 max-h-60 overflow-y-auto bg-black/30 p-3 rounded">
                  {results.details.map((detail, index) => (
                    <li key={index} className="text-gray-400">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSyncUsers}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Sincronizando usuários...
            </>
          ) : (
            "Sincronizar Usuários"
          )}
        </button>
      </div>

      {/* Formulário para adicionar usuário manualmente */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Adicionar Usuário Manualmente</h2>
        <p className="text-gray-300 mb-6">
          Use este formulário para adicionar manualmente um usuário à tabela de perfis.
        </p>

        <form onSubmit={handleAddUserManually} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ID do Usuário (UUID)</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              O ID do usuário é um UUID que pode ser encontrado no console do Supabase.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome (opcional)</label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Nome do usuário"
            />
          </div>

          <button
            type="submit"
            disabled={addingUser || !manualId || !manualEmail}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingUser ? "Adicionando..." : "Adicionar Usuário"}
          </button>
        </form>
      </div>

      <div className="flex justify-between">
        <Link href="/admin-panel/configuracoes" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
          Voltar para Configurações
        </Link>
        <Link href="/admin-panel/usuarios" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
          Ver Lista de Usuários
        </Link>
      </div>
    </div>
  )
}
