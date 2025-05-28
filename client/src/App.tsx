import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import AuthProvider from "./lib/auth";
import MainLayout from "./components/layout/main-layout";
import Dashboard from "./pages/dashboard";
import Horses from "./pages/horses";
import Documents from "./pages/documents";
import Farms from "./pages/farms";
// import Login from "./pages/auth/login";
import NotFound from "./pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" nest>
            <MainLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/horses" component={Horses} />
                <Route path="/documents" component={Documents} />
                <Route path="/farms" component={Farms} />
                <Route component={NotFound} />
              </Switch>
            </MainLayout>
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
