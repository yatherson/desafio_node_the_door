import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS } from '../../common/constants/cache-keys';
import {PrismaService} from "../../prisma/prisma.service";

@Processor('likes')
export class LikesProcessor extends WorkerHost {
    private readonly logger = new Logger(LikesProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {
        super();
    }

    async process(job: Job<{ postId: string; userId: string }>): Promise<void> {
        const { postId, userId } = job.data;

        try {
            this.logger.log(`Processando job ${job.id}: Like no Post ${postId}`);


            await this.prisma.$transaction(async (tx) => {

                await tx.like.create({
                    data: {
                        postId: postId,
                        userId: userId,
                    },
                });

                await tx.post.update({
                    where: { id: postId },
                    data: {
                        likesCount: { increment: 1 }
                    },
                });
            });


            await this.cacheManager.del(CACHE_KEYS.POST_DETAIL(postId));
            await this.cacheManager.del(CACHE_KEYS.POSTS_ALL);

            this.logger.log(`Sucesso: Like processado para o post ${postId}`);

        } catch (error) {

            if (error.code === 'P2002') {
                this.logger.warn(
                    `Ignorado: O usuário ${userId} já curtiu o post ${postId}`
                );
                return;
            }

            this.logger.error(`Falha ao processar like: ${error.message}`);
            throw error;
        }
    }
}