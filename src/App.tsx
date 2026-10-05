import { ThemeProvider } from "@/hooks/use-theme";
import { DietaryPreferencesProvider } from "@/hooks/use-dietary-preferences";
import Index from "./pages/Index.tsx";

const App = () => (
  <ThemeProvider>
    <DietaryPreferencesProvider>
      <Index />
    </DietaryPreferencesProvider>
  </ThemeProvider>
);

export default App;
