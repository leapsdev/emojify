'use client';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  // authモードでは何も処理しない
  if (mode === 'auth') {
    return null;
  }

  // profileモードの場合も何も処理しない
  // profile作成後のリダイレクトはCreateProfilePageで処理
  return null;
};
