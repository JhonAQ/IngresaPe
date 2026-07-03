import { Test, TestingModule } from '@nestjs/testing';
import { AuthRouter } from './auth.router';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../services/auth.service';
import * as bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import type { Request, Response } from 'express';

const mockContext = () => ({
  req: {} as Request,
  res: {} as Response,
  user: null,
});

describe('AuthRouter', () => {
  let router: AuthRouter;
  let prisma: any;
  let authService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    authService = {
      generateToken: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrpcService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: authService },
        AuthRouter,
      ],
    }).compile();

    router = module.get<AuthRouter>(AuthRouter);
  });

  const createCaller = () => router.router.createCaller(mockContext());

  describe('register', () => {
    it('debería registrar un nuevo usuario y devolver token', async () => {
      const input = {
        name: 'Test User',
        email: 'NEW@EXAMPLE.COM',
        password: 'secure123',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: input.email.toLowerCase(),
        name: input.name,
        role: 'USER',
      });

      const caller = createCaller();
      const result = await caller.register(input);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email.toLowerCase() },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: input.email.toLowerCase(),
            name: input.name,
            role: 'USER',
          }),
        })
      );
      expect(authService.generateToken).toHaveBeenCalled();
      expect(result.token).toBe('fake-jwt-token');
      expect(result.user.email).toBe(input.email.toLowerCase());
    });

    it('debería normalizar el email a minúsculas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'mixed@example.com',
        name: 'Test',
        role: 'USER',
      });

      const caller = createCaller();
      await caller.register({
        name: 'Test',
        email: 'Mixed@Example.COM',
        password: 'secure123',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'mixed@example.com' },
      });
    });

    it('debería rechazar registro si el email ya existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

      const caller = createCaller();

      await expect(
        caller.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'secure123',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('debería hashear la contraseña antes de guardar', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation((args: any) => ({
        id: 'user-123',
        ...args.data,
      }));

      const caller = createCaller();
      await caller.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'plain-password',
      });

      const createdData = prisma.user.create.mock.calls[0][0].data;
      expect(createdData.password).not.toBe('plain-password');
      const isValidHash = await bcrypt.compare('plain-password', createdData.password);
      expect(isValidHash).toBe(true);
    });
  });

  describe('login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const input = {
        email: 'test@example.com',
        password: 'secure123',
      };
      const hashedPassword = await bcrypt.hash(input.password, 12);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: input.email,
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
      });

      const caller = createCaller();
      const result = await caller.login(input);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(result.token).toBe('fake-jwt-token');
      expect(result.user.email).toBe(input.email);
    });

    it('debería normalizar email a minúsculas en login', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const caller = createCaller();
      await expect(
        caller.login({ email: 'TEST@EXAMPLE.COM', password: 'secure123' })
      ).rejects.toThrow();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('debería rechazar si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const caller = createCaller();
      await expect(
        caller.login({ email: 'missing@example.com', password: 'secure123' })
      ).rejects.toThrow(TRPCError);
    });

    it('debería rechazar si la contraseña es incorrecta', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: input.email,
        password: await bcrypt.hash('correct-password', 12),
      });

      const caller = createCaller();
      await expect(caller.login(input)).rejects.toThrow(TRPCError);
    });

    it('debería rechazar si el usuario se registró con OAuth y no tiene contraseña', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'oauth@example.com',
        password: null,
      });

      const caller = createCaller();
      await expect(
        caller.login({ email: 'oauth@example.com', password: 'any' })
      ).rejects.toThrow(TRPCError);
    });
  });
});
