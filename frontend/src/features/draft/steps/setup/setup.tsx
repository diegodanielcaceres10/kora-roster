import { useNavigate, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import type { DraftConfig, SetupSubStep } from "../../draft.types";
import { StepTeamCount } from "./components/StepTeamCount";
import { StepPlayersPerTeam } from "./components/StepPlayersPerTeam";
import { StepPlayerList } from "./components/StepPlayerList";
import { StepProgress, type GlobalStep } from "./components/step-progress/StepProgress";
import styles from "./setup.module.scss";
import type { ParsedPlayerName } from "../../utils/parsePastedNames";

interface StepSetupProps {
  config: DraftConfig;
  setTeamCount: (count: number) => void;
  setPlayersPerTeam: (count: number) => void;
  addPlayer: (name: string) => void;
  addPlayers: (entries: ParsedPlayerName[]) => void;
  removePlayer: (id: string) => void;
  removeAllPlayers: () => void;
  toggleGoalkeeper: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUB_STEP_ORDER: SetupSubStep[] = ["teams", "playersPerTeam", "list"];

const GLOBAL_STEP_BY_SUB_STEP: Record<SetupSubStep, GlobalStep> = {
  teams: 1,
  playersPerTeam: 2,
  list: 3,
};

export function StepSetup({ config, setTeamCount, setPlayersPerTeam, addPlayer, addPlayers, removePlayer, removeAllPlayers, toggleGoalkeeper, onNext, onBack }: StepSetupProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  const subStep = (location.state as { subStep?: SetupSubStep } | null)?.subStep ?? "teams";
  const subStepIndex = SUB_STEP_ORDER.indexOf(subStep);

  const goToNextSubStep = () => {
    if (subStepIndex === SUB_STEP_ORDER.length - 1) {
      onNext();
      return;
    }
    navigate(".", { state: { step: "setup", subStep: SUB_STEP_ORDER[subStepIndex + 1] } });
  };

  const goToPrevSubStep = () => {
    if (subStepIndex === 0) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <section className={styles.setup}>
      <StepProgress
        currentStep={GLOBAL_STEP_BY_SUB_STEP[subStep]}
        summaries={
          config.teamCount
            ? {
                1: intl.formatMessage({ id: "setup.summary.teams" }, { count: config.teamCount }),
                2: config.playersPerTeam ? intl.formatMessage({ id: "setup.summary.playersPerTeam" }, { count: config.playersPerTeam }) : undefined,
              }
            : undefined
        }
      />

      <div className={styles.setup__content}>
        {subStep === "teams" && <StepTeamCount teamCount={config.teamCount} onChange={setTeamCount} onNext={goToNextSubStep} onBack={goToPrevSubStep} />}

        {subStep === "playersPerTeam" && <StepPlayersPerTeam teamCount={config.teamCount} playersPerTeam={config.playersPerTeam} onChange={setPlayersPerTeam} onNext={goToNextSubStep} onBack={goToPrevSubStep} />}

        {subStep === "list" && <StepPlayerList players={config.players} totalNeeded={config.teamCount * config.playersPerTeam} teamCount={config.teamCount} onAdd={addPlayer} onAddMany={addPlayers} onRemove={removePlayer} onRemoveAll={removeAllPlayers} onToggleGoalkeeper={toggleGoalkeeper} onNext={goToNextSubStep} onBack={goToPrevSubStep} />}
      </div>
    </section>
  );
}
