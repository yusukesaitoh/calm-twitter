export const DEFAULT_SETTINGS = {
  isExploreHidden: true,
  isTrendsHidden: true,
  isReactionNumberHidden: true,
  isViewCountHidden: true,
  showCalmText: true,
  isFollowingNumberHidden: false,
  isFollowerNumberHidden: false,
  isReactionNumberAlwaysHidden: false,
  isReactionNumberDetailHidden: false,
  isWhoToFollowHidden: false,
  isTopicsToFollowHidden: false,
  isFontChanged: false,
} as const;

export const SECTION_STATES = {
  openSectionBasic: true,
  openSectionX: true,
  openSectionAdditional: true,
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type SectionStateKey = keyof typeof SECTION_STATES;
