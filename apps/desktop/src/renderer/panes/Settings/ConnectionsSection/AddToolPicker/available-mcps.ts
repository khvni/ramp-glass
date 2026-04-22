/**
 * Catalog of MCP integrations the picker can surface.
 *
 * Every MVP row is `available: false`. Post-MVP, flipping the flag + adding a
 * click handler inside `AddToolPicker` is the only change needed here — no
 * other call sites read this list.
 */
export type AvailableMcp = {
  readonly id: string;
  readonly label: string;
  readonly blurb: string;
  readonly ticket: string;
  readonly ticketUrl: string;
  readonly available: boolean;
};

export const AVAILABLE_MCPS: ReadonlyArray<AvailableMcp> = [
  {
    id: 'github',
    label: 'GitHub',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-158',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-158',
    available: false,
  },
  {
    id: 'linear',
    label: 'Linear',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-159',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-159',
    available: false,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-160',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-160',
    available: false,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-161',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-161',
    available: false,
  },
  {
    id: 'drive',
    label: 'Drive',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-162',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-162',
    available: false,
  },
  {
    id: 'slack',
    label: 'Slack',
    blurb: 'Coming soon — needs sign-in',
    ticket: 'TIN-163',
    ticketUrl: 'https://linear.app/tinker/issue/TIN-163',
    available: false,
  },
];
