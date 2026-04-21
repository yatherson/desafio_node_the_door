export const CACHE_KEYS = {
    POSTS_ALL: 'posts:all',
    POSTS_RANKING: 'posts:ranking',
    POST_DETAIL: (id: string) => `posts:${id}`,
};