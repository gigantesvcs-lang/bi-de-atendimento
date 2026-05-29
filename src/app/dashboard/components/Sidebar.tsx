"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, 
  HeadphonesIcon, 
  MessageSquare, 
  Users, 
  Star, 
  Clock, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Visão Geral", href: "/dashboard", icon: BarChart2 },
    { name: "Atendimentos", href: "/dashboard/atendimentos", icon: HeadphonesIcon },
    { name: "Canais", href: "/dashboard/canais", icon: MessageSquare },
    { name: "Equipe", href: "/dashboard/equipe", icon: Users },
    { name: "Avaliações", href: "/dashboard/avaliacoes", icon: Star },
    { name: "SLA", href: "/dashboard/sla", icon: Clock },
    { name: "Relatórios", href: "/dashboard/relatorios", icon: FileText },
    { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10">
      <div className="p-6 border-b border-slate-200 flex justify-center items-center h-[72px]">
        {/* Replace with your actual logo path */}
        <Image src="/logo.png" alt="Gigante Logo" width={140} height={45} className="object-contain" />
      </div>

      <div className="flex-1 py-6 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 relative group transition-colors ${
                isActive ? "text-teal-600" : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-md"></div>
              )}
              <div className={`p-2 rounded-lg ${isActive ? "bg-teal-500" : "group-hover:bg-teal-50"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-teal-600"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-6 py-3 w-full text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
