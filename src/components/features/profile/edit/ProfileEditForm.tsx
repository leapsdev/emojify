'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { User } from '@/repository/database';
import { profileFormSchema } from '@/repository/user/schema';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { useActionState } from 'react';
import { forwardRef } from 'react';
import { handleProfileFormAction } from './action';
import type { ProfileFormState } from './action';

interface ProfileEditFormProps {
  user: User;
}

const initialState: ProfileFormState = null;

export const ProfileEditForm = forwardRef<
  HTMLFormElement,
  ProfileEditFormProps
>(function ProfileEditForm({ user }, ref) {
  const [state, formAction, isPending] = useActionState(
    handleProfileFormAction,
    initialState,
  );

  const defaultValues = {
    username: user.username,
    bio: user.bio || '',
    email: user.email || null,
  };

  const [form, fields] = useForm({
    id: 'profile-edit-form',
    shouldValidate: 'onInput',
    lastResult: state,
    defaultValue: defaultValues,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileFormSchema });
    },
  });

  return (
    <form
      className="space-y-6"
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      ref={ref}
    >
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name={fields.email.name} value={user.email || ''} />

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
          defaultValue={user.username}
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
        <label htmlFor={fields.bio.id} className="text-lg font-medium">
          Bio
        </label>
        <div className="relative">
          <Textarea
            id={fields.bio.id}
            name={fields.bio.name}
            defaultValue={user.bio || ''}
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
          {isPending ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
});
