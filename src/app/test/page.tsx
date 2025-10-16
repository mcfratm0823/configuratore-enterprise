'use client'

// 🔥 TEST PAGE ENTERPRISE - VALIDAZIONE STEP6DESIGN
// Test completo del flow: Step1 → Step2 → Step3 → Step4 → Step5 → Step6

import { ConfiguratorProvider, useConfigurator, ServiceSubType } from '@/context'
import { Step1Country } from '@/features/configurator/components/steps/Step1Country'
import { Step2Service } from '@/features/configurator/components/steps/Step2Service'
import { Step3Materials } from '@/features/configurator/components/steps/Step3Materials'
import { Step4Sizes } from '@/features/configurator/components/steps/Step4Sizes'
import { Step5Extras } from '@/features/configurator/components/steps/Step5Extras'
import { Step6Design } from '@/features/configurator/components/steps/Step6Design'
import { useState } from 'react'

function TestContent() {
  const { state, actions } = useConfigurator()
  const [currentTestStep, setCurrentTestStep] = useState(1)

  // Debug info enterprise
  const renderDebugInfo = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-2">🔍 DEBUG STATE ENTERPRISE</h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <strong>Current Step:</strong> {state.currentStep} | <strong>Test Step:</strong> {currentTestStep}
        </div>
        <div>
          <strong>Service:</strong> {state.serviceSubType || 'None'}
        </div>
        <div>
          <strong>Country:</strong> {state.country || 'None'}
        </div>
        <div>
          <strong>Sample:</strong> {state.wantsSample ? 'YES €50' : 'NO'}
        </div>
        <div>
          <strong>Can Selection:</strong> {state.canSelection?.quantity || 'None'}
        </div>
        <div>
          <strong>Continue Quote:</strong> {state.wantsToContinueQuote ? 'YES' : 'NO'}
        </div>
        <div>
          <strong>Template Downloaded:</strong> {state.hasDownloadedTemplate ? '✅ YES' : '❌ NO'}
        </div>
        <div>
          <strong>Payment Completed:</strong> {state.paymentCompleted ? '✅ YES' : '❌ NO'}
        </div>
        <div className="col-span-2">
          <strong>Contact Form:</strong> {JSON.stringify(state.contactForm, null, 2)}
        </div>
      </div>
    </div>
  )

  // Quick setup per testare Step6
  const quickSetupForStep6 = () => {
    actions.setServiceSubType(ServiceSubType.WHITELABEL)
    actions.setCountry('Italia')
    actions.setWantsSample(true)
    actions.setCanSelection({
      size: 200,
      quantity: 600,
      cartonsCount: 25,
      totalPrice: 460
    })
    actions.setWantsToContinueQuote(true)
    actions.setHasDownloadedTemplate(true)
    setCurrentTestStep(6)
  }

  const renderNavigation = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">🎯 TEST NAVIGATION ENTERPRISE</h3>
      <div className="flex gap-2 flex-wrap mb-4">
        {[1, 2, 3, 4, 5, 6].map(step => (
          <button
            key={step}
            onClick={() => setCurrentTestStep(step)}
            className={`px-3 py-1 rounded text-sm font-medium border ${
              currentTestStep === step 
                ? 'bg-[#2d5a3d] text-white border-[#2d5a3d]' 
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Step {step}
          </button>
        ))}
      </div>
      <button
        onClick={quickSetupForStep6}
        className="px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700"
      >
        🚀 Quick Setup per Step6 (White Label + Template Downloaded)
      </button>
    </div>
  )

  const renderCurrentStep = () => {
    switch(currentTestStep) {
      case 1: return <Step1Country />
      case 2: return <Step2Service />
      case 3: return <Step3Materials />
      case 4: return <Step4Sizes />
      case 5: return <Step5Extras />
      case 6: return <Step6Design />
      default: return <div>Step non trovato</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 TEST PAGE ENTERPRISE
          </h1>
          <p className="text-gray-600">
            Validazione Step6Design - Contact Form + Payment Integration
          </p>
        </div>

        {renderDebugInfo()}
        {renderNavigation()}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Step {currentTestStep}: {
              currentTestStep === 1 ? 'Country Selection' :
              currentTestStep === 2 ? 'Service Selection' :
              currentTestStep === 3 ? 'Can Selection' :
              currentTestStep === 4 ? 'Quote Display' :
              currentTestStep === 5 ? 'Template Download' :
              'Contact Form + Payment'
            }
          </h2>
          
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}

export default function TestPage() {
  return (
    <ConfiguratorProvider>
      <TestContent />
    </ConfiguratorProvider>
  )
}