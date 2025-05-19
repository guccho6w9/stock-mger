import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string; // No uses parseInt

  if (req.method === "PUT") {
    const { name, price } = req.body;
    const product = await prisma.product.update({
      where: { id }, // Ahora id es string
      data: { 
        name, 
        price: parseFloat(price) 
      },
    });
    return res.status(200).json(product);
  }

  if (req.method === "DELETE") {
    await prisma.product.delete({ 
      where: { id } // Ahora id es string
    });
    return res.status(204).end();
  }

  res.status(405).end();
}