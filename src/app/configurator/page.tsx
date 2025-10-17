'use client'

import { ConfiguratorProvider } from '@/context'
import { ConfiguratorWizard } from '@/features/configurator/components/ConfiguratorWizard'

export default function ConfiguratorPage() {
  return (
    <ConfiguratorProvider>
      <ConfiguratorWizard />
    </ConfiguratorProvider>
  )
}