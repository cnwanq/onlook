import type { PageNode } from '@onlook/models/pages';
import { cn } from '@onlook/ui/utils';
import { forwardRef } from 'react';
import type { RowRendererProps } from 'react-arborist';

const PageTreeRow = forwardRef<
    HTMLDivElement,
    RowRendererProps<PageNode> & { isHighlighted?: boolean }
>(({ attrs, children, isHighlighted }, ref) => {
    return (
        <div
            ref={ref}
            {...attrs}
            className={cn(
                'outline-none h-6 cursor-pointer w-full rounded-lg',
                'text-foreground-onlook/70',
                !attrs['aria-selected'] && [
                    isHighlighted && 'bg-background-onlook text-foreground-primary',
                    'hover:text-foreground-primary hover:bg-background-onlook',
                ],
                attrs['aria-selected'] && [
                    '!bg-[#007AFF] dark:!bg-[#007AFF]',
                    '!text-primary dark:!text-primary',
                    '![&]:hover:bg-[#007AFF] dark:[&]:hover:bg-[#007AFF]',
                ],
            )}
        >
            {children}
        </div>
    );
});

PageTreeRow.displayName = 'PageTreeRow';
export default PageTreeRow;
