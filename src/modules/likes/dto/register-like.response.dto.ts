import { ApiProperty } from '@nestjs/swagger';

export class RegisterLikeResponseDto {
    @ApiProperty({ example: 'Like request accepted' })
    message: string;

    @ApiProperty({ example: '985c35aa-a259-4152-8a4e-79406264fab0' })
    postId: string;

    @ApiProperty({ example: 'user-abc123' })
    userId: string;
}