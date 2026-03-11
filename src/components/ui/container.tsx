import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
}

export function Container({ children, className = '', as: Component = 'div' }: ContainerProps) {
  return <Component className={`mx-auto max-w-5xl px-6 md:px-8 ${className}`}>{children}</Component>
}
