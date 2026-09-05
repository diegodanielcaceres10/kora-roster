import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { StepPlayersPerTeam } from "./StepPlayersPerTeam";
import { MAX_PLAYERS_PER_TEAM, MIN_PLAYERS_PER_TEAM } from "../../../draft.constants";
import messages from "../../../../../i18n/locales/en-US.json";

function renderStep(overrides: Partial<React.ComponentProps<typeof StepPlayersPerTeam>> = {}) {
  const onChange = vi.fn();
  const onNext = vi.fn();
  const onBack = vi.fn();
  const props = { teamCount: 2, playersPerTeam: 5, onChange, onNext, onBack, ...overrides };

  const { container } = render(
    <IntlProvider locale="en-US" messages={messages}>
      <StepPlayersPerTeam {...props} />
    </IntlProvider>,
  );

  return { onChange, onNext, onBack, container };
}

describe("StepPlayersPerTeam", () => {
  it("increments and decrements within MIN/MAX bounds", async () => {
    const user = userEvent.setup();
    const { onChange } = renderStep({ playersPerTeam: 5 });

    await user.click(screen.getByLabelText("Add player"));
    expect(onChange).toHaveBeenLastCalledWith(6);

    await user.click(screen.getByLabelText("Remove player"));
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it("disables the decrement button at the minimum", () => {
    renderStep({ playersPerTeam: MIN_PLAYERS_PER_TEAM });
    expect(screen.getByLabelText("Remove player")).toBeDisabled();
  });

  it("disables the increment button at the maximum", () => {
    renderStep({ playersPerTeam: MAX_PLAYERS_PER_TEAM });
    expect(screen.getByLabelText("Add player")).toBeDisabled();
  });

  it("calls onChange with the selected option value", async () => {
    const user = userEvent.setup();
    const { onChange } = renderStep({ playersPerTeam: 5 });

    await user.click(screen.getByText("7"));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("shows the total number of players needed for the current teamCount x playersPerTeam", () => {
    const { container } = renderStep({ teamCount: 3, playersPerTeam: 5 });
    expect(container.textContent).toContain("With 3 teams, you need 15 players in total.");
  });

  it("calls onNext and onBack when their buttons are clicked", async () => {
    const user = userEvent.setup();
    const { onNext, onBack } = renderStep();

    await user.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Continue"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
