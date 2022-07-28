/* eslint-disable prettier/prettier */
import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./header.module.scss";
import logo from "../../../public/images/logo.svg";

export default function Header() {
  const router = useRouter();
  const isHomePage = router?.asPath?.search('/post/') === -1;

  return (
    <header className={isHomePage ? `${styles.headerContent} ${styles.headerHomePadding}` : `${styles.headerContent}`}>
      <Link href="/">
        <a><img src='https://i.imgur.com/qHMA8Og.png' alt="logo" /></a>
      </Link>
    </header>
  );
}
