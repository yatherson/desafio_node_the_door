import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {DomainErrorFilter} from "./common/filters/domain-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
  );

  app.useGlobalFilters(new DomainErrorFilter());

  const config = new DocumentBuilder()
      .setTitle('Desafio The Door')
      .setDescription('API para gerenciamento de posts e likes')
      .setVersion('1.0')
      .addTag('posts')
      .addTag('likes')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();