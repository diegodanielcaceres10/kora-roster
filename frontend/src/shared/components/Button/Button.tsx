import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Thin, unstyled wrapper around the native <button>.
 *
 * It doesn't impose any visual style of its own — every page keeps its own
 * className/module.scss exactly as before. What it centralizes:
 *  - defaults `type="button"` so a button doesn't accidentally submit a
 *    form just because someone forgot to set the type.
 *  - forwards the ref, so it can be used anywhere a raw <button> ref was
 *    needed (see LanguageSwitcher).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ type = "button", ...props }, ref) {
  return <button ref={ref} type={type} {...props} />;
});
