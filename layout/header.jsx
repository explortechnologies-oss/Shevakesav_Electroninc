import { useState } from "react";
import { Search, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobSheetModal from "@/components/job-sheet/job-sheet-modal";
export default function Header() {
    var _a = useState(false), isJobSheetModalOpen = _a[0], setIsJobSheetModalOpen = _a[1];
    var currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return (<>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Today is {currentDate}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400"/>
              </div>
              <Input type="text" placeholder="Search jobs, customers..." className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
            </div>
            
            {/* Quick Actions */}
            <Button onClick={function () { return setIsJobSheetModalOpen(true); }} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <Plus className="h-4 w-4"/>
              <span>New Job</span>
            </Button>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5"/>
              <span className="absolute top-0 right-0 h-2 w-2 bg-error-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <JobSheetModal isOpen={isJobSheetModalOpen} onClose={function () { return setIsJobSheetModalOpen(false); }}/>
    </>);
}
