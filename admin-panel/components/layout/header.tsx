import { Search, Bell as BellIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AdminUser } from "@/lib/auth";

export function Header({ user }: { user: AdminUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tarif, kullanıcı, ID ile ara..." className="pl-10" />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-secondary">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-tomato" />
        </button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right text-sm">
            <div className="font-medium">{user.name || user.email}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {user.role.replace("_", " ")}
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
