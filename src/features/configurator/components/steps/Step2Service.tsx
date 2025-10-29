'use client'

import { useConfigurator, ServiceType, ServiceSubType } from '@/context'

export function Step2Service() {
  const { state, actions } = useConfigurator()

  const serviceSubTypes = [
    {
      subType: ServiceSubType.WHITELABEL,
      name: 'White Label',
      description: 'Soluzioni pronte da personalizzare con il tuo brand',
      features: ['Preventivo immediato', 'Template predefiniti', 'Consegna rapida']
    },
    {
      subType: ServiceSubType.PRIVATELABEL,
      name: 'Private Label', 
      description: 'Packaging completamente personalizzato per il tuo brand',
      features: ['Design su misura', 'Integrazione brand completa', 'Materiali premium']
    }
  ]

  const handleServiceSubTypeSelect = (serviceSubType: ServiceSubType) => {
    actions.setServiceSubType(serviceSubType)
    // Impostiamo automaticamente un service type di default
    if (!state.serviceType) {
      actions.setServiceType(ServiceType.STANDARD)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
        <div className="space-y-4 lg:grid lg:grid-cols-1 lg:gap-4 lg:space-y-0">
          {serviceSubTypes.map((service) => (
            <div
              key={service.subType}
              onClick={() => handleServiceSubTypeSelect(service.subType)}
              className={`border rounded-lg p-4 md:p-6 cursor-pointer transition-all ${
                state.serviceSubType === service.subType 
                  ? 'border-[#ed6d23] border-2' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-xs md:text-sm text-gray-500 flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  state.serviceSubType === service.subType
                    ? 'border-[#ed6d23] bg-[#ed6d23]'
                    : 'border-gray-300'
                }`}>
                  {state.serviceSubType === service.subType && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}