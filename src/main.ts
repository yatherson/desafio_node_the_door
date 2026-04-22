// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger (ADR-008)
  const config = new DocumentBuilder()
      .setTitle('Desafio The Door - Likes API')
      .setDescription('API para gerenciamento de posts e likes')
      .setVersion('1.0')
      .addTag('posts')
      .addTag('likes')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();