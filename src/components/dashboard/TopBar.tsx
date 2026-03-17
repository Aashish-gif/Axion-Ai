import React from 'react';
import { ChannelSwitcher } from './ChannelSwitcher';
import { Search, Bell } from 'lucide-react';

export function TopBar() {
    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-0 bg-bg-cream/90 backdrop-blur-md z-40 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b-[3px] border-dark-border shadow-[0_4px_0_#111827]">
            <div className="flex-1 w-full max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search videos, ideas, or comments..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border-[3px] border-dark-border rounded-xl font-medium text-dark-border placeholder:text-gray-400 outline-none transition-all focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(255,59,59,0.1)]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end w-full md:w-auto gap-4">
                <button className="w-11 h-11 bg-white border-[3px] border-dark-border rounded-xl shadow-[4px_5px_0_#111827] flex items-center justify-center transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none hover:text-accent-red">
                    <Bell size={20} />
                </button>
                <ChannelSwitcher />
            </div>
        </header>
    );
}
