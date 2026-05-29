import { getUsers, createUser, deleteUser } from "./actions";
import { UserPlus, Trash2 } from "lucide-react";

export default async function ConfiguracoesPage() {
  const users = await getUsers();

  return (
    <div className="p-8 bg-[#f8fafb] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie os acessos ao painel de Business Intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 rounded-lg">
                <UserPlus className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Novo Usuário</h2>
            </div>
            
            <form action={createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input name="nome" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input name="password" type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-md shadow-teal-500/20">
                Criar Usuário
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Usuários Cadastrados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm font-medium text-slate-500">
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Criado em</th>
                    <th className="pb-3 pl-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4 font-medium text-slate-800">{u.nome}</td>
                      <td className="py-4 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-4 pr-4 text-slate-500 text-sm">{u.criado_em.toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 pl-4 text-right">
                        <form action={deleteUser.bind(null, u.id)}>
                          <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Deletar Usuário">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">Nenhum usuário cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
