import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  BarChart3, 
  FileText, 
  LogOut,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';

export default function Sidebar() {
  const { url, props } = usePage<any>();
  const auth = props.auth;
  
  // Security check: Only Admins can see the User Management link
  const isAdmin = auth.user.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add News', href: '/add-news', icon: PlusCircle },
    { name: 'Monitoring', href: '/monitoring', icon: Search },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-[#1A237E] text-white shadow-2xl z-50">
      
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-center border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          
          {/* THE FIX: Replaced Shield Icon with the Real EMC Logo */}
          <div className="size-12.5 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden border-3 border-[#FBC02D]">
            <img 
                src="/images/emc-logo.jpg" 
                alt="EMC Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/EMC%20Logo.jpg';
                }}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter leading-tight italic">
              <span className="text-white">EMC </span>
              <span className="text-[#FBC02D]">NEWS</span>
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">Eastmincom AFP</span>
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
              className={`group flex items-center px-4 py-3 text-sm font-bold transition-all duration-200 rounded-lg ${
                isActive 
                  ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 size-5 ${isActive ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}

        {/* ADMIN ONLY SECTION */}
        {isAdmin && (
          <Link
            href="/admin/users"
            className={`group flex items-center px-4 py-3 text-sm font-bold transition-all duration-200 rounded-lg mt-4 ${
              url.startsWith('/admin/users') 
                ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className={`mr-3 size-5 ${url.startsWith('/admin/users') ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
            User Approval
          </Link>
        )}

        {/* SETTINGS SECTION */}
        <Link
          href="/settings"
          className={`group flex items-center px-4 py-3 text-sm font-bold transition-all duration-200 rounded-lg ${
            url.startsWith('/settings') 
              ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <SettingsIcon className={`mr-3 size-5 ${url.startsWith('/settings') ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
          Settings
        </Link>
      </nav>

      {/* Logout & Footer */}
      <div className="border-t border-white/10 p-4 space-y-1 text-center">
        <Link
          href={route('logout')}
          method="post"
          as="button"
          className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="mr-3 size-5" />
          Log Out
        </Link>
        <p className="mt-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase italic pb-2">
          "Para sa Bayan"
        </p>
      </div>
    </div>
  );
}