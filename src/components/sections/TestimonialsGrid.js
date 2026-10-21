import { MessageCircleHeart } from 'lucide-react';
import Card from '@/components/ui/Card';
import TestimonialsSlider from '@/components/sections/TestimonialsSlider';
import { getI18n } from '@/i18n/dictionaries';
import { listFeaturedReviews } from '@/services/reviews.service';

/** The platform's best real reviews (highest-rated, has a comment), across every course. Empty array → empty state. */
export default async function TestimonialsGrid({ emptyTitle, emptyBody }) {
  const [{ locale }, reviews] = await Promise.all([getI18n(), listFeaturedReviews()]);

  if (reviews.length === 0) {
    return (
      <Card variant="dashed" className="mt-8 p-10 text-center">
        <span className="mx-auto grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <MessageCircleHeart className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-4 font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </Card>
    );
  }

  return <TestimonialsSlider reviews={reviews} locale={locale} />;
}
