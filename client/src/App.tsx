import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Questionnaire from "./pages/Questionnaire";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Splash} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/login"} component={Login} />
      <Route path={"/questionnaire"} component={Questionnaire} />
      <Route path={"/home"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
