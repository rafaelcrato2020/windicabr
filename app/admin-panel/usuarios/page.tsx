import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Eye, Ban, ArrowUpDown } from "lucide-react"

export default async function UsersPage() {
  const supabase = createServerClient()

  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-6 py-3 text-gray-300">Nome</th>
                <th className="px-6 py-3 text-gray-300">Email</th>
                <th className="px-6 py-3 text-gray-300">Saldo</th>
                <th className="px-6 py-3 text-gray-300">Investimentos</th>
                <th className="px-6 py-3 text-gray-300">Status</th>
                <th className="px-6 py-3 text-gray-300">Cadastro</th>
                <th className="px-6 py-3 text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">{user.name || "Usuário"}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 font-medium">R$ {(user.balance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-medium">R$ {(user.investments || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin-panel/usuarios/${user.id}`}
                        className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30"
                      >
                        <Eye className="w-5 h-5 text-blue-400" />
                      </Link>
                      <Link
                        href={`/admin-panel/usuarios/${user.id}/bloquear`}
                        className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                      >
                        <Ban className="w-5 h-5 text-red-400" />
                      </Link>
                      <Link
                        href={`/admin-panel/usuarios/${user.id}/transacoes`}
                        className="p-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30"
                      >
                        <ArrowUpDown className="w-5 h-5 text-yellow-400" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
