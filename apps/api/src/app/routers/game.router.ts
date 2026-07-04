import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TrpcService } from '../trpc.service';
import { GameService } from '../services/game.service'; // <--- Importamos el Servicio
import { z } from 'zod';
import { answerSubmissionSchema } from '@ingresa-pe/domain';

@Injectable()
export class GameRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly gameService: GameService // <--- Inyectamos el Servicio
  ) {}

  router = this.trpc.router({
    submitAnswer: this.trpc.protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          answer: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const answerParse = answerSubmissionSchema.safeParse(input.answer);
        if (!answerParse.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La respuesta enviada no es válida',
          });
        }
        return await this.gameService.submitAnswer({
            userId: ctx.user.userId,
            questionId: input.questionId,
            answer: answerParse.data
        });
      }),
  });
}