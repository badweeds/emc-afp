import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Radio, 
  PlusCircle, 
  FileText, 
  BarChart3, 
  Settings,
  Shield
} from 'lucide-react';
import { cn } from './ui/utils';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/news-monitoring', label: 'News Monitoring', icon: Radio },
  { path: '/add-news', label: 'Add News', icon: PlusCircle },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1E293B] text-white h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#2D3F59]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#7B1E1E] rounded-lg">
            <Shield className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AFP EastMinCom</h1>
            <p className="text-xs text-gray-400">News Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-[#7B1E1E] text-white" 
                      : "text-gray-300 hover:bg-[#2D3F59] hover:text-white"
                  )}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2D3F59]">
        <p className="text-xs text-gray-400 text-center">
          © 2026 AFP EastMinCom
        </p>
      </div>
    </aside>
  );
}
