import { STUDENT } from '../config/student';
export const light = {
  bg: '#F6F4F1', card: '#FFFFFF', text: '#232521', muted: '#686A63',
  accent: `hsl(${STUDENT.accentHue}, 68%, 38%)`, border: '#DADBD5',
  onAccent: '#FFFFFF', success: '#246344', danger: '#AC2820', subtle: '#EFEAE5',
  accentSoft: '#FCEBE6', accentEnd: `hsl(${STUDENT.accentHue}, 74%, 46%)`,
  successSoft: '#E7F3EC', dangerSoft: '#FBE9E7', onDanger: '#FFFFFF',
  hero: '#F9E8E0', heroEnd: '#F5F1EC', shadow: '#372019', ghost: '#FCFAF7',
};
export const dark = {
  bg: '#161918', card: '#222725', text: '#F4F3EE', muted: '#B3BAB5',
  accent: `hsl(${STUDENT.accentHue}, 85%, 74%)`, border: '#46514B',
  onAccent: '#211815', success: '#8FDFB3', danger: '#FFB1A8', subtle: '#303733',
  accentSoft: '#3C2B29', accentEnd: `hsl(${STUDENT.accentHue}, 80%, 65%)`,
  successSoft: '#203C2E', dangerSoft: '#412B2A', onDanger: '#321A17',
  hero: '#322725', heroEnd: '#222725', shadow: '#000000', ghost: '#1B201E',
};
export type Palette = typeof light;
