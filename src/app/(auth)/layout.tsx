import { BrandMark } from "@/components/common";
import { IconDashboard, IconLeads, IconTeam } from "@/components/common/icons";

const VALUE_PROPS = [
  { icon: IconLeads, text: "Each company's leads stay fully isolated." },
  { icon: IconDashboard, text: "Live status breakdowns and recent activity in one view." },
  { icon: IconTeam, text: "Role-based access for admins, managers, and reps." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-panel-bg px-10 py-12 text-brand-panel-text md:flex">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <span className="font-brand text-4xl tracking-tight">LeadFlow</span>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="font-heading max-w-sm text-2xl leading-snug text-brand-panel-text">
            Sign in to manage your pipeline.
          </h1>
          <ul className="flex flex-col gap-4">
            {VALUE_PROPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-brand-panel-text-soft">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-panel-surface text-brand-panel-accent">
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-brand-panel-text-soft">
          Multi-tenant by design. Company A never sees Company B.
        </p>
      </div>

      <div className="flex items-center justify-center bg-paper px-4 py-12">{children}</div>
    </div>
  );
}
