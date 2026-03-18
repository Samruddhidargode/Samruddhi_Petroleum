const steps = ["Start", "Sales", "Cash", "Payments", "Summary", "Confirm"];

export default function Stepper() {
  return (
    <div className="my-4 flex flex-wrap gap-2">
      {steps.map((step) => (
        <span
          key={step}
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
        >
          {step}
        </span>
      ))}
    </div>
  );
}
