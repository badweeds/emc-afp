import { Search, Bell, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
// 1. IMPORT usePage from Inertia
import { usePage } from '@inertiajs/react';

export function Navbar() {
  // 2. GRAB the current logged-in user's data
  const { auth } = usePage<any>().props;
  const user = auth.user;

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input 
              type="search"
              placeholder="Search news, reports, analytics..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 size-2 bg-[#DC2626] rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#7B1E1E] text-white font-bold">
                    {/* 3. SHOW the first letter of their name instead of an icon */}
                    {user?.name?.charAt(0) || <User className="size-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  {/* 4. SHOW their actual Name and Role! */}
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    {user?.role ? user.role.replace('_', ' ') : 'Personnel'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 font-bold">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}