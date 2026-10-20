import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { STUDENT } from '../config/student';

export type PhotoResult = { kind: 'picked'; uri: string } | { kind: 'cancelled' } | { kind: 'denied'; canAskAgain: boolean };
export async function attachPhoto(source: 'camera' | 'library'): Promise<PhotoResult> {
  const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { kind: 'denied', canAskAgain: permission.canAskAgain };
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsEditing: false };
  const picked = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (picked.canceled) return { kind: 'cancelled' };
  const context = ImageManipulator.manipulate(picked.assets[0].uri);
  context.resize({ width: Math.min(picked.assets[0].width, 1600) });
  const rendered = await context.renderAsync();
  try {
    const compressed = await rendered.saveAsync({ compress: STUDENT.imageQuality, format: SaveFormat.JPEG });
    const directory = new Directory(Paths.document, 'lostfound-photos');
    directory.create({ idempotent: true, intermediates: true });
    const destination = new File(directory, `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
    new File(compressed.uri).copy(destination);
    return { kind: 'picked', uri: destination.uri };
  } finally { rendered.release(); context.release(); }
}
export async function clearPhotos() {
  const directory = new Directory(Paths.document, 'lostfound-photos');
  if (directory.exists) directory.delete();
}
