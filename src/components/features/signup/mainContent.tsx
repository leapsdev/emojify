import type { FC } from 'react';

const MainContent: FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center text-center">
      <h1 className="text-4xl md:text-6xl font-black">
        <span className="text-gray-900">No Words,</span>
        <span className="creative-text text-yellow-400 mx-2">Just</span>
        <span className="text-gray-900">Emojis</span>
      </h1>
    </div>
  );
};

export default MainContent;
