import { Fragment } from "react";
import { Images } from "@/lib/assets";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import type { CustomRole } from "@/lib/careers";
import { useT } from "@/i18n/LocaleProvider";

// Shared by the Careers page and the application page: which internships are open, and their content.

/** What the dashboard (/admin/careers) holds, read on the server for each visit. */
export interface CareersProps {
  /** Ids of the internships closed to applications. */
  closedRoles: string[];
  /** Internships written in the dashboard: added ones, and rewritten built-in ones (under the built-in id). */
  customRoles: CustomRole[];
  /** Ids of the built-in internships deleted in the dashboard. */
  removedRoles: string[];
}

const ROLE_PICTURE_FILES = {
  lab: Images.careers.researchIntern,
  nutrition: Images.careers.animalNutrition,
  office: Images.careers.hrMarketing,
};

/**
 * The open internships: the site's own, then the ones added in the dashboard. A built-in internship is in the
 * visitor's language until it's rewritten in the dashboard; from then on it shows as written there, like an added one.
 */
export function useOpenRoles({ closedRoles, customRoles, removedRoles }: CareersProps) {
  const t = useT().careers;
  const written = (role: CustomRole) => ({ ...role, bgImage: ROLE_PICTURE_FILES[role.picture] });
  const builtInIds = INTERNSHIP_ROLES.map((role) => role.id);
  return [
    ...INTERNSHIP_ROLES.map((role, i) => {
      const rewritten = customRoles.find((item) => item.id === role.id);
      return rewritten ? written(rewritten) : { id: role.id, bgImage: role.bgImage, ...t.roles[i] };
    }),
    ...customRoles.filter((role) => !builtInIds.includes(role.id)).map(written),
  ].filter((role) => !closedRoles.includes(role.id) && !removedRoles.includes(role.id));
}

/** Where an internship's application form is, before the language prefix: /careers/apply/research-intern. */
export const applyPath = (roleId: string) => `/careers/apply/${roleId}`;

/** Fills {name} placeholders in a translated sentence with links or other elements. */
export function fill(template: string, parts: Record<string, React.ReactNode>) {
  return template.split(/\{(\w+)\}/).map((piece, i) => (i % 2 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}
