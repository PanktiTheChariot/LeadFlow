import { forwardRef, type SVGProps } from "react";

/**
 * Majesticons (MIT, majesticons.com) - the `majesticons` npm package ships
 * raw SVG files with no React bindings, so these wrap the "line" style paths
 * we actually use as typed components with a lucide-compatible `size` prop,
 * letting every consumer (StatCard, nav items, etc.) treat this the same way
 * regardless of which icon library backs it.
 */
export type IconProps = SVGProps<SVGSVGElement> & { size?: number };
export type IconComponent = typeof IconDashboard;

function createIcon(displayName: string, children: React.ReactNode) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function IconImpl(
    { size = 24, strokeWidth = 2, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {children}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

export const IconDashboard = createIcon(
  "IconDashboard",
  <path d="M20 19v-8.5a1 1 0 0 0-.4-.8l-7-5.25a1 1 0 0 0-1.2 0l-7 5.25a1 1 0 0 0-.4.8V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1zM8 13v3m4-6v6m4-1v1" />,
);

export const IconLeads = createIcon(
  "IconLeads",
  <>
    <circle cx="12" cy="10" r="3" />
    <path d="M17 17c0-2.21-2.239-4-5-4s-5 1.79-5 4" />
    <rect width="18" height="18" x="3" y="3" rx="3" />
  </>,
);

export const IconTeam = createIcon(
  "IconTeam",
  <>
    <circle cx="9" cy="9" r="4" />
    <path d="M16 19c0-3.314-3.134-6-7-6s-7 2.686-7 6m13-6a4 4 0 1 0-3-6.646" />
    <path d="M22 19c0-3.314-3.134-6-7-6-.807 0-2.103-.293-3-1.235" />
  </>,
);

export const IconMenu = createIcon("IconMenu", <path d="M6 8h12M6 12h12M6 16h12" />);

export const IconClose = createIcon("IconClose", <path d="M12 12 7 7m5 5 5 5m-5-5 5-5m-5 5-5 5" />);

export const IconSearch = createIcon(
  "IconSearch",
  <path d="m20 20-4.05-4.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9z" />,
);

export const IconLogout = createIcon(
  "IconLogout",
  <path d="M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8m4-9-4-4m4 4-4 4m4-4H9" />,
);

export const IconLink = createIcon(
  "IconLink",
  <path d="M15 8h2c1.333 0 4 .8 4 4s-2.667 4-4 4h-2M9 8H7c-1.333 0-4 .8-4 4s2.667 4 4 4h2m-1-4h8" />,
);

export const IconChevronDown = createIcon("IconChevronDown", <path d="m6 9 6 6 6-6" />);

export const IconChevronLeft = createIcon("IconChevronLeft", <path d="m15 18-6-6 6-6" />);

export const IconChevronRight = createIcon("IconChevronRight", <path d="m9 18 6-6-6-6" />);

export const IconCheck = createIcon("IconCheck", <path d="M20 6 9 17l-5-5" />);

export const IconTrash = createIcon(
  "IconTrash",
  <path d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m3 0-.87 12.14A2 2 0 0 1 15.14 21H8.86a2 2 0 0 1-1.99-1.86L6 7m4 4v6m4-6v6" />,
);

export const IconPlus = createIcon("IconPlus", <path d="M12 5v14M5 12h14" />);

export const IconEdit = createIcon(
  "IconEdit",
  <>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </>,
);

export const IconNotes = createIcon(
  "IconNotes",
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13h8M8 17h8" />
  </>,
);

export const IconCopy = createIcon(
  "IconCopy",
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const IconBookmark = createIcon(
  "IconBookmark",
  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
);

export const IconEye = createIcon(
  "IconEye",
  <>
    <path d="M12 5c-6.307 0-9.367 5.683-9.91 6.808a.435.435 0 0 0 0 .384C2.632 13.317 5.692 19 12 19s9.367-5.683 9.91-6.808a.435.435 0 0 0 0-.384C21.368 10.683 18.308 5 12 5z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const IconEyeOff = createIcon(
  "IconEyeOff",
  <path d="M7 6.362A9.707 9.707 0 0 1 12 5c6.307 0 9.367 5.683 9.91 6.808.06.123.06.261 0 .385-.352.728-1.756 3.362-4.41 5.131M14 18.8a9.93 9.93 0 0 1-2 .2c-6.307 0-9.367-5.683-9.91-6.808a.44.44 0 0 1 0-.386c.219-.452.84-1.632 1.91-2.885m6 .843A3 3 0 0 1 14.236 14M3 3l18 18" />,
);

export const IconNew = createIcon(
  "IconNew",
  <path d="M9 8c-1.667.667-5.4 2.7-7 5.5m9.5-2.5C9.167 12.333 4 16.4 2 22m10.5-7.5c-1.167 1.167-3.8 4.1-5 6.5m7.174-14.55.673-3.285 2.225 2.51 3.027-.294-1.768 3.062 1.743 2.639-3.286-.673-2.51 2.225.19-3.156-3.062-1.768 2.768-1.26z" />,
);

export const IconQualified = createIcon(
  "IconQualified",
  <path d="M19 14c0 4-7 7-7 7s-7-3-7-7V5c1.5.167 5 0 7-2 2 2 5.5 2.167 7 2v9z" />,
);

export const IconConverted = createIcon(
  "IconConverted",
  <>
    <circle cx="12" cy="9" r="7" />
    <path d="M7 14v6.234a1 1 0 0 0 1.514.857l2.972-1.782a1 1 0 0 1 1.028 0l2.972 1.782A1 1 0 0 0 17 20.234V14" />
  </>,
);

export const IconLost = createIcon(
  "IconLost",
  <path d="M5.636 5.636a9 9 0 1 0 12.728 12.728M5.636 5.636a9 9 0 1 1 12.728 12.728M5.636 5.636 12 12l6.364 6.364" />,
);

export const IconArrowUp = createIcon("IconArrowUp", <path d="m12 5 6 6m-6-6-6 6m6-6v14" />);

export const IconArrowDown = createIcon("IconArrowDown", <path d="m12 19 6-6m-6 6-6-6m6 6V5" />);

export const IconMail = createIcon(
  "IconMail",
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>,
);

export const IconPhone = createIcon(
  "IconPhone",
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
);

export const IconBriefcase = createIcon(
  "IconBriefcase",
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </>,
);

export const IconSparkles = createIcon(
  "IconSparkles",
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />,
);

/** Google's brand mark needs its real multi-color palette, so it skips the single-stroke `createIcon` factory. */
export function IconGoogle({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
