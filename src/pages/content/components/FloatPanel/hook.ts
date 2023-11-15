export const useCollectionParse = (data: any) => {
  if (!data.all_collections) return;
  const { items } = data.all_collections;
  const collections = [];
  for (const key in items) {
    const element = items[key];
    element.key = element.publishedfileid;
    collections.push(element);
  }
  return collections;
};
