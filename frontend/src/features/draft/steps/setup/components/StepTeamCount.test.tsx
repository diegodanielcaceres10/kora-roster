import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { StepTeamCount } from "./StepTeamCount";
import { MAX_TEAMS, MIN_TEAMS } from "../../../draft.constants";
import messages from "../../../../../i18n/locales/en-US.json";

function renderStep(overrides: Partial<React.ComponentProps<typeof StepTeamCount>> = {}) {
  const onChange = vi.fn();
  const onNext = vi.fn();
  const onBack = vi.fn();
  const props = { teamCount: 2, onChange, onNext, onBack, ...overrides };

  render(
    <IntlProvider locale="en-US" messages={messages}>
      <StepTeamCount {...props} />
    </IntlProvider>,
  );

  return { onChange, onNext, onBack };
}

describe("StepTeamCount", () => {
  it("increments and decrements within MIN_TEAMS/MAX_TEAMS bounds", async () => {
    const user = userEvent.setup();
    const { onChange } = renderStep({ teamCount: 3 });

    await user.click(screen.getByLabelText("Add team"));
    expect(onChange).toHaveBeenLastCalledWith(4);

    await user.click(screen.getByLabelText("Remove team"));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("disables the decrement button at MIN_TEAMS", () => {
    renderStep({ teamCount: MIN_TEAMS });
    expect(screen.getByLabelText("Remove team")).toBeDisabled();
    expect(screen.getByLabelText("Add team")).not.toBeDisabled();
  });

  it("disables the increment button at MAX_TEAMS", () => {
    renderStep({ teamCount: MAX_TEAMS });
    expect(screen.getByLabelText("Add team")).toBeDisabled();
  });

  it("calls onChange with the selected chip value", async () => {
    const user = userEvent.setup();
    const { onChange } = renderStep({ teamCount: 2 });

    await user.click(screen.getByText("3"));
    expect(onChange).toHaveBeenCalledWith(3);
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
