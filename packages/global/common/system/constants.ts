export const HUMAN_ICON = `/icon/human.svg`;
const _brand = process.env.NEXT_PUBLIC_BRAND || 'hw';
export const LOGO_ICON = _brand === 'htlc' ? `/icon/htlc-logo.svg` : `/icon/hw-logo.png`;
export const HUGGING_FACE_ICON = `/imgs/model/huggingface.svg`;

export const DEFAULT_TEAM_AVATAR = `/imgs/avatar/defaultTeamAvatar.svg`;
export const DEFAULT_ORG_AVATAR = '/imgs/avatar/defaultOrgAvatar.svg';
export const DEFAULT_USER_AVATAR = '/imgs/avatar/BlueAvatar.svg';

export const isProduction = process.env.NODE_ENV === 'production';
export const isTestEnv = process.env.NODE_ENV === 'test';
