import prisma from "../../lib/prisma";

export default async function (_, res) {
  let user = await prisma.user.findFirst({});

  if (!user) {
    return res.status(500).send("Unhealthy");
  }

  return res.status(200).send("Healthy");
}
