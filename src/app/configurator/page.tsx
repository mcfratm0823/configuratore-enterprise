'use client'

import { ConfiguratorProvider } from '@/context'
import { ConfiguratorWizard } from '@/features/configurator/components/ConfiguratorWizard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function ConfiguratorPage() {
  return (
    <ErrorBoundary>
      <ConfiguratorProvider>
        <ErrorBoundary>
          <ConfiguratorWizard />
        </ErrorBoundary>
      </ConfiguratorProvider>
    </ErrorBoundary>
  )
}