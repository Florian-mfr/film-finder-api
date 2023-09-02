import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmController } from './film/film.controller';
import { FilmService } from './film/film.service';
import { FilmSchema } from './database/models/film.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/film-finder'),
    MongooseModule.forFeature([{ name: 'Film', schema: FilmSchema }]),
  ],
  controllers: [FilmController],
  providers: [FilmService],
})
export class AppModule {}
