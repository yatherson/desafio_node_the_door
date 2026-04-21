import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PostsRepository } from './posts.repository';
import { Post } from '@prisma/client';
import { NotFoundError } from '../../common/errors/not-found.error';

@Injectable()
export class PostsService {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        private readonly repository: PostsRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(): Promise<Post[]> {
        const cacheKey = 'posts:all';

        // 1. Tenta buscar no Cache (Redis)
        const cachedPosts = await this.cacheManager.get<Post[]>(cacheKey);
        if (cachedPosts) {
            this.logger.debug('Cache HIT: findAll');
            return cachedPosts;
        }

        // 2. Cache MISS: Busca no banco via Repository
        this.logger.debug('Cache MISS: findAll');
        const posts = await this.repository.findAll();

        // 3. Salva no Cache por 60 segundos (ADR-004)
        await this.cacheManager.set(cacheKey, posts, 60000);

        return posts;
    }

    async findOne(id: string): Promise<Post> {
        const cacheKey = `posts:${id}`;

        const cachedPost = await this.cacheManager.get<Post>(cacheKey);
        if (cachedPost) return cachedPost;

        const post = await this.repository.findById(id);

        if (!post) {
            throw new NotFoundError(`Post with ID ${id} not found`);
        }

        await this.cacheManager.set(cacheKey, post, 60000);

        return post;
    }

/*    async getRanking(): Promise<Post[]> {
        const cacheKey = 'posts:ranking';

        const cachedRanking = await this.cacheManager.get<Post[]>(cacheKey);
        if (cachedRanking) return cachedRanking;

        const ranking = await this.repository.getRanking(10);
        await this.cacheManager.set(cacheKey, ranking, 60000);

        return ranking;
    }*/
}