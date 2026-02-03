import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost'
}

export function Button({
  className,
  variant = 'solid',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-3 py-2 text-sm font-semibold border-2 border-black transition-colors disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'ghost'
      ? 'bg-transparent text-black hover:bg-black hover:text-white'
      : 'bg-black text-white hover:bg-white hover:text-black'
  return (
    <button
      type={props.type ?? 'button'}
      className={cx(base, styles, className)}
      {...props}
    />
  )
}

type FieldProps = {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide">
      <span>{label}</span>
      {children}
    </label>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        'w-full border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black',
        className,
      )}
      {...props}
    />
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cx(
        'w-full border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black',
        className,
      )}
      {...props}
    />
  )
}
