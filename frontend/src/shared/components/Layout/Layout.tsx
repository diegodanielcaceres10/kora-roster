import { Outlet } from "react-router-dom";
import styles from "./Layout.module.scss";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";

export function Layout() {
  return (
    <main className={styles.layout}>
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
}
