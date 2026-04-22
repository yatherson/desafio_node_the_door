import { ApiProperty } from '@nestjs/swagger';

export class LikesCountResponseDto {
    @ApiProperty({
        description: 'O ID único do post',
        example: 'bf66b7d1-d3a5-4219-8cbf-0d46c3697efe'
    })
    postId: string;

    @ApiProperty({
        description: 'A quantidade total de likes registrados para este post',
        example: 150
    })
    likesCount: number;
}