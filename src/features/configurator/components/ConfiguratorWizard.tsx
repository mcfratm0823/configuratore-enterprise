'use client'

// 🎯 CONFIGURATOR WIZARD ENTERPRISE
// Interface step-by-step con progress indicator e navigation

import { useConfigurator, ServiceSubType } from '@/context'
import { Step1Country } from './steps/Step1Country'
import { Step2Service } from './steps/Step2Service'
import { Step3Materials } from './steps/Step3Materials'
import { Step4Sizes } from './steps/Step4Sizes'
import { Step5Extras } from './steps/Step5Extras'
import { Step6Design } from './steps/Step6Design'

export function ConfiguratorWizard() {
  const { state, actions } = useConfigurator()

  // Step configuration enterprise
  const steps = [
    {
      id: 1,
      title: "Seleziona il tuo Paese",
      description: "Scegli il paese di destinazione",
      component: Step1Country,
      isCompleted: !!state.country,
      isAvailable: true
    },
    {
      id: 2,
      title: "Tipo di Servizio",
      description: "White Label o Private Label",
      component: Step2Service,
      isCompleted: !!state.serviceSubType,
      isAvailable: !!state.country
    },
    {
      id: 3,
      title: "Selezione Lattine",
      description: "Quantità e specifiche",
      component: Step3Materials,
      isCompleted: !!state.canSelection,
      isAvailable: !!state.serviceSubType && state.serviceSubType === ServiceSubType.WHITELABEL
    },
    {
      id: 4,
      title: "Preventivo",
      description: "Riepilogo costi",
      component: Step4Sizes,
      isCompleted: state.wantsToContinueQuote,
      isAvailable: !!state.canSelection
    },
    {
      id: 5,
      title: "Template Download",
      description: "Scarica i file di lavoro",
      component: Step5Extras,
      isCompleted: state.hasDownloadedTemplate,
      isAvailable: state.wantsToContinueQuote
    },
    {
      id: 6,
      title: "Dati di Contatto",
      description: "Finalizza la richiesta",
      component: Step6Design,
      isCompleted: state.paymentCompleted,
      isAvailable: state.hasDownloadedTemplate
    }
  ]

  const currentStepIndex = state.currentStep - 1
  const currentStep = steps[currentStepIndex] || steps[0]

  // Navigation functions - SOLO tramite CTA
  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1]
      if (nextStep && nextStep.isAvailable) {
        actions.setCurrentStep(currentStepIndex + 2)
      }
    }
  }

  const goPrevious = () => {
    if (currentStepIndex > 0) {
      actions.setCurrentStep(currentStepIndex)
    }
  }

  // Progress calculation
  const completedSteps = steps.filter(step => step.isCompleted).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const renderProgressBar = () => {
    // Progress basato su step corrente, non su completamento
    const stepProgressPercentage = (currentStepIndex + 1) / steps.length * 100
    
    return (
      <div className="mb-6">
        {/* Solo progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-[#2d5a3d] h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${stepProgressPercentage}%` }}
          />
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    const StepComponent = currentStep.component
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex-1 flex flex-col min-h-0">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {currentStep.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {currentStep.description}
            </p>
          </div>
          
          {/* Navigation CTA - Top Right */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={goPrevious}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                currentStepIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              ← Indietro
            </button>

            {/* Avanti solo se NON siamo all'ultimo step */}
            {currentStepIndex < steps.length - 1 && (
              <button
                onClick={goNext}
                disabled={!currentStep.isCompleted}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  !currentStep.isCompleted
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2d5a3d] text-white hover:bg-[#4a7c59] hover:scale-105'
                }`}
              >
                Avanti →
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <StepComponent />
        </div>
      </div>
    )
  }

  const renderBottomInfo = () => (
    <div className="text-center">
      <span className="text-sm text-gray-500">
        {currentStep.isCompleted ? 'Step completato' : 'In corso...'}
      </span>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          {renderProgressBar()}
        </div>

        {/* Step Content - Flexible height */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderStepContent()}
        </div>

        {/* Bottom Info */}
        <div className="mt-6">
          {renderBottomInfo()}
        </div>

      </div>
    </div>
  )
}