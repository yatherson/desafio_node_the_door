import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterLikeDto {
    @ApiProperty({ example: 'user-abc123' })
    @IsString()
    @IsNotEmpty()
    userId: string;
}