import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_URL } from '../config/env';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(REDIS_URL);
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
