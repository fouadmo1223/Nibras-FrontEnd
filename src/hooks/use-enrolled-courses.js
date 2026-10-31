'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from './use-auth';
import { enrollmentKeys, listMyEnrollments } from '@/services/enrollments.service';

/**
 * Course ids the signed-in caller is already enrolled in — empty for a guest — plus whether
 * that's still loading. Shared by `CartButton`/`CourseCard` so a course you already own never
 * offers "Add to cart" again, and shows a skeleton rather than flashing "Add to cart" first.
 */
export function useEnrolledCourseIds() {
  const session = useSession();
  const signedIn = Boolean(session.data?.user);
  const enrollments = useQuery({ queryKey: enrollmentKeys.mine(), queryFn: listMyEnrollments, enabled: signedIn });
  return { ids: new Set((enrollments.data ?? []).map((e) => e.course.id)), isLoading: signedIn && enrollments.isPending };
}
