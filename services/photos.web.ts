import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { STUDENT } from '../config/student';
import type { PhotoResult } from './photos';
// Browser preview has no app document directory; native path is implemented in photos.ts.
export async function attachPhoto(source: 'camera' | 'library'): Promise<PhotoResult> {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  const picked = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (picked.canceled) return { kind: 'cancelled' };
  const context = ImageManipulator.manipulate(picked.assets[0].uri);
  const image = await context.renderAsync();
  try { const result = await image.saveAsync({ compress: STUDENT.imageQuality, format: SaveFormat.JPEG }); return { kind: 'picked', uri: result.uri }; }
  finally { image.release(); context.release(); }
}
export async function clearPhotos() { /* Browser preview images do not enter a native document directory. */ }
