import { EMOJI_ITEMS } from '../contents';
import { EmojiItem } from './emojiItem';

export function EmojiList() {
  return (
    <div className="p-2 flex-1">
      <div className="grid grid-cols-2 gap-2">
        {EMOJI_ITEMS.map((item, index) => (
          <EmojiItem key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
