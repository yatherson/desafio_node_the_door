import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post} from "@nestjs/common";
import {LikesService} from "./likes.service";
import {LikesCountResponseDto} from "./dto/likes-count.response.dto";
import {RegisterLikeDto} from "./dto/register-like.dto";
import {RegisterLikeResponseDto} from "./dto/register-like.response.dto";

@ApiTags('likes')
@Controller('posts/:postId/likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Registrar like em um post' })
    @ApiResponse({status: 202, type: RegisterLikeResponseDto})
    async registerLike(
        @Param('postId') postId: string,
        @Body() body: RegisterLikeDto,
    ) {
        await this.likesService.addLikeToQueue(postId, body.userId);
        return {
            message: 'Solicitação de like aceita',
            postId: postId,
            userId: body.userId,
        };
    }

    @Get('count')
    @ApiOperation({ summary: 'Consultar a quantidade de likes de um post' })
    @ApiResponse({ status: 200, type: LikesCountResponseDto })
    async getLikesCount(@Param('postId') postId: string): Promise<LikesCountResponseDto> {
        return this.likesService.getLikesCount(postId);
    }
}