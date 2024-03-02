import { PrismaClient } from '@prisma/client';

import { OfferRepository } from './database/OfferRepository';
import { RequestRepository } from './database/RequestRepository';
import { TagRepository } from './database/TagRepository';

/** Service for database connection, querying and caching. */
export class HermesDatabaseService {
  protected readonly prisma: PrismaClient;

  protected readonly tagRepository: TagRepository;

  protected readonly offerRepository: OfferRepository;

  protected readonly requestRepository: RequestRepository;

  constructor(
    prisma: PrismaClient,
    tagRepository: TagRepository,
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
  ) {
    this.prisma = prisma;
    this.tagRepository = tagRepository;
    this.offerRepository = offerRepository;
    this.requestRepository = requestRepository;
  }

  public static create(): HermesDatabaseService {
    const prisma = new PrismaClient();

    const tagRepository = TagRepository.create(prisma);
    const offerRepository = OfferRepository.create(prisma);
    const requestRepository = RequestRepository.create(prisma);

    return new HermesDatabaseService(
      prisma,
      tagRepository,
      offerRepository,
      requestRepository,
    );
  }

  public getTagRepository(): TagRepository {
    return this.tagRepository;
  }

  public getOfferRepository(): OfferRepository {
    return this.offerRepository;
  }

  public getRequestRepository(): RequestRepository {
    return this.requestRepository;
  }

  public async start() {
    await this.prisma.$connect();
    await this.tagRepository.start();
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }
}
