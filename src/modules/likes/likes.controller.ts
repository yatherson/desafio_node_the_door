import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Controller, Get, HttpCode, HttpStatus, Param, Post} from "@nestjs/common";
import {LikesService} from "./likes.service";
import {LikesCountResponseDto} from "./dto/likes-count.response.dto";

@ApiTags('likes')
@Controller('posts/:postId/likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Registrar like em um post' })
    async registerLike(@Param('postId') postId: string) {

        const anonymousId = 'anonymous-user';

        await this.likesService.addLikeToQueue(postId, anonymousId);
        return { message: 'Like request accepted' };
    }

    @Get('count')
    @ApiOperation({ summary: 'Consultar a quantidade de likes de um post' })
    @ApiResponse({ status: 200, type: LikesCountResponseDto })
    async getLikesCount(@Param('postId') postId: string): Promise<LikesCountResponseDto> {
        return this.likesService.getLikesCount(postId);
    }
}