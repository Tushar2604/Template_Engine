import { Module } from '@nestjs/common';
import { TemplatesModule } from './modules/templates/templates.module';
import { ParserModule } from './modules/parser/parser.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [TemplatesModule, ParserModule, ExportModule],
})
export class AppModule {}
