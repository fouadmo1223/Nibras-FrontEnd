'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { certificateDownloadUrl, certificateKeys, listMyCertificates } from '@/services/certificates.service';

/** The signed-in user's earned certificates. Shown on the account page. */
export default function CertificatesCard() {
  const { t, locale, format } = useI18n();
  const certificates = useQuery({ queryKey: certificateKeys.mine(), queryFn: listMyCertificates });
  const rows = certificates.data ?? [];

  if (certificates.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('account.certificates.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (certificates.isError) return <Alert tone="error" title={errorMessage(certificates.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Award className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-foreground-muted">{t('account.certificates.empty')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((cert) => {
        const title = locale === 'ar' ? cert.enrollment.course.titleAr : cert.enrollment.course.titleEn;
        return (
          <li key={cert.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{title}</p>
              <p className="text-xs text-foreground-subtle">{t('account.certificates.issuedOn', { date: format.date(cert.issuedAt, { dateStyle: 'medium' }) })}</p>
            </div>
            <a
              href={certificateDownloadUrl(cert.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border-strong px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              <Download className="size-3.5" aria-hidden="true" />
              {t('account.certificates.download')}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
