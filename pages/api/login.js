import { connectToDatabase } from "../../lib/mongodb";
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

  const { db } = await connectToDatabase();

  let user;
  try {
    // Fetch the user
    user = await db.collection("users").findOne({ username });

    if (!user) {
      const insertResponse = await db.collection("users").insertOne({
        username,
        password: bcrypt.hashSync(password, saltRounds),
      });

      user = insertResponse.ops[0];
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  // Verify the password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(422).json({ message: "Invalid Credentials." });
  }

  const token = jwt.sign({ _id: user._id, username }, process.env.APP_SECRET);
  return res.status(200).json({ token });
}
