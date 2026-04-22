import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Post[]> {
        return this.prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id },
        });
    }

    async getRanking(limit: number): Promise<Post[]> {
        return this.prisma.post.findMany({
            orderBy: {
                likesCount: 'desc',
            },
            take: limit,
        });
    }
}