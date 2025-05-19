import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const q = (req.query.q as string) || "";
    const page = parseInt((req.query.page as string) || "1");
    const limit = 50;
    const skip = (page - 1) * limit;
    

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { name: { contains: q} },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: { name: { contains: q  } },
      }),
    ]);

    return res.status(200).json({ products, total });
  }

  if (req.method === "POST") {
    const { name, price } = req.body;
    const product = await prisma.product.create({
      data: { name, price },
    });
    return res.status(201).json(product);
  }

  res.status(405).end();
}
