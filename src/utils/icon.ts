// Category icons are stored either as an emoji (new default tree) or as a Vant
// icon name (legacy / user data created before the emoji switch). Vant icon
// names are plain lowercase-ascii-with-dashes; anything else is treated as an
// emoji and rendered as text.
export function isEmojiIcon(icon: string | undefined | null): boolean {
  if (!icon) return false;
  return !/^[a-z0-9-]+$/.test(icon);
}

// Emoji choices for the icon pickers.
export const EMOJI_CHOICES = [
  '🍴', '🥐', '🍱', '🍚', '🍿', '🧋', '☕', '🍎', '🥬', '🧂',
  '🛒', '👕', '📱', '🛋️', '🧺', '🎬', '🎮', '🏀', '🎤', '🎵',
  '🏠', '🏢', '💡', '📶', '🏥', '💊', '🩺', '📋', '📚', '📖',
  '🎓', '✏️', '🎁', '🧧', '🍻', '💄', '🧴', '💇', '🧳', '🏨',
  '🎫', '🚗', '🚌', '🚇', '🚕', '⛽', '🅿️', '📞', '🍼', '🧸',
  '👑', '📺', '☁️', '💰', '💵', '🏅', '💼', '💸', '📈', '🏦',
  '📊', '🎉', '✨', '💲', '🔧', '🧾',
];
