'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getBasename } from '@/lib/basename/basename';
import { profileFormSchema } from '@/repository/db/user/schema';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';

import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { handleProfileFormAction } from './action';
import type { ProfileFormState } from './action';

const initialState: ProfileFormState = null;

export const ProfileForm = forwardRef<HTMLFormElement>(
  function ProfileForm(_, ref) {
    const { isMiniApp } = useIsMiniApp();
    const { walletAddress } = useUnifiedAuth();
    const [basename, setBasename] = useState<string>('');

    const getAddress = useCallback(async () => {
      if (!walletAddress) {
        return;
      }
      const result = await getBasename(walletAddress as `0x${string}`);
      if (result) {
        setBasename(result);
      }
      return result;
    }, [walletAddress]);

    useEffect(() => {
      if (walletAddress) {
        getAddress();
      }
    }, [getAddress, walletAddress]);
    // 送信されるuserIdを計算（統合認証から取得したウォレットアドレス）
    const userId = walletAddress || '';

    const [state, formAction, isPending] = useActionState(
      handleProfileFormAction,
      initialState,
    );

    const [form, fields] = useForm({
      id: 'profile-form',
      shouldValidate: 'onInput',
      lastResult: state,
      onValidate({ formData }) {
        return parseWithZod(formData, { schema: profileFormSchema });
      },
    });

    return (
      <form
        ref={ref}
        className="space-y-6"
        id={form.id}
        onSubmit={form.onSubmit}
        action={formAction}
      >
        <input type="hidden" name={fields.imageUrl.name} />
        <input type="hidden" name="userId" value={userId} />
        <input
          type="hidden"
          name="isMiniApp"
          value={isMiniApp ? 'true' : 'false'}
        />

        {state?.message && (
          <div
            className={`p-4 rounded-lg ${
              state.status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor={fields.username.id} className="text-lg font-medium">
              Username
            </label>
          </div>
          <Input
            id={fields.username.id}
            name={fields.username.name}
            className={`rounded-2xl border-gray-200 bg-gray-50 px-4 py-6 text-lg ${
              fields.username.errors ? 'border-red-500' : ''
            }`}
            defaultValue={basename}
            required
          />
          {fields.username.errors && (
            <p className="text-red-500 text-sm">{fields.username.errors}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor={fields.bio.id} className="text-lg font-medium">
            Bio
          </label>
          <div className="relative">
            <Textarea
              id={fields.bio.id}
              name={fields.bio.name}
              placeholder="Tell us about you..."
              className={`rounded-2xl border-gray-200 bg-gray-50 min-h-[150px] p-4 text-lg resize-none ${
                fields.bio.errors ? 'border-red-500' : ''
              }`}
            />
            {fields.bio.errors && (
              <p className="text-red-500 text-sm">{fields.bio.errors}</p>
            )}
          </div>
        </div>

        <div className="p-4 mt-auto">
          <Button
            type="submit"
            className="w-full bg-black text-white rounded-full py-6 text-lg font-bold hover:bg-gray-900"
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Profile'}
          </Button>
        </div>
      </form>
    );
  },
);
