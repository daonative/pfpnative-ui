import '../styles/globals.css';
import styles from '../styles/Home.module.css';
import { Mainnet, DAppProvider } from '@usedapp/core';
import { getDefaultProvider } from 'ethers';
import { Toaster } from 'react-hot-toast'

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider('mainnet'),
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <DAppProvider config={config}>
      <div className={styles.background}>
        <Component className={styles.background} {...pageProps} />
        <Toaster position="bottom-center" />
      </div>
    </DAppProvider>
  );
}

export default MyApp;
