import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  BarChart3, 
  FileText, 
  LogOut,
  Shield
} from 'lucide-react';

export default function Sidebar() {
  const { url } = usePage();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add News', href: '/add-news', icon: PlusCircle },
    { name: 'Monitoring', href: '/monitoring', icon: Search },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    // 'fixed' keeps it pinned, 'h-screen' makes it full height, 'z-50' keeps it on top
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-[#1E293B] text-white shadow-2xl z-50">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-center border-b border-slate-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#7B1E1E] p-2 shadow-lg">
            <Shield className="size-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter leading-tight italic">EMC NEWS</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Eastmincom AFP</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = url.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive 
                  ? 'bg-[#7B1E1E] text-white shadow-md border-l-4 border-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 size-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout & Footer */}
      <div className="border-t border-slate-700 p-4 space-y-1 text-center">
        <Link
          href={route('logout')}
          method="post"
          as="button"
          className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="mr-3 size-5" />
          Log Out
        </Link>
        <p className="mt-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase italic pb-2">
          "Para sa Bayan"
        </p>
      </div>
    </div>
  );
}