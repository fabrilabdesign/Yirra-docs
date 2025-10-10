import React from 'react';
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import styles from './AuthButtons.module.css';

export default function AuthButtons(): JSX.Element {
  const { user } = useUser();

  return (
    <div className={styles.authContainer}>
      <SignedOut>
        <SignInButton mode="modal">
          <button className={styles.signInButton}>
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className={styles.userSection}>
          <span className={styles.userName}>
            {user?.firstName || user?.username}
          </span>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: styles.avatarBox,
              },
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}


