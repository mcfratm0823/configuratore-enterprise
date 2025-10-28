'use client'

// 🎯 CONFIGURATOR WIZARD ENTERPRISE
// Interface step-by-step con progress indicator e navigation

import { useConfigurator, ServiceSubType } from '@/context'
import { Step1Country } from './steps/Step1Country'
import { Step2Service } from './steps/Step2Service'
import { Step3Materials } from './steps/Step3Materials'
import { Step3BeverageSelection } from './steps/Step3BeverageSelection'
import { Step4Sizes } from './steps/Step4Sizes'
import { Step4VolumeFormat } from './steps/Step4VolumeFormat'
import { Step5Extras } from './steps/Step5Extras'
import { Step5PackagingChoice } from './steps/Step5PackagingChoice'
import { Step6Design } from './steps/Step6Design'
import { Step6ContactPrivateLabel } from './steps/Step6ContactPrivateLabel'

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
      title: state.serviceSubType === ServiceSubType.WHITELABEL ? "Selezione Lattine" : "Bevanda",
      description: state.serviceSubType === ServiceSubType.WHITELABEL ? "Quantità e specifiche" : "Tipologia bevanda",
      component: state.serviceSubType === ServiceSubType.WHITELABEL ? Step3Materials : Step3BeverageSelection,
      isCompleted: state.serviceSubType === ServiceSubType.WHITELABEL ? !!state.canSelection : !!state.beverageSelection,
      isAvailable: !!state.serviceSubType
    },
    {
      id: 4,
      title: state.serviceSubType === ServiceSubType.WHITELABEL ? "Preventivo" : "Volumi e Formati",
      description: state.serviceSubType === ServiceSubType.WHITELABEL ? "Riepilogo costi" : "Volume produzione e formato",
      component: state.serviceSubType === ServiceSubType.WHITELABEL ? Step4Sizes : Step4VolumeFormat,
      isCompleted: state.serviceSubType === ServiceSubType.WHITELABEL ? state.wantsToContinueQuote : !!state.volumeFormatSelection,
      isAvailable: state.serviceSubType === ServiceSubType.WHITELABEL ? !!state.canSelection : !!state.beverageSelection
    },
    {
      id: 5,
      title: state.serviceSubType === ServiceSubType.WHITELABEL ? "Template Download" : "Packaging",
      description: state.serviceSubType === ServiceSubType.WHITELABEL ? "Scarica i file di lavoro" : "Tipo di packaging",
      component: state.serviceSubType === ServiceSubType.WHITELABEL ? Step5Extras : Step5PackagingChoice,
      isCompleted: state.serviceSubType === ServiceSubType.WHITELABEL ? true : !!state.packagingSelection,
      isAvailable: state.serviceSubType === ServiceSubType.WHITELABEL ? state.wantsToContinueQuote : !!state.volumeFormatSelection
    },
    {
      id: 6,
      title: "Dati di Contatto",
      description: "Finalizza la richiesta",
      component: state.serviceSubType === ServiceSubType.WHITELABEL ? Step6Design : Step6ContactPrivateLabel,
      isCompleted: state.paymentCompleted,
      isAvailable: state.serviceSubType === ServiceSubType.WHITELABEL ? state.wantsToContinueQuote : !!state.packagingSelection
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

  // Progress calculation enterprise  
  // const completedSteps = steps.filter(step => step.isCompleted).length // Future use

  const renderStepTitle = () => (
    <div className="mb-8">
      <h3 className="text-3xl font-bold text-gray-900 mb-2">
        {currentStep.title}
      </h3>
      <p className="text-gray-600 text-base">
        {currentStep.description}
      </p>
    </div>
  )

  const renderStepContent = () => {
    const StepComponent = currentStep.component
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 h-[520px] flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          {/* Step mini description - Left side */}
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {/* Step-specific descriptions will be shown here */}
              {currentStepIndex === 0 && "Seleziona il paese di destinazione"}
              {currentStepIndex === 1 && "Scegli il tipo di servizio che meglio si adatta alle tue esigenze"}
              {currentStepIndex === 2 && state.serviceSubType === 'whitelabel' && "Scegli la quantità di lattine da 200ml per il tuo ordine White Label"}
              {currentStepIndex === 2 && state.serviceSubType === 'privatelabel' && "Che bevanda vuoi creare?"}
              {currentStepIndex === 3 && state.serviceSubType === 'whitelabel' && "Ecco il tuo preventivo per l'ordine White Label"}
              {currentStepIndex === 3 && state.serviceSubType === 'privatelabel' && "Seleziona volume di produzione e formato lattina"}
              {currentStepIndex === 4 && state.serviceSubType === 'whitelabel' && "Scarica il template per creare la tua etichetta personalizzata"}
              {currentStepIndex === 4 && state.serviceSubType === 'privatelabel' && "Scegli il tipo di packaging per la tua bevanda"}
              {currentStepIndex === 5 && "Inserisci i tuoi dati per completare la richiesta"}
            </p>
          </div>
          
          {/* Navigation CTA - Right side */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={goPrevious}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                currentStepIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    : 'bg-[#ed6d23] text-white hover:bg-[#d55a1a]'
                }`}
              >
                Avanti →
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
          <StepComponent />
        </div>
      </div>
    )
  }


  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with Logo */}
      <header className="flex justify-between items-center py-4 bg-white">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <img 
            src="/logo-124.png" 
            alt="124 Logo" 
            className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = '/'}
          />
          <div className="text-sm text-gray-600">
            Step {state.currentStep} di {steps.length}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-4">
        {/* Step Title - Outside box */}
        <div className="mt-0">
          {renderStepTitle()}
        </div>

        {/* Step Content - Fixed size */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">
            {renderStepContent()}
          </div>
        </div>


      </div>
    </div>
  )
}