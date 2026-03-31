import * as React from "react"

function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps = (children as any).props || {}
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      ...childProps,
      className: [props.className, childProps.className]
        .filter(Boolean)
        .join(" "),
    })
  }
  return <>{children}</>
}

export { Slot }
