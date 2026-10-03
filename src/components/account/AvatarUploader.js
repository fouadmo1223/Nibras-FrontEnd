'use client';

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useUpdateSessionUser } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/api-errors';
import { removeAvatar, uploadAvatar } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

/**
 * Profile photo picker. Validation (type, size, decoding) happens in the API;
 * its success or error message is shown as-is.
 */
export default function AvatarUploader({ user }) {
  const input = useRef(null);
  const updateUser = useUpdateSessionUser();
  const handlers = {
    onSuccess: (result) => {
      updateUser(result.data);
      toast.success(result.message);
    },
    onError: (error) => toast.error(errorMessage(error)),
  };
  const upload = useMutation({ mutationFn: uploadAvatar, ...handlers });
  const remove = useMutation({ mutationFn: removeAvatar, ...handlers });

  const onPick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (file) upload.mutate(file);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <Avatar user={user} size="xl" />
        {upload.isPending && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/45 text-xs font-medium text-white">
            Uploading…
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" loading={upload.isPending} onClick={() => input.current?.click()}>
            <Camera className="size-4" aria-hidden="true" />
            {user.avatarUrl ? 'Change photo' : 'Upload photo'}
          </Button>
          {user.avatarUrl && (
            <Button size="sm" variant="ghost" loading={remove.isPending} onClick={() => remove.mutate()}>
              <Trash2 className="size-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-foreground-subtle">JPG, PNG, WebP, GIF or HEIC · up to 5 MB</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={onPick}
        />
      </div>
    </div>
  );
}
