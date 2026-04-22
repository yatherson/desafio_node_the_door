import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class LikesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createLikeAndUpdatePostCount(postId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            await tx.like.create({
                data: { postId, userId },
            });

            await tx.post.update({
                where: { id: postId },
                data: { likesCount: { increment: 1 } },
            });
        });
    }
}