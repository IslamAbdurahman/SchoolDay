import { Link } from '@inertiajs/react';
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationProps {
  links: { url: string | null; label: string; active: boolean }[];
  className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
  if (!links || links.length <= 3) return null; // No pagination needed if only Prev, Next and 1 page

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        {links.map((link, i) => {
          let label = link.label;
          if (label.includes('&laquo;')) label = 'Previous';
          if (label.includes('&raquo;')) label = 'Next';

          const isPrevious = i === 0;
          const isNext = i === links.length - 1;

          if (isPrevious) {
            return (
              <PaginationItem key={i}>
                <PaginationPrevious
                  href={link.url || '#'}
                  aria-disabled={!link.url}
                  className={!link.url ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            );
          }

          if (isNext) {
            return (
              <PaginationItem key={i}>
                <PaginationNext
                  href={link.url || '#'}
                  aria-disabled={!link.url}
                  className={!link.url ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            );
          }

          if (label === '...') {
            return (
              <PaginationItem key={i}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={i}>
              <PaginationLink href={link.url || '#'} isActive={link.active}>
                {label}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </PaginationContent>
    </PaginationRoot>
  );
}
