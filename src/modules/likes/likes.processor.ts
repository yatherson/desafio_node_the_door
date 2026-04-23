import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS } from '../../common/constants/cache-keys';
import {PrismaService} from "../../prisma/prisma.service";
import {LikesRepository} from "./likes.repository";

@Processor('likes')
export class LikesProcessor extends WorkerHost {
    private readonly logger = new Logger(LikesProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly likesRepository: LikesRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {
        super();
    }

    async process(job: Job<{ postId: string; userId: string }>): Promise<void> {
        const { postId, userId } = job.data;

        try {
            this.logger.log(`Processing job ${job.id}: Like in Post ${postId}`);

            await this.likesRepository.createLikeAndUpdatePostCount(postId, userId);

            await this.cacheManager.del(CACHE_KEYS.POST_DETAIL(postId));
            await this.cacheManager.del(CACHE_KEYS.POSTS_ALL);
            await this.cacheManager.del(CACHE_KEYS.POSTS_RANKING);

            this.logger.log(`Success: Like processed for the post ${postId}`);

        } catch (error) {

            if (error.code === 'P2002') {
                this.logger.warn(
                    `Ignored: The user ${userId} already liked the post ${postId}`
                );
                return;
            }

            this.logger.error(`Failure to process like: ${error.message}`);
            throw error;
        }
    }
}