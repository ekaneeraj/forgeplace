import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getHome(): string {
    return this.appService.getHomePage();
  }
}
