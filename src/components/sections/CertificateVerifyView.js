import { Award, CircleX } from 'lucide-react';
import Card from '@/components/ui/Card';
import { getI18n } from '@/i18n/dictionaries';
import { verifyCertificate } from '@/services/certificates.service';

/** Public certificate verification — anyone with the code can confirm authenticity, no auth required. */
export default async function CertificateVerifyView({ params }) {
  const { code } = await params;
  const [{ t, locale, format }, certificate] = await Promise.all([getI18n(), verifyCertificate(code)]);

  if (!certificate) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-error-soft text-error">
          <CircleX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl tracking-tight text-foreground">{t('verify.notFound.title')}</h1>
        <p className="mt-2 text-sm text-foreground-muted">{t('verify.notFound.body')}</p>
      </Card>
    );
  }

  const courseTitle = locale === 'ar' ? certificate.courseTitleAr : certificate.courseTitleEn;

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-success-soft text-success">
        <Award className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-2xl tracking-tight text-foreground">{t('verify.valid.title')}</h1>
      <p className="mt-3 text-foreground-muted">
        {t('verify.valid.body', { name: certificate.learnerName, course: courseTitle })}
      </p>
      <p className="mt-4 text-sm text-foreground-subtle">
        {t('verify.valid.issuedOn', { date: format.date(certificate.issuedAt, { dateStyle: 'long' }) })}
      </p>
    </Card>
  );
}
