'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useUpdateSessionUser } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { removeAvatar, uploadAvatar } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

const RING = 2 * Math.PI * 46; // circumference for r=46 in a 100×100 viewBox

/** Circular progress around the avatar: upload percentage, then an indeterminate "processing" sweep. */
function ProgressRing({ percent, processing }) {
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-1.5 size-[calc(100%+0.75rem)] -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className={processing ? 'origin-center animate-spin text-secondary [animation-duration:1.1s]' : 'text-primary transition-[stroke-dashoffset] duration-200 ease-out'}
        strokeDasharray={RING}
        strokeDashoffset={processing ? RING * 0.72 : RING * (1 - percent / 100)}
      />
    </svg>
  );
}

/**
 * Profile photo picker with live upload progress. Validation (type, size,
 * decoding) happens in the API; its success or error message is shown as-is.
 */
export default function AvatarUploader({ user }) {
  const { t } = useI18n();
  const input = useRef(null);
  const updateUser = useUpdateSessionUser();
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  // Revoke the local object URL once it's no longer shown.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const done = {
    onSuccess: (result) => {
      updateUser(result.data);
      toast.success(result.message);
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  };
  const upload = useMutation({
    mutationFn: (file) => uploadAvatar(file, setProgress),
    ...done,
    onSettled: () => setPreview(null),
  });
  const remove = useMutation({ mutationFn: removeAvatar, ...done });

  const onPick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setProgress(0);
    setPreview(URL.createObjectURL(file));
    upload.mutate(file);
  };

  const uploading = upload.isPending;
  const processing = uploading && progress >= 100;
  const shown = preview ? { ...user, avatarUrl: preview } : user;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          aria-label={user.avatarUrl ? t('avatar.changeLabel') : t('avatar.uploadLabel')}
          className="group relative block rounded-full focus-visible:outline-offset-4"
        >
          <Avatar user={shown} size="xl" className="size-28 text-4xl ring-4 ring-surface" />
          <span
            className={`absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white transition-opacity duration-200 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
          >
            {uploading ? (
              <span className="text-sm font-semibold tabular-nums" aria-live="polite">
                {processing ? t('avatar.optimizing') : `${progress}%`}
              </span>
            ) : (
              <Camera className="size-6" aria-hidden="true" />
            )}
          </span>
        </button>
        {uploading && <ProgressRing percent={progress} processing={processing} />}
        {uploading && (
          <span className="sr-only" role="status">
            {processing ? t('avatar.processingStatus') : t('avatar.uploadingStatus', { progress })}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="secondary" disabled={uploading} onClick={() => input.current?.click()}>
          <Camera className="size-4" aria-hidden="true" />
          {user.avatarUrl ? t('avatar.change') : t('avatar.upload')}
        </Button>
        {user.avatarUrl && !uploading && (
          <Button size="sm" variant="ghost" loading={remove.isPending} onClick={() => remove.mutate()}>
            <Trash2 className="size-4" aria-hidden="true" />
            {t('avatar.remove')}
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-foreground-subtle">{t('avatar.requirements')}</p>
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
  );
}
