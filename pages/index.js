import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";
import { compareHands, getHandDetails } from "./../lib/pusoy-hand.js";

export default function Home() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    console.log(getHandDetails("AH 2H 3H 4H 5H"));
    console.log(getHandDetails("AS AD AC AH JD"));
    console.log(compareHands("AH 2H 3H 4H 5H", "AS AD AC AH JD"));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {!user && (
          <div>
            <form>
              <h1>Login</h1>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
