import {Injectable, Inject, Logger, InternalServerErrorException} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PostsRepository } from './posts.repository';
import { Post } from '@prisma/client';
import { PostNotFoundException } from '../../common/errors/post-not-found.exception';
import {CACHE_KEYS} from "../../common/constants/cache-keys";

@Injectable()
export class PostsService {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        private readonly postsRepository: PostsRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(): Promise<Post[]> {
        const cacheKey = 'posts:all';

        const cachedPosts = await this.cacheManager.get<Post[]>(cacheKey);
        if (cachedPosts) {
            this.logger.debug('Cache HIT: findAll');
            return cachedPosts;
        }

        this.logger.debug('Cache MISS: findAll');
        const posts = await this.postsRepository.findAll();

        await this.cacheManager.set(cacheKey, posts, 60000);

        return posts;
    }

    async findOne(id: string): Promise<Post> {
        const cacheKey = `posts:${id}`;

        const cachedPost = await this.cacheManager.get<Post>(cacheKey);
        if (cachedPost) return cachedPost;

        const post = await this.postsRepository.findById(id);

        if (!post) {
            throw new PostNotFoundException(`Post com id ${id} não encontrado`);
        }

        await this.cacheManager.set(cacheKey, post, 60000);

        return post;
    }

    async getRanking(): Promise<Post[]> {
        try {

            try {
                const cached = await this.cacheManager.get<Post[]>(CACHE_KEYS.POSTS_RANKING);
                if (cached) return cached;
            } catch (e) {
                this.logger.error('Erro ao acessar o Redis', e);
            }

            const ranking = await this.postsRepository.getRanking(10);


            if (!ranking || ranking.length === 0) {

                return [];
            }

            return ranking;
        } catch (error) {
            this.logger.error(`Falha fatal ao gerar ranking: ${error.message}`);
            throw new InternalServerErrorException('Não foi possível carregar o ranking no momento.');
        }
    }
}