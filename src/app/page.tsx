'use client'

import { ConfiguratorProvider } from '@/context'
import { ConfiguratorWizard } from '@/features/configurator/components/ConfiguratorWizard'

export default function HomePage() {
  return (
    <ConfiguratorProvider>
      <ConfiguratorWizard />
    </ConfiguratorProvider>
  )
}