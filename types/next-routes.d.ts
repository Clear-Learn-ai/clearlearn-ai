// Next.js route type declarations to fix Link component issues
declare module 'next/link' {
  import { ComponentProps } from 'react'
  
  interface LinkProps extends ComponentProps<'a'> {
    href: string | { pathname: string; query?: Record<string, any> }
    as?: string
    replace?: boolean
    scroll?: boolean
    shallow?: boolean
    passHref?: boolean
    prefetch?: boolean
  }
  
  export default function Link(props: LinkProps): JSX.Element
}

// Extend Next.js route types
declare module 'next' {
  interface RouteImpl<T> {
    pathname: string
    query?: Record<string, any>
  }
}

// Global type augmentations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'link': any
    }
  }
}
