import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FilmService } from './film.service';
import { Film } from 'src/database/models/film.model';

@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}
  @Get()
  findAll(@Query() filter: object): Promise<{ total: number; films: Film[] }> {
    return this.filmService.findAll(filter);
  }

  @Get('id/:id')
  findOne(@Param('id') id: string): Promise<Film> {
    return this.filmService.findOne(id);
  }

  @Post()
  create(@Body() film: Film): Promise<Film> {
    return this.filmService.create(film);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() film: Film): Promise<Film> {
    return this.filmService.update(id, film);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Film> {
    return this.filmService.delete(id);
  }

  @Get('filter')
  getFilter(): Promise<any> {
    return this.filmService.getFilter();
  }

  @Get('update-notes')
  updateNotes(): Promise<any> {
    return this.filmService.updateNotes();
  }

  @Get('update-notes/:id')
  updateNote(@Param('id') id: string): Promise<any> {
    return this.filmService.updateNotes(id);
  }
}
