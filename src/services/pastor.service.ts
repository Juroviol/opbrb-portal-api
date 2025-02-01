import BaseService from './base.service';
import { IPastor } from '../models/pastor.model';
import PastorRepository from '../repositories/pastor.repository';

class PastorService extends BaseService<IPastor> {
  constructor() {
    super(PastorRepository);
  }
}

export default new PastorService();
