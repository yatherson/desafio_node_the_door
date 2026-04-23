import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PostsRepository } from '../posts/posts.repository';
import { PostNotFoundException } from '../../common/errors/post-not-found.exception';
import { LikesCountResponseDto } from './dto/likes-count.response.dto';

@Injectable()
export class LikesService {
    constructor(
        @InjectQueue('likes') private readonly likesQueue: Queue,
        private readonly postsRepository: PostsRepository,
    ) {}

    async addLikeToQueue(postId: string, userId: string): Promise<void> {

        const post = await this.postsRepository.findById(postId);

        if (!post) {
            throw new PostNotFoundException(postId);
        }

        await this.likesQueue.add(
            'process-like',
            { postId, userId },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
            }
        );
    }

    async getLikesCount(postId: string): Promise<LikesCountResponseDto> {
        const post = await this.postsRepository.findById(postId);

        if (!post) {
            throw new PostNotFoundException(postId);
        }

        return {
            postId: post.id,
            likesCount: post.likesCount,
        };
    }
}