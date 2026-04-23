import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikesProcessor } from './likes.processor';
import { PostsModule } from '../posts/posts.module';
import {LikesRepository} from "./likes.repository";

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
        LikesProcessor,
        LikesRepository
    ],
})
export class LikesModule {}