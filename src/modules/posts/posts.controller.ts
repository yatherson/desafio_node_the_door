import { Controller, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from '@prisma/client';
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os posts' })
    @ApiResponse({ status: 200, description: 'Lista retornada com sucesso (via Cache ou DB).' })
    async findAll() {
        return this.postsService.findAll();
    }

    @Get('ranking')
    @ApiOperation({ summary: 'Obter ranking dos posts com mais likes' })
    async getRanking() {
        return this.postsService.getRanking();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um post por ID' })
    @ApiResponse({ status: 200, description: 'Post encontrado.' })
    @ApiResponse({ status: 404, description: 'Post não encontrado.' })
    async findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

}