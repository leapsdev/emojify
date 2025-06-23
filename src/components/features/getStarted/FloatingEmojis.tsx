'use client';

import dynamic from 'next/dynamic';

const EMOJIS = [
  '😊',
  '😎',
  '🌟',
  '🎉',
  '🚀',
  '🌈',
  '🍕',
  '🎸',
  '🏆',
  '🌺',
  '🦄',
  '🍦',
];

const FloatingEmojis = () => {
  const positions = EMOJIS.map(() => ({
    top: Math.random() * 80 + 10,
    left: Math.random() * 80 + 10,
    rotation: Math.random() * 30 - 15,
  }));

  return (
    <div className="absolute inset-0">
      {EMOJIS.map((emoji, idx) => (
        <div
          key={emoji}
          className={`floating-element absolute text-4xl bg-gray-100 rounded-2xl p-4 shadow-md ${
            idx % 2 === 0 ? 'animate-float' : 'animate-float-reverse'
          }`}
          style={{
            top: `${positions[idx].top}%`,
            left: `${positions[idx].left}%`,
            transform: `rotate(${positions[idx].rotation}deg)`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

// dynamicインポートでクライアントサイドレンダリングのコンポーネントを作成
export const DynamicFloatingEmojis = dynamic(
  () => Promise.resolve(FloatingEmojis),
  { ssr: false },
);

export default FloatingEmojis;
