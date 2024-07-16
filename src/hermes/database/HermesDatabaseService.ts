import { PrismaClient } from '@prisma/client';
import { BlacklistRepository } from '../../blacklist/repository/BlacklistRepository';

import { OfferRepository } from '../../offer/database/OfferRepository';
import { RequestRepository } from '../../request/database/RequestRepository';
import { StickyMessagesRepository } from '../../sticky/repository/StickyMessagesRepository';
import { TagRepository } from '../../tag/database/TagRepository';

/** Service for database connection, querying and caching. */
export class HermesDatabaseService {
  protected readonly prisma: PrismaClient;

  protected readonly tagRepository: TagRepository;

  protected readonly offerRepository: OfferRepository;

  protected readonly requestRepository: RequestRepository;

  protected readonly blacklistRepository: BlacklistRepository;

  protected readonly stickyRepository: StickyMessagesRepository;

  constructor(
    prisma: PrismaClient,
    tagRepository: TagRepository,
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
    blacklistRepository: BlacklistRepository,
    stickyRepository: StickyMessagesRepository,
  ) {
    this.prisma = prisma;
    this.tagRepository = tagRepository;
    this.offerRepository = offerRepository;
    this.requestRepository = requestRepository;
    this.blacklistRepository = blacklistRepository;
    this.stickyRepository = stickyRepository;
  }

  public static create(): HermesDatabaseService {
    const prisma = new PrismaClient();

    const tagRepository = TagRepository.create(prisma);
    const offerRepository = OfferRepository.create(prisma);
    const requestRepository = RequestRepository.create(prisma);
    const blacklistRepository = BlacklistRepository.create(prisma);
    const stickyRepository = StickyMessagesRepository.create(prisma);

    return new HermesDatabaseService(
      prisma,
      tagRepository,
      offerRepository,
      requestRepository,
      blacklistRepository,
      stickyRepository,
    );
  }

  public async start() {
    await this.prisma.$connect();
    await this.tagRepository.start();
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
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

  public getBlacklistRepository(): BlacklistRepository {
    return this.blacklistRepository;
  }

  public getStickyRepository(): StickyMessagesRepository {
    return this.stickyRepository;
  }
}
