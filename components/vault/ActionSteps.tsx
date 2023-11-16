import { ActionStep } from "@/lib/vault/getActionSteps"
import { XMarkIcon } from "@heroicons/react/24/outline"

function getStepColor(preFix: string, step: any): string {
  if (step.loading || step.success) return `${preFix}-green-500`
  if (step.error) return `${preFix}-red-500`
  return `${preFix}-warmGray`
}

interface ActionStepsProps {
  steps: ActionStep[];
  stepCounter: number;
}

export default function ActionSteps({ steps, stepCounter }: ActionStepsProps): JSX.Element {
  return (
    <div className="flex flex-row items-center">
      {
        steps.map((step, i) => <>
          <div
            key={step.label}
            className={`w-8 h-8 rounded-full border leading-none flex justify-center items-center cursor-default bg-opacity-40
              ${i === stepCounter ? "border-[#FFE650] bg-[#FFE650]" : `${getStepColor("border", step)} ${getStepColor("bg", step)}`}`}
          >
            {step.loading && <img src="/images/loader/puff.svg" className={`h-6 w-6 text-primaryLight`} />}
            {!step.loading && step.error && <XMarkIcon className="h-4 w-4 text-red-500" />}
            {!step.loading && step.success && <img src="/images/icons/checkIcon.svg" className={`h-4 w-4`} />}
            {!step.loading && !step.error && !step.success && <div className={`rounded-full h-3 w-3 ${i === stepCounter ? "bg-[#FFE650]" : "bg-primaryLight bg-opacity-80"}`} />}
          </div>
          {step.step < steps.length && <p className={`mb-3 tracking-none text-primaryLight`}>________</p>}
        </>)
      }
    </div>
  )
}