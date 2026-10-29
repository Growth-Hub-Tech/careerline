interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
}

export const fetchAll = async <T>(fetchPage: (offset: number) => Promise<Page<T>>) => {
  const all: T[] = [];

  for (;;) {
    const page = await fetchPage(all.length);
    all.push(...page.items);

    if (page.items.length === 0 || all.length >= page.total) return all;
  }
};
