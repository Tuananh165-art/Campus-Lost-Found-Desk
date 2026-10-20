import { LostItem } from './lostItems';

export type FormState = {
  title: string;
  category: LostItem['category'];
  locationFound: string;
  reporterName: string;
  photoUri: string | null;
};
export type FormAction =
  | { type: 'title'; value: string }
  | { type: 'category'; value: LostItem['category'] }
  | { type: 'location'; value: string }
  | { type: 'reporter'; value: string }
  | { type: 'photo'; value: string | null };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'title': return { ...state, title: action.value };
    case 'category': return { ...state, category: action.value };
    case 'location': return { ...state, locationFound: action.value };
    case 'reporter': return { ...state, reporterName: action.value };
    case 'photo': return { ...state, photoUri: action.value };
  }
}
export function validateForm(state: FormState, items: readonly LostItem[]) {
  const title = state.title.trim();
  return {
    title: !title ? 'Tên món đồ là bắt buộc.' : state.title.length > 40 ? 'Tên tối đa 40 ký tự.' :
      items.some(item => item.title.trim().toLocaleLowerCase('vi') === title.toLocaleLowerCase('vi')) ? 'Tên món đồ đã tồn tại.' : '',
    locationFound: state.locationFound.trim() ? '' : 'Nhập nơi tìm thấy.',
    reporterName: state.reporterName.trim() ? '' : 'Nhập người báo.',
  };
}
