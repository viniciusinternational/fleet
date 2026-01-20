'use client';

import { ThreadListPrimitive, ThreadListItemPrimitive } from '@assistant-ui/react';

function ThreadListItem() {
  return (
    <ThreadListItemPrimitive.Root className="cursor-pointer rounded-lg p-2 hover:bg-accent">
      <ThreadListItemPrimitive.Title className="text-sm font-medium" />
    </ThreadListItemPrimitive.Root>
  );
}

export function ThreadList() {
  return (
    <ThreadListPrimitive.Root>
      <ThreadListPrimitive.New />
      <ThreadListPrimitive.Items
        components={{
          ThreadListItem,
        }}
      />
    </ThreadListPrimitive.Root>
  );
}
