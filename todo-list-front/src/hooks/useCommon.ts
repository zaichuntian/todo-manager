import router from '../router';

export function useCommon() {
  const goHomePage = () => {
    router.push('/');
  };

  const goProfile = () => {
    router.push('/profile');
  };

  return {
    goHomePage,
    goProfile,
  };
}
