import { GALLERY_ITEMS } from '../contents';
import { GalleryItem } from './galleryItem';

export function EmojiGallery() {
  return (
    <main>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {GALLERY_ITEMS.map((item, index) => (
            <GalleryItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
