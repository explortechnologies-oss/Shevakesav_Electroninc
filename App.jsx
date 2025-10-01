import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import JobSheet from "@/pages/job-sheet";
import Customers from "@/pages/customers";
import Technicians from "@/pages/technicians";
import Invoices from "@/pages/invoices";
import DInvoices from "@/pages/d-invoices";
import Quotations from "@/pages/quotations";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
function Router() {
    return (<div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard}/>
            <Route path="/job-sheet" component={JobSheet}/>
            <Route path="/customers" component={Customers}/>
            <Route path="/technicians" component={Technicians}/>
            <Route path="/invoices" component={Invoices}/>
            <Route path="/d-invoices" component={DInvoices}/>
            <Route path="/quotations" component={Quotations}/>
            <Route component={NotFound}/>
          </Switch>
        </main>
      </div>
    </div>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
