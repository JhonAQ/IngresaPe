import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NAMES = [
  'Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Fernando', 'Gaby', 'Hugo', 
  'Ines', 'Juan', 'Kevin', 'Laura', 'Mario', 'Natalia', 'Oscar', 'Paula', 
  'Quique', 'Rosa', 'Sergio', 'Tania', 'Victor', 'Wendy', 'Ximena', 'Yolo', 'Zack'
];

async function main() {
  console.log('🌱 Sembrando competidores...');

  // Hashear la contraseña una sola vez (es más eficiente)
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Crear 50 usuarios
  for (let i = 0; i < 50; i++) {
    const randomName = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${i}`;
    const randomXP = Math.floor(Math.random() * 5000); // XP entre 0 y 5000

    await prisma.user.create({
      data: {
        email: `competidor${i}@test.com`,
        password: hashedPassword, // Contraseña hasheada
        name: randomName,
        totalXp: randomXP,
        role: 'USER',
      },
    });
  }

  console.log('✅ ¡50 Competidores creados! Ahora tienes contra quién jugar.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());