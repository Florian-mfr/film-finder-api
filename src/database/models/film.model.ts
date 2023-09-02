import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema()
export class Film {
  @Prop()
  title: string;

  @Prop()
  image: string;

  @Prop()
  year: string;

  @Prop()
  genres: string[];

  @Prop()
  origin: string;

  @Prop()
  director: string;

  @Prop()
  actors: string[];

  @Prop()
  version: string;

  @Prop()
  quality: string;

  @Prop()
  duration: string;

  @Prop()
  synopsis: string;

  @Prop({
    type: SchemaTypes.Mixed,
    validate: {
      validator: function (value) {
        return (
          value &&
          typeof value.score === 'number' &&
          typeof value.voters === 'number'
        );
      },
      message: 'Invalid rating object',
    },
  })
  rating: {
    score: number;
    voters: number;
  };
}

export const FilmSchema = SchemaFactory.createForClass(Film);
