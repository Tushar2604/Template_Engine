import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS for frontend
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('ResumeForge API')
    .setDescription('Resume Builder SaaS — Templates, Parser, PDF Export')
    .setVersion('1.0')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 ResumeForge API running on http://localhost:${port}`);
  console.log(`📘 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
