import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set API prefix
  app.setGlobalPrefix('api');

  // Global pipes setup
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Quản lý Tổ dân phố API')
    .setDescription(
      'API Backend cho hệ thống quản lý thông tin tổ dân phố 7 - Phường La Khê',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .addTag('Auth', 'Xác thực người dùng')
    .addTag('Nhân khẩu', 'Quản lý thông tin nhân khẩu')
    .addTag('Hộ khẩu', 'Quản lý thông tin hộ khẩu')
    .addTag('Tạm trú/Tạm vắng', 'Quản lý tạm trú tạm vắng')
    .addTag('Khoản thu', 'Quản lý các khoản thu')
    .addTag('Thu phí', 'Quản lý thu phí và đóng góp')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Middleware setup
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    credentials: true,
  });

  // Start server
  const port = configService.get<string>('PORT') ?? 8080;
  await app.listen(port);

  console.log(`✨ Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

void bootstrap();
