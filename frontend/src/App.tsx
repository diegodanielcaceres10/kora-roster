import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/layout";
import { useDraftWizard } from "./features/draft/hooks/useDraftWizard";
import { StepWelcome } from "./features/draft/steps/welcome/welcome";
import { StepSetup } from "./features/draft/steps/setup/setup";
import { StepDraw } from "./features/draft/steps/draw/draw";
import { StepExport } from "./features/draft/steps/export/export";
import { TutorialPage } from "./pages/tutorial/TutorialPage";
import { FAQPage } from "./pages/faq/FAQPage";
import { AboutPage } from "./pages/about/AboutPage";
import { LoginPage } from "./pages/auth/login/LoginPage";
import { ForgotPage } from "./pages/auth/forgot/ForgotPage";
import { RegisterPage } from "./pages/auth/register/RegisterPage";
import { SetPasswordPage } from "./pages/auth/set-password/SetPasswordPage";

function DraftWizard() {
  const wizard = useDraftWizard();

  switch (wizard.step) {
    case "welcome":
      return <StepWelcome onStart={wizard.goNext} />;

    case "setup":
      return (
        <StepSetup
          config={wizard.config}
          setTeamCount={wizard.setTeamCount}
          setPlayersPerTeam={wizard.setPlayersPerTeam}
          addPlayer={wizard.addPlayer}
          addPlayers={wizard.addPlayers}
          removePlayer={wizard.removePlayer}
          removeAllPlayers={wizard.removeAllPlayers}
          toggleGoalkeeper={wizard.toggleGoalkeeper}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      );

    case "draw":
      return (
        <StepDraw
          config={wizard.config}
          setAssignmentMode={wizard.setAssignmentMode}
          resetAssignments={wizard.resetAssignments}
          assignPlayerToTeam={wizard.assignPlayerToTeam}
          unassignPlayer={wizard.unassignPlayer}
          drawTeams={wizard.drawTeams}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      );

    case "export":
      return <StepExport config={wizard.config} onBack={wizard.goBack} onReset={wizard.reset} />;
  }
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DraftWizard />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
      </Route>
    </Routes>
  );
}

export default App;
