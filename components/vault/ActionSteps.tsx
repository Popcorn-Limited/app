import { ActionStep } from "@/lib/vault/getActionSteps"

function getStepColor(preFix: string, step: any): string {
  if (step.loading) return `${preFix}-primary`
  if (step.success) return `${preFix}-green-500`
  if (step.error) return `${preFix}-red-500`
  return `${preFix}-primaryLight`
}

interface ActionStepsProps {
  steps: ActionStep[]
}

export default function ActionSteps({ steps }: ActionStepsProps): JSX.Element {
  return (
    <div className="flex flex-row items-center">
      {
        steps.map(i => <>
          <div key={i.label} className={`w-8 h-8 rounded-full border leading-none flex justify-center items-center cursor-default ${getStepColor("border", i)}`}>
            {i.loading ? <img src="/images/loader/spinner.svg" className="w-6 h-6"/> : <p className={`mt-0.5 ${getStepColor("text", i)}`}>{i.step}</p>}
          </div>
          {i.step < steps.length && <p className={`mt-0.5 ${getStepColor("text", i)}`}>-----&gt;</p>}
        </>)
      }
    </div>
  )
}