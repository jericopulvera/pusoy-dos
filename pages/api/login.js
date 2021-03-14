import { q, faunaDbClient } from "../../lib/faunadb";
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
    user = await faunaDbClient.query(
      q.Get(q.Match(q.Index("username_index"), username))
    );
  } catch (error) {
    if (error?.requestResult?.statusCode === 404 && !user) {
      user = await faunaDbClient.query(
        q.Create(q.Collection("users"), {
          data: { username, password: bcrypt.hashSync(password, saltRounds) },
        })
      );
    }
  }

  // Verify the password
  if (!bcrypt.compareSync(password, user.data.password)) {
    return res.status(422).json({ message: "Invalid Credentials." });
  }

  const token = jwt.sign({ id: user.ref.id, username }, process.env.APP_SECRET);
  return res.status(200).json({ token });
}
