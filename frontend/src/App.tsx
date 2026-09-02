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
import { TermsPage } from "./pages/terms/TermsPage";
import { PrivacyPage } from "./pages/privacy/PrivacyPage";
import { LoginPage } from "./pages/auth/login/LoginPage";
import { ForgotPage } from "./pages/auth/forgot/ForgotPage";
import { RegisterPage } from "./pages/auth/register/RegisterPage";
import { SetPasswordPage } from "./pages/auth/set-password/SetPasswordPage";
import { MePage } from "./pages/me/MePage";
import { RequireAuth } from "./features/account/guards/RequireAuth";
import { RequireGuest } from "./features/account/guards/RequireGuest";

function DraftWizard() {
  const wizard = useDraftWizard();

  switch (wizard.step) {
    case "welcome":
      return <StepWelcome onStart={wizard.goNext} onQuickFriendly={wizard.quickFriendlyDraft} />;

    case "setup":
      return <StepSetup config={wizard.config} setTeamCount={wizard.setTeamCount} setPlayersPerTeam={wizard.setPlayersPerTeam} addPlayer={wizard.addPlayer} addPlayers={wizard.addPlayers} removePlayer={wizard.removePlayer} removeAllPlayers={wizard.removeAllPlayers} toggleGoalkeeper={wizard.toggleGoalkeeper} onNext={wizard.goNext} onBack={wizard.goBack} />;

    case "draw":
      return <StepDraw config={wizard.config} setAssignmentMode={wizard.setAssignmentMode} resetAssignments={wizard.resetAssignments} assignPlayerToTeam={wizard.assignPlayerToTeam} unassignPlayer={wizard.unassignPlayer} drawTeams={wizard.drawTeams} onNext={wizard.goNext} onBack={wizard.goBack} />;

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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/forgot"
          element={
            <RequireGuest>
              <ForgotPage />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <RegisterPage />
            </RequireGuest>
          }
        />
        <Route
          path="/set-password"
          element={
            <RequireGuest>
              <SetPasswordPage />
            </RequireGuest>
          }
        />
        <Route
          path="/me"
          element={
            <RequireAuth>
              <MePage />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
