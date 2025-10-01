import { Link, useLocation } from "wouter";
import { Home, FileText, Users, UserCog, File, CreditCard, Package, BarChart3, BookOpen, Settings, Wrench, Receipt, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
var mainNavItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/job-sheet", label: "Job Sheet", icon: FileText },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/technicians", label: "Technicians", icon: UserCog },
    { href: "/quotations", label: "Quotations", icon: ClipboardList },
    { href: "/invoices", label: "Invoices", icon: Receipt },
    { href: "/d-invoices", label: "D-Invoices", icon: FileText },
    { href: "/billing", label: "Billing", icon: File },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/inventory", label: "Inventory", icon: Package },
];
var reportNavItems = [
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/day-book", label: "Day Book", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
];
export default function Sidebar() {
    var location = useLocation()[0];
    return (<div className="w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wrench className="text-white h-5 w-5"/>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SHIVAKESAV ELECTRONICS</h1>
            <p className="text-xs text-gray-500">Panasonic & JBL Authorized Service Center</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map(function (item) {
            var Icon = item.icon;
            var isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Reports
          </p>
          <div className="space-y-1">
            {reportNavItems.map(function (item) {
            var Icon = item.icon;
            var isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </div>);
}
