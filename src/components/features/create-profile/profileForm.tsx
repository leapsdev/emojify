'use client';

import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createProfile } from '@/repository/user/actions';
import { profileFormSchema } from '@/repository/user/schema';
import type { z } from 'zod';

type FormState = {
  message: string;
  status: 'error' | 'success';
} | null;

const initialState: FormState = null;

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState<FormState>(async (): Promise<FormState> => {
    try {
      const formElement = document.getElementById('profile-form');
      if (!formElement) {
        return {
          message: 'フォームの初期化に失敗しました',
          status: 'error',
        };
      }

      const submission = parseWithZod(new FormData(formElement as HTMLFormElement), {
        schema: profileFormSchema,
      });

      if (submission.status === "error") {
        if (!submission.error) {
          return {
            message: 'バリデーションエラーが発生しました',
            status: 'error',
          };
        }
        
        const firstError = Object.entries(submission.error)
          .find(([, errors]) => errors && errors.length > 0);
        
        return {
          message: firstError?.[1]?.[0] || 'バリデーションエラーが発生しました',
          status: 'error',
        };
      }

      const formData = Object.fromEntries(
        Object.entries(submission.payload).map(([key, value]) => [
          key,
          'value' in (value as { value: unknown }) ? (value as { value: unknown }).value : value
        ])
      ) as z.infer<typeof profileFormSchema>;

      await createProfile(formData);
      return {
        message: 'プロフィールを作成しました',
        status: 'success',
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'エラーが発生しました',
        status: 'error',
      };
    }
  }, initialState);


  const [form, fields] = useForm({
    id: 'profile-form',
    shouldValidate: 'onBlur',
    lastResult: state,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileFormSchema });
    },
  });

  return (
    <form className="space-y-6" id={form.id} onSubmit={form.onSubmit} action={formAction}>
      {state?.message && (
        <div
          className={`p-4 rounded-lg ${
            state.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
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
          <span className="text-gray-500">Required</span>
        </div>
        <Input
          id={fields.username.id}
          name={fields.username.name}
          className={`rounded-2xl border-gray-200 bg-gray-50 px-4 py-6 text-lg ${
            fields.username.errors ? 'border-red-500' : ''
          }`}
          required
        />
        {fields.username.errors && (
          <p className="text-red-500 text-sm">{fields.username.errors}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={fields.displayName.id} className="text-lg font-medium">
          Display name
        </label>
        <Input
          id={fields.displayName.id}
          name={fields.displayName.name}
          placeholder="Your name"
          className={`rounded-2xl border-gray-200 bg-gray-50 px-4 py-6 text-lg ${
            fields.displayName.errors ? 'border-red-500' : ''
          }`}
        />
        {fields.displayName.errors && (
          <p className="text-red-500 text-sm">{fields.displayName.errors}</p>
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
            maxLength={300}
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
          {isPending ? '作成中...' : 'プロフィールを作成'}
        </Button>
      </div>
    </form>
  );
}
