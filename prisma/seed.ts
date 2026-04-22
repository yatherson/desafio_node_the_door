import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    await prisma.post.createMany({
        data: [
            { title: 'Primeiro Post', content: 'Explorando o NestJS', likesCount: 10 },
            { title: 'Arquitetura de Filas', content: 'BullMQ é incrível', likesCount: 50 },
            { title: 'Redis Cache', content: 'Performance é tudo', likesCount: 30 },
        ],
    });

    console.log('Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });