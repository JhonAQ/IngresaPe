import { Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import { SuperJSON } from 'superjson'; // Para enviar fechas y tipos complejos

@Injectable()
export class TrpcService {
  trpc = initTRPC.create({
    transformer: SuperJSON,
  });
  
  // Exponemos los helpers comunes de tRPC
  public procedure = this.trpc.procedure;
  public router = this.trpc.router;
  public mergeRouters = this.trpc.mergeRouters;
}