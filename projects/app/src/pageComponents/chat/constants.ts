export enum ChatSidebarPaneEnum {
  SETTING = 's',
  TEAM_APPS = 'ta',
  RECENTLY_USED_APPS = 'ra',
  CONSOLE = 'c',

  // these two features are only available in the commercial version
  HOME = 'h',
  FAVORITE_APPS = 'fa'
}

/**
 * 0: expanded
 * 1: folded
 */
export type CollapseStatusType = 0 | 1;
export const defaultCollapseStatus: CollapseStatusType = 0; // default expanded

export enum ChatSettingTabOptionEnum {
  HOME = 'home',
  FAVORITE_APPS = 'favorite_apps',
  DATA_DASHBOARD = 'data_dashboard',
  LOG_DETAILS = 'log_details'
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
const _brand = process.env.NEXT_PUBLIC_BRAND || 'hw';
export const getLogoBannerUrl = (brand?: string) => {
  const _brand = brand || process.env.NEXT_PUBLIC_BRAND || 'hw';
  return _brand === 'htlc'
    ? `${BASE_URL}/imgs/chat/htlc_banner.png`
    : `${BASE_URL}/imgs/chat/hw_alope_banner.png`;
};

export const getLogoBannerCollapsedUrl = (brand?: string) => {
  const _brand = brand || process.env.NEXT_PUBLIC_BRAND || 'hw';
  return _brand === 'htlc'
    ? `${BASE_URL}/imgs/chat/htlc_banner_fold.png`
    : `${BASE_URL}/imgs/chat/hw_alope_banner_fold.png`;
};
