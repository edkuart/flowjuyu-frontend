import { cn } from "@/lib/utils"

type BaseSectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function BaseSectionHeading({
  eyebrow,
  title,
  description,
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: BaseSectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && (
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500",
            eyebrowClassName
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-lg font-semibold leading-tight text-neutral-900 sm:text-xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-neutral-600",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
