import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
    @ApiProperty({ example: 'uuid-v4-string' })
    id: string;

    @ApiProperty({ example: 'Título do Post' })
    title: string;

    @ApiProperty({ example: 'Conteúdo do post' })
    content: string;

    @ApiProperty({ example: 42 })
    likesCount: number;

    @ApiProperty({ example: '2026-04-21T20:00:00.000Z' })
    createdAt: Date;
}