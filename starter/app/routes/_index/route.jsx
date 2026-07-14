import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Win-back — Sidekick workshop app</h1>
        <p className={styles.text}>
          A demo email-marketing app for the DotDev Sidekick app extensions
          workshop. Install it on your dev store to build along.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Find lapsed customers</strong>. Surface who hasn&apos;t
            ordered in a given window.
          </li>
          <li>
            <strong>Draft win-back campaigns</strong>. Propose a re-engagement
            email for that audience.
          </li>
          <li>
            <strong>Composable with Sidekick</strong>. Extensions let Sidekick
            chain the goal into a merchant-confirmed send.
          </li>
        </ul>
      </div>
    </div>
  );
}
