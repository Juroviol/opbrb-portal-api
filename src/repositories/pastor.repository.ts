import BaseRepository from '../repositories/base.repository';
import { PastorModel, IPastor } from '../models/pastor.model';

class PastorRepository extends BaseRepository<IPastor> {
  constructor() {
    super(PastorModel);
  }
}

export default new PastorRepository();
