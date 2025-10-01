import { useState } from "react";
import { Plus, File, CreditCard, UserPlus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import JobSheetModal from "@/components/job-sheet/job-sheet-modal";
export default function QuickActions() {
    var _a = useState(false), isJobSheetModalOpen = _a[0], setIsJobSheetModalOpen = _a[1];
    var actions = [
        {
            title: "Create Job Sheet",
            icon: Plus,
            bgColor: "bg-primary-600",
            hoverColor: "hover:bg-primary-700",
            onClick: function () { return setIsJobSheetModalOpen(true); },
        },
        {
            title: "Generate Invoice",
            icon: File,
            bgColor: "bg-secondary-600",
            hoverColor: "hover:bg-secondary-700",
            onClick: function () { },
        },
        {
            title: "Record Payment",
            icon: CreditCard,
            bgColor: "bg-success-600",
            hoverColor: "hover:bg-success-700",
            onClick: function () { },
        },
        {
            title: "Add Technician",
            icon: UserPlus,
            bgColor: "bg-accent-600",
            hoverColor: "hover:bg-accent-700",
            onClick: function () { },
        },
        {
            title: "View Reports",
            icon: BarChart3,
            bgColor: "bg-gray-600",
            hoverColor: "hover:bg-gray-700",
            onClick: function () { },
        },
    ];
    return (<>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map(function (action, index) {
            var Icon = action.icon;
            return (<Button key={index} onClick={action.onClick} className={"w-full flex items-center justify-center px-4 py-3 ".concat(action.bgColor, " text-white rounded-lg ").concat(action.hoverColor, " transition-colors duration-200")}>
                  <Icon className="mr-2 h-4 w-4"/>
                  {action.title}
                </Button>);
        })}
          </div>
        </CardContent>
      </Card>

      <JobSheetModal isOpen={isJobSheetModalOpen} onClose={function () { return setIsJobSheetModalOpen(false); }}/>
    </>);
}
