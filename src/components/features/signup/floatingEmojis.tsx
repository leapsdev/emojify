'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

const EMOJIS = ['😊', '😎', '🌟', '🎉', '🚀', '🌈', '🍕', '🎸', '🏆', '🌺', '🦄', '🍦'];

const FloatingEmojis: FC = () => {
  const positions = EMOJIS.map(() => ({
    top: Math.random() * 80 + 10,
    left: Math.random() * 80 + 10,
    rotation: Math.random() * 30 - 15,
  }));

  return (
    <div className="absolute inset-0">
      {EMOJIS.map((emoji, index) => (
        <div
          key={`emoji-${emoji}-${index}`}
          className={`floating-element absolute text-4xl bg-gray-100 rounded-2xl p-4 shadow-md ${
            index % 2 === 0 ? 'animate-float' : 'animate-float-reverse'
          }`}
          style={{
            top: `${positions[index].top}%`,
            left: `${positions[index].left}%`,
            transform: `rotate(${positions[index].rotation}deg)`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

// dynamicインポートでクライアントサイドレンダリングのコンポーネントを作成
export const DynamicFloatingEmojis = dynamic(() => Promise.resolve(FloatingEmojis), { ssr: false });

export default FloatingEmojis;
