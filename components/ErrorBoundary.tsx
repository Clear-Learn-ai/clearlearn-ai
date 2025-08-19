'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  level?: 'page' | 'component' | 'critical'
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught error:', error)
    console.error('Error Info:', errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to analytics/monitoring service
    this.logError(error, errorInfo)
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to monitoring service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.log('📊 Error logged:', errorData)
    
    // TODO: Send to monitoring service
    // Example: Sentry.captureException(error, { extra: errorData })
  }

  private retry = () => {
    const maxRetries = this.props.maxRetries || 3
    
    if (this.state.retryCount < maxRetries) {
      console.log(`🔄 Retrying (attempt ${this.state.retryCount + 1}/${maxRetries})`)
      
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      })
    } else {
      console.error('❌ Max retries exceeded')
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry)
      }

      // Default fallback UI based on level
      return this.getDefaultFallback()
    }

    return this.props.children
  }

  private getDefaultFallback() {
    const { level = 'component' } = this.props
    const canRetry = this.state.retryCount < (this.props.maxRetries || 3)

    switch (level) {
      case 'critical':
        return <CriticalErrorFallback 
          error={this.state.error!} 
          retry={canRetry ? this.retry : undefined}
        />
      
      case 'page':
        return <PageErrorFallback 
          error={this.state.error!}
          retry={canRetry ? this.retry : undefined}
        />
      
      default:
        return <ComponentErrorFallback 
          error={this.state.error!}
          retry={canRetry ? this.retry : undefined}
        />
    }
  }
}

// Critical system error (entire app failure)
const CriticalErrorFallback: React.FC<{ error: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="max-w-md mx-auto text-center p-8">
      <div className="text-6xl mb-4">🚨</div>
      <h1 className="text-2xl font-bold text-red-800 mb-4">
        System Error
      </h1>
      <p className="text-red-600 mb-6">
        We're experiencing technical difficulties. Our team has been notified.
      </p>
      <div className="space-y-3">
        {retry && (
          <button
            onClick={retry}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔄 Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Reload Page
        </button>
      </div>
      <details className="mt-6 text-left">
        <summary className="cursor-pointer text-sm text-gray-600">
          Technical Details
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
)

// Page-level error (navigation still works)
const PageErrorFallback: React.FC<{ error: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-lg mx-auto text-center">
      <div className="text-8xl mb-6">😵</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Oops! Something went wrong
      </h1>
      <p className="text-gray-600 mb-8">
        Don't worry, this happens sometimes. The error has been logged and we're working on it.
      </p>
      
      <div className="space-y-4">
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            🔄 Try Again
          </button>
        )}
        
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🏠 Home
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Meanwhile, did you know?</h3>
        <p className="text-blue-700 text-sm">
          The human brain creates new neural pathways every time you learn something new. 
          Even experiencing this error is helping your brain adapt!
        </p>
      </div>
    </div>
  </div>
)

// Component-level error (graceful degradation)
const ComponentErrorFallback: React.FC<{ error: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 m-4">
    <div className="flex items-start">
      <div className="text-3xl mr-4">⚠️</div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Component Error
        </h3>
        <p className="text-yellow-700 mb-4">
          This component couldn't load properly, but the rest of the page should work fine.
        </p>
        
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
          >
            🔄 Retry Component
          </button>
        )}
        
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800">
            Error Details
          </summary>
          <code className="block mt-2 text-xs bg-yellow-100 p-2 rounded">
            {error.message}
          </code>
        </details>
      </div>
    </div>
  </div>
)

// HOC for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for error reporting
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: string) => {
    console.error(`🚨 Manual error report (${context}):`, error)
    
    // Log to monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // TODO: Send to monitoring service
    console.log('📊 Manual error logged:', errorData)
  }
  
  return { reportError }
}

export default ErrorBoundary