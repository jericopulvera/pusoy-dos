import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const saltRounds = 10;

export default async function (req, res) {
  const {
    body: { username, password },
  } = req;

  if (!username || !password) {
    return res
      .status(401)
      .json({ message: "Username and password must be provided." });
  }

  let user;
  try {
    // Fetch the user
    user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          password: bcrypt.hashSync(password, saltRounds),
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  // Verify the password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(422).json({ message: "Invalid Credentials." });
  }

  const token = jwt.sign({ id: user.id, username }, process.env.APP_SECRET);
  return res.status(200).json({ token });
}
