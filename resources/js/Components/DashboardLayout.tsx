import React, { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import { Navbar } from './Navbar';

export default function DashboardLayout({ children, user }: PropsWithChildren<{ user?: any }>) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />
      
      {/* Main Content Area */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}