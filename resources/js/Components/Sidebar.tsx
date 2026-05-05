import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  BarChart3, 
  FileText, 
  LogOut,
  Users,
  Settings as SettingsIcon,
  ClipboardList // Added this new icon for Pending News
} from 'lucide-react';

// --- Animation Configurations ---
const sidebarVariants = {
  hidden: { x: -260 },
  visible: { 
    x: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.1 } 
  }
};

const linkVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hover: { scale: 1.02, x: 5, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  tap: { scale: 0.95 }
};

export default function Sidebar() {
  const { url, props } = usePage<any>();
  const auth = props.auth;
  
  const userRole = auth.user?.role;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add News', href: '/add-news', icon: PlusCircle },
    { name: 'Monitoring', href: '/monitoring', icon: Search },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-[#1A237E] text-white shadow-2xl z-50"
    >
      
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-center border-b border-white/30 px-6 py-4">
        <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="flex items-center gap-3"
        >
          <div className="size-12 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden border-2 border-[#FBC02D]">
            <img 
                src="/images/emc-logo.png" 
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
            <span className="text-[10px] text-slate-290 uppercase tracking-widest font-semibold">Eastmincom AFP</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = url.startsWith(item.href);
          return (
            <motion.div key={item.name} variants={linkVariants} whileHover="hover" whileTap="tap">
              <Link
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-bold transition-colors duration-200 rounded-lg ${
                  isActive 
                    ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 size-5 ${isActive ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            </motion.div>
          );
        })}

        {/* ADMIN ONLY SECTION */}
        {isAdmin && (
          <>
            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
              <Link
                href="/admin/users"
                className={`group flex items-center px-4 py-3 text-sm font-bold transition-colors duration-200 rounded-lg mt-4 ${
                  url.startsWith('/admin/users') 
                    ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className={`mr-3 size-5 ${url.startsWith('/admin/users') ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
                User Approval
              </Link>
            </motion.div>

            {/* NEW: Pending News Link */}
            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
              <Link
                href="/admin/news/pending"
                className={`group flex items-center px-4 py-3 text-sm font-bold transition-colors duration-200 rounded-lg mt-1 ${
                  url.startsWith('/admin/news/pending') 
                    ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ClipboardList className={`mr-3 size-5 ${url.startsWith('/admin/news/pending') ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
                Pending News
              </Link>
            </motion.div>
          </>
        )}

        {/* SETTINGS SECTION */}
        <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
          <Link
            href="/settings"
            className={`group flex items-center px-4 py-3 text-sm font-bold transition-colors duration-200 rounded-lg mt-4 ${
              url.startsWith('/settings') 
                ? 'bg-[#FBC02D] text-[#1A237E] shadow-md border-l-4 border-white' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SettingsIcon className={`mr-3 size-5 ${url.startsWith('/settings') ? 'text-[#1A237E]' : 'text-slate-400 group-hover:text-white'}`} />
            Settings
          </Link>
        </motion.div>
      </nav>

      {/* Logout & Footer */}
      <motion.div 
        variants={linkVariants}
        className="border-t border-white/10 p-4 space-y-1 text-center"
      >
        <motion.div whileHover="hover" whileTap="tap">
          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="mr-3 size-5" />
            Log Out
          </Link>
        </motion.div>
        <p className="mt-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase italic pb-2">
          "Para sa Bayan"
        </p>
      </motion.div>
    </motion.div>
  );
}