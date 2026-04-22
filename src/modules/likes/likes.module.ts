import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service'; // Faltava este
import { LikesProcessor } from './likes.processor'; // Faltava este
import { PostsModule } from '../posts/posts.module';

@Module({
    imports: [
        PostsModule,
        BullModule.registerQueue({
            name: 'likes',
        }),
    ],
    controllers: [LikesController],
    providers: [
        LikesService,
        LikesProcessor
    ],
})
export class LikesModule {}