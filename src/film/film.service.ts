import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from '../database/models/film.model';
import {
  handleFilter,
  handlePagination,
  handleSort,
} from 'src/utils/function.utils';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as stringSimilarity from 'string-similarity';

@Injectable()
export class FilmService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(filter): Promise<{ total: number; films: Film[] }> {
    try {
      const filterObj = handleFilter(filter);
      const sortObj = handleSort(filter);
      const { skip, limit } = handlePagination(filter);
      const total = this.filmModel.countDocuments(filterObj).exec();
      const films = this.filmModel
        .find(filterObj)
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .exec();
      return Promise.all([total, films]).then((values) => {
        return {
          total: Math.ceil(values[0] / limit),
          films: values[1],
        };
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string): Promise<Film> {
    try {
      return this.filmModel.findById(id).exec();
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(film: Film): Promise<Film> {
    const createdFilm = new this.filmModel(film);
    return createdFilm.save();
  }

  async update(id: string, film: Film): Promise<Film> {
    return this.filmModel.findByIdAndUpdate(id, film, { new: true });
  }

  async delete(id: string): Promise<Film> {
    return this.filmModel.findByIdAndRemove(id);
  }

  async getFilter(): Promise<any> {
    const filter = {
      genres: [],
      quality: [],
      version: [],
    };
    const films = await this.filmModel.find().exec();
    films.forEach((film) => {
      film.genres.forEach((genre) => {
        if (!filter.genres.includes(genre)) {
          filter.genres.push(genre);
        }
      });
      if (!filter.quality.includes(film.quality)) {
        filter.quality.push(film.quality);
      }
      if (!filter.version.includes(film.version)) {
        filter.version.push(film.version);
      }
    });
    return filter;
  }

  async updateNotes(id?: string): Promise<any> {
    try {
      const films = await this.filmModel.find(id ? { _id: id } : {}).exec();
      let count = 0;
      for (const film of films) {
        console.log(`${count++}/${films.length}`);
        try {
          const response = await axios.get(
            `https://www.allocine.fr/_/autocomplete/${encodeURIComponent(
              film.title,
            )}`,
          );
          if (
            !response.data ||
            !response.data.results ||
            !response.data.results.length
          ) {
            continue;
          }
          const allocineFilm = response.data.results.filter(
            (item) => !item.sponsored,
          );
          const match = stringSimilarity.findBestMatch(
            film.title,
            allocineFilm.map((item) => item.label),
          );
          // console.log('match => ', match);
          // console.log('allocineFilm => ', allocineFilm[match.bestMatchIndex]);
          // console.log('film => ', film);
          if (
            allocineFilm[match.bestMatchIndex].data.year !== film.year &&
            !allocineFilm[match.bestMatchIndex].data.director_name.includes(
              film.director,
            )
          ) {
            console.log('no match found =>', film.title);
            film.rating = { score: 0, voters: 0 };
            await film.save();
            continue;
          }
          console.log(
            'MATCH FOUND =>',
            film.title,
            '||',
            allocineFilm[match.bestMatchIndex].label,
          );
          try {
            const html = await axios.get(
              `https://www.allocine.fr/film/fichefilm_gen_cfilm=${
                allocineFilm[match.bestMatchIndex].data.id
              }.html`,
            );
            if (!html || !html.data) {
              continue;
            }

            const $ = cheerio.load(html.data);
            const score = $('.stareval-note').eq(1).text();
            const votersString = $('.stareval-review.light').text();
            const numbers = votersString.match(/\d+/g);

            let voters = 0;
            if (numbers && numbers.length >= 2) {
              voters = parseInt(numbers[1]);
            }

            const rating = {
              score: parseFloat(score.replace(',', '.')) || 0,
              voters,
            };
            film.rating = rating;
            await film.save();
          } catch (error) {
            continue;
          }
        } catch (error) {
          continue;
        }
      }
      return { success: true };
    } catch (error) {
      throw new Error(error);
    }
    // try {
    //   // const film = await this.filmModel.find().limit(1).exec();
    //   const film = await this.filmModel.findById(id).exec();
    //   const { data } = await axios.get(
    //     `https://www.allocine.fr/_/autocomplete/${encodeURIComponent(
    //       film.title,
    //     )}`,
    //   );
    //   const allocineFilm = data.results.filter((item) => !item.sponsored)[0];
    //   const html = await axios.get(
    //     `https://www.allocine.fr/film/fichefilm_gen_cfilm=${allocineFilm.data.id}.html`,
    //   );

    //   const $ = cheerio.load(html.data);

    //   const score = $('.stareval-note').eq(1).text();
    //   const votersString = $('.stareval-review.light').text();
    //   const numbers = votersString.match(/\d+/g);
    //   let voters = 0;
    //   if (numbers && numbers.length >= 2) {
    //     voters = parseInt(numbers[1]);
    //   }
    //   const rating = {
    //     score: parseFloat(score.replace(',', '.')),
    //     voters,
    //   };
    //   film.rating = rating;
    //   return film.save();
    // } catch (error) {
    //   throw new Error(error);
    // }
  }
}
