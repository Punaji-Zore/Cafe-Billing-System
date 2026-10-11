const EMOJI = { Coffee: '☕', Bakery: '🥐', Snacks: '🥪', Beverage: '🧋' };

export const emojiFor = (category) => EMOJI[category] || '🍽️';
export const money = (n) => `₹${Number(n || 0).toFixed(2)}`;
