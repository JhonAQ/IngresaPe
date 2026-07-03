import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';

// Guardamos el secreto original para restaurarlo después
const ORIGINAL_SECRET = process.env.JWT_SECRET;

// Mock de PrismaService
const mockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-for-unit-tests';

    prisma = mockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    process.env.JWT_SECRET = ORIGINAL_SECRET;
  });

  describe('generateToken', () => {
    it('debería generar un JWT con userId, email y role', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };

      const token = service.generateToken(user);

      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('debería generar un token que expire en 7 días', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
      const now = Math.floor(Date.now() / 1000);

      const token = service.generateToken(user);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

      expect(decoded.exp).toBeDefined();
      // Permitimos una tolerancia de 60 segundos
      expect((decoded.exp as number) - now).toBeGreaterThanOrEqual(7 * 24 * 60 * 60 - 60);
      expect((decoded.exp as number) - now).toBeLessThanOrEqual(7 * 24 * 60 * 60 + 60);
    });
  });

  describe('validateOAuthUser', () => {
    it('debería crear un nuevo usuario si no existe', async () => {
      const profile = {
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/photo.jpg',
        providerId: 'google-123',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        provider: 'google',
        providerId: profile.providerId,
      });

      const result = await service.validateOAuthUser(profile);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: profile.email } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          provider: 'google',
          providerId: profile.providerId,
        },
      });
      expect(result.email).toBe(profile.email);
    });

    it('debería actualizar usuario existente con datos de Google', async () => {
      const profile = {
        email: 'existing@example.com',
        name: 'Existing User',
        picture: 'https://example.com/new-photo.jpg',
        providerId: 'google-456',
      };

      const existingUser = {
        id: 'existing-id',
        email: profile.email,
        name: 'Old Name',
        image: 'https://example.com/old-photo.jpg',
        provider: 'email',
        providerId: null,
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue({
        ...existingUser,
        image: profile.picture,
        provider: 'google',
        providerId: profile.providerId,
      });

      const result = await service.validateOAuthUser(profile);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          image: profile.picture,
          provider: 'google',
          providerId: profile.providerId,
        },
      });
      expect(result.image).toBe(profile.picture);
    });
  });
});
