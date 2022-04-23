import '../styles/globals.css';
import styles from '../styles/Home.module.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className={styles.background}>
      <Component className={styles.background} {...pageProps} />
    </div>
  );
}

export default MyApp;
