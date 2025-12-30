import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { GameService } from '../services/game.service'; // <--- Importamos el Servicio
import { z } from 'zod';

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
          selectedOptionIndex: z.number().min(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Delegamos toda la lógica al servicio
        return await this.gameService.submitAnswer({
            userId: ctx.user.userId,
            questionId: input.questionId,
            selectedOptionIndex: input.selectedOptionIndex
        });
      }),
  });
}