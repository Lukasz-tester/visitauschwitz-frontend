'use client'

import React from 'react'

type Props = {
  children: React.ReactNode
  blockType: string
}

type State = {
  hasError: boolean
}

export class BlockErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(`Block "${this.props.blockType}" crashed:`, error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
